import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, FlatList, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import api from '../constants/Api';

const { width } = Dimensions.get('window');

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

export default function BusinessSettings() {
  const { businessId } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: '',
    address: '',
    description: '',
    email: '',
    phone: '',
    imageUrl: '',
    gallery: [] as string[]
  });

  useEffect(() => {
    if (businessId) fetchBusinessData();
  }, [businessId]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/businesses/${businessId}`);
      const b = response.data;
      setForm({
        name: b.name || '',
        category: b.category || '',
        address: b.address || '',
        description: b.description || '',
        email: b.email || '',
        phone: b.phone || '',
        imageUrl: b.imageUrl || '',
        gallery: b.gallery || []
      });
    } catch (error) {
      Alert.alert('Hata', 'İşletme bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (type: 'profile' | 'gallery') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Hata', 'Galeriye erişim izni verilmedi.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: type === 'profile',
      aspect: [16, 9],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (type === 'profile') {
        setForm({ ...form, imageUrl: base64Img });
      } else {
        setForm({ ...form, gallery: [...form.gallery, base64Img] });
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = [...form.gallery];
    newGallery.splice(index, 1);
    setForm({ ...form, gallery: newGallery });
  };

  const handleUpdate = async () => {
    if (!form.name || !form.address) {
      Alert.alert('Hata', 'Lütfen gerekli alanları doldurun.');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/businesses/${businessId}`, form);
      Alert.alert('Başarılı', 'İşletme bilgileri güncellendi! 🎉');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Güncelleme sırasında bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const styles = createStyles(theme, isDark);

  if (loading) return (
    <View style={styles.loader}><ActivityIndicator size="large" color={theme.primary} /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>İşletme Ayarları</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          {/* Profile/Cover Image Section */}
          <Text style={styles.label}>Kapak Fotoğrafı</Text>
          <TouchableOpacity style={styles.imagePickerMain} onPress={() => pickImage('profile')}>
            {form.imageUrl ? (
              <Image source={{ uri: form.imageUrl }} style={styles.mainImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color={theme.subText} />
                <Text style={styles.placeholderText}>Fotoğraf Ekle</Text>
              </View>
            )}
            <View style={styles.editIconBadge}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Business Gallery Section */}
          <Text style={[styles.label, { marginTop: 20 }]}>İşletme Galerisi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
            <TouchableOpacity style={styles.addGalleryBtn} onPress={() => pickImage('gallery')}>
              <Ionicons name="add" size={30} color={theme.primary} />
            </TouchableOpacity>
            {form.gallery.map((img, index) => (
              <View key={index} style={styles.galleryItem}>
                <Image source={{ uri: img }} style={styles.galleryImage} />
                <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeGalleryImage(index)}>
                  <Ionicons name="close-circle" size={22} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.inputGroup, { marginTop: 25 }]}>
            <Text style={styles.label}>İşletme Adı *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="İşletme Adı" 
              placeholderTextColor={theme.subText}
              value={form.name}
              onChangeText={(v) => setForm({...form, name: v})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategori</Text>
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
            <Text style={styles.label}>E-posta</Text>
            <TextInput 
              style={styles.input} 
              placeholder="isletme@email.com" 
              placeholderTextColor={theme.subText}
              value={form.email}
              onChangeText={(v) => setForm({...form, email: v})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput 
              style={styles.input} 
              placeholder="05xx xxx xx xx" 
              placeholderTextColor={theme.subText}
              value={form.phone}
              onChangeText={(v) => setForm({...form, phone: v})}
              keyboardType="phone-pad"
            />
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
              placeholder="İşletme açıklaması..." 
              placeholderTextColor={theme.subText}
              value={form.description}
              onChangeText={(v) => setForm({...form, description: v})}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Değişiklikleri Kaydet</Text>}
          </TouchableOpacity>
          
          <View style={{ height: 30 }} />
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
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.card },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  formContent: { padding: 25 },
  label: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 10 },
  imagePickerMain: { width: '100%', height: 220, backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.border, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { alignItems: 'center', gap: 10 },
  placeholderText: { color: theme.subText, fontWeight: '600', fontSize: 13 },
  editIconBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: theme.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  galleryScroll: { flexDirection: 'row', marginTop: 5 },
  addGalleryBtn: { width: 100, height: 100, backgroundColor: theme.card, borderRadius: 15, borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  galleryItem: { width: 100, height: 100, borderRadius: 15, overflow: 'hidden', marginRight: 12, position: 'relative' },
  galleryImage: { width: '100%', height: '100%' },
  removeImgBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: '#fff', borderRadius: 11 },
  inputGroup: { marginBottom: 20 },
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
