import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Image, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TextInput, Button, Surface, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { loginWithEmail } from '../services/firebase';

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

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);

  // 既にログインしているかチェック
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ユーザーがログイン済みの場合、メイン画面に遷移
        handleNavigateToMain();
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  // メイン画面に遷移するハンドラー
  const handleNavigateToMain = () => {
    // @ts-ignore
    navigation.navigate('Main');
  };

  // フォームのバリデーション
  const validateForm = (): boolean => {
    let isValid = true;

    // メールアドレスのバリデーション
    if (!email.trim()) {
      setEmailError('メールアドレスを入力してください');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('有効なメールアドレスを入力してください');
      isValid = false;
    } else {
      setEmailError('');
    }

    // パスワードのバリデーション
    if (!password.trim()) {
      setPasswordError('パスワードを入力してください');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('パスワードは6文字以上で入力してください');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  // ログインハンドラー
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const { user, error } = await loginWithEmail(email, password);

      if (error) {
        console.error('ログインに失敗しました:', error);
        Alert.alert(
          'ログインエラー',
          'メールアドレスまたはパスワードが正しくありません。'
        );
        setLoading(false);
        return;
      }

      if (user) {
        // ログイン成功
        handleNavigateToMain();
      }

      setLoading(false);
    } catch (error) {
      console.error('ログインに失敗しました:', error);
      Alert.alert(
        'エラー',
        'ログイン中にエラーが発生しました。もう一度お試しください。'
      );
      setLoading(false);
    }
  };

  // 新規登録画面に遷移
  const handleRegister = () => {
    // @ts-ignore
    navigation.navigate('Register');
  };

  // パスワードリセット画面に遷移
  const handleForgotPassword = () => {
    // @ts-ignore
    navigation.navigate('ForgotPassword');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <MaterialIcons name="smoking-rooms" size={64} color={THEME_COLORS.primary} />
          <Text style={styles.appTitle}>喫煙所マップ</Text>
          <Text style={styles.appSubtitle}>あなたの近くの喫煙所を見つけよう</Text>
        </View>

        <Surface style={styles.formContainer}>
          <Text style={styles.formTitle}>ログイン</Text>

          <TextInput
            label="メールアドレス"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            error={!!emailError}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email" color={THEME_COLORS.primary} />}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <TextInput
            label="パスワード"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            error={!!passwordError}
            secureTextEntry={secureTextEntry}
            placeholder="パスワードを入力"
            left={<TextInput.Icon icon="lock" color={THEME_COLORS.primary} />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye-off' : 'eye'}
                color={THEME_COLORS.primary}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>パスワードをお忘れですか？</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            loading={loading}
            disabled={loading}
          >
            ログイン
          </Button>

          <Divider style={styles.divider} />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>アカウントをお持ちでないですか？</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>新規登録</Text>
            </TouchableOpacity>
          </View>
        </Surface>

        <TouchableOpacity
          style={styles.skipContainer}
          onPress={handleNavigateToMain}
        >
          <Text style={styles.skipText}>スキップしてアプリを使用</Text>
          <MaterialIcons name="arrow-forward" size={16} color={THEME_COLORS.primary} />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME_COLORS.primary,
    marginTop: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  appSubtitle: {
    fontSize: 16,
    color: THEME_COLORS.text,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  formContainer: {
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  input: {
    marginBottom: 8,
    backgroundColor: THEME_COLORS.surface,
  },
  errorText: {
    color: THEME_COLORS.error,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: THEME_COLORS.primary,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  loginButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 8,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 24,
    backgroundColor: THEME_COLORS.border,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: THEME_COLORS.text,
    fontSize: 14,
    marginRight: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  registerLink: {
    color: THEME_COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  skipContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  skipText: {
    color: THEME_COLORS.primary,
    fontSize: 14,
    marginRight: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
});

export default LoginScreen;