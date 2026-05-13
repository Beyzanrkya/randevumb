import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Dimensions, RefreshControl, Image, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../constants/Api';

const { width } = Dimensions.get('window');


export default function BusinessDashboard() {
  const { businessId } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('appointments'); // appointments, services, reviews

  const [business, setBusiness] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchData();
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [businessId]);

  const fetchNotifications = async () => {
    try {
      // Sadece bu dükkanın bildirimlerini çek
      const response = await api.get(`/notifications?businessId=${businessId}`);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, sRes, rRes, aRes, stRes, cRes] = await Promise.all([
        api.get(`/businesses/${businessId}`),
        api.get(`/services?businessId=${businessId}`),
        api.get(`/reviews/business/${businessId}`),
        api.get(`/appointments`),
        api.get(`/appointments/stats/${businessId}`),
        api.get(`/campaigns/business/${businessId}`)
      ]);

      setBusiness(bRes.data);
      setServices(sRes.data);
      setReviews(rRes.data);
      setWeeklyStats(stRes.data);
      setCampaigns(cRes.data);

      // Bildirimleri çek
      fetchNotifications();

      const allApps = aRes.data.appointments || [];
      const myApps = allApps.filter((a: any) =>
        (a.businessId?._id === businessId || a.businessId === businessId)
      );
      setAppointments(myApps);

      const pending = myApps.filter((a: any) => a.status === 'pending').length;
      const completed = myApps.filter((a: any) => a.status === 'completed').length;
      setStats({ total: myApps.length, pending, completed });

    } catch (error) {
      console.error("Veriler çekilemedi:", error);
      Alert.alert('Hata', 'Veriler yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string, note?: string) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus, note });
      Alert.alert('Başarılı', 'Durum güncellendi.');
      setShowRejectModal(false);
      setShowRescheduleModal(false);
      setRejectReason('');
      fetchData();
    } catch (error) {
      Alert.alert('Hata', 'İşlem başarısız.');
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      Alert.alert('Hata', 'Lütfen tarih ve saat girin.');
      return;
    }
    try {
      await api.put(`/appointments/${selectedAppId}`, { date: newDate, time: newTime });
      Alert.alert('Başarılı', 'Randevu zamanı güncellendi ve müşteriye bildirildi.');
      setShowRescheduleModal(false);
      fetchData();
    } catch (error) {
      Alert.alert('Hata', 'Güncelleme başarısız.');
    }
  };

  const confirmReject = (appointmentId: string) => {
    setSelectedAppId(appointmentId);
    setShowRejectModal(true);
  };

  const WeeklyChart = ({ data, theme }: { data: any[], theme: any }) => {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const maxCount = Math.max(...data.map(d => d.count), 5);
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    return (
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const height = (item.count / maxCount) * 100;
          const dayLabel = days[new Date(item.date).getDay() === 0 ? 6 : new Date(item.date).getDay() - 1];

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              style={styles.barWrapper}
              onPress={() => setSelectedIdx(selectedIdx === index ? null : index)}
            >
              {selectedIdx === index && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>{item.count}</Text>
                  <View style={styles.tooltipArrow} />
                </View>
              )}
              <View style={styles.barBackground}>
                <View style={[styles.barFill, { height: `${height}%`, backgroundColor: theme.primary }]} />
              </View>
              <Text style={styles.barLabel}>{dayLabel}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const styles = createStyles(theme, isDark);

  if (loading && !refreshing) return (
    <View style={styles.loader}><ActivityIndicator size="large" color={theme.primary} /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/business-selection' as any)}>
          <Ionicons name="business" size={20} color={theme.primary} />
          <Text style={styles.switchText}>Değiştir</Text>
        </TouchableOpacity>

        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <Text style={styles.businessTitle} numberOfLines={1}>{business?.name}</Text>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.primary} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push({ pathname: '/business-settings', params: { businessId } })}
        >
          <Ionicons name="cog-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Business Cover Image */}
        {business?.imageUrl && (
          <View style={styles.coverContainer}>
            <Image source={{ uri: business.imageUrl }} style={styles.coverImage} />
          </View>
        )}

        {/* Weekly Performance Chart */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Haftalık Performans</Text>
            <Ionicons name="trending-up" size={20} color={theme.primary} />
          </View>
          <WeeklyChart data={weeklyStats} theme={theme} />
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <StatBox label="Bugün" value={stats.pending} color="#F59E0B" />
          <StatBox label="Tamamlanan" value={stats.completed} color="#10B981" />
          <StatBox label="Puan" value={business?.averageRating || '5.0'} color="#EAB308" />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TabItem id="appointments" label="Randevular" icon="calendar" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
          <TabItem id="services" label="Hizmetler" icon="list" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
          <TabItem id="reviews" label="Yorumlar" icon="star" activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        </View>

        {/* Dynamic Content Based on Tab */}
        <View style={styles.contentArea}>
          {activeTab === 'appointments' && (
            <View>
              {/* Bekleyen ve Onaylanan Randevular */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Randevular</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>{appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length}</Text></View>
              </View>
              {appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').map((item) => (
                <AppointmentCard
                  key={item._id}
                  item={item}
                  onAction={handleUpdateStatus}
                  onReject={confirmReject}
                  onReschedule={(app: any) => {
                    setSelectedAppId(app._id);
                    setNewDate(app.date);
                    setNewTime(app.time);
                    setShowRescheduleModal(true);
                  }}
                  theme={theme}
                />
              ))}
              {appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length === 0 && (
                <EmptyState icon="calendar-clear-outline" text="Aktif randevu yok." theme={theme} />
              )}
            </View>
          )}

          {activeTab === 'services' && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Hizmet Listesi</Text>
                <TouchableOpacity
                  style={styles.addSmallBtn}
                  onPress={() => router.push({ pathname: '/add-service', params: { businessId } })}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              {services.map((service) => (
                <View key={service._id} style={styles.serviceCard}>
                  <View>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceMeta}>{service.duration} dk | {service.price} TL</Text>
                  </View>
                  <TouchableOpacity><Ionicons name="create-outline" size={20} color={theme.subText} /></TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View>
              <Text style={styles.sectionTitle}>Müşteri Geri Bildirimleri</Text>
              {reviews.map((review) => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.customerId?.name || 'Müşteri'}</Text>
                    <View style={styles.starRow}>
                      <Ionicons name="star" size={12} color="#EAB308" />
                      <Text style={styles.reviewRating}>{review.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString('tr-TR')}</Text>
                </View>
              ))}
              {reviews.length === 0 && <EmptyState icon="chatbubble-outline" text="Henüz yorum yok." theme={theme} />}
            </View>
          )}
        </View>

        {/* Separate Campaigns Section */}
        <View style={styles.campaignsBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktif Kampanyalar</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{campaigns.length}</Text></View>
          </View>
          {campaigns.map((camp) => (
            <View key={camp._id} style={styles.campaignCard}>
              <View style={styles.campaignHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.campaignTitle}>{camp.title}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>%{camp.discountRate} İndirim</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: '/create-campaign',
                    params: {
                      businessId,
                      campaignId: camp._id,
                      title: camp.title,
                      description: camp.description,
                      discountRate: camp.discountRate.toString()
                    }
                  })}
                >
                  <Ionicons name="create-outline" size={20} color={theme.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.campaignDesc}>{camp.description}</Text>
              <View style={styles.campaignFooter}>
                <Ionicons name="time-outline" size={14} color={theme.subText} />
                <Text style={styles.campaignDate}>
                  Son Gün: {new Date(camp.endDate).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </View>
          ))}
          {campaigns.length === 0 && <EmptyState icon="megaphone-outline" text="Henüz kampanya oluşturmadınız." theme={theme} />}
        </View>

        {/* Quick Footer Action */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/create-campaign?businessId=${businessId}` as any)}
          >
            <Ionicons name="megaphone-outline" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Kampanya Oluştur</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal visible={showRescheduleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.rejectModalContent}>
            <Text style={styles.modalTitle}>Randevu Zamanını Güncelle</Text>
            <Text style={styles.modalSubTitle}>Yeni tarih ve saati belirleyin. Müşteriye anında bilgi verilecektir.</Text>
            
            <View style={{ gap: 15, marginBottom: 20 }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.subText, marginBottom: 5 }}>Tarih</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.subText}
                  value={newDate}
                  onChangeText={setNewDate}
                />
              </View>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.subText, marginBottom: 5 }}>Saat</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="HH:MM"
                  placeholderTextColor={theme.subText}
                  value={newTime}
                  onChangeText={setNewTime}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRescheduleModal(false)}>
                <Text style={styles.cancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmRejectBtn, { backgroundColor: theme.primary }]}
                onPress={handleReschedule}
              >
                <Text style={styles.confirmRejectBtnText}>Güncelle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.rejectModalContent}>
            <Text style={styles.modalTitle}>Reddetme Sebebi</Text>
            <Text style={styles.modalSubTitle}>Müşteriye neden reddettiğinizi açıklayan bir not bırakabilirsiniz (Opsiyonel).</Text>
            <TextInput
              style={styles.rejectInput}
              placeholder="Örn: O saatte dükkan kapalı..."
              placeholderTextColor={theme.subText}
              multiline
              value={rejectReason}
              onChangeText={setRejectReason}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRejectModal(false)}>
                <Text style={styles.cancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmRejectBtn}
                onPress={() => handleUpdateStatus(selectedAppId!, 'cancelled', rejectReason)}
              >
                <Text style={styles.confirmRejectBtnText}>Reddet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showNotifications} transparent animationType="slide" onRequestClose={() => setShowNotifications(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowNotifications(false)} />
          <View style={styles.notifContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bildirimler</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Ionicons name="close-circle" size={32} color={theme.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
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
                      <Text style={[styles.notifText, !n.isRead && { fontWeight: '700', color: theme.text }]}>{n.message}</Text>
                      <Text style={styles.notifDate}>{new Date(n.createdAt).toLocaleDateString('tr-TR')} {new Date(n.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ alignItems: 'center', marginTop: 80 }}>
                  <View style={{ backgroundColor: theme.border + '30', padding: 30, borderRadius: 50, marginBottom: 20 }}>
                    <Ionicons name="notifications-off" size={80} color={theme.primary} />
                  </View>
                  <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>Henüz Bildirim Yok</Text>
                  <Text style={{ color: theme.subText, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>Müşterileriniz randevu aldığında burada bildirim göreceksiniz.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const StatBox = ({ label, value, color }: any) => (
  <View style={styles3.statBox}>
    <Text style={[styles3.statValue, { color }]}>{value}</Text>
    <Text style={styles3.statLabel}>{label}</Text>
  </View>
);

const TabItem = ({ id, label, icon, activeTab, setActiveTab, theme }: any) => (
  <TouchableOpacity
    style={[styles3.tabItem, activeTab === id && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
    onPress={() => setActiveTab(id)}
  >
    <Ionicons name={activeTab === id ? icon : `${icon}-outline` as any} size={20} color={activeTab === id ? theme.primary : theme.subText} />
    <Text style={[styles3.tabLabel, { color: activeTab === id ? theme.text : theme.subText }]}>{label}</Text>
  </TouchableOpacity>
);

const AppointmentCard = ({ item, onAction, onReject, onReschedule, theme }: any) => {
  const isPending = item.status === 'pending';
  const isConfirmed = item.status === 'confirmed';

  return (
    <View style={styles3.appCard}>
      <View style={styles3.appMain}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles3.appCustName}>{item.customerId?.name || 'Müşteri'}</Text>
          <View style={[styles3.statusBadge, { backgroundColor: isConfirmed ? '#E0F2FE' : '#F1F5F9' }]}>
            <Text style={[styles3.statusText, { color: isConfirmed ? '#0369A1' : '#64748B' }]}>
              {isConfirmed ? 'Onaylı' : 'Bekliyor'}
            </Text>
          </View>
        </View>
        <Text style={styles3.appServName}>{item.serviceId?.name || 'Hizmet'}</Text>
        <Text style={styles3.appTime}>{item.date} | {item.time}</Text>
      </View>
      <View style={styles3.appActions}>
        <TouchableOpacity style={styles3.rescheduleBtn} onPress={() => onReschedule(item)}>
          <Ionicons name="time-outline" size={18} color={theme.primary} />
        </TouchableOpacity>
        
        {isPending && (
          <>
            <TouchableOpacity style={styles3.rejectBtn} onPress={() => onReject(item._id)}>
              <Ionicons name="close" size={18} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity style={styles3.approveBtn} onPress={() => onAction(item._id, 'confirmed')}>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </TouchableOpacity>
          </>
        )}
        {isConfirmed && (
          <>
            <TouchableOpacity style={styles3.rejectBtn} onPress={() => onReject(item._id)}>
              <Ionicons name="close" size={18} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity style={styles3.completeBtn} onPress={() => onAction(item._id, 'completed')}>
              <Ionicons name="flash" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', marginLeft: 4 }}>Tamamla</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const EmptyState = ({ icon, text, theme }: any) => (
  <View style={{ alignItems: 'center', padding: 40 }}>
    <Ionicons name={icon} size={40} color={theme.border} />
    <Text style={{ marginTop: 10, color: theme.subText, fontWeight: '600' }}>{text}</Text>
  </View>
);

const styles3 = StyleSheet.create({
  statBox: { flex: 1, alignItems: 'center', padding: 15 },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '700', marginTop: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  tabLabel: { fontSize: 14, fontWeight: '700' },
  appCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center' },
  appMain: { flex: 1 },
  appCustName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  appServName: { fontSize: 13, color: '#DB2777', fontWeight: '700', marginVertical: 4 },
  appTime: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  appActions: { flexDirection: 'row', gap: 8 },
  approveBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  completeBtn: { height: 36, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#8B5CF6', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#EF444430', justifyContent: 'center', alignItems: 'center' },
  rescheduleBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#64748B30', justifyContent: 'center', alignItems: 'center' }
});

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.card },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.primary + '15', padding: 8, borderRadius: 12 },
  switchText: { fontSize: 11, fontWeight: '800', color: theme.primary },
  businessTitle: { fontSize: 16, fontWeight: '800', color: theme.text, flex: 1, textAlign: 'center', marginHorizontal: 10 },
  settingsBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  coverContainer: { height: 220, width: '100%', backgroundColor: theme.card, overflow: 'hidden' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  chartSection: { backgroundColor: theme.card, margin: 20, marginBottom: 0, padding: 20, borderRadius: 25, borderWidth: 1, borderColor: theme.border },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, marginTop: 20 },
  barWrapper: { alignItems: 'center', flex: 1 },
  barBackground: { width: 12, height: 100, backgroundColor: theme.border, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, color: theme.subText, marginTop: 8, fontWeight: '600' },
  tooltip: { position: 'absolute', top: -35, backgroundColor: theme.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignItems: 'center', minWidth: 25 },
  tooltipText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  tooltipArrow: { position: 'absolute', bottom: -4, width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: theme.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  rejectModalContent: { backgroundColor: theme.card, borderRadius: 30, padding: 25, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: theme.text, marginBottom: 10 },
  modalSubTitle: { fontSize: 13, color: theme.subText, marginBottom: 20, lineHeight: 18 },
  rejectInput: { backgroundColor: theme.background, borderRadius: 15, padding: 15, height: 100, textAlignVertical: 'top', color: theme.text, borderWidth: 1, borderColor: theme.border, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 15, alignItems: 'center', backgroundColor: theme.border },
  cancelBtnText: { fontWeight: '700', color: theme.text },
  confirmRejectBtn: { flex: 2, padding: 16, borderRadius: 15, alignItems: 'center', backgroundColor: '#EF4444' },
  confirmRejectBtnText: { fontWeight: '800', color: '#fff' },
  dateInput: { backgroundColor: theme.background, borderRadius: 15, padding: 12, color: theme.text, borderWidth: 1, borderColor: theme.border },
  statsRow: { flexDirection: 'row', backgroundColor: theme.card, margin: 20, borderRadius: 25, borderWidth: 1, borderColor: theme.border },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  contentArea: { padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: theme.text },
  badge: { backgroundColor: theme.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  addSmallBtn: { backgroundColor: theme.secondary, width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  serviceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.card, padding: 18, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  campaignsBox: { backgroundColor: theme.card, margin: 20, padding: 20, borderRadius: 25, borderWidth: 1, borderColor: theme.border, marginTop: 10 },
  campaignCard: { backgroundColor: theme.background, padding: 18, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: theme.border },
  campaignHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  campaignTitle: { fontSize: 16, fontWeight: '900', color: theme.text },
  discountBadge: { backgroundColor: '#8B5CF6' + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#8B5CF6', fontSize: 11, fontWeight: '800' },
  campaignDesc: { fontSize: 14, color: theme.subText, lineHeight: 20, marginBottom: 15 },
  campaignFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border },
  campaignDate: { fontSize: 12, color: theme.subText, fontWeight: '600' },
  serviceName: { fontSize: 15, fontWeight: '700', color: theme.text },
  serviceMeta: { fontSize: 12, color: theme.subText, marginTop: 4 },
  reviewCard: { backgroundColor: theme.card, padding: 18, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: theme.border },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewerName: { fontWeight: '800', color: theme.text },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewRating: { fontSize: 12, fontWeight: '800', color: '#EAB308' },
  reviewComment: { fontSize: 14, color: theme.subText, lineHeight: 20 },
  reviewDate: { fontSize: 10, color: theme.border, marginTop: 10, textAlign: 'right' },
  quickActions: { padding: 20 },
  actionBtn: { backgroundColor: theme.primary, padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  notificationButton: { width: 40, height: 40, borderRadius: 10, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  notifBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#EF4444', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.card },
  notifBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  notifContent: { backgroundColor: theme.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '80%', marginTop: '20%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  notifItem: { flexDirection: 'row', gap: 15, padding: 15, borderRadius: 20, marginBottom: 10, alignItems: 'center' },
  notifUnread: { backgroundColor: theme.primary + '08' },
  notifIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  notifText: { fontSize: 14, color: theme.text, lineHeight: 20 },
  notifDate: { fontSize: 11, color: theme.subText, marginTop: 4 }
});
