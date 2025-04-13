import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { SmokerSpot } from '../types';

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
const db = getFirestore(app);
const storage = getStorage(app);

// 認証関連の関数
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // ユーザープロフィールを作成
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      createdAt: serverTimestamp(),
      stats: {
        posts: 0,
        reviews: 0,
        favorites: 0
      }
    });
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// 喫煙所関連の関数
export const getSmokerSpots = async () => {
  try {
    const spotsRef = collection(db, 'spots');
    const q = query(spotsRef);
    const spotsSnapshot = await getDocs(q);
    const spotsList = spotsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        location: data.location,
        rating: data.rating,
        facilities: data.facilities,
        businessHours: data.businessHours,
        crowdedness: data.crowdedness,
        photos: data.photos,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as SmokerSpot;
    });
    console.log('Fetched spots:', spotsList);
    return { spots: spotsList, error: null };
  } catch (error) {
    console.error('Firestore error:', error);
    return { spots: [], error };
  }
};

export const getSmokerSpotById = async (spotId: string) => {
  try {
    const spotRef = doc(db, 'spots', spotId);
    const spotSnapshot = await getDoc(spotRef);
    
    if (spotSnapshot.exists()) {
      return { 
        spot: { 
          id: spotSnapshot.id, 
          ...spotSnapshot.data() 
        }, 
        error: null 
      };
    } else {
      return { spot: null, error: 'Spot not found' };
    }
  } catch (error) {
    return { spot: null, error };
  }
};

export const addSmokerSpot = async (spotData: any, userId: string) => {
  try {
    // 喫煙所データを追加
    const spotRef = await addDoc(collection(db, 'spots'), {
      ...spotData,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // ユーザーの投稿数を更新
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      await updateDoc(userRef, {
        'stats.posts': (userData.stats?.posts || 0) + 1
      });
    }
    
    return { spotId: spotRef.id, error: null };
  } catch (error) {
    return { spotId: null, error };
  }
};

export const saveFavoriteSpot = async (spotId: string, userId: string) => {
  try {
    const favoriteRef = doc(db, 'users', userId, 'favorites', spotId);
    await setDoc(favoriteRef, {
      spotId,
      savedAt: serverTimestamp()
    });
    
    // 実際のお気に入り数を取得して更新
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const favoritesSnapshot = await getDocs(favoritesRef);
    const favoriteCount = favoritesSnapshot.docs.length;
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'stats.favorites': favoriteCount
    });
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

export const removeFavoriteSpot = async (spotId: string, userId: string) => {
  try {
    const favoriteRef = doc(db, 'users', userId, 'favorites', spotId);
    await deleteDoc(favoriteRef);
    
    // 実際のお気に入り数を取得して更新
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const favoritesSnapshot = await getDocs(favoritesRef);
    const favoriteCount = favoritesSnapshot.docs.length;
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'stats.favorites': favoriteCount
    });
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

export const getFavoriteSpots = async (userId: string) => {
  try {
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const favoritesSnapshot = await getDocs(favoritesRef);
    
    const favoriteIds = favoritesSnapshot.docs.map(doc => doc.id);
    
    // ユーザーのお気に入り数を実際の数で更新
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        'stats.favorites': favoriteIds.length
      });
    }
    
    if (favoriteIds.length === 0) {
      return { spots: [], error: null };
    }
    
    // 喫煙所データを取得
    const spots = [];
    for (const spotId of favoriteIds) {
      const { spot, error } = await getSmokerSpotById(spotId);
      if (spot) {
        spots.push(spot);
      }
    }
    
    return { spots, error: null };
  } catch (error) {
    return { spots: [], error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      return { 
        profile: { 
          id: userSnapshot.id, 
          ...userSnapshot.data() 
        }, 
        error: null 
      };
    } else {
      return { profile: null, error: 'User not found' };
    }
  } catch (error) {
    return { profile: null, error };
  }
};

export { auth, db, storage };