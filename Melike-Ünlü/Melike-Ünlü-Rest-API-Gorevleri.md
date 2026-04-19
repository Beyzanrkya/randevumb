# Melike Ünlü'nün REST API Metotları

**API Test Videosu:** [https://youtu.be/KTNT28wr6eE](https://example.com)
**Frontend Adresi:** https://randevual-theta.vercel.app

---

## 1. Müşteri Üye Olma

- **Endpoint:** `POST /customers/register`
- **Request Body:**
  ```json
  {
    "name": "Melike",
    "email": "mel_test2@gmail.com",
    "password": "sifre"
  }
  ```
- **Response:** `201 Created` - Müşteri hesabı başarıyla oluşturuldu
  ```json
  {
    "name": "Melike",
    "email": "mel_test2@gmail.com",
    "password": "sifre",
    "_id": "69d2ae76d8ed842e369638a2",
    "createdAt": "2026-04-05T18:48:22.379Z",
    "__v": 0
  }
  ```

---

## 2. Müşteri Giriş

- **Endpoint:** `POST /customers/login`
- **Request Body:**
  ```json
  {
    "email": "mel_test2@gmail.com",
    "password": "sifre"
  }
  ```
- **Response:** `200 OK` - Giriş başarılı, kimlik doğrulama token'ı döndürüldü
  ```json
  {
    "message": "Giriş başarılı",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

## 3. Profil Güncelleme

- **Endpoint:** `PUT /customers/{customerId}`
- **Path Parameters:**
  - `customerId` (string, required) - Müşteri ID'si (örn: `69d2ae76d8ed842e369638a2`)
- **Request Body:**
  ```json
  {
    "name": "Melike Unlu Guncel"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Not:** Kendi profilini güncellemek için `/customers/me` kullanılabilir.
- **Response:** `200 OK` - Profil başarıyla güncellendi
  ```json
  {
    "_id": "69d2ae76d8ed842e369638a2",
    "name": "Melike Unlu Guncel",
    "email": "mel_test2@gmail.com",
    "password": "sifre",
    "createdAt": "2026-04-05T18:48:22.379Z",
    "__v": 0
  }
  ```

---

## 4. Randevu Oluşturma

- **Endpoint:** `POST /appointments`
- **Request Body:**
  ```json
  {
    "customerId": "69d2ae76d8ed842e369638a2",
    "businessId": "69d29fa9fa7dafca23d868c8",
    "serviceId": "69d2aef2d8ed842e369638a6",
    "date": "2026-04-10",
    "time": "14:30"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Randevu başarıyla oluşturuldu
  ```json
  {
    "customerId": "69d2ae76d8ed842e369638a2",
    "businessId": "69d29fa9fa7dafca23d868c8",
    "serviceId": "69d2aef2d8ed842e369638a6",
    "date": "2026-04-10",
    "time": "14:30",
    "status": "pending",
    "note": "",
    "_id": "69d2af40d8ed842e369638a8",
    "createdAt": "2026-04-05T18:51:44.525Z",
    "updatedAt": "2026-04-05T18:51:44.525Z",
    "__v": 0
  }
  ```

---

## 5. Randevu Listeleme (Müşteri)

- **Endpoint:** `GET /appointments?customerId={customerId}`
- **Query Parameters:**
  - `customerId` (string, required) - Müşteri ID'si (örn: `69d2ae76d8ed842e369638a2`)
- **Authentication:** Bearer Token gerekli
- **Not:** Kendi randevularını listelemek için `/appointments/me` kullanılabilir.
- **Response:** `200 OK` - Müşteriye ait tüm randevular listelendi
  ```json
  {
    "message": "Randevular getirildi",
    "appointments": [
      {
        "_id": "69d2af40d8ed842e369638a8",
        "customerId": {
          "_id": "69d2ae76d8ed842e369638a2",
          "name": "Melike Unlu Guncel",
          "email": "mel_test2@gmail.com"
        },
        "businessId": {
          "_id": "69d29fa9fa7dafca23d868c8",
          "name": "Test İşletme 3",
          "email": "tesjjetd5@islfterftme.com"
        },
        "serviceId": "69d2aef2d8ed842e369638a6",
        "date": "2026-04-10",
        "time": "14:30",
        "status": "pending",
        "note": "",
        "createdAt": "2026-04-05T18:51:44.525Z",
        "updatedAt": "2026-04-05T18:51:44.525Z",
        "__v": 0
      }
    ]
  }
  ```

---

## 6. Randevu Silme

- **Endpoint:** `DELETE /appointments/{appointmentId}`
- **Path Parameters:**
  - `appointmentId` (string, required) - Randevu ID'si (örn: `69d2af40d8ed842e369638a8`)
- **Authentication:** Bearer Token gerekli
- **Response:** `204 No Content` - Randevu başarıyla iptal edildi (response body boş döner)

---

## 7. Hizmet Ekleme

- **Endpoint:** `POST /services`
- **Request Body:**
  ```json
  {
    "businessId": "69d29fa9fa7dafca23d868c8",
    "name": "Saç Kesimi",
    "price": 250,
    "duration": 30
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Hizmet başarıyla eklendi
  ```json
  {
    "businessId": "69d29fa9fa7dafca23d868c8",
    "name": "Saç Kesimi",
    "price": 250,
    "duration": 30,
    "_id": "69d2aef2d8ed842e369638a6",
    "__v": 0
  }
  ```

---

## 8. Hizmet Listeleme

- **Endpoint:** `GET /services?businessId={businessId}`
- **Query Parameters:**
  - `businessId` (string, required) - İşletme ID'si (örn: `69d29fa9fa7dafca23d868c8`)
- **Authentication:** Gerekli değil
- **Not:** Kendi işletmene ait hizmetleri listelemek için `/services/me` kullanılabilir.
- **Response:** `200 OK` - İşletmeye ait tüm hizmetler listelendi
  ```json
  [
    {
      "_id": "69d2a4ffe47c2572239d9d69",
      "businessId": "69d29fa9fa7dafca23d868c8",
      "name": "Saç Kesimi",
      "price": 350,
      "duration": 30,
      "__v": 0
    },
    {
      "_id": "69d2aef2d8ed842e369638a6",
      "businessId": "69d29fa9fa7dafca23d868c8",
      "name": "Saç Kesimi",
      "price": 250,
      "duration": 30,
      "__v": 0
    }
  ]
  ```

---

## 9. Hizmet Güncelleme

- **Endpoint:** `PUT /services/{serviceId}`
- **Path Parameters:**
  - `serviceId` (string, required) - Hizmet ID'si (örn: `69d2aef2d8ed842e369638a6`)
- **Request Body:** (sadece güncellenecek alanlar gönderilebilir)
  ```json
  {
    "price": 360
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Hizmet başarıyla güncellendi
  ```json
  {
    "_id": "69d2aef2d8ed842e369638a6",
    "businessId": "69d29fa9fa7dafca23d868c8",
    "name": "Saç Kesimi",
    "price": 360,
    "duration": 30,
    "__v": 0
  }
  ```
