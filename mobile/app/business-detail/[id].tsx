import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, ImageBackground, Dimensions, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import api from '../../constants/Api';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

export default function BusinessDetail() {
  const { id } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [business, setBusiness] = useState<any>(null); // any eklendi
  const [services, setServices] = useState<any[]>([]); // never[] hatası için
  const [reviews, setReviews] = useState<any[]>([]); // never[] hatası için
  const [loyalty, setLoyalty] = useState<any>({ points: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any>(null);

  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let userId = "69f7530d8c83d838910931d0";
      try {
        const storedId = await SecureStore.getItemAsync('userId');
        if (storedId) {
          userId = storedId;
          setCurrentUserId(storedId);
        }
      } catch (e) {}

      const [bRes, sRes, rRes] = await Promise.all([
        api.get(`/businesses/${id}`),
        api.get(`/services?businessId=${id}`),
        api.get(`/reviews/business/${id}`)
      ]);

      try {
        const lRes = await api.get(`/loyalty/business/${id}`);
        setLoyalty(lRes.data || { points: 0 });
      } catch (e) {
        setLoyalty({ points: 0 });
      }

      setBusiness(bRes.data);
      setServices(sRes.data);
      setReviews(rRes.data);
    } catch (error) {
      console.error("Veriler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!userComment.trim()) {
      Alert.alert('Hata', 'Lütfen bir yorum yazın.');
      return;
    }

    try {
      setIsSubmitting(true);
      const reviewData = {
        businessId: id,
        rating: userRating,
        comment: userComment,
        customerId: currentUserId || "69f7530d8c83d838910931d0"
      };

      if (editingReviewId) {
        await api.put(`/reviews/${editingReviewId}`, reviewData);
        Alert.alert('Başarılı', 'Yorumunuz güncellendi.');
      } else {
        await api.post('/reviews', reviewData);
        Alert.alert('Başarılı', 'Değerlendirmeniz paylaşıldı.');
      }

      setUserComment('');
      setUserRating(5);
      setEditingReviewId(null);

      const rRes = await api.get(`/reviews/business/${id}`);
      setReviews(rRes.data);
      const bRes = await api.get(`/businesses/${id}`);
      setBusiness(bRes.data);
    } catch (error) {
      Alert.alert('Hata', 'Yorum gönderilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    Alert.alert(
      'Yorumu Sil',
      'Bu yorumu silmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await api.delete(`/reviews/${reviewId}`);
              Alert.alert('Başarılı', 'Yorum silindi.');
              const rRes = await api.get(`/reviews/business/${id}`);
              setReviews(rRes.data);
              const bRes = await api.get(`/businesses/${id}`);
              setBusiness(bRes.data);
            } catch (e) {
              Alert.alert('Hata', 'Yorum silinemedi.');
            }
          }
        }
      ]
    );
  };

  const handleEditPress = (review: any) => {
    setEditingReviewId(review._id);
    setUserComment(review.comment);
    setUserRating(review.rating);
  };

  const getPlaceholderImage = (category: string) => {
    if (category?.includes('Güzellik')) return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800';
    if (category?.includes('Spor')) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800';
    if (category?.includes('Sağlık')) return 'https://images.unsplash.com/photo-1505751172107-57324c4bc710?w=800';
    return 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800';
  };

  const styles = createStyles(theme, isDark);

  if (loading) return (
    <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color={theme.primary} /></View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <ImageBackground source={{ uri: business?.imageUrl || getPlaceholderImage(business?.category) }} style={styles.coverImage}>
            <SafeAreaView>
              <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.circleButton} onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </ImageBackground>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <Text style={styles.businessName}>{business?.name}</Text>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={16} color="#EAB308" />
              <Text style={styles.ratingText}>{business?.averageRating || '5.0'}</Text>
            </View>
          </View>
          <Text style={styles.categoryText}>{business?.category || 'İşletme'}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={theme.primary} />
            <Text style={styles.addressText}>{business?.address || 'Adres Belirtilmemiş'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.loyaltyCard}>
            <Text style={styles.loyaltyTitle}>Sadakat Kartı ({loyalty.points} Puan)</Text>
            <View style={styles.stampContainer}>
              {[...Array(10)].map((_, i) => (
                <View key={i} style={[styles.stamp, loyalty.points >= (i + 1) * 10 && styles.stampActive]}>
                  <Ionicons name={loyalty.points >= (i + 1) * 10 ? "checkmark" : "star"} size={18} color={loyalty.points >= (i + 1) * 10 ? "#fff" : theme.border} />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.descriptionTitle}>Hakkımızda</Text>
          <Text style={styles.descriptionText}>{business?.description || 'Hoş geldiniz.'}</Text>
        </View>

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Hizmetlerimiz</Text>
          {services.map((service: any) => (
            <TouchableOpacity key={service._id} style={[styles.serviceCard, selectedService?._id === service._id && styles.serviceCardSelected]} onPress={() => setSelectedService(service)}>
              <Text style={[styles.serviceName, selectedService?._id === service._id && { color: '#fff' }]}>{service.name}</Text>
              <Text style={[styles.servicePrice, selectedService?._id === service._id && { color: '#fff' }]}>{service.price} TL</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Değerlendirmeler</Text>

          {/* Yorum Yapma Kutusu */}
          <View style={styles.addReviewBox}>
            <Text style={styles.addReviewTitle}>
              {editingReviewId ? 'Yorumu Düzenle' : 'Deneyiminizi Paylaşın'}
            </Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity key={num} onPress={() => setUserRating(num)}>
                  <Ionicons 
                    name={userRating >= num ? "star" : "star-outline"} 
                    size={28} 
                    color={userRating >= num ? "#EAB308" : theme.border} 
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Hizmet hakkında ne düşünüyorsunuz?..."
              placeholderTextColor={theme.subText}
              value={userComment}
              onChangeText={setUserComment}
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity 
                style={[styles.submitButton, { flex: 1 }, isSubmitting && { opacity: 0.7 }]} 
                onPress={handleSubmitReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingReviewId ? 'Güncelle' : 'Yorumu Gönder'}
                  </Text>
                )}
              </TouchableOpacity>
              {editingReviewId && (
                <TouchableOpacity 
                  style={[styles.submitButton, { backgroundColor: theme.border }]} 
                  onPress={() => {
                    setEditingReviewId(null);
                    setUserComment('');
                    setUserRating(5);
                  }}
                >
                  <Text style={[styles.submitButtonText, { color: theme.text }]}>Vazgeç</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {reviews.map((review: any) => {
            const isMe = review.customerId?._id === currentUserId || review.customerId === currentUserId;
            return (
              <View key={review._id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewUserName}>{review.customerId?.name || 'Müşteri'}</Text>
                    <View style={styles.reviewStars}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons key={i} name="star" size={12} color={i < review.rating ? "#EAB308" : theme.border} />
                      ))}
                    </View>
                  </View>
                  {isMe && (
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity onPress={() => handleEditPress(review)}>
                        <Ionicons name="create-outline" size={20} color={theme.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteReview(review._id)}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                {review.businessReply && (
                  <View style={styles.replyBox}>
                    <Text style={styles.replyTitle}>İşletme Yanıtı:</Text>
                    <Text style={styles.replyText}>{review.businessReply}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {selectedService && (
        <SafeAreaView style={styles.footer}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => router.push({ pathname: `/booking/${id}` as any, params: { serviceId: selectedService._id } })}
          >
            <Text style={styles.bookButtonText}>Randevu Al: {selectedService.name}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingBottom: 100 },
  headerContainer: { height: 250, width: '100%' },
  coverImage: { flex: 1 },
  headerButtons: { padding: 20 },
  circleButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center' },
  infoCard: { backgroundColor: theme.card, marginTop: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  businessName: { fontSize: 24, fontWeight: '800', color: theme.text },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: theme.inputBg, padding: 8, borderRadius: 10 },
  ratingText: { fontWeight: '700', color: theme.text },
  categoryText: { color: theme.primary, fontWeight: '600', marginTop: 5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  addressText: { color: theme.subText, fontSize: 14 },
  divider: { height: 1, backgroundColor: theme.border, marginVertical: 20 },
  loyaltyCard: { backgroundColor: theme.inputBg, padding: 20, borderRadius: 20 },
  loyaltyTitle: { fontWeight: '800', color: theme.text, marginBottom: 15 },
  stampContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stamp: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: theme.border, justifyContent: 'center', alignItems: 'center' },
  stampActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  descriptionTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 10 },
  descriptionText: { color: theme.subText, lineHeight: 22 },
  servicesSection: { padding: 25 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 15 },
  serviceCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: theme.card, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  serviceCardSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
  serviceName: { fontWeight: '700', color: theme.text },
  servicePrice: { fontWeight: '800', color: theme.text },
  reviewsSection: { padding: 25 },
  reviewCard: { backgroundColor: theme.card, padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewUserName: { fontWeight: '700', color: theme.text },
  reviewComment: { color: theme.subText, fontSize: 14 },
  addReviewBox: { backgroundColor: theme.card, padding: 20, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: theme.primary + '30', shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  addReviewTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 15 },
  starRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  commentInput: { backgroundColor: theme.inputBg, borderRadius: 15, padding: 15, color: theme.text, minHeight: 80, textAlignVertical: 'top', marginBottom: 15, borderWidth: 1, borderColor: theme.border },
  submitButton: { backgroundColor: theme.primary, padding: 15, borderRadius: 15, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.card, padding: 20, borderTopWidth: 1, borderTopColor: theme.border },
  bookButton: { backgroundColor: theme.secondary, padding: 18, borderRadius: 15, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  replyBox: { marginTop: 12, padding: 12, backgroundColor: isDark ? '#334155' : '#F8FAFC', borderRadius: 10, borderLeftWidth: 3, borderLeftColor: theme.primary },
  replyTitle: { fontSize: 12, fontWeight: '700', color: theme.primary, marginBottom: 4 },
  replyText: { fontSize: 13, color: theme.text, fontStyle: 'italic' }
});
