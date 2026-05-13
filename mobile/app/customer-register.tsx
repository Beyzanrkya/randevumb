import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, ImageBackground, Modal, SafeAreaView } from 'react-native';
import api from '../constants/Api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function RegisterScreen() {
  const { isDark, toggleTheme, theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  const navLinks = [
    { title: 'Ana Sayfa', path: '/' },
    { title: 'Müşteri Giriş', path: '/login' },
    { title: 'Müşteri Kayıt', path: '/customer-register' },
    { title: 'İşletme Giriş', path: '/business-login' },
    { title: 'İşletme Kayıt', path: '/business-register' },
  ];

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      console.log("Kayıt isteği gönderiliyor:", { name, email });
      const response = await api.post('/customers/register', { name, email, password });
      console.log("Kayıt yanıtı alındı:", response.data);
      if (response.data) {
        setOtpModalVisible(true);
        console.log("OTP Modalı açılmalı: true");
      }
    } catch (error: any) {
      console.error("Kayıt hatası:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'Kayıt sırasında bir hata oluştu.';
      Alert.alert('Kayıt Başarısız', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length < 4) {
      Alert.alert('Hata', 'Lütfen geçerli bir doğrulama kodu girin.');
      return;
    }

    setVerifying(true);
    try {
      const response = await api.post('/customers/verify-email', { email, code: otpCode });
      if (response.data) {
        Alert.alert('Başarılı', 'E-posta adresiniz doğrulandı! Şimdi giriş yapabilirsiniz.');
        setOtpModalVisible(false);
        router.push('/login' as any);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Doğrulama kodu hatalı veya süresi dolmuş.';
      Alert.alert('Doğrulama Başarısız', errorMsg);
    } finally {
      setVerifying(false);
    }
  };

  const handleSocialLogin = (platform: string) => {
    Alert.alert(
      'Yakında Hizmetinizde',
      `${platform} ile kayıt şu an aktif değil. Çok yakında hizmetinizde olacak!`,
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
          source={require('../assets/images/register_bg.png')} 
          style={styles.heroImage}
          imageStyle={{ borderRadius: 0 }}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroCard}>
              <Text style={styles.heroCardTitle}>Hemen Başlayın</Text>
              <Text style={styles.heroCardSubtitle}>
                MBrandev hesabı oluşturarak favori işletmelerinizi takip edin, geçmiş randevularınızı görün ve yeni randevularınızı tek tıkla alın.
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* 3. Register Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MÜŞTERİ KAYDI</Text>
        </View>

        <Text style={styles.title}>Aramıza Katılın</Text>
        <Text style={styles.subtitle}>Saniyeler içinde hesabınızı oluşturun ve güzellik dünyasını keşfedin.</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn. Ayşe Yılmaz"
              value={name}
              onChangeText={setName}
              placeholderTextColor={isDark ? "#64748B" : "#A0AEC0"}
            />
          </View>

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
            <Text style={styles.label}>Şifre</Text>
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
            style={styles.registerButton} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login' as any)}>
            <Text style={styles.loginText}>
              Zaten bir hesabınız var mı? <Text style={styles.loginAction}>Giriş Yapın</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* OTP Verification Modal */}
      <Modal visible={otpModalVisible} animationType="fade" transparent={true}>
        <View style={styles.otpModalOverlay}>
          <View style={[styles.otpCard, { backgroundColor: theme.card }]}>
            <View style={styles.otpIconContainer}>
              <Ionicons name="mail-open-outline" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.otpTitle, { color: theme.text }]}>E-postanızı Doğrulayın</Text>
            <Text style={[styles.otpSubtitle, { color: theme.subText }]}>
              {email} adresine gönderdiğimiz 6 haneli kodu aşağıya girin.
            </Text>
            
            <TextInput
              style={[styles.otpInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBg }]}
              placeholder="000000"
              placeholderTextColor={isDark ? "#64748B" : "#A0AEC0"}
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity 
              style={[styles.verifyButton, { backgroundColor: theme.secondary }]} 
              onPress={handleVerifyOTP}
              disabled={verifying}
            >
              {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyButtonText}>Kodu Doğrula</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setOtpModalVisible(false)} style={styles.cancelOtpButton}>
              <Text style={[styles.cancelOtpText, { color: theme.subText }]}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center', padding: 20 },
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
  registerButton: { backgroundColor: theme.secondary, padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  divider: { flex: 1, height: 1, backgroundColor: theme.border },
  dividerText: { paddingHorizontal: 12, fontSize: 10, color: theme.subText, fontWeight: '700' },
  
  socialContainer: { gap: 12 },
  socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card },
  socialButtonText: { fontSize: 15, fontWeight: '600' },
  
  loginLink: { marginTop: 10, alignItems: 'center' },
  loginText: { color: theme.subText, fontSize: 14 },
  loginAction: { color: theme.primary, fontWeight: '700' },

  menuContainer: { flex: 1, padding: 25 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 50 },
  menuLinks: { gap: 15 },
  menuItem: { padding: 22, borderRadius: 20, alignItems: 'center' },
  menuItemText: { fontSize: 18, fontWeight: '700' },

  // OTP Modal Styles
  otpModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  otpCard: { width: '85%', padding: 30, borderRadius: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  otpIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: isDark ? '#3E1D26' : '#FCE7F3', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  otpTitle: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  otpSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  otpInput: { width: '100%', padding: 18, borderRadius: 15, fontSize: 24, textAlign: 'center', letterSpacing: 8, fontWeight: '700', borderWidth: 1, marginBottom: 20 },
  verifyButton: { width: '100%', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  verifyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelOtpButton: { padding: 10 },
  cancelOtpText: { fontSize: 14, fontWeight: '600' }
});
