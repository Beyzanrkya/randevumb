import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, ImageBackground, Dimensions, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import api from '../../constants/Api';

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

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const testCustomerId = "69f7530d8c83d8389109310"; 
      
      const [bRes, sRes, rRes] = await Promise.all([
        api.get(`/businesses/${id}`),
        api.get(`/services?businessId=${id}`),
        api.get(`/reviews/business/${id}`)
      ]);
      
      try {
        const lRes = await api.get(`/loyalty/debug/${id}`);
        const userLoyalty = lRes.data.records.find((r: any) => r.customerId._id === testCustomerId);
        setLoyalty(userLoyalty || { points: 0 });
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
        customerId: "69f7530d8c83d838910931d0"
      };

      await api.post('/reviews', reviewData);
      Alert.alert('Başarılı', 'Değerlendirmeniz paylaşıldı.');
      setUserComment('');
      setUserRating(5);
      
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
          {reviews.map((review: any) => (
            <View key={review._id} style={styles.reviewCard}>
              <Text style={styles.reviewUserName}>{review.customerId?.name || 'Müşteri'}</Text>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
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
  reviewUserName: { fontWeight: '700', color: theme.text, marginBottom: 5 },
  reviewComment: { color: theme.subText },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.card, padding: 20, borderTopWidth: 1, borderTopColor: theme.border },
  bookButton: { backgroundColor: theme.secondary, padding: 18, borderRadius: 15, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});
