import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Card, Chip, Searchbar, ActivityIndicator, Divider, Surface, Button } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getSmokerSpots } from '../services/firebase';
import { SmokerSpot } from '../types';
import { serverTimestamp } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

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

const ListScreen = () => {
  const navigation = useNavigation();
  const [spots, setSpots] = useState<SmokerSpot[]>(sampleSpots);
  const [filteredSpots, setFilteredSpots] = useState<SmokerSpot[]>(sampleSpots);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // 喫煙所データを取得
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const { spots, error } = await getSmokerSpots();
        
        if (error) {
          console.error('喫煙所データの取得に失敗しました:', error);
          setLoading(false);
          return;
        }
        
        if (spots.length > 0) {
          setSpots(spots);
          setFilteredSpots(spots);
        } else {
          setSpots(sampleSpots);
          setFilteredSpots(sampleSpots);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('喫煙所データの取得に失敗しました:', error);
        setLoading(false);
      }
    };
    
    fetchSpots();
  }, []);

  // 検索クエリが変更されたときのハンドラー
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredSpots(spots);
      return;
    }
    
    const filtered = spots.filter(spot => 
      spot.title.toLowerCase().includes(query.toLowerCase()) ||
      spot.description.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredSpots(filtered);
  };

  // 詳細画面に遷移するハンドラー
  const handleViewDetails = (spot: SmokerSpot) => {
    navigation.navigate('SpotDetail', { spotId: spot.id });
  };

  // 喫煙所アイテムをレンダリング
  const renderSpotItem = ({ item }: { item: SmokerSpot }) => (
    <TouchableOpacity 
      onPress={() => handleViewDetails(item)}
      style={styles.cardContainer}
      activeOpacity={0.7}
    >
      <Card style={styles.card} elevation={3}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <MaterialCommunityIcons name="smoking" size={20} color={THEME_COLORS.primary} style={styles.titleIcon} />
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{item.description}</Text>
          
          <View style={styles.facilitiesContainer}>
            {item.facilities.hasRoof && (
              <Chip 
                icon="umbrella" 
                style={[styles.facilityChip, { backgroundColor: THEME_COLORS.lightPurple }]} 
                textStyle={{ color: THEME_COLORS.primary, fontWeight: '600' }}
              >
                屋根
              </Chip>
            )}
            {item.facilities.hasSeating && (
              <Chip 
                icon="seat" 
                style={[styles.facilityChip, { backgroundColor: THEME_COLORS.lightPurple }]} 
                textStyle={{ color: THEME_COLORS.primary, fontWeight: '600' }}
              >
                座席
              </Chip>
            )}
            {item.facilities.hasVendingMachine && (
              <Chip 
                icon="coffee" 
                style={[styles.facilityChip, { backgroundColor: THEME_COLORS.lightPurple }]} 
                textStyle={{ color: THEME_COLORS.primary, fontWeight: '600' }}
              >
                自販機
              </Chip>
            )}
            {item.facilities.isIndoor ? (
              <Chip 
                icon="home" 
                style={[styles.facilityChip, { backgroundColor: THEME_COLORS.lightPurple }]} 
                textStyle={{ color: THEME_COLORS.primary, fontWeight: '600' }}
              >
                屋内
              </Chip>
            ) : (
              <Chip 
                icon="tree" 
                style={[styles.facilityChip, { backgroundColor: THEME_COLORS.lightPurple }]} 
                textStyle={{ color: THEME_COLORS.primary, fontWeight: '600' }}
              >
                屋外
              </Chip>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.footer}>
            <View style={styles.hoursContainer}>
              <MaterialIcons name="access-time" size={16} color={THEME_COLORS.text} />
              <Text style={styles.hours}>
                {item.businessHours.isOpen24Hours 
                  ? '24時間営業' 
                  : `${item.businessHours.openingTime}〜${item.businessHours.closingTime}`
                }
              </Text>
            </View>
            <Button 
              mode="text" 
              icon="chevron-right" 
              textColor={THEME_COLORS.primary}
              contentStyle={{ flexDirection: 'row-reverse' }}
              labelStyle={{ marginRight: -8 }}
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
        <Appbar.Action icon="filter" onPress={() => {}} color="#FFFFFF" />
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
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Surface style={styles.loadingBox}>
            <MaterialCommunityIcons name="smoking" size={64} color={THEME_COLORS.primary} />
            <ActivityIndicator size="large" color={THEME_COLORS.primary} style={styles.loadingIndicator} />
            <Text style={styles.loadingText}>喫煙所データを読み込み中...</Text>
          </Surface>
        </View>
      ) : filteredSpots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Surface style={styles.emptyBox}>
            <MaterialIcons name="search-off" size={64} color={THEME_COLORS.disabled} />
            <Text style={styles.emptyTitle}>検索結果なし</Text>
            <Text style={styles.emptyText}>検索条件に一致する喫煙所が見つかりませんでした</Text>
            <Button 
              mode="contained" 
              onPress={() => {
                setSearchQuery('');
                setFilteredSpots(spots);
              }}
              style={styles.resetButton}
              labelStyle={styles.resetButtonLabel}
            >
              検索をリセット
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
    paddingBottom: 32,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  description: {
    fontSize: 14,
    color: THEME_COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  facilityChip: {
    margin: 2,
    height: 32,
  },
  divider: {
    marginVertical: 12,
    height: 1,
    backgroundColor: THEME_COLORS.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hours: {
    marginLeft: 8,
    fontSize: 14,
    color: THEME_COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
});

export default ListScreen;