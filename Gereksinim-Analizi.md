# Gereksinim Analizi

Aşağıda uygulamaya ait gereksinim analizi yapılıp listelenmiştir.Ekip üyeleri arasında paylaşım yapılmıştır.										

# Tüm Gereksinimler 

## 👤 Müşteri İşlemleri

1. **Müşteri Üye Olma**  (Melike Ünlü)
   - **API Metodu:** `POST /customers/register`  
   - **Açıklama:** Yeni müşterilerin sisteme kayıt olmasını sağlar. Kullanıcı adı, email ve şifre bilgileri alınarak hesap oluşturulur.

2. **Müşteri Giriş**  (Melike Ünlü)
   - **API Metodu:** `POST /customers/login`  
   - **Açıklama:** Müşterinin email ve şifre ile sisteme giriş yapmasını sağlar. Başarılı girişte kimlik doğrulama için token döndürülür

3. **Profil Güncelleme**  (Melike Ünlü)
   - **API Metodu:** `PUT /customers/{customerId}`  
   - **Açıklama:** Müşterinin profil bilgilerini güncellemesini sağlar.  
   - **Not:** Kendi profilini güncellemek için `/customers/me` kullanılabilir.

---

## 📅 Randevu İşlemleri

4. **Randevu Oluşturma**  (Melike Ünlü)
   - **API Metodu:** `POST /appointments`  
   - **Açıklama:** Müşterinin seçtiği işletme ve hizmet için randevu oluşturur.

5. **Randevu Listeleme (Müşteri)**  (Melike Ünlü)
   - **API Metodu:** `GET /appointments?customerId={customerId}`  
   - **Açıklama:** Belirli bir müşteriye ait tüm randevuları listeler.  
   - **Not:** Kendi randevularını listelemek için `/appointments/me` kullanılabilir.

6. **Randevu Güncelleme**  (Beyza Nur Kaya)
   - **API Metodu:** `PUT /appointments/{appointmentId}`  
   - **Açıklama:** Var olan randevunun tarih veya saat bilgilerini günceller.

7. **Randevu Silme**  (Melike Ünlü)
   - **API Metodu:** `DELETE /appointments/{appointmentId}`  
   - **Açıklama:** Randevuyu iptal eder.

---

## 💬 Comment İşlemleri

8. **Comment Ekleme**  (Beyza Nur Kaya)
    - **API Metodu:** `POST /comments`  
    - **Açıklama:** Müşteri, aldığı hizmet için yorum yapabilir.

9. **Comment Güncelleme**  (Beyza Nur Kaya)
    - **API Metodu:** `PUT /comments/{commentId}`  
    - **Açıklama:** Müşterinin yaptığı yorumu günceller.

10. **Comment Silme**  (Beyza Nur Kaya)
    - **API Metodu:** `DELETE /comments/{commentId}`  
    - **Açıklama:** Yorumu siler.

---

## 🏢 İşletme İşlemleri

11. **İşletme Üye Olma** (Beyza Nur Kaya)  
    - **API Metodu:** `POST /businesses/register`  
    - **Açıklama:** Yeni işletme hesabı oluşturur.

12. **İşletme Giriş**  (Beyza Nur Kaya)
    - **API Metodu:** `POST /businesses/login`  
    - **Açıklama:** İşletmenin sisteme giriş yapmasını sağlar.

13. **İşletme Oluşturma**  (Beyza Nur Kaya)
    - **API Metodu:** `POST /businesses`  
    - **Açıklama:** Sisteme yeni bir işletme ekler.

---

## 🏢 İşletme Randevu İşlemleri

14. **İşletmeye Ait Randevuları Listeleme**  (Beyza Nur Kaya)
    - **API Metodu:** `GET /appointments?businessId={businessId}`  
    - **Açıklama:** Belirli bir işletmeye ait tüm randevuları listeler.  
    - **Not:** Kendi işletmene ait randevuları listelemek için `/appointments/me` veya `/businesses/me/appointments` kullanılabilir.

---

## 🛎️ Hizmet İşlemleri

15. **Hizmet Ekleme**  (Melike Ünlü)
    - **API Metodu:** `POST /services`  
    - **Açıklama:** İşletmeye yeni hizmet ekler.

16. **Hizmet Listeleme**  (Melike Ünlü)
    - **API Metodu:** `GET /services?businessId={businessId}`  
    - **Açıklama:** Belirli bir işletmeye ait hizmetleri listeler.  
    - **Not:** Kendi işletmene ait hizmetleri listelemek için `/services/me` kullanılabilir.

17. **Hizmet Güncelleme**  (Melike Ünlü)
    - **API Metodu:** `PUT /services/{serviceId}`  
    - **Açıklama:** Hizmet bilgilerini günceller.

---

## 🗂️ Kategori İşlemleri

18. **Kategori Listeleme (ID Bazlı)**  (Beyza Nur Kaya)
    - **API Metodu:** `GET /categories/{categoryId}`  
    - **Açıklama:** Belirli bir kategorideki işletmeleri getirir.  


# Gereksinim Dağılımları

1. [Beyza Nur Kaya'nın Gereksinimleri](Beyza-Nur-Kaya/Beyza-Nur-Kaya-Gereksinimler.md)
2. [Melike Ünlü'nün Gereksinimleri](Melike-Ünlü/Melike-Ünlü-Gereksinimler.md)
