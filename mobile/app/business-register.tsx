import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, ImageBackground, Modal, FlatList, SafeAreaView } from 'react-native';
import api from '../constants/Api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  'Güzellik & Bakım',
  'Spor & Fitness',
  'Psikoloji & Danışmanlık',
  'Otomobil & Servis',
  'Eğlence & Etkinlik',
  'Sağlık & Diyet',
  'Eğitim & Kurs',
  'Ev & Temizlik'
];

export default function BusinessRegisterScreen() {
  const { isDark, toggleTheme, theme } = useTheme();
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const navLinks = [
    { title: 'Ana Sayfa', path: '/' },
    { title: 'Müşteri Giriş', path: '/login' },
    { title: 'Müşteri Kayıt', path: '/customer-register' },
    { title: 'İşletme Giriş', path: '/business-login' },
    { title: 'İşletme Kayıt', path: '/business-register' },
  ];

  const handleRegister = async () => {
    if (!businessName || !category || !email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/businesses/register', {
        name: businessName,
        email,
        password,
        category // Also sending category name as 'category'
      });
      if (response.data) {
        Alert.alert('Başarılı', 'İşletme kaydınız başarıyla oluşturuldu. Giriş yapabilirsiniz.');
        router.push('/business-login' as any);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Kayıt sırasında bir hata oluştu.';
      Alert.alert('Kayıt Başarısız', errorMsg);
    } finally {
      setLoading(false);
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
            <Ionicons name="menu-outline" size={30} color={theme.text} style={{ marginLeft: 15 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Hero Section with Background Image */}
      <View style={styles.heroWrapper}>
        <ImageBackground
          source={require('../assets/images/business_reg_bg.png')}
          style={styles.heroImage}
          imageStyle={{ borderRadius: 0 }}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroCard}>
              <Text style={styles.heroCardTitle}>Aramıza Katılın</Text>
              <Text style={styles.heroCardSubtitle}>
                MBrandev ailesine katılarak işletmenizi binlerce potansiyel müşteriye ulaştırın ve rezervasyonlarınızı dijitalleştirin.
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* 3. Register Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>KURUMSAL BAŞVURU</Text>
        </View>

        <Text style={styles.title}>İşletme Hesabı Açın</Text>
        <Text style={styles.subtitle}>Hemen ücretsiz işletme hesabınızı oluşturun.</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>İşletme Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: MBrandev Güzellik Salonu"
              value={businessName}
              onChangeText={setBusinessName}
              placeholderTextColor={isDark ? "#64748B" : "#A0AEC0"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>İşletme Kategorisi</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerButton]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[styles.pickerText, { color: category ? theme.text : (isDark ? "#64748B" : "#A0AEC0") }]}>
                {category || 'Kategori Seçiniz'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta Adresi</Text>
            <TextInput
              style={styles.input}
              placeholder="isletme@ornek.com"
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
              placeholder="En az 6 karakter"
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
              <Text style={styles.buttonText}>Hesap Oluştur</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>HIZLI KAYIT OLUN</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
              <Ionicons name="logo-google" size={20} color={theme.text} />
              <Text style={[styles.socialButtonText, { color: theme.text }]}>Google ile Kayıt Ol</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.secondary }]} onPress={() => handleSocialLogin('Apple')}>
              <Ionicons name="logo-apple" size={20} color="#fff" />
              <Text style={[styles.socialButtonText, { color: '#fff' }]}>Apple ile Kayıt Ol</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/business-login' as any)}>
            <Text style={styles.loginText}>
              Zaten bir işletme hesabınız var mı? <Text style={styles.loginAction}>Giriş Yapın</Text>
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

      {/* Category Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategori Seçiniz</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => {
                    setCategory(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.categoryText, { color: category === item ? theme.primary : theme.text, fontWeight: category === item ? '700' : '400' }]}>
                    {item}
                  </Text>
                  {category === item && <Ionicons name="checkmark" size={20} color={theme.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
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
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerText: { fontSize: 16 },
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.text },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  categoryText: { fontSize: 16 },

  menuContainer: { flex: 1, padding: 25 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 50 },
  menuLinks: { gap: 15 },
  menuItem: { padding: 22, borderRadius: 20, alignItems: 'center' },
  menuItemText: { fontSize: 18, fontWeight: '700' }
});
