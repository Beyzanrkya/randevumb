import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../constants/Api';

const { width } = Dimensions.get('window');



export default function BusinessSelection() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {
    fetchMyBusinesses();
  }, []);

  const fetchMyBusinesses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/businesses/my-businesses');
      setBusinesses(response.data);
    } catch (error) {
      console.error("İşletmeler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (businessId: string) => {
    router.push({
      pathname: '/business-dashboard' as any,
      params: { businessId }
    });
  };

  const styles = createStyles(theme, isDark);

  if (loading) return (
    <View style={styles.loader}><ActivityIndicator size="large" color={theme.primary} /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.replace('/' as any)}>
            <Ionicons name="log-out-outline" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.title}>İşletme Seçin</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.subtitle}>Yönetmek istediğiniz işletmeyi seçerek devam edin.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {businesses.length > 0 ? (
          businesses.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              onPress={() => handleSelect(item._id)}
            >
              <Image
                source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400' }}
                style={styles.cardImage}
              />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardCategory}>{item.category || 'Hizmet'}</Text>
                <View style={styles.cardStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={14} color="#EAB308" />
                    <Text style={styles.statText}>{item.averageRating || '5.0'}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="location-outline" size={14} color={theme.subText} />
                    <Text style={styles.statText}>{item.address?.split(',')[0] || 'İstanbul'}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.border} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={60} color={theme.border} />
            <Text style={styles.emptyText}>Henüz bir işletmeniz bulunmuyor.</Text>
          </View>
        )}
      </ScrollView>

      {/* Persistent Add Business Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/add-business' as any)}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Yeni İşletme Ekle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 25, paddingTop: 50 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 26, fontWeight: '900', color: theme.text },
  subtitle: { fontSize: 14, color: theme.subText, lineHeight: 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  cardImage: { width: 70, height: 70, borderRadius: 15 },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardName: { fontSize: 17, fontWeight: '800', color: theme.text, marginBottom: 4 },
  cardCategory: { fontSize: 12, color: theme.primary, fontWeight: '600', marginBottom: 6 },
  cardStats: { flexDirection: 'row', gap: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 11, color: theme.subText, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 15, fontSize: 14, color: theme.subText, fontWeight: '600' },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border
  },
  addBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: theme.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});
