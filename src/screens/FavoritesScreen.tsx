import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Card, Chip, Surface, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getFavoriteSpots } from '../services/firebase';
import { SmokerSpot } from '../types';
import { getAuth } from 'firebase/auth';

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

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favoriteSpots, setFavoriteSpots] = useState<SmokerSpot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // ログイン状態とお気に入りデータを取得
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setIsLoggedIn(true);
      fetchFavoriteSpots(user.uid);
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  // お気に入りの喫煙所データを取得
  const fetchFavoriteSpots = async (userId: string) => {
    try {
      setLoading(true);
      const { spots, error } = await getFavoriteSpots(userId);
      
      if (error) {
        console.error('お気に入りデータの取得に失敗しました:', error);
        setLoading(false);
        return;
      }
      
      if (spots && spots.length > 0) {
        setFavoriteSpots(spots as SmokerSpot[]);
      } else {
        setFavoriteSpots([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('お気に入りデータの取得に失敗しました:', error);
      setLoading(false);
    }
  };

  // 詳細画面に遷移するハンドラー
  const handleViewDetails = (spot: SmokerSpot) => {
    // @ts-ignore
    navigation.navigate('SpotDetail', { spotId: spot.id });
  };

  // ログイン画面に遷移するハンドラー
  const handleLogin = () => {
    // @ts-ignore
    navigation.navigate('Login');
  };

  // メイン画面に遷移するハンドラー
  const handleNavigateToMain = () => {
    // @ts-ignore
    navigation.navigate('Main');
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
          title="お気に入り" 
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Surface style={styles.loadingBox}>
            <MaterialCommunityIcons name="heart" size={64} color={THEME_COLORS.primary} />
            <ActivityIndicator size="large" color={THEME_COLORS.primary} style={styles.loadingIndicator} />
            <Text style={styles.loadingText}>お気に入りを読み込み中...</Text>
          </Surface>
        </View>
      ) : !isLoggedIn ? (
        <View style={styles.notLoggedInContainer}>
          <MaterialIcons name="account-circle" size={80} color={THEME_COLORS.disabled} />
          <Text style={styles.notLoggedInTitle}>ログインが必要です</Text>
          <Text style={styles.notLoggedInText}>
            お気に入り機能を利用するには、ログインが必要です。
          </Text>
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
          >
            ログインする
          </Button>
        </View>
      ) : favoriteSpots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Surface style={styles.emptyBox}>
            <MaterialIcons name="favorite-border" size={64} color={THEME_COLORS.disabled} />
            <Text style={styles.emptyTitle}>お気に入りがありません</Text>
            <Text style={styles.emptyText}>喫煙所の詳細画面からお気に入りに追加できます。</Text>
            <Button 
              mode="contained" 
              onPress={handleNavigateToMain}
              style={styles.mapButton}
              labelStyle={styles.mapButtonLabel}
            >
              マップを見る
            </Button>
          </Surface>
        </View>
      ) : (
        <FlatList
          data={favoriteSpots}
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
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  notLoggedInText: {
    fontSize: 16,
    color: THEME_COLORS.placeholder,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
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
  loginButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonLabel: {
    fontWeight: '600',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  mapButton: {
    marginTop: 16,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  mapButtonLabel: {
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

export default FavoritesScreen;