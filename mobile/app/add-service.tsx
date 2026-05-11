import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../constants/Api';

export default function AddService() {
  const { businessId } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    price: '',
    duration: '',
    description: ''
  });

  const handleAdd = async () => {
    if (!form.name || !form.price || !form.duration) {
      Alert.alert('Hata', 'Lütfen gerekli alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        businessId,
        price: Number(form.price),
        duration: Number(form.duration)
      };
      await api.post('/services', payload);
      Alert.alert('Başarılı', 'Hizmet başarıyla eklendi! 🎉');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Hizmet eklenirken bir sorun oluştu.');
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
          <Text style={styles.headerTitle}>Yeni Hizmet Ekle</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hizmet Adı *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Örn: Saç Kesimi" 
              placeholderTextColor={theme.subText}
              value={form.name}
              onChangeText={(v) => setForm({...form, name: v})}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 15 }}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Ücret (TL) *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Örn: 250" 
                placeholderTextColor={theme.subText}
                value={form.price}
                onChangeText={(v) => setForm({...form, price: v})}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Süre (Dakika) *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Örn: 45" 
                placeholderTextColor={theme.subText}
                value={form.duration}
                onChangeText={(v) => setForm({...form, duration: v})}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput 
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
              placeholder="Hizmet detayları..." 
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
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Hizmeti Kaydet</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.card },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  formContent: { padding: 25 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 8 },
  input: { backgroundColor: theme.card, borderRadius: 15, padding: 16, fontSize: 15, color: theme.text, borderWidth: 1, borderColor: theme.border },
  submitBtn: { backgroundColor: theme.primary, padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 10, shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
