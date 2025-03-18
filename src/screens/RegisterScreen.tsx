import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TextInput, Button, Surface, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { registerWithEmail } from '../services/firebase';

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

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState<boolean>(true);

  // メイン画面に遷移するハンドラー
  const handleNavigateToMain = () => {
    // @ts-ignore
    navigation.navigate('Main');
  };

  // ログイン画面に遷移するハンドラー
  const handleNavigateToLogin = () => {
    // @ts-ignore
    navigation.navigate('Login');
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

    // パスワード確認のバリデーション
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('パスワード（確認）を入力してください');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('パスワードが一致しません');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  // 登録ハンドラー
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const { user, error } = await registerWithEmail(email, password);

      if (error) {
        console.error('登録に失敗しました:', error);
        
        // エラーメッセージをユーザーフレンドリーに変換
        let errorMessage = 'アカウント登録中にエラーが発生しました。';
        const firebaseError = error as { code?: string };
        
        if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = 'このメールアドレスは既に使用されています。';
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = '無効なメールアドレスです。';
        } else if (firebaseError.code === 'auth/weak-password') {
          errorMessage = 'パスワードが弱すぎます。より強力なパスワードを設定してください。';
        }
        
        Alert.alert('登録エラー', errorMessage);
        setLoading(false);
        return;
      }

      if (user) {
        // 登録成功
        Alert.alert(
          '登録完了',
          'アカウントが正常に作成されました。',
          [
            {
              text: 'OK',
              onPress: handleNavigateToMain
            }
          ]
        );
      }

      setLoading(false);
    } catch (error) {
      console.error('登録に失敗しました:', error);
      Alert.alert(
        'エラー',
        'アカウント登録中にエラーが発生しました。もう一度お試しください。'
      );
      setLoading(false);
    }
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
          <Text style={styles.appSubtitle}>新規アカウント登録</Text>
        </View>

        <Surface style={styles.formContainer}>
          <Text style={styles.formTitle}>アカウント作成</Text>

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
            placeholder="6文字以上のパスワード"
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

          <TextInput
            label="パスワード（確認）"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            error={!!confirmPasswordError}
            secureTextEntry={secureConfirmTextEntry}
            placeholder="パスワードを再入力"
            left={<TextInput.Icon icon="lock-check" color={THEME_COLORS.primary} />}
            right={
              <TextInput.Icon
                icon={secureConfirmTextEntry ? 'eye-off' : 'eye'}
                color={THEME_COLORS.primary}
                onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
              />
            }
          />
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

          <Text style={styles.termsText}>
            アカウントを作成することで、
            <Text style={styles.termsLink}>利用規約</Text>
            および
            <Text style={styles.termsLink}>プライバシーポリシー</Text>
            に同意したことになります。
          </Text>

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.registerButton}
            loading={loading}
            disabled={loading}
          >
            アカウント作成
          </Button>

          <Divider style={styles.divider} />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>既にアカウントをお持ちですか？</Text>
            <TouchableOpacity onPress={handleNavigateToLogin}>
              <Text style={styles.loginLink}>ログイン</Text>
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
  termsText: {
    fontSize: 12,
    color: THEME_COLORS.text,
    marginVertical: 16,
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  termsLink: {
    color: THEME_COLORS.primary,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  registerButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 8,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 24,
    backgroundColor: THEME_COLORS.border,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: THEME_COLORS.text,
    fontSize: 14,
    marginRight: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  loginLink: {
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

export default RegisterScreen;