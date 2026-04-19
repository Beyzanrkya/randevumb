## 📅 Randevu İşlemleri

1. **Randevu Güncelleme**  (Beyza Nur Kaya)
   - **API Metodu:** `PUT /appointments/{appointmentId}`  
   - **Açıklama:** Var olan randevunun tarih veya saat bilgilerini günceller.
---

## 💬 Comment İşlemleri

2. **Comment Ekleme**  (Beyza Nur Kaya)
    - **API Metodu:** `POST /comments`  
    - **Açıklama:** Müşteri, aldığı hizmet için yorum yapabilir.

3. **Comment Güncelleme**  (Beyza Nur Kaya)
    - **API Metodu:** `PUT /comments/{commentId}`  
    - **Açıklama:** Müşterinin yaptığı yorumu günceller.

4. **Comment Silme**  (Beyza Nur Kaya)
    - **API Metodu:** `DELETE /comments/{commentId}`  
    - **Açıklama:** Yorumu siler.

---

## 🏢 İşletme İşlemleri

5. **İşletme Üye Olma** (Beyza Nur Kaya)  
    - **API Metodu:** `POST /businesses/register`  
    - **Açıklama:** Yeni işletme hesabı oluşturur.

6. **İşletme Giriş**  (Beyza Nur Kaya)
    - **API Metodu:** `POST /businesses/login`  
    - **Açıklama:** İşletmenin sisteme giriş yapmasını sağlar.

7. **İşletme Oluşturma**  (Beyza Nur Kaya)
    - **API Metodu:** `POST /businesses`  
    - **Açıklama:** Sisteme yeni bir işletme ekler.

---

## 🏢 İşletme Randevu İşlemleri

8. **İşletmeye Ait Randevuları Listeleme**  (Beyza Nur Kaya)
    - **API Metodu:** `GET /appointments?businessId={businessId}`  
    - **Açıklama:** Belirli bir işletmeye ait tüm randevuları listeler.  
    - **Not:** Kendi işletmene ait randevuları listelemek için `/appointments/me` veya `/businesses/me/appointments` kullanılabilir.
    - 
---

## 🗂️ Kategori İşlemleri

9. **Kategori Listeleme (ID Bazlı)**  (Beyza Nur Kaya)
    - **API Metodu:** `GET /categories/{categoryId}`  
    - **Açıklama:** Belirli bir kategorideki işletmeleri getirir.  
