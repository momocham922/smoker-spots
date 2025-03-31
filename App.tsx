import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// スプラッシュスクリーンのインポート
import SplashScreen from './src/components/SplashScreen';

// スクリーンのインポート
import MapScreen from './src/screens/MapScreen';
import ListScreen from './src/screens/ListScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SpotDetailScreen from './src/screens/SpotDetailScreen';
import AddSpotScreen from './src/screens/AddSpotScreen';
import AdminScreen from './src/screens/AdminScreen';

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyBab6xodw-6bYn1x6UJDRk7W2wITCAnSwc",
  authDomain: "smoker-spots-app.firebaseapp.com",
  projectId: "smoker-spots-app",
  storageBucket: "smoker-spots-app.firebasestorage.app",
  messagingSenderId: "689889531515",
  appId: "1:689889531515:web:07eff45c9aabd34a0234de",
  measurementId: "G-JK214ZN8TS"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// テーマの設定
const theme = {
  ...DefaultTheme,
  dark: false,
  roundness: 12,
  colors: {
    ...DefaultTheme.colors,
    primary: '#7C3AED', // メインカラー（ビビッドな紫）
    accent: '#F43F5E', // アクセントカラー（ビビッドなピンク）
    background: '#F9FAFB', // 背景色（明るいグレー）
    surface: '#FFFFFF', // サーフェス色（白）
    text: '#1F2937', // テキスト色（濃いグレー）
    disabled: '#9CA3AF', // 無効時の色（中間グレー）
    placeholder: '#6B7280', // プレースホルダー色（グレー）
    backdrop: 'rgba(0, 0, 0, 0.5)', // 背景オーバーレイ
    notification: '#F59E0B', // 通知色（オレンジ）
    card: '#FFFFFF', // カード背景色
    border: '#E5E7EB', // ボーダー色
    // カスタムカラー
    success: '#10B981', // 成功色（緑）
    warning: '#F59E0B', // 警告色（オレンジ）
    error: '#EF4444', // エラー色（赤）
    info: '#3B82F6', // 情報色（青）
    lightPurple: '#EDE9FE', // 薄い紫（背景用）
    darkPurple: '#4C1D95', // 濃い紫
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
      fontWeight: '500',
    },
    light: {
      fontFamily: Platform.OS === 'ios' ? 'Avenir-Light' : 'sans-serif-light',
      fontWeight: '300',
    },
    thin: {
      fontFamily: Platform.OS === 'ios' ? 'Avenir-Light' : 'sans-serif-thin',
      fontWeight: '100',
    },
  },
  animation: {
    scale: 1.0,
  },
};

// タブナビゲーターの作成
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// メインタブナビゲーション
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Map') {
            return focused ?
              <MaterialCommunityIcons name="map" size={size} color={color} /> :
              <MaterialCommunityIcons name="map-outline" size={size} color={color} />;
          } else if (route.name === 'List') {
            return focused ?
              <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} /> :
              <MaterialCommunityIcons name="format-list-bulleted-triangle" size={size} color={color} />;
          } else if (route.name === 'Favorites') {
            return focused ?
              <MaterialCommunityIcons name="bookmark" size={size} color={color} /> :
              <MaterialCommunityIcons name="bookmark-outline" size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return focused ?
              <MaterialCommunityIcons name="account-circle" size={size} color={color} /> :
              <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />;
          }
          
          return null;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.disabled,
        tabBarStyle: {
          elevation: 12,
          backgroundColor: '#FFFFFF',
          height: 85, // タブバーの高さを増加
          paddingBottom: 25, // 下部のパディングを増加（iPhoneのホームバー対応）
          paddingTop: 8,
          position: 'absolute',
          bottom: 0, // 画面下端まで背景を表示
          left: 0,
          right: 0,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: '地図' }} />
      <Tab.Screen name="List" component={ListScreen} options={{ title: '一覧' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'お気に入り' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'プロフィール' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  // 位置情報の許可を取得
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);

  // スプラッシュ画面を表示
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 初期化中はローディング表示
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBox}>
          <MaterialIcons name="smoking-rooms" size={64} color={theme.colors.primary} />
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>喫煙所マップを読み込み中...</Text>
        </View>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={theme.colors.primary} />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
            },
            headerShadowVisible: false,
            headerTitleAlign: 'center',
            contentStyle: { backgroundColor: theme.colors.background },
            animation: 'slide_from_right',
          }}
        >
          {/* 認証チェックをバイパスして常にメイン画面を表示 */}
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SpotDetail"
            component={SpotDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddSpot"
            component={AddSpotScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'ログイン' }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'アカウント登録' }}
          />
          <Stack.Screen
            name="Admin"
            component={AdminScreen}
            options={{ title: '管理者画面' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
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
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
});
