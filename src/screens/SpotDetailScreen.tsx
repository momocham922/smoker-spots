import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, Linking, Share, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Appbar, Surface, Divider, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { getSmokerSpotById, saveFavoriteSpot, removeFavoriteSpot, getFavoriteSpots } from '../services/firebase';
import { SmokerSpot } from '../types';
import { getAuth } from 'firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// テーマカラー
const THEME_COLORS = {
  primary: '#7C3AED',
  accent: '#F43F5E',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#1F2937',
  disabled: '#9CA3AF',
  placeholder: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  lightPurple: '#EDE9FE',
  darkPurple: '#4C1D95',
  border: '#E5E7EB',
};

const SpotDetailScreen: React.FC<NativeStackScreenProps<any>> = ({ navigation }) => {
  const route = useRoute();
  const [spot, setSpot] = useState<SmokerSpot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // React Navigationのヘッダーを非表示にする
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  // サンプルデータ
  const sampleSpot: SmokerSpot = {
    id: '1',
    title: '東京駅八重洲口喫煙所',
    description: '東京駅八重洲口近くの屋外喫煙所です。屋根付きで雨の日も安心です。座席も完備されており、ゆっくりとタバコを楽しむことができます。駅から徒歩2分の便利な場所にあります。',
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
    createdAt: null,
    updatedAt: null
  };

  useEffect(() => {
    const fetchSpotDetails = async () => {
      try {
        // @ts-ignore
        const spotId = route.params?.spotId;
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!spotId) {
          console.log('喫煙所IDが指定されていません');
          setSpot(sampleSpot);
          setLoading(false);
          return;
        }
        
        const response = await getSmokerSpotById(spotId);
        
        if (response.error) {
          if (response.error === 'Spot not found') {
            setErrorMessage('指定された喫煙所が見つかりません。サンプルデータを表示しています。');
          } else {
            setErrorMessage('喫煙所データの取得に失敗しました。サンプルデータを表示しています。');
          }
          setSpot(sampleSpot);
        } else if (response.spot) {
          const spotData = response.spot as SmokerSpot;
          setSpot(spotData);
          
          // お気に入りの状態を確認
          if (user) {
            const { spots } = await getFavoriteSpots(user.uid);
            if (spots && spots.some(spot => spot.id === spotId)) {
              setIsFavorite(true);
            }
          }
        } else {
          setErrorMessage('喫煙所データがnullです。サンプルデータを表示しています。');
          setSpot(sampleSpot);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('喫煙所データの取得に失敗しました:', error);
        setErrorMessage('例外が発生しました。サンプルデータを表示しています。');
        setSpot(sampleSpot);
        setLoading(false);
      }
    };
    
    fetchSpotDetails();
  }, []);

  const handleFavorite = async () => {
    try {
      setFavoriteLoading(true);
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('ログインが必要です', 'お気に入りに追加するにはログインが必要です。');
        setFavoriteLoading(false);
        return;
      }
      
      if (!spot) {
        setFavoriteLoading(false);
        return;
      }
      
      if (isFavorite) {
        const { success, error } = await removeFavoriteSpot(spot.id, user.uid);
        
        if (success) {
          setIsFavorite(false);
          Alert.alert('削除しました', 'お気に入りから削除しました。');
        } else {
          Alert.alert('エラー', '削除に失敗しました。');
        }
      } else {
        const { success, error } = await saveFavoriteSpot(spot.id, user.uid);
        
        if (success) {
          setIsFavorite(true);
          Alert.alert('保存しました', 'お気に入りに追加しました。');
        } else {
          Alert.alert('エラー', '保存に失敗しました。');
        }
      }
      
      setFavoriteLoading(false);
    } catch (error) {
      Alert.alert('エラー', '操作に失敗しました。');
      setFavoriteLoading(false);
    }
  };

  const handleOpenInMaps = () => {
    if (!spot) return;
    
    const { latitude, longitude } = spot.location;
    const label = spot.title;
    
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleShare = async () => {
    if (!spot) return;
    
    try {
      await Share.share({
        message: `${spot.title} - ${spot.description}\n\n位置情報: ${spot.location.latitude}, ${spot.location.longitude}`,
        title: '喫煙所情報をシェア'
      });
    } catch (error) {
      console.error('シェアに失敗しました:', error);
    }
  };

  let content;
  if (loading) {
    content = (
      <View style={styles.loadingContainer}>
        <Surface style={styles.loadingBox}>
          <MaterialCommunityIcons name="smoking" size={64} color={THEME_COLORS.primary} />
          <ActivityIndicator size="large" color={THEME_COLORS.primary} style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>喫煙所データを読み込み中...</Text>
        </Surface>
      </View>
    );
  } else if (!spot) {
    content = (
      <View style={styles.errorContainer}>
        <Surface style={styles.errorBox}>
          <MaterialIcons name="error-outline" size={48} color={THEME_COLORS.error} />
          <Text style={styles.errorText}>喫煙所データを取得できませんでした</Text>
          <Text style={styles.errorSubText}>ネットワーク接続を確認して再試行してください</Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            labelStyle={styles.backButtonLabel}
          >
            戻る
          </Button>
        </Surface>
      </View>
    );
  } else {
    content = (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Surface style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: spot.location.latitude,
              longitude: spot.location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: spot.location.latitude,
                longitude: spot.location.longitude
              }}
              title={spot.title}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerSurface}>
                  <MaterialCommunityIcons name="smoking" size={20} color={THEME_COLORS.primary} />
                </View>
              </View>
            </Marker>
          </MapView>
          
          <TouchableOpacity
            style={styles.openInMapsButton}
            onPress={handleOpenInMaps}
          >
            <Text style={styles.openInMapsText}>地図アプリで開く</Text>
            <MaterialIcons name="open-in-new" size={16} color={THEME_COLORS.primary} />
          </TouchableOpacity>
        </Surface>
        
        <Surface style={styles.infoContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{spot.title}</Text>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={20} color="#FFD700" />
              <Text style={styles.rating}>{spot.rating.toFixed(1)}</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{spot.description}</Text>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>営業時間</Text>
          <View style={styles.hoursContainer}>
            <MaterialIcons name="access-time" size={20} color={THEME_COLORS.text} />
            <Text style={styles.hours}>
              {spot.businessHours.isOpen24Hours
                ? '24時間営業'
                : `${spot.businessHours.openingTime}〜${spot.businessHours.closingTime}`
              }
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>設備</Text>
          <View style={styles.facilitiesContainer}>
            <View style={styles.facilityItem}>
              <MaterialCommunityIcons 
                name="umbrella" 
                size={24} 
                color={spot.facilities.hasRoof ? THEME_COLORS.success : THEME_COLORS.disabled} 
              />
              <Text style={[
                styles.facilityText, 
                { color: spot.facilities.hasRoof ? THEME_COLORS.text : THEME_COLORS.disabled }
              ]}>
                屋根
              </Text>
            </View>
            
            <View style={styles.facilityItem}>
              <MaterialCommunityIcons 
                name="seat" 
                size={24} 
                color={spot.facilities.hasSeating ? THEME_COLORS.success : THEME_COLORS.disabled} 
              />
              <Text style={[
                styles.facilityText, 
                { color: spot.facilities.hasSeating ? THEME_COLORS.text : THEME_COLORS.disabled }
              ]}>
                座席
              </Text>
            </View>
            
            <View style={styles.facilityItem}>
              <MaterialCommunityIcons 
                name="coffee" 
                size={24} 
                color={spot.facilities.hasVendingMachine ? THEME_COLORS.success : THEME_COLORS.disabled} 
              />
              <Text style={[
                styles.facilityText, 
                { color: spot.facilities.hasVendingMachine ? THEME_COLORS.text : THEME_COLORS.disabled }
              ]}>
                自販機
              </Text>
            </View>
            
            <View style={styles.facilityItem}>
              <MaterialCommunityIcons 
                name={spot.facilities.isIndoor ? "home" : "tree"} 
                size={24} 
                color={THEME_COLORS.success} 
              />
              <Text style={styles.facilityText}>
                {spot.facilities.isIndoor ? '屋内' : '屋外'}
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>位置情報</Text>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={20} color={THEME_COLORS.text} />
            <Text style={styles.locationText}>
              {`${spot.location.latitude.toFixed(6)}, ${spot.location.longitude.toFixed(6)}`}
            </Text>
          </View>
        </Surface>
        
        <Surface style={styles.actionsContainer}>
          <Button 
            mode="contained" 
            icon="directions" 
            onPress={handleOpenInMaps}
            style={styles.directionButton}
            contentStyle={styles.buttonContent}
          >
            ここへ行く
          </Button>
          
          <Button 
            mode="outlined" 
            icon={isFavorite ? "heart" : "heart-outline"} 
            onPress={handleFavorite}
            style={styles.favoriteButton}
            contentStyle={styles.buttonContent}
            loading={favoriteLoading}
            disabled={favoriteLoading}
          >
            {isFavorite ? 'お気に入り済み' : 'お気に入りに追加'}
          </Button>
        </Surface>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content
          title={errorMessage ? "喫煙所の詳細 (サンプル)" : "喫煙所の詳細"}
          titleStyle={styles.headerTitle}
        />
        {!loading && spot && (
          <>
            <Appbar.Action
              icon={isFavorite ? "heart" : "heart-outline"}
              onPress={handleFavorite}
              color="#FFFFFF"
              disabled={favoriteLoading}
            />
            <Appbar.Action icon="share" onPress={handleShare} color="#FFFFFF" />
          </>
        )}
      </Appbar.Header>

      {errorMessage && (
        <View style={styles.warningBanner}>
          <MaterialIcons name="info-outline" size={20} color={THEME_COLORS.warning} />
          <Text style={styles.warningText}>{errorMessage}</Text>
        </View>
      )}

      <View style={styles.contentContainer}>
        {content}
      </View>
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
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.background,
    padding: 20,
  },
  errorBox: {
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
  errorText: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
    color: THEME_COLORS.text,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  errorSubText: {
    marginBottom: 24,
    fontSize: 14,
    color: THEME_COLORS.placeholder,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  backButton: {
    marginTop: 16,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  backButtonLabel: {
    fontWeight: '600',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    color: THEME_COLORS.text,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  mapContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  map: {
    height: 200,
  },
  openInMapsButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  openInMapsText: {
    fontSize: 12,
    color: THEME_COLORS.primary,
    marginRight: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  infoContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    flex: 1,
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
  },
  description: {
    fontSize: 16,
    color: THEME_COLORS.text,
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: THEME_COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hours: {
    fontSize: 16,
    color: THEME_COLORS.text,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  facilityItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityText: {
    fontSize: 16,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: THEME_COLORS.text,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  actionsContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  directionButton: {
    backgroundColor: THEME_COLORS.primary,
    marginBottom: 12,
    borderRadius: 8,
  },
  favoriteButton: {
    borderColor: THEME_COLORS.primary,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerSurface: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default SpotDetailScreen;