import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Surface, Button, Divider, List, Avatar, Switch } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { getUserProfile, logout } from '../services/firebase';
import { UserProfile } from '../types';

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

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  // ログイン状態とプロフィールデータを取得
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setIsLoggedIn(true);
      fetchUserProfile(user.uid);
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  // ユーザープロフィールを取得
  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { profile, error } = await getUserProfile(userId);
      
      if (error) {
        console.error('プロフィールデータの取得に失敗しました:', error);
        setLoading(false);
        return;
      }
      
      if (profile) {
        setProfile(profile as UserProfile);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('プロフィールデータの取得に失敗しました:', error);
      setLoading(false);
    }
  };

  // ログイン画面に遷移するハンドラー
  const handleNavigateToLogin = () => {
    // @ts-ignore
    navigation.navigate('Login');
  };

  // ログアウトハンドラー
  const handleLogout = async () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel'
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await logout();
              
              if (error) {
                console.error('ログアウトに失敗しました:', error);
                Alert.alert('エラー', 'ログアウトに失敗しました。もう一度お試しください。');
                return;
              }
              
              setIsLoggedIn(false);
              setProfile(null);
              
              // マップ画面に遷移
              // @ts-ignore
              navigation.navigate('Map');
            } catch (error) {
              console.error('ログアウトに失敗しました:', error);
              Alert.alert('エラー', 'ログアウトに失敗しました。もう一度お試しください。');
            }
          }
        }
      ]
    );
  };

  // お気に入り画面に遷移するハンドラー
  const handleNavigateToFavorites = () => {
    // @ts-ignore
    navigation.navigate('Favorites');
  };

  // プロフィール編集画面に遷移するハンドラー
  const handleEditProfile = () => {
    // 現在は未実装
    Alert.alert('お知らせ', 'この機能は現在開発中です。');
  };

  // 設定変更ハンドラー
  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    // 実際のダークモード切り替え処理は未実装
    Alert.alert('お知らせ', 'ダークモード機能は現在開発中です。');
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // 実際の通知設定処理は未実装
    Alert.alert('お知らせ', '通知設定機能は現在開発中です。');
  };

  // ログイン状態に応じたコンテンツをレンダリング
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      );
    }

    if (!isLoggedIn) {
      return (
        <View style={styles.notLoggedInContainer}>
          <MaterialIcons name="account-circle" size={80} color={THEME_COLORS.disabled} />
          <Text style={styles.notLoggedInTitle}>ログインが必要です</Text>
          <Text style={styles.notLoggedInText}>
            プロフィール機能を利用するには、ログインが必要です。
          </Text>
          <Button
            mode="contained"
            onPress={handleNavigateToLogin}
            style={styles.loginButton}
          >
            ログインする
          </Button>
        </View>
      );
    }

    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Surface style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile?.photoURL ? (
              <Avatar.Image
                source={{ uri: profile.photoURL }}
                size={80}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text
                label={profile?.displayName?.substring(0, 2) || profile?.email?.substring(0, 2) || 'U'}
                size={80}
                style={styles.avatar}
                color="#FFFFFF"
                labelStyle={styles.avatarLabel}
              />
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>
                {profile?.displayName || '名前未設定'}
              </Text>
              <Text style={styles.email}>{profile?.email}</Text>
            </View>
          </View>
          
          <Button
            mode="outlined"
            icon="account-edit"
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            プロフィールを編集
          </Button>
        </Surface>

        <Surface style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.stats?.posts || 0}</Text>
            <Text style={styles.statLabel}>投稿</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.stats?.reviews || 0}</Text>
            <Text style={styles.statLabel}>レビュー</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.stats?.favorites || 0}</Text>
            <Text style={styles.statLabel}>お気に入り</Text>
          </View>
        </Surface>

        <Surface style={styles.menuContainer}>
          <List.Section>
            <List.Subheader style={styles.menuHeader}>アカウント</List.Subheader>
            <List.Item
              title="お気に入り"
              left={props => <List.Icon {...props} icon="heart" color={THEME_COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleNavigateToFavorites}
              style={styles.menuItem}
              titleStyle={styles.menuTitle}
            />
            <List.Item
              title="投稿した喫煙所"
              left={props => <List.Icon {...props} icon="smoking" color={THEME_COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('お知らせ', 'この機能は現在開発中です。')}
              style={styles.menuItem}
              titleStyle={styles.menuTitle}
            />
            <List.Item
              title="レビュー履歴"
              left={props => <List.Icon {...props} icon="star" color={THEME_COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('お知らせ', 'この機能は現在開発中です。')}
              style={styles.menuItem}
              titleStyle={styles.menuTitle}
            />
          </List.Section>

          <Divider style={styles.divider} />

          <List.Section>
            <List.Subheader style={styles.menuHeader}>設定</List.Subheader>
            <List.Item
              title="ダークモード"
              left={props => <List.Icon {...props} icon="theme-light-dark" color={THEME_COLORS.primary} />}
              right={() => (
                <Switch
                  value={darkMode}
                  onValueChange={handleToggleDarkMode}
                  color={THEME_COLORS.primary}
                />
              )}
              style={styles.menuItem}
              titleStyle={styles.menuTitle}
            />
            <List.Item
              title="通知"
              left={props => <List.Icon {...props} icon="bell" color={THEME_COLORS.primary} />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  color={THEME_COLORS.primary}
                />
              )}
              style={styles.menuItem}
              titleStyle={styles.menuTitle}
            />
            <List.Item
              title="言語"
              description="日本語"
              left={props => <List.Icon {...props} icon="translate" color={THEME_COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('お知らせ', 'この機能は現在開発中です。')}
              style={styles.menuItem}
              titleStyle={styles.menuTitle}
              descriptionStyle={styles.menuDescription}
            />
          </List.Section>

          <Divider style={styles.divider} />

          <List.Section>
            <List.Subheader style={styles.menuHeader}>その他</List.Subheader>
            <List.Item
              title="ヘルプ・サポート"
              left={props => <List.Icon {...props} icon="help-circle" color={THEME_COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('お知らせ', 'この機能は現在開発中です。')}
              style={styles.menuItem}
              titleStyle={styles.menuTitle}
            />
            <List.Item
              title="プライバシーポリシー"
              left={props => <List.Icon {...props} icon="shield-account" color={THEME_COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('お知らせ', 'この機能は現在開発中です。')}
              style={styles.menuItem}
              titleStyle={styles.menuTitle}
            />
            <List.Item
              title="利用規約"
              left={props => <List.Icon {...props} icon="file-document" color={THEME_COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('お知らせ', 'この機能は現在開発中です。')}
              style={styles.menuItem}
              titleStyle={styles.menuTitle}
            />
            <List.Item
              title="アプリについて"
              left={props => <List.Icon {...props} icon="information" color={THEME_COLORS.primary} />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('お知らせ', 'この機能は現在開発中です。')}
              style={styles.menuItem}
              titleStyle={styles.menuTitle}
            />
          </List.Section>
        </Surface>

        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          labelStyle={styles.logoutButtonLabel}
        >
          ログアウト
        </Button>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="プロフィール" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      
      {renderContent()}
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: THEME_COLORS.text,
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
  loginButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  profileHeader: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: THEME_COLORS.primary,
  },
  avatarLabel: {
    fontWeight: 'bold',
    fontSize: 32,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  email: {
    fontSize: 14,
    color: THEME_COLORS.placeholder,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  editButton: {
    borderColor: THEME_COLORS.primary,
    borderRadius: 8,
  },
  statsContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  statLabel: {
    fontSize: 14,
    color: THEME_COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: THEME_COLORS.border,
    alignSelf: 'center',
  },
  menuContainer: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  menuHeader: {
    color: THEME_COLORS.primary,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  menuItem: {
    paddingVertical: 8,
  },
  menuTitle: {
    fontSize: 16,
    color: THEME_COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  menuDescription: {
    fontSize: 14,
    color: THEME_COLORS.placeholder,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  divider: {
    backgroundColor: THEME_COLORS.border,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
    borderColor: THEME_COLORS.error,
    borderRadius: 8,
  },
  logoutButtonContent: {
    paddingVertical: 6,
  },
  logoutButtonLabel: {
    color: THEME_COLORS.error,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
});

export default ProfileScreen;