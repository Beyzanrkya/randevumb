# Beyza Nur Kaya - REST API Görevleri

**API Test Videosu:** [Postman Test Videosu](https://www.youtube.com/watch?v=ygb-mFXHdUE)

# <<<<<<< HEAD

> > > > > > > 1d1af6834abc09d6efaa1e7af4486cb1a427c79b
> > > > > > > **API Adresi:** https://https://randevual-theta.vercel.app/

---

## 1. Randevu Güncelleme

- **Endpoint:** `PUT /appointments/{appointmentId}`
- **Authentication:** Bearer Token gerekli
- **Request Body:**

```json
{
  "date": "2026-04-10",
  "time": "14:00",
  "status": "confirmed"
}
```

- **Response:** `200 OK`

---

## 2. Comment Ekleme

- **Endpoint:** `POST /comments`
- **Authentication:** Bearer Token gerekli
- **Request Body:**

```json
{
  "businessId": "işletme_id",
  "text": "Yorum metni",
  "rating": 5
}
```

- **Response:** `201 Created`

---

## 3. Comment Güncelleme

- **Endpoint:** `PUT /comments/{commentId}`
- **Authentication:** Bearer Token gerekli
- **Request Body:**

```json
{
  "text": "Güncellenmiş yorum",
  "rating": 4
}
```

- **Response:** `200 OK`

---

## 4. Comment Silme

- **Endpoint:** `DELETE /comments/{commentId}`
- **Authentication:** Bearer Token gerekli
- **Response:** `204 No Content`

---

## 5. İşletme Üye Olma

- **Endpoint:** `POST /businesses/register`
- **Request Body:**

```json
{
  "name": "İşletme Adı",
  "email": "isletme@example.com",
  "password": "Sifre123!"
}
```

- **Response:** `201 Created`

---

## 6. İşletme Giriş

- **Endpoint:** `POST /businesses/login`
- **Request Body:**

```json
{
  "email": "isletme@example.com",
  "password": "Sifre123!"
}
```

- **Response:** `200 OK` - Token döner

---

## 7. İşletme Oluşturma

- **Endpoint:** `POST /businesses`
- **Authentication:** Bearer Token gerekli
- **Request Body:**

```json
{
  "name": "İşletme Adı",
  "email": "isletme2@example.com",
  "password": "Sifre123!"
}
```

- **Response:** `201 Created`

---

## 8. İşletmeye Ait Randevuları Listeleme

- **Endpoint:** `GET /appointments?businessId={businessId}`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK`

---

## 9. Kategori Listeleme (ID Bazlı)

- **Endpoint:** `GET /categories/{categoryId}`
- **Response:** `200 OK`
