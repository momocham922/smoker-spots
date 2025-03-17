import { FirebaseError } from 'firebase/app';
import { User } from 'firebase/auth';
import { Timestamp, FieldValue } from 'firebase/firestore';

// 喫煙所の型定義
export interface SmokerSpot {
  id: string;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  facilities: {
    hasRoof: boolean;
    hasSeating: boolean;
    hasVendingMachine: boolean;
    isIndoor: boolean;
  };
  businessHours: {
    isOpen24Hours: boolean;
    openingTime?: string;
    closingTime?: string;
  };
  crowdedness?: {
    level: 'low' | 'medium' | 'high';
    lastUpdated: Timestamp;
  };
  photos?: string[];
  createdBy: string;
  createdAt: Timestamp | FieldValue | null;
  updatedAt: Timestamp | FieldValue | null;
}

// ユーザープロフィールの型定義
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  stats: {
    posts: number;
    reviews: number;
    favorites: number;
  };
}

// レビューの型定義
export interface Review {
  id: string;
  spotId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// お気に入りの型定義
export interface Favorite {
  spotId: string;
  savedAt: Timestamp;
}

// 認証関連のレスポンス型
export interface AuthResponse {
  user: User | null;
  error: FirebaseError | null | unknown;
}

// 喫煙所関連のレスポンス型
export interface SpotsResponse {
  spots: SmokerSpot[];
  error: FirebaseError | null | unknown;
}

export interface SpotResponse {
  spot: SmokerSpot | null;
  error: FirebaseError | null | unknown;
}

export interface AddSpotResponse {
  spotId: string | null;
  error: FirebaseError | null | unknown;
}

// お気に入り関連のレスポンス型
export interface FavoriteResponse {
  success: boolean;
  error: FirebaseError | null | unknown;
}

// ユーザープロフィール関連のレスポンス型
export interface ProfileResponse {
  profile: UserProfile | null;
  error: FirebaseError | null | unknown;
}

// 位置情報の型定義
export interface Location {
  latitude: number;
  longitude: number;
}

// フィルター条件の型定義
export interface FilterOptions {
  hasRoof?: boolean;
  hasSeating?: boolean;
  hasVendingMachine?: boolean;
  isIndoor?: boolean;
  isOutdoor?: boolean;
  is24Hours?: boolean;
  isDaytime?: boolean;
  minRating?: number;
  maxDistance?: number;
}