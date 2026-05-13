import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../constants/Api';

const testCustomerId = "69f7530d8c83d838910931d0"; // Ahmet ID

export default function MyAppointments() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]); // never[] hatası fix
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await api.get('/appointments');

      // Tüm randevuları çekiyoruz, frontend'de Ahmet'in olanları ve diğerlerini ayırabiliriz
      const data = Array.isArray(response.data) ? response.data : [];
      setAppointments(data);
    } catch (error) {
      console.error("Hata:", error);
      setErrorMsg("Veriler çekilemedi. Sunucu bağlantısını kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed': return { label: 'Tamamlandı', color: '#10B981', icon: 'checkmark-circle' };
      case 'pending': return { label: 'Beklemede', color: '#F59E0B', icon: 'time' };
      case 'cancelled': return { label: 'İptal Edildi', color: '#EF4444', icon: 'close-circle' };
      default: return { label: 'Bilinmiyor', color: theme.subText, icon: 'help-circle' };
    }
  };

  const styles = createStyles(theme, isDark);

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color={theme.primary} /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Randevularım</Text>
        <TouchableOpacity onPress={fetchAppointments}>
          <Ionicons name="refresh" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {errorMsg ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={50} color={theme.border} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={60} color={theme.border} />
          <Text style={styles.emptyText}>Henüz bir randevunuz bulunmuyor.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {appointments.map((item: any) => {
            const status = getStatusInfo(item.status);
            const isAhmet = item.customerId?._id === testCustomerId || item.customerId === testCustomerId;

            return (
              <View key={item._id} style={[styles.appointmentCard, isAhmet && styles.ahmetCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.businessInfo}>
                    <Text style={styles.businessName}>{item.businessId?.name || "İşletme"}</Text>
                    <Text style={styles.serviceName}>{item.serviceId?.name || "Hizmet Belirtilmemiş"}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                    <Ionicons name={status.icon as any} size={14} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.dateTime}>
                    <Ionicons name="calendar-outline" size={16} color={theme.subText} />
                    <Text style={styles.dateText}>{item.date} | {item.time}</Text>
                  </View>
                  {isAhmet && (
                    <View style={styles.userBadge}>
                      <Text style={styles.userBadgeText}>Sizin Randevunuz</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  scrollContent: { padding: 20 },
  appointmentCard: { backgroundColor: theme.card, borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: theme.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  ahmetCard: { borderColor: theme.primary, borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  businessInfo: { flex: 1 },
  businessName: { fontSize: 17, fontWeight: '800', color: theme.text, marginBottom: 4 },
  serviceName: { fontSize: 14, color: theme.primary, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: theme.border },
  dateTime: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 14, color: theme.subText, fontWeight: '600' },
  userBadge: { backgroundColor: theme.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  userBadgeText: { fontSize: 11, color: theme.primary, fontWeight: '700' },
  errorText: { marginTop: 15, color: theme.subText, textAlign: 'center' },
  emptyText: { marginTop: 15, fontSize: 16, color: theme.subText, fontWeight: '600' }
});
