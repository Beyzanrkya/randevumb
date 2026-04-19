# Beyza Nur Kaya - Web Frontend Görevleri

**Frontend Test Videosu:** [Link buraya eklenecek](https://youtu.be/ll4oh8ftqBc)

**Frontend Adresi:** https://randevual-theta.vercel.app

---

## 1. İşletme Kayıt Sayfası

- **API Endpoint:** `POST /businesses/register`
- **Sayfa:** `/register`
- **Açıklama:** İşletme kayıt formu. Ad, email ve şifre ile kayıt.

## 2. İşletme Giriş Sayfası

- **API Endpoint:** `POST /businesses/login`
- **Sayfa:** `/login`
- **Açıklama:** İşletme giriş formu. Token localStorage'a kaydedilir.

## 3. İşletme Oluşturma

- **API Endpoint:** `POST /businesses`
- **Sayfa:** `/register`
- **Açıklama:** Yeni işletme oluşturma.

## 4. Randevuları Listeleme

- **API Endpoint:** `GET /appointments?businessId={id}`
- **Sayfa:** `/appointments`
- **Açıklama:** İşletmeye ait randevuları listeler.

## 5. Randevu Güncelleme

- **API Endpoint:** `PUT /appointments/{id}`
- **Sayfa:** `/appointments`
- **Açıklama:** Randevu tarih, saat ve durumunu günceller.

## 6. Yorum Ekleme

- **API Endpoint:** `POST /comments`
- **Sayfa:** `/comments`
- **Açıklama:** İşletmeye yorum ekler.

## 7. Yorum Güncelleme

- **API Endpoint:** `PUT /comments/{id}`
- **Sayfa:** `/comments`
- **Açıklama:** Yorumu günceller.

## 8. Yorum Silme

- **API Endpoint:** `DELETE /comments/{id}`
- **Sayfa:** `/comments`
- **Açıklama:** Yorumu siler.

## 9. Kategori Listeleme

- **API Endpoint:** `GET /categories/{id}`
- **Sayfa:** `/categories`
- **Açıklama:** Kategoriye ait işletmeleri listeler.
