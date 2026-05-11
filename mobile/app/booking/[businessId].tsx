import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import api from '../../constants/Api';

export default function BookingScreen() {
  const { businessId, serviceId } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<any[]>([]); // never[] hatası için tip eklendi
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // null hatası için tip eklendi
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    generateDays();
  }, []);

  const generateDays = () => {
    const nextDays = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      nextDays.push({
        id: i.toString(),
        fullDate: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('tr-TR', { month: 'short' }),
      });
    }
    setDays(nextDays);
    setSelectedDate(nextDays[0].fullDate);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Uyarı', 'Lütfen tarih ve saat seçiniz.');
      return;
    }

    try {
      setLoading(true);
      const bookingData = {
        customerId: "69f7530d8c83d838910931d0", // Ahmet ID
        businessId: businessId,
        serviceId: serviceId,
        date: selectedDate,
        time: selectedTime,
        status: "pending"
      };

      await api.post('/appointments', bookingData);
      Alert.alert('Başarılı', 'Randevu talebiniz iletildi.', [
        { text: 'Tamam', onPress: () => router.replace('/customer-dashboard' as any) }
      ]);
    } catch (error: any) {
      Alert.alert('Hata', 'Randevu oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Randevu Al</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarih Seçin</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
            {days.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.dayCard, selectedDate === item.fullDate && styles.selectedCard]}
                onPress={() => setSelectedDate(item.fullDate)}
              >
                <Text style={[styles.dayName, selectedDate === item.fullDate && styles.selectedText]}>{item.dayName}</Text>
                <Text style={[styles.dayNumber, selectedDate === item.fullDate && styles.selectedText]}>{item.dayNumber}</Text>
                <Text style={[styles.monthName, selectedDate === item.fullDate && styles.selectedText]}>{item.monthName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saat Seçin</Text>
          <View style={styles.timeGrid}>
            {times.map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeCard, selectedTime === time && styles.selectedCard]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeText, selectedTime === time && styles.selectedText]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
            <Text style={styles.summaryText}>Seçilen: {selectedDate} | {selectedTime || '--:--'}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.confirmButton, (!selectedDate || !selectedTime) && { opacity: 0.5 }]} 
          onPress={handleBooking}
          disabled={loading || !selectedDate || !selectedTime}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>Randevuyu Onayla</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  section: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 15 },
  daysScroll: { paddingRight: 20 },
  dayCard: { width: 70, height: 90, backgroundColor: theme.card, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: theme.border },
  selectedCard: { backgroundColor: theme.primary, borderColor: theme.primary },
  dayName: { fontSize: 12, color: theme.subText, marginBottom: 4 },
  dayNumber: { fontSize: 20, fontWeight: '800', color: theme.text },
  monthName: { fontSize: 12, color: theme.subText, marginTop: 4 },
  selectedText: { color: '#fff' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timeCard: { width: '22%', paddingVertical: 12, backgroundColor: theme.card, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  timeText: { fontSize: 14, fontWeight: '600', color: theme.text },
  summarySection: { padding: 20 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.card, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
  summaryText: { fontSize: 14, color: theme.text, fontWeight: '600' },
  footer: { padding: 20, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border },
  confirmButton: { backgroundColor: theme.primary, padding: 18, borderRadius: 15, alignItems: 'center' },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
