import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform, Alert, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region, MapStyleElement } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Appbar, FAB, Card, Chip, ActivityIndicator, Button, Surface, Avatar, Badge, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth } from 'firebase/auth';
import { getSmokerSpots, saveFavoriteSpot } from '../services/firebase';
import { SmokerSpot, Location as LocationType } from '../types';

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

// カスタムマップスタイル
const mapStyle: MapStyleElement[] = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
];

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
    createdAt: null,
    updatedAt: null
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
    createdAt: null,
    updatedAt: null
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
    createdAt: null,
    updatedAt: null
  }
];

const MapScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(null);
  const [spots, setSpots] = useState<SmokerSpot[]>(sampleSpots);
  const [selectedSpot, setSelectedSpot] = useState<SmokerSpot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  // 現在地を取得
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            '位置情報の許可が必要です',
            '近くの喫煙所を表示するには、位置情報の許可が必要です。',
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({});
        const currentLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        
        setCurrentLocation(currentLocation);
        
        // 地図の表示領域を現在地に設定
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...currentLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('位置情報の取得に失敗しました:', error);
        setLoading(false);
      }
    })();
  }, []);

  // 喫煙所データを取得
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const { spots, error } = await getSmokerSpots();
        
        if (error) {
          console.error('喫煙所データの取得に失敗しました:', error);
          return;
        }
        
        if (spots.length > 0) {
          setSpots(spots);
        }
      } catch (error) {
        console.error('喫煙所データの取得に失敗しました:', error);
      }
    };
    
    fetchSpots();
  }, []);

  // 現在地ボタンのハンドラー
  const handleCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      });
    }
  };

  // 喫煙所を保存するハンドラー
  const handleSaveSpot = async (spotId: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('ログインが必要です', 'お気に入りに追加するにはログインが必要です。');
        return;
      }
      
      const { success, error } = await saveFavoriteSpot(spotId, user.uid);
      
      if (success) {
        Alert.alert('保存しました', 'お気に入りに追加しました。');
      } else {
        Alert.alert('エラー', '保存に失敗しました。');
        console.error('お気に入りの保存に失敗しました:', error);
      }
    } catch (error) {
      Alert.alert('エラー', '保存に失敗しました。');
      console.error('お気に入りの保存に失敗しました:', error);
    }
  };

  // 詳細画面に遷移するハンドラー
  const handleViewDetails = (spot: SmokerSpot) => {
    navigation.navigate('SpotDetail', { spotId: spot.id });
  };

  // 喫煙所追加画面に遷移するハンドラー
  const handleAddSpot = () => {
    navigation.navigate('AddSpot', { 
      initialLocation: currentLocation || { 
        latitude: 35.681236, 
        longitude: 139.768149 
      } 
    });
  };

  // フィルターボタンのハンドラー
  const handleFilter = () => {
    setFilterVisible(true);
  };

  // 地図上のマーカーをレンダリング
  const renderMarkers = () => {
    return spots.map((spot) => (
      <Marker
        key={spot.id}
        coordinate={{
          latitude: spot.location.latitude,
          longitude: spot.location.longitude
        }}
        title={spot.title}
        description={spot.description}
        onPress={() => setSelectedSpot(spot)}
      >
        <View style={styles.markerContainer}>
          <Surface style={styles.markerSurface}>
            <MaterialCommunityIcons name="smoking" size={20} color={THEME_COLORS.primary} />
          </Surface>
          <View style={styles.markerArrow} />
        </View>
        <Callout tooltip onPress={() => handleViewDetails(spot)}>
          <Card style={styles.callout} elevation={5}>
            <LinearGradient
              colors={[THEME_COLORS.primary, THEME_COLORS.darkPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.calloutHeader}
            >
              <Text style={styles.calloutTitle}>{spot.title}</Text>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{spot.rating.toFixed(1)}</Text>
              </View>
            </LinearGradient>
            <Card.Content style={styles.calloutContent}>
              <Text style={styles.description}>{spot.description}</Text>
              <View style={styles.facilitiesContainer}>
                {spot.facilities.hasRoof && (
                  <Chip
                    icon="umbrella"
                    style={[styles.facilityChip, { backgroundColor: THEME_COLORS.lightPurple }]}
                    textStyle={{ color: THEME_COLORS.primary, fontWeight: '600' }}
                  >
                    屋根
                  </Chip>
                )}
                {spot.facilities.hasSeating && (
                  <Chip
                    icon="seat"
                    style={[styles.facilityChip, { backgroundColor: THEME_COLORS.lightPurple }]}
                    textStyle={{ color: THEME_COLORS.primary, fontWeight: '600' }}
                  >
                    座席
                  </Chip>
                )}
                {spot.facilities.hasVendingMachine && (
                  <Chip
                    icon="coffee"
                    style={[styles.facilityChip, { backgroundColor: THEME_COLORS.lightPurple }]}
                    textStyle={{ color: THEME_COLORS.primary, fontWeight: '600' }}
                  >
                    自販機
                  </Chip>
                )}
                {spot.facilities.isIndoor ? (
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
              <View style={styles.hoursContainer}>
                <MaterialIcons name="access-time" size={16} color={THEME_COLORS.text} />
                <Text style={styles.hours}>
                  {spot.businessHours.isOpen24Hours
                    ? '24時間営業'
                    : `${spot.businessHours.openingTime}〜${spot.businessHours.closingTime}`
                  }
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={() => handleViewDetails(spot)}
                style={[styles.detailsButton, { backgroundColor: THEME_COLORS.primary }]}
                labelStyle={styles.buttonLabel}
                icon="information-outline"
              >
                詳細を見る
              </Button>
            </Card.Content>
          </Card>
        </Callout>
      </Marker>
    ));
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="喫煙所マップ" titleStyle={styles.headerTitle} />
        <Appbar.Action icon="filter" onPress={handleFilter} color="#FFFFFF" />
        <Appbar.Action icon="magnify" onPress={() => {}} color="#FFFFFF" />
      </Appbar.Header>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBox}>
            <MaterialCommunityIcons name="smoking" size={64} color={THEME_COLORS.primary} />
            <ActivityIndicator size="large" color={THEME_COLORS.primary} style={styles.loadingIndicator} />
            <Text style={styles.loadingText}>地図を読み込み中...</Text>
          </View>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            customMapStyle={mapStyle}
            initialRegion={{
              latitude: 35.681236,
              longitude: 139.768149,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            }}
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass
            showsScale
          >
            {renderMarkers()}
          </MapView>
          
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleCurrentLocation}
          >
            <MaterialIcons name="my-location" size={24} color={THEME_COLORS.primary} />
          </TouchableOpacity>
          
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={handleAddSpot}
            color="#ffffff"
          />
        </View>
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
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
  // マーカースタイル
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
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    transform: [{ translateY: -1 }],
  },
  // コールアウトスタイル
  callout: {
    width: 280,
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
  calloutHeader: {
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calloutTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  calloutContent: {
    padding: 12,
  },
  description: {
    fontSize: 14,
    color: THEME_COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
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
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    marginTop: 8,
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
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hours: {
    fontSize: 14,
    color: THEME_COLORS.text,
    marginLeft: 8,
  },
  detailsButton: {
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
  },
  buttonLabel: {
    fontWeight: '600',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  // 現在地ボタン
  currentLocationButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  // FABスタイル
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
});

export default MapScreen;