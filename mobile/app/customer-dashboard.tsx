import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, SafeAreaView, ActivityIndicator, ImageBackground, Modal, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../constants/Api';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'Tümü', icon: 'grid-outline' },
  { id: '2', name: 'Güzellik & Bakım', icon: 'sparkles-outline' },
  { id: '3', name: 'Spor & Fitness', icon: 'fitness-outline' },
  { id: '4', name: 'Psikoloji & Danışmanlık', icon: 'chatbubble-ellipses-outline' },
  { id: '5', name: 'Otomobil & Servis', icon: 'car-outline' },
  { id: '6', name: 'Eğlence & Etkinlik', icon: 'game-controller-outline' },
  { id: '7', name: 'Sağlık & Diyet', icon: 'medkit-outline' },
  { id: '8', name: 'Eğitim & Kurs', icon: 'school-outline' },
  { id: '9', name: 'Ev & Temizlik', icon: 'home-outline' },
  { id: '10', name: 'Yemek', icon: 'restaurant-outline' },
];

export default function CustomerDashboard() {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [businesses, setBusinesses] = useState<any[]>([]); // never[] hatası fix
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const testCustomerId = "69f7530d8c83d838910931d0";

  useEffect(() => {
    fetchBusinesses();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10 saniyede bir kontrol et
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      // Daha güvenilir test rotasına geçiş
      const response = await api.get(`/notifications/test/${testCustomerId}`); 
      setNotifications(response.data);
    } catch (error: any) {
      console.error("Bildirimler çekilemedi:", error.response?.data || error.message);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Okundu işaretlenemedi:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/businesses');
      setBusinesses(response.data);
    } catch (error) {
      console.error("İşletmeler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter((b: any) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === '1') return matchesSearch;
    const catName = CATEGORIES.find(c => c.id === selectedCategory)?.name || '';
    return matchesSearch && (b.category?.includes(catName) || b.category === catName);
  });

  const getPlaceholderImage = (category: string) => {
    if (category?.includes('Güzellik')) return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400';
    if (category?.includes('Spor')) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400';
    if (category?.includes('Sağlık')) return 'https://images.unsplash.com/photo-1505751172107-57324c4bc710?w=400';
    return 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400';
  };

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Hoş Geldin, 👋</Text>
            <Text style={styles.userName}>Müşterimiz</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity 
              style={styles.notificationButton} 
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications-outline" size={24} color={theme.primary} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(true)}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="menu-outline" size={28} color={theme.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={showNotifications} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.notifContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Bildirimler</Text>
                <TouchableOpacity onPress={() => setShowNotifications(false)}>
                  <Ionicons name="close" size={28} color={theme.text} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <TouchableOpacity 
                      key={n._id} 
                      style={[styles.notifItem, !n.isRead && styles.notifUnread]}
                      onPress={() => markAsRead(n._id)}
                    >
                      <View style={[styles.notifIcon, { backgroundColor: n.isRead ? theme.border : theme.primary + '20' }]}>
                        <Ionicons name="notifications" size={20} color={n.isRead ? theme.subText : theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.notifText, !n.isRead && { fontWeight: '700' }]}>{n.message}</Text>
                        <Text style={styles.notifDate}>{new Date(n.createdAt).toLocaleDateString('tr-TR')} {new Date(n.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <Ionicons name="notifications-off-outline" size={60} color={theme.border} />
                    <Text style={{ color: theme.subText, marginTop: 10 }}>Henüz bildiriminiz yok.</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color={theme.subText} />
            <TextInput
              style={styles.searchInput}
              placeholder="İşletme veya hizmet ara..."
              placeholderTextColor={theme.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryItem, selectedCategory === cat.id && styles.categoryItemActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons name={cat.icon as any} size={20} color={selectedCategory === cat.id ? '#fff' : theme.primary} />
                <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>İşletmeleri Keşfet</Text>
            <TouchableOpacity onPress={fetchBusinesses}><Ionicons name="refresh" size={20} color={theme.primary} /></TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
          ) : filteredBusinesses.length > 0 ? (
            filteredBusinesses.map((business: any) => (
              <TouchableOpacity 
                key={business._id} 
                style={styles.businessCard}
                onPress={() => router.push(`/business-detail/${business._id}` as any)}
              >
                <Image source={{ uri: business.imageUrl || getPlaceholderImage(business.category) }} style={styles.businessImage} />
                <View style={styles.businessInfo}>
                  <View style={styles.businessHeader}>
                    <Text style={styles.businessName}>{business.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={14} color="#EAB308" />
                      <Text style={styles.ratingText}>{business.averageRating || '5.0'}</Text>
                    </View>
                  </View>
                  <Text style={styles.businessCategory}>{business.category || 'Hizmet'}</Text>
                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={14} color={theme.subText} />
                    <Text style={styles.locationText}>{business.address || 'İstanbul'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={50} color={theme.border} />
              <Text style={styles.emptyText}>Sonuç bulunamadı.</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.bannerContainer}>
           <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800' }} style={styles.bannerImage} imageStyle={{ borderRadius: 20 }}>
             <View style={styles.bannerOverlay}>
               <Text style={styles.bannerTitle}>İlk Randevuna Özel</Text>
               <Text style={styles.bannerDiscount}>%20 İNDİRİM</Text>
             </View>
           </ImageBackground>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={styles.menuContent}>
            <SafeAreaView>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>MBrandev</Text>
                <TouchableOpacity onPress={() => setShowMenu(false)}><Ionicons name="close" size={28} color={theme.text} /></TouchableOpacity>
              </View>
              <View style={styles.menuItems}>
                <MenuLink icon="home-outline" label="Ana Sayfa" onPress={() => { setShowMenu(false); router.push('/customer-dashboard' as any); }} theme={theme} />
                <MenuLink icon="calendar-outline" label="Randevularım" onPress={() => { setShowMenu(false); router.push('/my-appointments' as any); }} theme={theme} />
                <MenuLink icon="person-outline" label="Profilim" onPress={() => { setShowMenu(false); router.push('/profile' as any); }} theme={theme} />
                <View style={styles.menuDivider} />
                <MenuLink icon={isDark ? "sunny-outline" : "moon-outline"} label={isDark ? "Aydınlık Mod" : "Karanlık Mod"} onPress={toggleTheme} theme={theme} />
                <MenuLink icon="log-out-outline" label="Çıkış Yap" onPress={() => router.replace('/' as any)} theme={theme} isDestructive />
              </View>
            </SafeAreaView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const MenuLink = ({ icon, label, onPress, theme, isDestructive = false }: any) => (
  <TouchableOpacity style={styles2(theme).menuItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color={isDestructive ? "#EF4444" : theme.primary} />
    <Text style={[styles2(theme).menuItemText, isDestructive && { color: '#EF4444' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles2 = (theme: any) => StyleSheet.create({
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 15, paddingHorizontal: 10, borderRadius: 12 },
  menuItemText: { fontSize: 16, fontWeight: '600', color: theme.text }
});

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  welcomeText: { fontSize: 14, color: theme.subText, fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '800', color: theme.text },
  menuButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 25 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderRadius: 15, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: theme.border },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: theme.text },
  filterButton: { width: 55, height: 55, backgroundColor: theme.secondary, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  sectionContainer: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.text, paddingHorizontal: 24, marginBottom: 15 },
  categoryList: { paddingLeft: 24 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 30, marginRight: 12, borderWidth: 1, borderColor: theme.border, gap: 8 },
  categoryItemActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  categoryText: { fontSize: 14, fontWeight: '600', color: theme.text },
  categoryTextActive: { color: '#fff' },
  businessCard: { flexDirection: 'row', backgroundColor: theme.card, marginHorizontal: 24, marginBottom: 15, borderRadius: 20, padding: 12, borderWidth: 1, borderColor: theme.border },
  businessImage: { width: 90, height: 90, borderRadius: 15 },
  businessInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  businessHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  businessName: { fontSize: 16, fontWeight: '800', color: theme.text },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '700', color: theme.text },
  businessCategory: { fontSize: 13, color: theme.primary, marginVertical: 4, fontWeight: '600' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: theme.subText },
  bannerContainer: { marginHorizontal: 24, height: 160, marginTop: 10 },
  bannerImage: { flex: 1, overflow: 'hidden' },
  bannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 25, justifyContent: 'center' },
  bannerTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bannerDiscount: { color: '#fff', fontSize: 28, fontWeight: '900', marginVertical: 4 },
  emptyState: { alignItems: 'center', marginTop: 30, gap: 10 },
  emptyText: { color: theme.subText, fontSize: 14 },
  notificationButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  notifBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#EF4444', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.card },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  notifContent: { backgroundColor: theme.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '80%', marginTop: '20%' },
  notifItem: { flexDirection: 'row', gap: 15, padding: 15, borderRadius: 20, marginBottom: 10, alignItems: 'center' },
  notifUnread: { backgroundColor: theme.primary + '08' },
  notifIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  notifText: { fontSize: 14, color: theme.text, lineHeight: 20 },
  notifDate: { fontSize: 11, color: theme.subText, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  menuContent: { width: width * 0.75, height: height, backgroundColor: theme.card, padding: 20 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingTop: 10 },
  menuTitle: { fontSize: 22, fontWeight: '900', color: theme.primary },
  menuItems: { gap: 10 },
  menuDivider: { height: 1, backgroundColor: theme.border, marginVertical: 10 }
});
