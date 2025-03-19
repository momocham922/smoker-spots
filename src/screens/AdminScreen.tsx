import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Appbar, Surface, Button, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import initializeFirestore from '../scripts/initializeFirestore';

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

const AdminScreen = () => {
  const navigation = useNavigation();
  const [initializing, setInitializing] = useState<boolean>(false);
  
  // Firestoreを初期化する
  const handleInitializeFirestore = async () => {
    try {
      // 確認ダイアログを表示
      Alert.alert(
        '確認',
        'Firestoreを初期化し、サンプルデータを登録します。よろしいですか？',
        [
          {
            text: 'キャンセル',
            style: 'cancel'
          },
          {
            text: '初期化する',
            onPress: async () => {
              setInitializing(true);
              
              const { success, error } = await initializeFirestore();
              
              if (success) {
                Alert.alert(
                  '成功',
                  'Firestoreの初期化が完了しました。サンプルデータが登録されました。',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // @ts-ignore
                        navigation.navigate('Map');
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('エラー', `初期化に失敗しました: ${error}`);
              }
              
              setInitializing(false);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('エラー', `初期化に失敗しました: ${error}`);
      setInitializing(false);
    }
  };
  
  // 認証状態を確認
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
          <Appbar.Content title="管理者画面" titleStyle={styles.headerTitle} />
        </Appbar.Header>
        
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={THEME_COLORS.error} />
          <Text style={styles.errorText}>この画面にアクセスするにはログインが必要です。</Text>
          <Button 
            mode="contained" 
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Login');
            }} 
            style={styles.actionButton}
          >
            ログイン
          </Button>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="管理者画面" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Surface style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>データベース管理</Text>
          <Text style={styles.description}>
            Firestoreデータベースの初期化とサンプルデータの登録を行います。
            この操作は、アプリケーションの初回起動時や、データベースをリセットしたい場合に実行してください。
          </Text>
          
          <View style={styles.warningContainer}>
            <MaterialIcons name="warning" size={24} color={THEME_COLORS.warning} />
            <Text style={styles.warningText}>
              初期化を実行すると、既存のデータが上書きされる可能性があります。
            </Text>
          </View>
          
          <Button 
            mode="contained" 
            onPress={handleInitializeFirestore}
            style={styles.initButton}
            loading={initializing}
            disabled={initializing}
          >
            Firestoreを初期化する
          </Button>
        </Surface>
        
        <Surface style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>ユーザー情報</Text>
          <Text style={styles.userInfo}>
            ログイン中のユーザー: {user.email}
          </Text>
          <Text style={styles.userInfo}>
            ユーザーID: {user.uid}
          </Text>
          
          <Divider style={styles.divider} />
          
          <Button 
            mode="outlined" 
            onPress={() => {
              auth.signOut();
              // @ts-ignore
              navigation.navigate('Map');
            }}
            style={styles.logoutButton}
          >
            ログアウト
          </Button>
        </Surface>
      </ScrollView>
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
  infoContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  description: {
    fontSize: 16,
    color: THEME_COLORS.text,
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    color: THEME_COLORS.text,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  initButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 6,
    borderRadius: 8,
  },
  userInfo: {
    fontSize: 16,
    color: THEME_COLORS.text,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: THEME_COLORS.border,
  },
  logoutButton: {
    borderColor: THEME_COLORS.primary,
    paddingVertical: 6,
    borderRadius: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.background,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: THEME_COLORS.text,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  actionButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});

export default AdminScreen;