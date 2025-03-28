import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Callout, Region, MapStyleElement } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Appbar, FAB, Button } from 'react-native-paper';
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
  const [spots, setSpots] = useState<SmokerSpot[]>([]);
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
        console.log('Firestoreからデータを取得中...');
        const { spots: fetchedSpots, error } = await getSmokerSpots();
        
        if (error) {
          console.error('喫煙所データの取得に失敗しました:', error);
          // エラー時はサンプルデータを使用
          setSpots(sampleSpots);
          return;
        }
        
        if (fetchedSpots && fetchedSpots.length > 0) {
          console.log(`${fetchedSpots.length}件の喫煙所データを取得しました`);
          const typedSpots = fetchedSpots as unknown as SmokerSpot[];
          setSpots(typedSpots);
        } else {
          console.log('喫煙所データが見つかりませんでした');
          // データが見つからない場合はサンプルデータを使用
          setSpots(sampleSpots);
        }
      } catch (error) {
        console.error('喫煙所データの取得に失敗しました:', error);
        // エラー時はサンプルデータを使用
        setSpots(sampleSpots);
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

  // 詳細画面に遷移するハンドラー
  const handleViewDetails = (spot: SmokerSpot) => {
    // @ts-ignore
    navigation.navigate('SpotDetail', { spotId: spot.id });
  };

  // 喫煙所追加画面に遷移するハンドラー
  const handleAddSpot = () => {
    // @ts-ignore
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

  // 地図上のマーカーをレンダリング（シンプル化）
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
          <View style={styles.markerSurface}>
            <MaterialCommunityIcons name="smoking" size={20} color={THEME_COLORS.primary} />
          </View>
        </View>
        <Callout onPress={() => handleViewDetails(spot)}>
          <View style={styles.calloutContainer}>
            <Text style={styles.calloutTitle}>{spot.title}</Text>
            <Text style={styles.calloutDescription}>{spot.description}</Text>
            <View style={styles.calloutFooter}>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{spot.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.hours}>
                {spot.businessHours.isOpen24Hours
                  ? '24時間営業'
                  : `${spot.businessHours.openingTime}〜${spot.businessHours.closingTime}`
                }
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => handleViewDetails(spot)}
            >
              <Text style={styles.detailsButtonText}>詳細を見る</Text>
            </TouchableOpacity>
          </View>
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
  // マーカースタイル（シンプル化）
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
  // コールアウトスタイル（シンプル化）
  calloutContainer: {
    width: 220,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: THEME_COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  calloutDescription: {
    fontSize: 14,
    color: THEME_COLORS.text,
    marginBottom: 10,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  calloutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
  },
  hours: {
    fontSize: 12,
    color: THEME_COLORS.text,
  },
  detailsButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: 'bold',
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