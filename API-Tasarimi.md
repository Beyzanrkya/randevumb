# API Tasarımı - OpenAPI Specification Örneği

**OpenAPI Spesifikasyon Dosyası:** [lamine.yaml](lamine.yaml)

Bu doküman, OpenAPI Specification (OAS) 3.0 standardına göre hazırlanmış MBrandev randevu sistemi API tasarımını içermektedir.

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: MBrandev Appointment API
  description: |
    MBrandev çok kategorili randevu sistemi için REST API yapıldı.

    ## Özellikler:
    - Müşteri hesap yönetimi
    - İşletme yönetimi
    - Hizmet yönetimi
    - Randevu oluşturma ve yönetme
    - Yorum sistemi
    -JWT tabanlı kimlik doğrulama
  version: 1.0.0
  contact:
    name: MBrandev API Destek Ekibi
    email: api-support@mbrandev.com
    url: https://mbrandev.com/support
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.mbrandev.com/api
    description: Production server
  - url: https://staging.mbrandev.com/api
    description: Staging server
  - url: http://localhost:8080/api
    description: Development server

tags:
  - name: customers
    description: Müşteri hesap yönetimi işlemleri
  - name: businesses
    description: İşletme hesap ve işletme yönetimi işlemleri
  - name: appointments
    description: Randevu oluşturma ve yönetim işlemleri
  - name: services
    description: İşletmelerin sunduğu hizmet yönetimi işlemleri
  - name: comments
    description: Müşteri yorum işlemleri
  - name: categories
    description: İşletme kategorileri listeleme işlemleri
  - name: auth
    description: Kimlik doğrulama işlemleri

paths:
  /customers/register:
    post:
      tags:
        - auth
      summary: Müşteri kayıt
      description: Sisteme yeni bir kullanıcı kaydeder
      operationId: registerUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CustomerRegister"
            examples:
              example1:
                summary: Örnek kullanıcı kaydı
                value:
                  email: kullanici@example.com
                  password: Guvenli123!
                  firstName: Ahmet
                  lastName: Yılmaz
      responses:
        "201":
          description: Kullanıcı başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CustomerRegister"
        "400":
          $ref: "#/components/responses/BadRequest"
        "409":
          description: Email adresi zaten kullanımda
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /customers/login:
    post:
      tags:
        - auth
      summary: Müşteri giriş
      description: Email ve şifre ile giriş yapar, JWT token döner
      operationId: loginUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/LoginCredentials"
      responses:
        "200":
          description: Başarılı giriş
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AuthToken"
        "401":
          $ref: "#/components/responses/Unauthorized"

  /customers/{customerId}:
    put:
      tags:
        - customers
      summary: Profil güncelle
      description: Kullanıcı profilini günceller
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/CustomerId"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CustomerUpdate"
      responses:
        "200":
          description: Kullanıcı başarıyla güncellendi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"

  /appointments:
    post:
      tags:
        - appointments
      summary: Randevu oluştur
      description: Yeni randevu oluşturur
      operationId: appointmentsOrder
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/AppointmentCreate"
      responses:
        "201":
          description: Randevu oluşturuldu
        "400":
          $ref: "#/components/responses/BadRequest"

    get:
      tags:
        - appointments
      summary: Randevu listele
      description: Kullanıcının randevularını listeler
      operationId: listAppointments
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/PageParam"
        - $ref: "#/components/parameters/LimitParam"
      responses:
        "200":
          description: Randevu listesi Başarılı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AppointmentsList"

  /appointments/{appointmentId}:
    put:
      tags:
        - appointments
      summary: Randevu güncelle
      description: Kullanıcı randevularını günceller
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/AppointmentId"
      responses:
        "200":
          description: Güncellendi
        "400":
          $ref: "#/components/responses/BadRequest"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "403":
          $ref: "#/components/responses/Forbidden"
        "404":
          $ref: "#/components/responses/NotFound"

    delete:
      tags:
        - appointments
      summary: Randevu sil
      description: Randevuyu sistemden siler
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/AppointmentId"
      responses:
        "204":
          description: Randevu silindi
        "404":
          $ref: "#/components/responses/NotFound"
        "403":
          $ref: "#/components/responses/Forbidden"

  /comments:
    post:
      tags:
        - comments
      summary: Yorum ekle
      description: İşletmeye yorum ekler
      security:
        - bearerAuth: []
      responses:
        "201":
          description: Yorum eklendi
        "401":
          $ref: "#/components/responses/Unauthorized"

  /comments/{commentId}:
    put:
      tags:
        - comments
      summary: Yorum güncelle
      description: İşletmeden yorum günceller
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/CommentId"
      responses:
        "200":
          description: Güncellendi

    delete:
      tags:
        - comments
      summary: Yorum sil
      description: İşletmeden yorum siler
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/CommentId"
      responses:
        "204":
          description: Silindi

  /businesses/register:
    post:
      tags:
        - auth
      summary: İşletme kayıt
      description: Sisteme yeni bir işletme kaydeder
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/BusinessRegister"
            examples:
              example1:
                summary: Örnek işletme kaydı
                value:
                  email: isletme@example.com
                  password: Guvenli123!
                  name: "ABC Kuaför"
      responses:
        "201":
          description: İşletme başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/BusinessRegister"
        "400":
          $ref: "#/components/responses/BadRequest"
        "409":
          description: Email zaten kullanımda
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /businesses/login:
    post:
      tags:
        - auth
      summary: İşletme giriş
      description: Email ve şifre ile giriş yapar, JWT token döner
      operationId: loginBusiness
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/LoginCredentials"
      responses:
        "200":
          description: Giriş başarılı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AuthToken"
        "401":
          $ref: "#/components/responses/Unauthorized"

  /businesses:
    post:
      tags:
        - businesses
      summary: İşletme oluştur
      description: Yeni işletme oluştur
      security:
        - bearerAuth: []
      responses:
        "201":
          description: İşletme eklendi
        "401":
          $ref: "#/components/responses/Unauthorized"

  /businesses/{businessId}/appointments:
    get:
      tags:
        - appointments
      summary: İşletmeye ait randevular
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/BusinessId"
      responses:
        "200":
          description: Randevu listesi

  /services:
    post:
      tags:
        - services
      summary: Hizmet ekle
      security:
        - bearerAuth: []
      responses:
        "201":
          description: Hizmet eklendi

    get:
      tags:
        - services
      summary: Hizmet listele
      parameters:
        - name: businessId
          in: query
          schema:
            type: integer
      responses:
        "200":
          description: Hizmet listesi

  /services/{serviceId}:
    put:
      tags:
        - services
      summary: Hizmet güncelle
      security:
        - bearerAuth: []
      parameters:
        - $ref: "#/components/parameters/ServiceId"
      responses:
        "200":
          description: Güncellendi

  /categories/{categoryId}:
    get:
      tags:
        - categories
      summary: Kategoriye göre işletmeler
      parameters:
        - $ref: "#/components/parameters/CategoryId"
      responses:
        "200":
          description: İşletme listesi
        "404":
          $ref: "#/components/responses/NotFound"

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  parameters:
    CustomerId:
      name: customerId
      in: path
      required: true
      schema:
        type: integer

    AppointmentId:
      name: appointmentId
      in: path
      required: true
      schema:
        type: integer

    CommentId:
      name: commentId
      in: path
      required: true
      schema:
        type: integer

    BusinessId:
      name: businessId
      in: path
      required: true
      schema:
        type: integer

    ServiceId:
      name: serviceId
      in: path
      required: true
      schema:
        type: integer

    CategoryId:
      name: categoryId
      in: path
      required: true
      schema:
        type: integer

    PageParam:
      name: page
      in: query
      description: Sayfa numarası
      schema:
        type: integer
        minimum: 1
        default: 1

    LimitParam:
      name: limit
      in: query
      description: Sayfa başına kayıt sayısı
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20

  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
        phone:
          type: string

    CustomerRegister:
      type: object
      required:
        - name
        - email
        - password
      properties:
        name:
          type: string
        email:
          type: string
        password:
          type: string

    CustomerUpdate:
      type: object
      properties:
        name:
          type: string
        phone:
          type: string

    BusinessRegister:
      type: object
      required:
        - name
        - email
        - password
        - firstName
        - lastName
      properties:
        name:
          type: string
          description: İşletme adı
        email:
          type: string
          description: İşletme email adresi
        password:
          type: string
          description: Hesap şifresi
        firstName:
          type: string
          description: Yetkili kişinin adı
        lastName:
          type: string
          description: Yetkili kişinin soyadı

    LoginCredentials:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
        password:
          type: string

    AppointmentCreate:
      type: object
      required:
        - serviceId
        - date
        - time
      properties:
        serviceId:
          type: integer
        date:
          type: string
          format: date
        time:
          type: string
          format: time

    AppointmentsList:
      type: array
      items:
        $ref: "#/components/schemas/Appointment"

    Appointment:
      type: object
      properties:
        id:
          type: integer
        serviceId:
          type: integer
        date:
          type: string
        time:
          type: string
        customerId:
          type: integer

    AuthToken:
      type: object
      properties:
        token:
          type: string

    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
          description: Hata kodu
          example: "VALIDATION_ERROR"
        message:
          type: string
          description: Hata mesajı
          example: "Geçersiz email adresi"
        details:
          type: array
          description: Detaylı hata bilgileri
          items:
            type: object
            properties:
              field:
                type: string
                example: "email"
              message:
                type: string
                example: "Email formatı geçersiz"

  responses:
    BadRequest:
      description: Geçersiz istek
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          example:
            code: "BAD_REQUEST"
            message: "İstek parametreleri geçersiz"

    Unauthorized:
      description: Yetkisiz erişim
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          example:
            code: "UNAUTHORIZED"
            message: "Kimlik doğrulama başarısız"

    NotFound:
      description: Kaynak bulunamadı
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          example:
            code: "NOT_FOUND"
            message: "İstenen kaynak bulunamadı"

    Forbidden:
      description: Erişim reddedildi
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          example:
            code: "FORBIDDEN"
            message: "Bu işlem için yetkiniz bulunmamaktadır"
```
