import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../constants/Api';

const testOwnerId = "69f754fa8c83d83891093216"; 

const CATEGORIES = [
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

export default function AddBusiness() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: '',
    address: '',
    description: ''
  });

  const handleAdd = async () => {
    if (!form.name || !form.category || !form.address) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      const payload = { ...form, ownerId: testOwnerId };
      await api.post('/businesses', payload);
      
      Alert.alert('Başarılı', 'Yeni işletmeniz anında oluşturuldu! 🎉', [
        { text: 'Dükkanlarıma Git', onPress: () => router.replace('/business-selection' as any) }
      ]);
    } catch (error) {
      Alert.alert('Hata', 'İşletme oluşturulurken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni İşletme Ekle</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBox}>
            <Ionicons name="flash" size={20} color={theme.primary} />
            <Text style={styles.infoText}>Hesabınız doğrulanmış olduğu için yeni işletmeniz anında aktif olacaktır.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>İşletme Adı *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Örn: MBrandev Güzellik" 
              placeholderTextColor={theme.subText}
              value={form.name}
              onChangeText={(v) => setForm({...form, name: v})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategori *</Text>
            <TouchableOpacity 
              style={styles.categoryPicker} 
              onPress={() => setShowCatModal(true)}
            >
              <Text style={{ color: form.category ? theme.text : theme.subText, fontSize: 15 }}>
                {form.category || 'Kategori Seçin'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adres *</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
              placeholder="Tam adres bilgisi..." 
              placeholderTextColor={theme.subText}
              value={form.address}
              onChangeText={(v) => setForm({...form, address: v})}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput 
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
              placeholder="Hizmetleriniz hakkında kısa bir bilgi..." 
              placeholderTextColor={theme.subText}
              value={form.description}
              onChangeText={(v) => setForm({...form, description: v})}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleAdd}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Şubeyi Hemen Aç</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* CATEGORY MODAL */}
      <Modal visible={showCatModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategori Seçin</Text>
              <TouchableOpacity onPress={() => setShowCatModal(false)}>
                <Ionicons name="close" size={26} color={theme.text} />
              </TouchableOpacity>
            </View>
            <FlatList 
              data={CATEGORIES}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.catItem}
                  onPress={() => {
                    setForm({...form, category: item.name});
                    setShowCatModal(false);
                  }}
                >
                  <View style={styles.catIconBox}>
                    <Ionicons name={item.icon as any} size={20} color={theme.primary} />
                  </View>
                  <Text style={styles.catName}>{item.name}</Text>
                  {form.category === item.name && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.card },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  formContent: { padding: 25 },
  infoBox: { flexDirection: 'row', backgroundColor: theme.primary + '10', padding: 15, borderRadius: 15, marginBottom: 25, gap: 10, alignItems: 'center' },
  infoText: { flex: 1, fontSize: 13, color: theme.text, fontWeight: '500' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 8 },
  input: { backgroundColor: theme.card, borderRadius: 15, padding: 16, fontSize: 15, color: theme.text, borderWidth: 1, borderColor: theme.border },
  categoryPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.card, borderRadius: 15, padding: 16, borderWidth: 1, borderColor: theme.border },
  submitBtn: { backgroundColor: theme.primary, padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 10, shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: theme.text },
  catItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.border },
  catIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  catName: { flex: 1, fontSize: 16, fontWeight: '600', color: theme.text }
});
