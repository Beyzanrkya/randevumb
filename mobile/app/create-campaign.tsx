import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../constants/Api';

export default function CreateCampaign() {
  const params = useLocalSearchParams();
  const { businessId, campaignId } = params;
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState((params.title as string) || '');
  const [description, setDescription] = useState((params.description as string) || '');
  const [discountRate, setDiscountRate] = useState((params.discountRate as string) || '');
  const [daysValid, setDaysValid] = useState('7');

  const handleCreate = async () => {
    if (!title || !description) {
      Alert.alert('Hata', 'Lütfen başlık ve açıklama giriniz.');
      return;
    }

    setLoading(true);
    try {
      const data = {
        businessId,
        title,
        description,
        discountRate: parseInt(discountRate) || 0,
      };

      const endDateObj = new Date();
      endDateObj.setDate(endDateObj.getDate() + parseInt(daysValid));
      const finalData = { ...data, endDate: endDateObj.toISOString() };

      if (campaignId) {
        await api.put(`/campaigns/${campaignId}`, finalData);
        Alert.alert('Başarılı', 'Kampanyanız güncellendi.');
      } else {
        await api.post('/campaigns', finalData);
        Alert.alert('Başarılı', 'Kampanyanız başarıyla oluşturuldu.');
      }
      
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'İşlem başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{campaignId ? 'Kampanyayı Güncelle' : 'Kampanya Oluştur'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kampanya Başlığı</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Bahar İndirimi"
            placeholderTextColor={theme.subText}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kampanya Açıklaması</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Kampanya detaylarını yazın..."
            placeholderTextColor={theme.subText}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>İndirim Oranı (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 20"
            placeholderTextColor={theme.subText}
            keyboardType="numeric"
            value={discountRate}
            onChangeText={setDiscountRate}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Geçerlilik Süresi (Gün)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 7"
            placeholderTextColor={theme.subText}
            keyboardType="numeric"
            value={daysValid}
            onChangeText={setDaysValid}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="megaphone-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.submitBtnText}>{campaignId ? 'Değişiklikleri Kaydet' : 'Kampanyayı Yayınla'}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.card },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  content: { padding: 25 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 8 },
  input: { backgroundColor: theme.card, borderRadius: 15, padding: 15, color: theme.text, borderWidth: 1, borderColor: theme.border },
  submitBtn: { backgroundColor: theme.primary, borderRadius: 20, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
