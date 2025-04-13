import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Platform, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Card, Chip, Searchbar, ActivityIndicator, Divider, Surface, Button } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getSmokerSpots } from '../services/firebase';
import { SmokerSpot } from '../types';
import { serverTimestamp } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

// テーマカラー
const THEME_COLORS = {
  primary: '#7C3AED', // メインカラー（ビビッドな紫）
  accent: '#F43F5E', // アクセントカラー（ビビッドなピンク）
  background: '#F9FAFB', // 背景色（明るいグレー）
  surface: '#FFFFFF', // サーフェス色（白）
  text: '#1F2937', // テキスト色（濃いグレー）
  disabled: '#9CA3AF', // 無効時の色（中間グレー）
  placeholder: '#6B7280', // プレースホルダー色（グレー）
  success: '#10B981', // 成功色（緑）
  warning: '#F59E0B', // 警告色（オレンジ）
  error: '#EF4444', // エラー色（赤）
  info: '#3B82F6', // 情報色（青）
  lightPurple: '#EDE9FE', // 薄い紫（背景用）
  darkPurple: '#4C1D95', // 濃い紫
  border: '#E5E7EB', // ボーダー色
};

// サンプルデータ（Firebaseからのデータ取得が実装されるまでの仮データ）
const sampleSpots: SmokerSpot[] = [
  {
    id: '1',
    title: '東京駅八重洲口喫煙所',
    description: '東京駅八重洲口近くの屋外喫煙所です。屋根付きで雨の日も安心です。',
    location: {
      latitude: 35.681236,
      longitude: 139.768149
    },
    rating: 4.2,
    facilities: {
      hasRoof: true,
      hasSeating: true,
      hasVendingMachine: true,
      isIndoor: false
    },
    businessHours: {
      isOpen24Hours: true
    },
    createdBy: 'user1',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: '2',
    title: '新宿駅東口喫煙所',
    description: '新宿駅東口近くの屋外喫煙所です。座席があり、ゆっくりできます。',
    location: {
      latitude: 35.690921,
      longitude: 139.702776
    },
    rating: 3.8,
    facilities: {
      hasRoof: true,
      hasSeating: true,
      hasVendingMachine: false,
      isIndoor: false
    },
    businessHours: {
      isOpen24Hours: false,
      openingTime: '7:00',
      closingTime: '23:00'
    },
    createdBy: 'user1',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: '3',
    title: '渋谷駅ハチ公前喫煙所',
    description: '渋谷駅ハチ公前の屋外喫煙所です。人通りが多いエリアにあります。',
    location: {
      latitude: 35.658517,
      longitude: 139.701334
    },
    rating: 3.5,
    facilities: {
      hasRoof: true,
      hasSeating: false,
      hasVendingMachine: true,
      isIndoor: false
    },
    businessHours: {
      isOpen24Hours: false,
      openingTime: '6:00',
      closingTime: '24:00'
    },
    createdBy: 'user1',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// 2点間の距離を計算する関数（ハーバーサイン公式）
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // 地球の半径（km）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // km単位の距離
  return distance;
};

const ListScreen = () => {
  const navigation = useNavigation();
  const [spots, setSpots] = useState<SmokerSpot[]>(sampleSpots);
  const [filteredSpots, setFilteredSpots] = useState<SmokerSpot[]>(sampleSpots);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(5); // デフォルトは5km
  const [locationError, setLocationError] = useState<string | null>(null);

  // 位置情報の取得
  useEffect(() => {
    const getLocation = async () => {
      setLocationLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('位置情報へのアクセスが許可されていません');
          setLocationLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        setLocationError(null);
      } catch (error) {
        console.error('位置情報の取得に失敗しました:', error);
        setLocationError('位置情報の取得に失敗しました');
      } finally {
        setLocationLoading(false);
      }
    };

    getLocation();
  }, []);

  // 喫煙所データを取得
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const { spots: fetchedSpots } = await getSmokerSpots();
        console.log('Fetched spots in ListScreen:', fetchedSpots);
        
        if (fetchedSpots && fetchedSpots.length > 0) {
          setSpots(fetchedSpots);
          filterSpotsByDistance(fetchedSpots, currentLocation, maxDistance);
        }
      } catch (error) {
        console.error('喫煙所データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpots();
  }, []);

  // 距離でフィルタリングする関数
  const filterSpotsByDistance = (spotsToFilter: SmokerSpot[], location: {latitude: number, longitude: number} | null, distance: number) => {
    if (!location) {
      setFilteredSpots(spotsToFilter);
      return;
    }

    const filtered = spotsToFilter.filter(spot => {
      const spotDistance = calculateDistance(
        location.latitude,
        location.longitude,
        spot.location.latitude,
        spot.location.longitude
      );
      // spotに距離情報を追加
      (spot as any).distance = spotDistance;
      return spotDistance <= distance;
    });

    // 距離順にソート
    filtered.sort((a, b) => (a as any).distance - (b as any).distance);
    
    setFilteredSpots(filtered);
  };

  // 検索クエリが変更されたときのハンドラー
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      filterSpotsByDistance(spots, currentLocation, maxDistance);
      return;
    }
    
    const filtered = spots.filter(spot => 
      spot.title.toLowerCase().includes(query.toLowerCase()) ||
      spot.description.toLowerCase().includes(query.toLowerCase())
    );
    
    filterSpotsByDistance(filtered, currentLocation, maxDistance);
  };

  // 距離スライダーが変更されたときのハンドラー
  const handleDistanceChange = (value: number) => {
    setMaxDistance(value);
    filterSpotsByDistance(spots, currentLocation, value);
  };

  // 詳細画面に遷移するハンドラー
  const handleViewDetails = (spot: SmokerSpot) => {
    // @ts-ignore
    navigation.navigate('SpotDetail', { spotId: spot.id });
  };

  // 位置情報を再取得するハンドラー
  const handleRefreshLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      setLocationError(null);
      
      // 位置情報が更新されたら、喫煙所を再フィルタリング
      filterSpotsByDistance(spots, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }, maxDistance);
    } catch (error) {
      console.error('位置情報の更新に失敗しました:', error);
      setLocationError('位置情報の更新に失敗しました');
    } finally {
      setLocationLoading(false);
    }
  };

  // 喫煙所アイテムをレンダリング（コンパクト版）
  const renderSpotItem = ({ item }: { item: SmokerSpot }) => (
    <TouchableOpacity 
      onPress={() => handleViewDetails(item)}
      style={styles.cardContainer}
      activeOpacity={0.7}
    >
      <Card style={styles.card} elevation={3}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <MaterialCommunityIcons name="smoking" size={20} color={THEME_COLORS.primary} style={styles.titleIcon} />
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            {/* 距離情報 */}
            {(item as any).distance !== undefined && (
              <View style={styles.distanceContainer}>
                <MaterialIcons name="place" size={14} color={THEME_COLORS.primary} />
                <Text style={styles.distanceText}>
                  {(item as any).distance < 1 
                    ? `${((item as any).distance * 1000).toFixed(0)}m` 
                    : `${(item as any).distance.toFixed(1)}km`}
                </Text>
              </View>
            )}
            
            {/* 営業時間 */}
            <View style={styles.hoursContainer}>
              <MaterialIcons name="access-time" size={14} color={THEME_COLORS.text} />
              <Text style={styles.hoursText} numberOfLines={1}>
                {item.businessHours.isOpen24Hours 
                  ? '24時間' 
                  : `${item.businessHours.openingTime}〜${item.businessHours.closingTime}`
                }
              </Text>
            </View>
          </View>
          
          <View style={styles.facilitiesContainer}>
            {item.facilities.hasRoof && (
              <View style={styles.facilityItem}>
                <MaterialCommunityIcons name="umbrella" size={14} color={THEME_COLORS.primary} />
              </View>
            )}
            {item.facilities.hasSeating && (
              <View style={styles.facilityItem}>
                <MaterialCommunityIcons name="seat" size={14} color={THEME_COLORS.primary} />
              </View>
            )}
            {item.facilities.hasVendingMachine && (
              <View style={styles.facilityItem}>
                <MaterialCommunityIcons name="coffee" size={14} color={THEME_COLORS.primary} />
              </View>
            )}
            <View style={styles.facilityItem}>
              <MaterialCommunityIcons 
                name={item.facilities.isIndoor ? "home" : "tree"} 
                size={14} 
                color={THEME_COLORS.primary} 
              />
            </View>
            
            <Button 
              mode="text" 
              icon="chevron-right" 
              textColor={THEME_COLORS.primary}
              contentStyle={{ flexDirection: 'row-reverse' }}
              labelStyle={{ marginRight: -8, fontSize: 12 }}
              style={styles.detailButton}
            >
              詳細
            </Button>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content 
          title="喫煙所一覧" 
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action 
          icon="refresh" 
          onPress={handleRefreshLocation} 
          color="#FFFFFF" 
          disabled={locationLoading}
        />
      </Appbar.Header>
      
      <Searchbar
        placeholder="喫煙所を検索"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={THEME_COLORS.primary}
        placeholderTextColor={THEME_COLORS.placeholder}
        inputStyle={styles.searchInput}
        elevation={2}
      />
      
      <View style={styles.distanceFilterContainer}>
        <Text style={styles.distanceLabel}>検索範囲: {maxDistance}km以内</Text>
        <Slider
          value={maxDistance}
          onValueChange={handleDistanceChange}
          minimumValue={1}
          maximumValue={20}
          step={1}
          style={styles.slider}
          minimumTrackTintColor={THEME_COLORS.primary}
          thumbTintColor={THEME_COLORS.primary}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderMinLabel}>1km</Text>
          <Text style={styles.sliderMaxLabel}>20km</Text>
        </View>
      </View>
      
      {locationError && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={20} color={THEME_COLORS.error} />
          <Text style={styles.errorText}>{locationError}</Text>
          <Button 
            mode="contained" 
            onPress={handleRefreshLocation}
            style={styles.retryButton}
            labelStyle={styles.retryButtonLabel}
            loading={locationLoading}
            disabled={locationLoading}
          >
            再試行
          </Button>
        </View>
      )}
      
      {loading || locationLoading ? (
        <View style={styles.loadingContainer}>
          <Surface style={styles.loadingBox}>
            <MaterialCommunityIcons name="smoking" size={64} color={THEME_COLORS.primary} />
            <ActivityIndicator size="large" color={THEME_COLORS.primary} style={styles.loadingIndicator} />
            <Text style={styles.loadingText}>
              {locationLoading ? '位置情報を取得中...' : '喫煙所データを読み込み中...'}
            </Text>
          </Surface>
        </View>
      ) : filteredSpots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Surface style={styles.emptyBox}>
            <MaterialIcons name="search-off" size={64} color={THEME_COLORS.disabled} />
            <Text style={styles.emptyTitle}>喫煙所が見つかりません</Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim() !== '' 
                ? '検索条件に一致する喫煙所が見つかりませんでした' 
                : `${maxDistance}km以内に喫煙所が見つかりませんでした`}
            </Text>
            <Button 
              mode="contained" 
              onPress={() => {
                setSearchQuery('');
                setMaxDistance(10);
                filterSpotsByDistance(spots, currentLocation, 10);
              }}
              style={styles.resetButton}
              labelStyle={styles.resetButtonLabel}
            >
              検索条件をリセット
            </Button>
          </Surface>
        </View>
      ) : (
        <FlatList
          data={filteredSpots}
          renderItem={renderSpotItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  header: {
    backgroundColor: THEME_COLORS.primary,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.surface,
    borderColor: THEME_COLORS.border,
    borderWidth: 1,
  },
  searchInput: {
    color: THEME_COLORS.text,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  distanceFilterContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: THEME_COLORS.surface,
    borderRadius: 12,
    borderColor: THEME_COLORS.border,
    borderWidth: 1,
  },
  distanceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  slider: {
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderMinLabel: {
    fontSize: 12,
    color: THEME_COLORS.placeholder,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  sliderMaxLabel: {
    fontSize: 12,
    color: THEME_COLORS.placeholder,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  errorContainer: {
    margin: 16,
    marginTop: 0,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: THEME_COLORS.error,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  retryButton: {
    marginLeft: 8,
    backgroundColor: THEME_COLORS.error,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  retryButtonLabel: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.background,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: THEME_COLORS.background,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    width: '100%',
    maxWidth: 400,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: THEME_COLORS.disabled,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
    marginBottom: 20,
  },
  resetButton: {
    marginTop: 16,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  resetButtonLabel: {
    fontWeight: '600',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // タブバーの高さ + 追加のパディング
  },
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rating: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#FFD700',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  distanceText: {
    marginLeft: 4,
    fontSize: 12,
    color: THEME_COLORS.primary,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursText: {
    marginLeft: 4,
    fontSize: 12,
    color: THEME_COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  facilitiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityItem: {
    marginRight: 12,
  },
  detailButton: {
    marginLeft: 'auto',
    padding: 0,
  },
});

export default ListScreen;