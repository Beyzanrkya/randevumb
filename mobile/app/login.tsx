import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, ImageBackground, Image, Modal, SafeAreaView } from 'react-native';
import api from '../constants/Api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as WebBrowser from 'expo-web-browser';

import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { isDark, toggleTheme, theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const navLinks = [
    { title: 'Ana Sayfa', path: '/' },
    { title: 'Müşteri Giriş', path: '/login' },
    { title: 'Müşteri Kayıt', path: '/customer-register' },
    { title: 'İşletme Giriş', path: '/business-login' },
    { title: 'İşletme Kayıt', path: '/business-register' },
  ];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/customers/login', { email, password });
      if (response.data.token) {
        await SecureStore.setItemAsync('userToken', response.data.token);
        await SecureStore.setItemAsync('userRole', 'customer');
        Alert.alert('Giriş Başarılı', `Hoş geldiniz, ${response.data.customerName || 'Müşterimiz'}!`);
        router.replace('/customer-dashboard');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'E-posta veya şifre hatalı.';
      Alert.alert('Hata', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform: string) => {
    Alert.alert(
      'Yakında Hizmetinizde',
      `${platform} ile giriş şu an aktif değil. Çok yakında hizmetinizde olacak!`,
      [{ text: 'Tamam' }]
    );
  };

  const styles = createStyles(theme, isDark);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
      {/* 1. Navbar / Header Area */}
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <View style={styles.logoBadge}><Text style={styles.logoIconText}>MB</Text></View>
          <Text style={styles.logoText}>MBrandev</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={toggleTheme}>
            <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={isDark ? theme.primary : "#EAB308"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu-outline" size={30} color={theme.text} style={{marginLeft: 15}} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Hero Section with Background Image */}
      <View style={styles.heroWrapper}>
        <ImageBackground 
          source={require('../assets/images/login_bg.png')} 
          style={styles.heroImage}
          imageStyle={{ borderRadius: 0 }}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroCard}>
              <Text style={styles.heroCardTitle}>Zarafetin{'\n'}Yeni Adresi</Text>
              <Text style={styles.heroCardSubtitle}>
                En seçkin salonlardan randevu almanın en hızlı ve şık yolu. Kendinizi ödüllendirmeye hazır mısınız?
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* 3. Login Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MÜŞTERİ GİRİŞİ</Text>
        </View>

        <Text style={styles.title}>Hoş Geldiniz</Text>
        <Text style={styles.subtitle}>Güzellik ve bakım dünyasına adım atmak için giriş yapın.</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta Adresi</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={isDark ? "#64748B" : "#A0AEC0"}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.label}>Şifre</Text>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={isDark ? "#64748B" : "#A0AEC0"}
            />
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>



          <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/customer-register' as any)}>
            <Text style={styles.registerText}>
              Henüz bir hesabınız yok mu? <Text style={styles.registerAction}>Kayıt Olun</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal visible={menuVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={[styles.menuContainer, { backgroundColor: theme.card }]}>
          <View style={styles.menuHeader}>
             <View style={styles.logoContainer}>
                <View style={styles.logoBadge}><Text style={styles.logoIconText}>MB</Text></View>
                <Text style={[styles.logoText, { color: theme.text }]}>MBrandev</Text>
             </View>
             <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close-outline" size={36} color={theme.text} />
             </TouchableOpacity>
          </View>
          
          <View style={styles.menuLinks}>
            {navLinks.map((link, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.menuItem, { backgroundColor: isDark ? theme.secondary : '#F3F4F6' }]} 
                onPress={() => { setMenuVisible(false); router.push(link.path as any); }}
              >
                <Text style={[styles.menuItemText, { color: theme.text }]}>{link.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: theme.background },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backButton: { width: 40 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBadge: { width: 30, height: 30, backgroundColor: isDark ? '#3E1D26' : '#FCE7F3', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  logoIconText: { color: theme.primary, fontWeight: '800', fontSize: 12 },
  logoText: { fontSize: 18, fontWeight: '800', color: theme.text },
  headerIcons: { flexDirection: 'row', alignItems: 'center', width: 80, justifyContent: 'flex-end' },
  
  heroWrapper: { height: 280, width: '100%' },
  heroImage: { flex: 1, justifyContent: 'center' },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  heroCard: { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.9)', padding: 25, borderRadius: 24, width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  heroCardTitle: { fontSize: 24, fontWeight: '800', color: theme.text, marginBottom: 12, lineHeight: 28 },
  heroCardSubtitle: { fontSize: 13, color: theme.subText, lineHeight: 18 },

  formContainer: { padding: 24, paddingTop: 30 },
  badge: { backgroundColor: isDark ? '#3E1D26' : '#F3EBED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20 },
  badgeText: { color: theme.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '800', color: theme.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: theme.subText, marginBottom: 30, lineHeight: 22 },
  
  form: { gap: 18 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: theme.text },
  input: { backgroundColor: theme.inputBg, padding: 16, borderRadius: 14, fontSize: 16, borderWidth: 1, borderColor: theme.border, color: theme.text },
  forgotText: { fontSize: 13, color: theme.primary, fontWeight: '600' },
  loginButton: { backgroundColor: theme.secondary, padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  divider: { flex: 1, height: 1, backgroundColor: theme.border },
  dividerText: { paddingHorizontal: 12, fontSize: 10, color: theme.subText, fontWeight: '700' },
  
  socialContainer: { gap: 12 },
  socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card },
  socialButtonText: { fontSize: 15, fontWeight: '600' },
  
  registerLink: { marginTop: 10, alignItems: 'center' },
  registerText: { color: theme.subText, fontSize: 14 },
  registerAction: { color: theme.primary, fontWeight: '700' },

  menuContainer: { flex: 1, padding: 25 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 50 },
  menuLinks: { gap: 15 },
  menuItem: { padding: 22, borderRadius: 20, alignItems: 'center' },
  menuItemText: { fontSize: 18, fontWeight: '700' }
});
