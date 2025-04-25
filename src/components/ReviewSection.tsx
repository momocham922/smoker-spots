import React, { useState } from 'react';
import { StyleSheet, View, Text, Platform, Alert, TouchableOpacity } from 'react-native';
import { Button, Surface, TextInput, Avatar, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Review as BaseReview } from '../types';
import { getAuth } from 'firebase/auth';
import { addReview, getReviews } from '../services/firebase';

// 拡張されたReview型
interface ReviewWithUser extends BaseReview {
  user?: {
    id: string;
    displayName: string;
    photoURL?: string;
  } | null;
}

// テーマカラー（SpotDetailScreenと同じ）
const THEME_COLORS = {
  primary: '#7C3AED',
  text: '#1F2937',
  placeholder: '#6B7280',
  border: '#E5E7EB',
  background: '#F9FAFB',
  error: '#EF4444',
};

interface ReviewSectionProps {
  spotId: string;
  onReviewAdded?: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ spotId, onReviewAdded }) => {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await getReviews(spotId);
      if (!response.error) {
        setReviews(response.reviews);
      }
    } catch (error) {
      console.error('レビューの取得に失敗しました:', error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchReviews();
  }, [spotId]);

  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert('ログインが必要です', 'レビューを投稿するにはログインが必要です。');
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert('エラー', 'レビューは10文字以上入力してください。');
      return;
    }

    setSubmitting(true);
    try {
      const response = await addReview(spotId, user.uid, rating, comment.trim());
      if (!response.error) {
        Alert.alert('成功', 'レビューを投稿しました。');
        setComment('');
        setRating(5);
        fetchReviews();
        if (onReviewAdded) {
          onReviewAdded();
        }
      } else {
        Alert.alert('エラー', 'レビューの投稿に失敗しました。');
      }
    } catch (error) {
      Alert.alert('エラー', '予期せぬエラーが発生しました。');
    }
    setSubmitting(false);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialIcons
            key={star}
            name={star <= rating ? 'star' : 'star-border'}
            size={24}
            color={star <= rating ? '#FFD700' : THEME_COLORS.placeholder}
            style={styles.star}
          />
        ))}
      </View>
    );
  };

  return (
    <Surface style={styles.container}>
      <Text style={styles.sectionTitle}>レビュー</Text>

      {/* レビュー投稿フォーム */}
      <Surface style={styles.reviewForm}>
        <Text style={styles.formLabel}>評価</Text>
        <View style={styles.ratingInput}>
          {[1, 2, 3, 4, 5].map((star) => (
           <TouchableOpacity
             key={star}
             onPress={() => setRating(star)}
             style={styles.starButton}
           >
             <MaterialIcons
               name={star <= rating ? 'star' : 'star-border'}
               size={32}
               color={star <= rating ? '#FFD700' : THEME_COLORS.placeholder}
             />
           </TouchableOpacity>
         ))}
        </View>

        <Text style={styles.formLabel}>コメント</Text>
        <TextInput
          mode="outlined"
          value={comment}
          onChangeText={setComment}
          placeholder="この喫煙所の感想を書いてください"
          multiline
          numberOfLines={4}
          style={styles.commentInput}
        />

        <Button
          mode="contained"
          onPress={handleSubmitReview}
          loading={submitting}
          disabled={submitting || !comment.trim() || !user}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          レビューを投稿する
        </Button>
      </Surface>

      <Divider style={styles.divider} />

      {/* レビュー一覧 */}
      {loading ? (
        <Text style={styles.loadingText}>レビューを読み込み中...</Text>
      ) : reviews.length > 0 ? (
        reviews.map((review, index) => (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Avatar.Text
                size={40}
                label={review.user?.displayName?.[0] || 'A'}
                style={styles.avatar}
              />
              <View style={styles.reviewHeaderText}>
                <Text style={styles.reviewerName}>
                  {review.user?.displayName || 'Anonymous'}
                </Text>
                <Text style={styles.reviewDate}>
                  {review.createdAt.toDate().toLocaleDateString()}
                </Text>
              </View>
            </View>
            {renderStars(review.rating)}
            <Text style={styles.reviewComment}>{review.comment}</Text>
            {index < reviews.length - 1 && <Divider style={styles.reviewDivider} />}
          </View>
        ))
      ) : (
        <Text style={styles.noReviewsText}>まだレビューはありません</Text>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop: 0,
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
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  reviewForm: {
    padding: 16,
    backgroundColor: THEME_COLORS.background,
    borderRadius: 12,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif-medium',
  },
  ratingInput: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
    marginRight: 4,
  },
  commentInput: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
  },
  submitButtonContent: {
    height: 40,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: THEME_COLORS.border,
  },
  loadingText: {
    textAlign: 'center',
    color: THEME_COLORS.placeholder,
    marginVertical: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  noReviewsText: {
    textAlign: 'center',
    color: THEME_COLORS.placeholder,
    marginVertical: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  reviewItem: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    backgroundColor: THEME_COLORS.primary,
  },
  reviewHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
  },
  reviewDate: {
    fontSize: 12,
    color: THEME_COLORS.placeholder,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    marginRight: 4,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: THEME_COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'sans-serif',
  },
  reviewDivider: {
    marginVertical: 16,
    backgroundColor: THEME_COLORS.border,
  },
});

export default ReviewSection;