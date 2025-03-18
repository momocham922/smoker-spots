import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, Platform, Alert, TouchableOpacity, Switch, KeyboardAvoidingView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Appbar, TextInput, Button, Surface, Divider, HelperText, Checkbox } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getAuth } from 'firebase/auth';
import { addSmokerSpot } from '../services/firebase';
import { Location as LocationType } from '../types';

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

const AddSpotScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  
  // フォーム状態
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<LocationType | null>(null);
  const [isIndoor, setIsIndoor] = useState<boolean>(false);
  const [hasRoof, setHasRoof] = useState<boolean>(true);
  const [hasSeating, setHasSeating] = useState<boolean>(false);
  const [hasVendingMachine, setHasVendingMachine] = useState<boolean>(false);
  const [isOpen24Hours, setIsOpen24Hours] = useState<boolean>(true);
  const [openingTime, setOpeningTime] = useState<string>('9:00');
  const [closingTime, setClosingTime] = useState<string>('22:00');
  
  // バリデーション状態
  const [titleError, setTitleError] = useState<string>('');
  const [descriptionError, setDescriptionError] = useState<string>('');
  const [locationError, setLocationError] = useState<string>('');
  
  // 送信状態
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 初期位置情報を設定
  useEffect(() => {
    const setInitialLocation = async () => {
      try {
        // @ts-ignore
        const initialLocation = route.params?.initialLocation;
        
        if (initialLocation) {
          setLocation(initialLocation);
          return;
        }
        
        // 現在地を取得
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          // デフォルトの位置（東京駅）
          setLocation({
            latitude: 35.681236,
            longitude: 139.768149
          });
          return;
        }
        
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });
      } catch (error) {
        console.error('位置情報の取得に失敗しました:', error);
        // デフォルトの位置（東京駅）
        setLocation({
          latitude: 35.681236,
          longitude: 139.768149
        });
      }
    };
    
    setInitialLocation();
  }, []);

  // マップをタップしたときのハンドラー
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setLocation(coordinate);
  };

  // フォームのバリデーション
  const validateForm = (): boolean => {
    let isValid = true;
    
    // タイトルのバリデーション
    if (!title.trim()) {
      setTitleError('タイトルを入力してください');
      isValid = false;
    } else if (title.length > 50) {
      setTitleError('タイトルは50文字以内で入力してください');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    // 説明のバリデーション
    if (!description.trim()) {
      setDescriptionError('説明を入力してください');
      isValid = false;
    } else if (description.length > 200) {
      setDescriptionError('説明は200文字以内で入力してください');
      isValid = false;
    } else {
      setDescriptionError('');
    }
    
    // 位置情報のバリデーション
    if (!location) {
      setLocationError('位置情報を設定してください');
      isValid = false;
    } else {
      setLocationError('');
    }
    
    return isValid;
  };

  // 送信ハンドラー
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('ログインが必要です', '喫煙所を追加するにはログインが必要です。');
        setSubmitting(false);
        return;
      }
      
      if (!location) {
        setSubmitting(false);
        return;
      }
      
      // 喫煙所データを作成
      const spotData = {
        title,
        description,
        location,
        rating: 0, // 初期評価
        facilities: {
          hasRoof,
          hasSeating,
          hasVendingMachine,
          isIndoor
        },
        businessHours: {
          isOpen24Hours,
          openingTime: isOpen24Hours ? undefined : openingTime,
          closingTime: isOpen24Hours ? undefined : closingTime
        }
      };
      
      // Firebaseに保存
      const { spotId, error } = await addSmokerSpot(spotData, user.uid);
      
      if (error) {
        Alert.alert('エラー', '喫煙所の追加に失敗しました。');
        console.error('喫煙所の追加に失敗しました:', error);
        setSubmitting(false);
        return;
      }
      
      Alert.alert(
        '追加しました',
        '喫煙所情報を追加しました。',
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
      
      setSubmitting(false);
    } catch (error) {
      Alert.alert('エラー', '喫煙所の追加に失敗しました。');
      console.error('喫煙所の追加に失敗しました:', error);
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="喫煙所を追加" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Surface style={styles.formContainer}>
          <Text style={styles.sectionTitle}>基本情報</Text>
          
          <TextInput
            label="タイトル"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            error={!!titleError}
            placeholder="例: 東京駅八重洲口喫煙所"
            maxLength={50}
          />
          {titleError ? <HelperText type="error">{titleError}</HelperText> : null}
          
          <TextInput
            label="説明"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            error={!!descriptionError}
            placeholder="例: 東京駅八重洲口近くの屋外喫煙所です。屋根付きで雨の日も安心です。"
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          {descriptionError ? <HelperText type="error">{descriptionError}</HelperText> : null}
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>位置情報</Text>
          <Text style={styles.sectionSubtitle}>地図をタップして位置を設定してください</Text>
          
          {location ? (
            <Surface style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005
                }}
                onPress={handleMapPress}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude
                  }}
                  draggable
                  onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
                >
                  <View style={styles.markerContainer}>
                    <View style={styles.markerSurface}>
                      <MaterialCommunityIcons name="smoking" size={20} color={THEME_COLORS.primary} />
                    </View>
                  </View>
                </Marker>
              </MapView>
            </Surface>
          ) : (
            <View style={styles.mapPlaceholder}>
              <MaterialIcons name="map" size={64} color={THEME_COLORS.disabled} />
              <Text style={styles.mapPlaceholderText}>位置情報を読み込み中...</Text>
            </View>
          )}
          
          {locationError ? <HelperText type="error">{locationError}</HelperText> : null}
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>設備情報</Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>屋内/屋外</Text>
            <View style={styles.switchOption}>
              <Text style={[
                styles.switchOptionText,
                !isIndoor && styles.switchOptionTextActive
              ]}>
                屋外
              </Text>
              <Switch
                value={isIndoor}
                onValueChange={setIsIndoor}
                color={THEME_COLORS.primary}
                style={styles.switch}
              />
              <Text style={[
                styles.switchOptionText,
                isIndoor && styles.switchOptionTextActive
              ]}>
                屋内
              </Text>
            </View>
          </View>
          
          <View style={styles.checkboxContainer}>
            <Checkbox.Item
              label="屋根あり"
              status={hasRoof ? 'checked' : 'unchecked'}
              onPress={() => setHasRoof(!hasRoof)}
              color={THEME_COLORS.primary}
              style={styles.checkbox}
              labelStyle={styles.checkboxLabel}
            />
            
            <Checkbox.Item
              label="座席あり"
              status={hasSeating ? 'checked' : 'unchecked'}
              onPress={() => setHasSeating(!hasSeating)}
              color={THEME_COLORS.primary}
              style={styles.checkbox}
              labelStyle={styles.checkboxLabel}
            />
            
            <Checkbox.Item
              label="自販機あり"
              status={hasVendingMachine ? 'checked' : 'unchecked'}
              onPress={() => setHasVendingMachine(!hasVendingMachine)}
              color={THEME_COLORS.primary}
              style={styles.checkbox}
              labelStyle={styles.checkboxLabel}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>営業時間</Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>24時間営業</Text>
            <Switch
              value={isOpen24Hours}
              onValueChange={setIsOpen24Hours}
              color={THEME_COLORS.primary}
            />
          </View>
          
          {!isOpen24Hours && (
            <View style={styles.timeContainer}>
              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>開店時間</Text>
                <TextInput
                  value={openingTime}
                  onChangeText={setOpeningTime}
                  mode="outlined"
                  style={styles.timeInput}
                  placeholder="9:00"
                />
              </View>
              
              <View style={styles.timeInputContainer}>
                <Text style={styles.timeLabel}>閉店時間</Text>
                <TextInput
                  value={closingTime}
                  onChangeText={setClosingTime}
                  mode="outlined"
                  style={styles.timeInput}
                  placeholder="22:00"
                />
              </View>
            </View>
          )}
        </Surface>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={submitting}
            disabled={submitting}
          >
            喫煙所を追加
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={submitting}
          >
            キャンセル
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  formContainer: {
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
  sectionSubtitle: {
    fontSize: 14,
    color: THEME_COLORS.placeholder,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  input: {
    marginBottom: 8,
    backgroundColor: THEME_COLORS.surface,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: THEME_COLORS.border,
  },
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 8,
  },
  map: {
    height: 200,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: THEME_COLORS.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapPlaceholderText: {
    marginTop: 8,
    color: THEME_COLORS.placeholder,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: THEME_COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  switchOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchOptionText: {
    fontSize: 14,
    color: THEME_COLORS.disabled,
    marginHorizontal: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  switchOptionTextActive: {
    color: THEME_COLORS.primary,
    fontWeight: 'bold',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  checkboxContainer: {
    marginBottom: 8,
  },
  checkbox: {
    paddingVertical: 4,
  },
  checkboxLabel: {
    fontSize: 16,
    color: THEME_COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInputContainer: {
    width: '48%',
  },
  timeLabel: {
    fontSize: 14,
    color: THEME_COLORS.text,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  timeInput: {
    backgroundColor: THEME_COLORS.surface,
  },
  buttonContainer: {
    margin: 16,
    marginTop: 0,
  },
  submitButton: {
    backgroundColor: THEME_COLORS.primary,
    marginBottom: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: THEME_COLORS.primary,
    paddingVertical: 6,
    borderRadius: 8,
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

export default AddSpotScreen;