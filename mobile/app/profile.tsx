import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, SafeAreaView, ActivityIndicator, Alert, Image, Modal, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import api from '../constants/Api';

const testCustomerId = "69f7530d8c83d838910931d0"; 

export default function Profile() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    profilePicture: ''
  });

  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [selectedDay, setSelectedDay] = useState('01');
  const [selectedMonth, setSelectedMonth] = useState('01');
  const [selectedYear, setSelectedYear] = useState('1995');

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const years = Array.from({ length: 80 }, (_, i) => (2024 - i).toString());

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/customers/${testCustomerId}`);
      const data = res.data;
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        birthDate: data.birthDate || '',
        profilePicture: data.profilePicture || ''
      });
      if (data.birthDate && data.birthDate.includes('/')) {
        const parts = data.birthDate.split('/');
        setSelectedDay(parts[0]); setSelectedMonth(parts[1]); setSelectedYear(parts[2]);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const pickImage = async () => {
    // Galeri izni iste
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Hata', 'Galeriye erişim izni verilmedi.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Güncel sürüm için array formatı
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Boyutu optimize etmek için
      base64: true, // Veritabanına kaydetmek için Base64 kullanıyoruz
    });

    if (!result.canceled) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setProfile({ ...profile, profilePicture: base64Img });
      
      // Fotoğraf seçildiği an otomatik kaydetme deneyimi
      try {
        setSaving(true);
        await api.put(`/customers/${testCustomerId}`, { ...profile, profilePicture: base64Img });
        Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
      } catch (e) {
        Alert.alert('Hata', 'Fotoğraf kaydedilemedi.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/customers/${testCustomerId}`, profile);
      Alert.alert('Başarılı', 'Profil güncellendi.');
    } catch (e) { Alert.alert('Hata', 'Kaydedilemedi.'); } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (passData.new !== passData.confirm) {
      Alert.alert('Hata', 'Yeni şifreler uyuşmuyor.');
      return;
    }
    try {
      setSaving(true);
      await api.patch(`/customers/change-password/${testCustomerId}`, {
        oldPassword: passData.old,
        newPassword: passData.new
      });
      Alert.alert('Başarılı', 'Şifreniz değiştirildi.');
      setShowPassModal(false);
      setPassData({ old: '', new: '', confirm: '' });
    } catch (e) {
      Alert.alert('Hata', 'Eski şifre yanlış.');
    } finally { setSaving(false); }
  };

  const styles = createStyles(theme);

  if (loading) return (
    <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color={theme.primary} /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Bilgilerim</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.avatarSection}>
          <View style={{ position: 'relative' }}>
            <Image source={{ uri: profile.profilePicture || 'https://ui-avatars.com/api/?name=' + profile.name }} style={styles.avatar} />
            <TouchableOpacity style={styles.editBadge} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.emailText}>{profile.email}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput style={styles.input} value={profile.name} onChangeText={(v) => setProfile({...profile, name: v})} placeholder="Ad Soyad" placeholderTextColor={theme.subText} />

          <Text style={styles.label}>Telefon</Text>
          <TextInput style={styles.input} value={profile.phone} onChangeText={(v) => setProfile({...profile, phone: v})} placeholder="Telefon" placeholderTextColor={theme.subText} keyboardType="phone-pad" />

          <Text style={styles.label}>Doğum Tarihi</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text style={{ color: profile.birthDate ? theme.text : theme.subText }}>{profile.birthDate || 'Tarih Seçin'}</Text>
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Bilgileri Güncelle</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.card, marginTop: 15, borderWidth: 1, borderColor: theme.border }]} onPress={() => setShowPassModal(true)}>
            <Text style={[styles.saveBtnText, { color: theme.text }]}>Şifre Değiştir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PASSWORD MODAL */}
      <Modal visible={showPassModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Şifre Değiştir</Text>
            <TextInput style={styles.input} value={passData.old} onChangeText={(v) => setPassData({...passData, old: v})} placeholder="Eski Şifre" placeholderTextColor={theme.subText} secureTextEntry />
            <TextInput style={styles.input} value={passData.new} onChangeText={(v) => setPassData({...passData, new: v})} placeholder="Yeni Şifre" placeholderTextColor={theme.subText} secureTextEntry />
            <TextInput style={styles.input} value={passData.confirm} onChangeText={(v) => setPassData({...passData, confirm: v})} placeholder="Yeni Şifre Tekrar" placeholderTextColor={theme.subText} secureTextEntry />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.confirmBtn, { flex: 1, backgroundColor: theme.border }]} onPress={() => setShowPassModal(false)}>
                <Text style={{ color: theme.text }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { flex: 1 }]} onPress={handleChangePassword}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>Onayla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DATE PICKER MODAL */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Doğum Tarihi</Text><TouchableOpacity onPress={() => setShowDatePicker(false)}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity></View>
            <View style={{ flexDirection: 'row', height: 200 }}>
              <PickerColumn data={days} selected={selectedDay} onSelect={setSelectedDay} theme={theme} label="Gün" />
              <PickerColumn data={months} selected={selectedMonth} onSelect={setSelectedMonth} theme={theme} label="Ay" />
              <PickerColumn data={years} selected={selectedYear} onSelect={setSelectedYear} theme={theme} label="Yıl" />
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => { setProfile({ ...profile, birthDate: `${selectedDay}/${selectedMonth}/${selectedYear}` }); setShowDatePicker(false); }}><Text style={{ color: '#fff', fontWeight: '800' }}>Tamam</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

interface PickerColumnProps {
  data: string[];
  selected: string;
  onSelect: (val: string) => void;
  theme: any;
  label: string;
}

const PickerColumn = ({ data, selected, onSelect, theme, label }: PickerColumnProps) => (
  <View style={{ flex: 1 }}>
    <Text style={{ textAlign: 'center', fontSize: 10, color: theme.subText }}>{label}</Text>
    <FlatList data={data} keyExtractor={i => i} renderItem={({ item }) => (
      <TouchableOpacity style={{ padding: 10, alignItems: 'center', backgroundColor: selected === item ? theme.primary + '20' : 'transparent', borderRadius: 8 }} onPress={() => onSelect(item)}>
        <Text style={{ color: selected === item ? theme.primary : theme.text, fontWeight: selected === item ? '800' : '400' }}>{item}</Text>
      </TouchableOpacity>
    )} showsVerticalScrollIndicator={false} />
  </View>
);

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  avatarSection: { alignItems: 'center', padding: 30 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: theme.primary },
  editBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: theme.primary, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: theme.card },
  emailText: { marginTop: 10, color: theme.subText, fontWeight: '600' },
  form: { padding: 20 },
  label: { fontSize: 13, fontWeight: '700', color: theme.subText, marginBottom: 8 },
  input: { backgroundColor: theme.card, borderRadius: 12, padding: 15, marginBottom: 15, color: theme.text, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveBtn: { backgroundColor: theme.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: theme.card, borderRadius: 25, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
  confirmBtn: { backgroundColor: theme.primary, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 }
});
