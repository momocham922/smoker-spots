// Firestoreの初期化スクリプト
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

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
const db = getFirestore(app);

// サンプルデータ
const sampleSpots = [
  {
    id: 'sample1',
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
    createdBy: 'admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: 'sample2',
    title: '新宿駅東口喫煙所',
    description: '新宿駅東口近くの屋外喫煙所です。多くの喫煙者で賑わっています。',
    location: {
      latitude: 35.690921,
      longitude: 139.702776
    },
    rating: 3.8,
    facilities: {
      hasRoof: true,
      hasSeating: false,
      hasVendingMachine: false,
      isIndoor: false
    },
    businessHours: {
      isOpen24Hours: false,
      openingTime: '7:00',
      closingTime: '23:00'
    },
    createdBy: 'admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    id: 'sample3',
    title: '渋谷駅ハチ公前喫煙所',
    description: '渋谷のランドマーク近くにある喫煙所です。観光客にも人気です。',
    location: {
      latitude: 35.658517,
      longitude: 139.701334
    },
    rating: 4.0,
    facilities: {
      hasRoof: true,
      hasSeating: true,
      hasVendingMachine: true,
      isIndoor: false
    },
    businessHours: {
      isOpen24Hours: true
    },
    createdBy: 'admin',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Firestoreにコレクションとサンプルデータを作成する関数
const initializeFirestore = async () => {
  try {
    console.log('Firestoreの初期化を開始します...');
    
    // spotsコレクションを作成し、サンプルデータを追加
    for (const spot of sampleSpots) {
      const spotRef = doc(db, 'spots', spot.id);
      await setDoc(spotRef, spot);
      console.log(`喫煙所データを追加しました: ${spot.title}`);
    }
    
    console.log('Firestoreの初期化が完了しました！');
    return { success: true };
  } catch (error) {
    console.error('Firestoreの初期化に失敗しました:', error);
    return { success: false, error };
  }
};

export default initializeFirestore;