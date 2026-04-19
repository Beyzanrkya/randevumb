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

6. **Randevu Silme**  (Melike Ünlü)
   - **API Metodu:** `DELETE /appointments/{appointmentId}`  
   - **Açıklama:** Randevuyu iptal eder.

---

## 🛎️ Hizmet İşlemleri

7. **Hizmet Ekleme**  (Melike Ünlü)
    - **API Metodu:** `POST /services`  
    - **Açıklama:** İşletmeye yeni hizmet ekler.

8. **Hizmet Listeleme**  (Melike Ünlü)
    - **API Metodu:** `GET /services?businessId={businessId}`  
    - **Açıklama:** Belirli bir işletmeye ait hizmetleri listeler.  
    - **Not:** Kendi işletmene ait hizmetleri listelemek için `/services/me` kullanılabilir.

9. **Hizmet Güncelleme**  (Melike Ünlü)
    - **API Metodu:** `PUT /services/{serviceId}`  
    - **Açıklama:** Hizmet bilgilerini günceller.
