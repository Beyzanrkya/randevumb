import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, SafeAreaView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function LandingScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, theme } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const navLinks = [
    { title: 'Ana Sayfa', path: '/' },
    { title: 'Müşteri Giriş', path: '/login' },
    { title: 'Müşteri Kayıt', path: '/customer-register' },
    { title: 'İşletme Giriş', path: '/business-login' },
    { title: 'İşletme Kayıt', path: '/business-register' },
  ];

  const features = [
    { icon: 'calendar-outline', title: 'Zahmetsiz Randevu', desc: 'Birkaç saniye içinde online randevunuzu oluşturun.' },
    { icon: 'stats-chart-outline', title: 'Modern Panel', desc: 'İşletmenizin performansını ve takvimini anlık olarak yönetin.' },
    { icon: 'sparkles-outline', title: 'Şeffaf Tasarım', desc: 'Müşterilerinize modern ve estetik bir rezervasyon deneyimi sunun.' }
  ];

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        {/* 1. Navbar Section */}
        <View style={styles.navbar}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}><Text style={styles.logoIconText}>MB</Text></View>
            <Text style={styles.logoText}>MBrandev</Text>
          </View>
          <View style={styles.navIcons}>
            <TouchableOpacity 
              style={styles.iconCircle} 
              onPress={toggleTheme}
            >
              <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={isDark ? theme.primary : "#EAB308"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Ionicons name="menu-outline" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.container}>
          {/* 2. Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>✨ İŞLETMENİN KOLAY HALİ</Text></View>
            
            <Image source={{ uri: 'https://randevumb.vercel.app/booking_lifestyle.png' }} style={[styles.heroImage, { marginBottom: 30 }]} />

            <Text style={styles.heroTitle}>MBrandev ile{'\n'}<Text style={{color: theme.primary}}>Mükemmel Randevular</Text></Text>
            <Text style={styles.heroSubtitle}>İşletmenizi büyütmenin ve müşterilerinizle buluşmanın en modern, şeffaf ve şık yolu.</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={() => router.push('/business-register')}
              >
                <Text style={styles.primaryButtonText}>İşletme Kaydı Oluştur →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/login')}><Text style={styles.secondaryButtonText}>Müşteri Olarak Başla</Text></TouchableOpacity>
            </View>
          </View>

          {/* 3. Neden MBrandev Section */}
          <View style={styles.section}>
            <Text style={styles.whyTitle}>Neden MBrandev?</Text>
            <View style={styles.featuresGrid}>
              {features.map((item, i) => (
                <View key={i} style={styles.featureCard}>
                   <View style={styles.featureIconCircle}>
                      <Ionicons name={item.icon} size={30} color={theme.primary} />
                   </View>
                   <Text style={styles.featureTitle}>{item.title}</Text>
                   <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 4. Salon Yönetimi Section */}
          <View style={styles.section}>
            <View style={styles.badgeRow}>
               <Text style={styles.smallBadge}>💼 İşletmeler İçin</Text>
            </View>
            <Text style={styles.sectionTitle}>Salonunuz İçin{'\n'}<Text style={{color: theme.primary}}>Kusursuz Yönetim</Text></Text>
            <Text style={styles.sectionDesc}>Salonunuzun ambiyansına yakışır modern bir dijital deneyim sunun. Siz sadece işinize odaklanın.</Text>
            
            <Image source={require('../../assets/images/salon.png')} style={styles.heroImage} />

            <View style={styles.checkList}>
              {['Tam Otomatik Takvim Yönetimi', 'Gerçek Zamanlı Bildirimler', 'Müşteri Yorumları ile İtibar'].map((item, i) => (
                <View key={i} style={styles.checkItem}>
                  <Ionicons name="checkmark-circle" size={22} color={theme.text} />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 5. Sistem Nasıl Çalışır Section */}
          <View style={styles.guideSection}>
             <View style={[styles.badgeRow, { justifyContent: 'center' }]}>
               <Text style={[styles.smallBadge, { backgroundColor: isDark ? theme.background : '#F3F4F6' }]}>REHBER</Text>
             </View>
             <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>Sistem Nasıl Çalışır?</Text>
             
             {[
               { id: '01', title: 'Kayıt Olun', desc: 'Müşteri veya İşletme hesabı oluşturarak platforma anında giriş yapın.' },
               { id: '02', title: 'Hizmetleri Keşfedin', desc: 'İşletmeler hizmetlerini ekler, müşteriler ise kolayca filtreler.' },
               { id: '03', title: 'Randevu Alın', desc: 'Tek tıkla randevu oluşturun. AI desteği ile süreci yönetin.' }
             ].map((step, i) => (
               <View key={i} style={styles.stepCard}>
                  <Text style={styles.stepNumber}>{step.id}</Text>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
               </View>
             ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 MBrandev Mobile</Text>
          </View>
        </View>
      </ScrollView>

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
                onPress={() => { setMenuVisible(false); router.push(link.path); }}
              >
                <Text style={[styles.menuItemText, { color: theme.text }]}>{link.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme, isDark) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  scrollContainer: { flexGrow: 1 },
  navbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: { width: 35, height: 35, backgroundColor: isDark ? '#3E1D26' : '#FCE7F3', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  logoIconText: { color: theme.primary, fontWeight: '800', fontSize: 14 },
  logoText: { fontSize: 20, fontWeight: '800', color: theme.text },
  navIcons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconCircle: { width: 35, height: 35, backgroundColor: theme.card, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  heroSection: { alignItems: 'center', marginBottom: 40 },
  heroBadge: { backgroundColor: theme.card, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 30, borderWidth: 1, borderColor: theme.border, marginBottom: 20 },
  heroBadgeText: { fontSize: 11, fontWeight: '700', color: theme.text },
  heroTitle: { fontSize: 32, fontWeight: '900', color: theme.text, textAlign: 'center', lineHeight: 38, marginBottom: 15 },
  heroSubtitle: { fontSize: 15, color: theme.subText, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  buttonContainer: { width: '100%', gap: 12 },
  primaryButton: { backgroundColor: theme.secondary, paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryButton: { backgroundColor: theme.card, paddingVertical: 16, borderRadius: 30, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  secondaryButtonText: { color: theme.primary, fontSize: 15, fontWeight: '700' },
  section: { marginTop: 40 },
  whyTitle: { fontSize: 30, fontWeight: '900', color: theme.text, textAlign: 'center', marginBottom: 30 },
  featuresGrid: { gap: 20 },
  featureCard: { backgroundColor: theme.card, padding: 30, borderRadius: 30, alignItems: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  featureIconCircle: { width: 70, height: 70, backgroundColor: isDark ? '#3E1D26' : '#F3EBED', borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  featureTitle: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 10 },
  featureDesc: { fontSize: 14, color: theme.subText, textAlign: 'center', lineHeight: 20 },
  heroImage: { width: '100%', height: 250, borderRadius: 24, marginBottom: 20 },
  badgeRow: { marginBottom: 15 },
  smallBadge: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: isDark ? '#3E1D26' : '#F3EBED', borderRadius: 12, color: isDark ? '#F9A8D4' : '#1E2A40', fontWeight: '700', fontSize: 12 },
  sectionTitle: { fontSize: 28, fontWeight: '800', color: theme.text, marginBottom: 15 },
  sectionDesc: { fontSize: 15, color: theme.subText, lineHeight: 22, marginBottom: 25 },
  checkList: { gap: 12 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkText: { fontSize: 15, fontWeight: '600', color: theme.text },
  guideSection: { backgroundColor: theme.card, borderRadius: 40, padding: 30, marginTop: 40 },
  stepCard: { alignItems: 'center', marginBottom: 40 },
  stepNumber: { fontSize: 48, fontWeight: '900', color: isDark ? '#334155' : '#F3F4F6', marginBottom: -25 },
  stepTitle: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 10 },
  stepDesc: { fontSize: 14, color: theme.subText, textAlign: 'center', lineHeight: 20 },
  footer: { marginTop: 60, paddingBottom: 40, alignItems: 'center' },
  footerText: { color: theme.subText, fontSize: 12 },
  menuContainer: { flex: 1, padding: 25 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 50 },
  menuLinks: { gap: 15 },
  menuItem: { padding: 22, borderRadius: 20, alignItems: 'center' },
  menuItemText: { fontSize: 18, fontWeight: '700' }
});

