# Evently — Etkinlik Yönetim ve Biletleme Mobil Uygulaması
  

##  Proje Özeti ve Amacı
**Evently**, kullanıcıların etkinlikleri keşfedebileceği, favorilere ekleyebileceği ve dijital bilet satın alabileceği tam yığın (full-stack) bir mobil uygulamadır.

### Çözülen Problem
Geleneksel etkinlik biletleme platformları mobil öncelikli değildir ve yerel ölçekteki etkinliklere ulaşmak için ayrı bir uygulama gerektirmez. Evently bu boşluğu doldurarak kullanıcıya tek bir uygulamadan:

- 🎫 Anlık dijital bilet satın alma (QR kodlu)
- ❤️ Favori etkinlik listesi yönetimi
- 🤖 Yapay zeka destekli etkinlik öneri chatbotu
- 🌗 Koyu/Açık tema desteğiyle kişiselleştirme

imkânı sunar.

### Proje Kapsamı
| Bileşen | Teknoloji | Açıklama |
|---|---|---|
| Mobil Uygulama | React Native + Expo | iOS & Android çapraz platform |
| Backend API | Laravel 12 (PHP 8.2) | RESTful API, Sanctum Auth |
| Veritabanı | SQLite | Hızlı geliştirme ortamı için |
| Kimlik Doğrulama | Laravel Sanctum (Token) | Bearer token tabanlı |

---

## Kullanılan Teknolojiler

### Frontend — React Native / Expo

| Teknoloji | Versiyon | Kullanım Amacı |
|---|---|---|
| **React Native** | 0.76+ | Çapraz platform mobil uygulama çerçevesi |
| **Expo** | SDK 52 | Geliştirme ortamı ve native modüller |
| **TypeScript** | 5.x | Tip güvenliği |
| **React Navigation** | v6 | Stack + Tab tabanlı sayfa navigasyonu |
| **Axios** | latest | HTTP istemcisi, API iletişimi |
| **Expo Linear Gradient** | — | Gradient arkaplan efektleri |
| **AsyncStorage** | — | Token ve kullanıcı verisi yerel depolama |
| **expo-constants** | — | Dinamik IP tespiti (LAN bağlantısı için) |

### Backend — Laravel

| Teknoloji | Versiyon | Kullanım Amacı |
|---|---|---|
| **PHP** | 8.2+ | Sunucu taraflı dil |
| **Laravel** | 12.x | MVC web çerçevesi |
| **Laravel Sanctum** | — | API token kimlik doğrulama |
| **Eloquent ORM** | — | Veritabanı modelleme ve ilişkiler |
| **SQLite** | — | Geliştirme veritabanı |
| **Carbon** | — | Tarih/saat işlemleri |

##  Kurulum ve Çalıştırma

### Gereksinimler

Kurulumdan önce aşağıdaki yazılımların sisteminizde kurulu olduğunu doğrulayın:

```
✅ PHP >= 8.2
✅ Composer >= 2.x
✅ Node.js >= 18.x
✅ npm >= 9.x
✅ Expo CLI  →  npm install -g expo-cli
✅ Expo Go   →  Telefonunuza App Store / Play Store'dan kurun
```

### 1️⃣ Laravel Backend Kurulumu

```bash
# 1. Proje dizinine girin
cd "yeni staj projesi/laravel-backend"

# 2. PHP bağımlılıklarını yükleyin
composer install

# 3. Ortam dosyasını oluşturun
cp .env.example .env

# 4. Uygulama anahtarı üretin
php artisan key:generate

# 5. Veritabanını sıfırlayın ve örnek verileri (seed) yükleyin
php artisan migrate:fresh --seed

# 6. Geliştirme sunucusunu başlatın (tüm ağ arabirimlerinde)
php artisan serve --host=0.0.0.0 --port=8000
```

> ✅ Backend çalışıyor: `http://<BİLGİSAYARINIZIN_IP>:8000`  
> Sağlık kontrolü: `http://localhost:8000/api/events`

#### Seed ile Oluşturulan Demo Hesap

```
E-posta : demo@evently.app
Şifre   : Test1234!
```

### Mobil Uygulama Kurulumu

```bash
# 1. Mobile dizinine girin
cd "Evently_App/mobile"

# 2. Node bağımlılıklarını yükleyin
npm install

# 3. Expo geliştirme sunucusunu başlatın
npm start
# veya
npx expo start
```

#### IP Adresi Ayarı 

Fiziksel cihazda veya gerçek bir ağda test ederken `mobile/src/constants/config.ts` dosyasındaki `LOCAL_LAN_IP` değerini **bilgisayarınızın güncel Wi-Fi IP adresiyle** güncelleyin:

```typescript
// mobile/src/constants/config.ts

// ⚠️  Kendi IP adresinizi yazın (cmd > ipconfig ile öğrenebilirsiniz)
const LOCAL_LAN_IP = '192.168.1.XXX';   // ← buraya bilgisayarınızın IP'si
```

| Ortam | API_BASE_URL |
|---|---|
| Android Emülatör | `http://10.0.2.2:8000/api` |
| iOS Simülatör | `http://localhost:8000/api` |
| Fiziksel Cihaz (Expo Go) | `http://<BİLGİSAYAR_IP>:8000/api` |
| Otomatik Tespit (Expo Go) | `config.ts` dinamik olarak çözer ✅ |

> **Not:** Expo Go uygulaması açıkken `config.ts` dosyası `hostUri` üzerinden bilgisayarın IP adresini otomatik algılar. Manuel güncelleme yalnızca bu başarısız olursa gereklidir.
> 

### Uygulamayı Telefona Bağlamak

1. Expo Go uygulamasını telefonunuza indirin.
2. `npm start` ile terminalde gösterilen **QR kodu** taratın.
3. Uygulama otomatik olarak yüklenecektir.


## 📂 Proje Dizin Yapısı

```
Evently_App/
│
├── laravel-backend/                  ← PHP Laravel REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php    → Kayıt, Giriş, Profil
│   │   │   ├── EventController.php   → Etkinlik listeleme, detay, arama
│   │   │   ├── FavoriteController.php→ Favori ekleme/kaldırma
│   │   │   └── TicketController.php  → Bilet satın alma, listeleme
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Event.php
│   │       ├── Category.php
│   │       ├── Ticket.php
│   │       └── Favorite.php
│   ├── database/
│   │   ├── migrations/               → Tablo şemaları
│   │   └── seeders/DatabaseSeeder.php→ 20 örnek etkinlik + demo kullanıcı
│   ├── routes/api.php                → Tüm API route tanımları
│   └── .env                          → Ortam değişkenleri
│
└── mobile/                           ← React Native Expo Uygulaması
    ├── src/
    │   ├── components/
    │   │   ├── common/               → Button, Input, Skeleton, StateViews
    │   │   └── events/               → EventCard (Featured, Popular, Upcoming)
    │   ├── context/
    │   │   ├── AuthContext.tsx        → JWT token + kullanıcı state yönetimi
    │   │   └── ThemeContext.tsx       → Koyu/Açık tema yönetimi
    │   ├── navigation/AppNavigator.tsx→ Stack + Bottom Tab Navigator
    │   ├── screens/
    │   │   ├── auth/
    │   │   │   ├── LoginScreen.tsx
    │   │   │   └── RegisterScreen.tsx
    │   │   └── main/
    │   │       ├── HomeScreen.tsx        → Öne çıkan, yaklaşan, popüler etkinlikler
    │   │       ├── SearchScreen.tsx      → Tam metin etkinlik arama
    │   │       ├── EventDetailScreen.tsx → Etkinlik detay + bilet alma
    │   │       ├── OrderConfirmationScreen.tsx → Sipariş özeti + onay
    │   │       ├── FavoritesScreen.tsx   → Favori etkinlikler
    │   │       ├── TicketsScreen.tsx     → Kullanıcının biletleri
    │   │       ├── TicketDetailScreen.tsx→ QR kodlu bilet görünümü
    │   │       ├── ProfileScreen.tsx     → Profil ve tema ayarları
    │   │       ├── EditProfileScreen.tsx → Profil düzenleme
    │   │       └── ChatbotScreen.tsx     → AI etkinlik öneri asistanı
    │   ├── services/api.ts           → Tüm API çağrıları (Axios)
    │   └── constants/
    │       ├── config.ts             → API_BASE_URL dinamik çözümü
    │       ├── colors.ts             → Tasarım renk paleti
    │       └── typography.ts         → Tipografi sistemi
    └── App.tsx
```

##  API Dokümantasyonu

**Base URL:** `http://<SUNUCU_IP>:8000/api`  
**Uyumluluk:** `/api/v1/...` prefix'i de desteklenmektedir.  
**Kimlik Doğrulama:** `Authorization: Bearer <TOKEN>` başlığı


### Kimlik Doğrulama (Auth)

| Method | Endpoint | İstek Gövdesi | Auth | Açıklama |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | `{name, email, password}` | — | Yeni kullanıcı kaydı |
| `POST` | `/api/auth/login` | `{email, password}` | — | Giriş, token döner |
| `GET` | `/api/auth/me` | — | ✅ | Oturum açık kullanıcı bilgisi |
| `PUT` | `/api/auth/me` | `{name?, bio?, avatar?}` | ✅ | Profil güncelleme |
| `POST` | `/api/auth/logout` | — | ✅ | Çıkış, token iptal |

**Başarılı Login Yanıtı:**
```json
{
  "success": true,
  "data": {
    "token": "1|aBcDeFgH...",
    "user": { "id": "...", "name": "Demo Kullanıcı", "email": "demo@evently.app" }
  }
}
```

### Etkinlikler (Events)

| Method | Endpoint | Parametreler | Auth | Açıklama |
|---|---|---|---|---|
| `GET` | `/api/events` | `search, category, sort, page, limit, featured, minPrice, maxPrice` | — | Etkinlik listesi (filtrelenebilir) |
| `GET` | `/api/events/featured` | — | — | Öne çıkan etkinlikler (max 5) |
| `GET` | `/api/events/categories` | — | — | Kategori listesi |
| `GET` | `/api/events/{id}` | — | İsteğe bağlı | Etkinlik detayı |

**`GET /api/events` Sorgu Parametreleri:**

| Parametre | Tip | Örnek | Açıklama |
|---|---|---|---|
| `search` | string | `teknoloji` | Başlık, açıklama, konum, organizatör ve kategori adında arama |
| `category` | string | `Müzik` | Kategori adı veya ID'ye göre filtrele |
| `sort` | string | `popular` | `date_asc`, `date_desc`, `price_asc`, `price_desc`, `popular` |
| `page` | int | `1` | Sayfa numarası |
| `limit` | int | `10` | Sayfa başına kayıt sayısı (maks. 50) |
| `featured` | bool | `true` | Yalnızca öne çıkan etkinlikler |
| `minPrice` | float | `0` | Minimum fiyat filtresi |
| `maxPrice` | float | `500` | Maksimum fiyat filtresi |

---

### Favoriler (Favorites)

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| `GET` | `/api/favorites` | ✅ | Kullanıcının favori etkinlikleri |
| `POST` | `/api/favorites/{eventId}` | ✅ | Etkinliği favorilere ekle |
| `DELETE` | `/api/favorites/{eventId}` | ✅ | Etkinliği favorilerden kaldır |
| `GET` | `/api/favorites/check/{eventId}` | ✅ | Etkinlik favoride mi? |

---

### Biletler (Tickets)

| Method | Endpoint | İstek Gövdesi | Auth | Açıklama |
|---|---|---|---|---|
| `GET` | `/api/tickets` | — | ✅ | Kullanıcının tüm biletleri |
| `POST` | `/api/tickets/purchase` | `{eventId, quantity}` | ✅ | Bilet satın al |
| `GET` | `/api/tickets/{id}` | — | ✅ | Bilet detayı (QR kodu dahil) |

**Bilet Satın Alma İstek Örneği:**
```json
POST /api/tickets/purchase
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "eventId": "01j...",
  "quantity": 2
}
```

**Başarılı Yanıt:**
```json
{
  "success": true,
  "message": "Biletiniz başarıyla satın alındı.",
  "data": {
    "id": "01j...",
    "ticketNumber": "EVT-A1B2C3D4",
    "qrCode": "EVENTLY:EVT-A1B2C3D4:...",
    "status": "ACTIVE",
    "quantity": 2,
    "totalPrice": 300.00,
    "event": { "title": "DevFest 2026", "date": "2026-10-04T10:00:00.000Z" }
  }
}
```

**Geçmiş Etkinlik Hata Yanıtı (HTTP 400):**
```json
{
  "success": false,
  "message": "Bu etkinliğin tarihi geçtiği için bilet alamazsınız.",
  "error": "Event has already passed"
}
```

---

## Test Senaryoları

Aşağıdaki senaryolar, uygulamanın uçtan uca doğru çalıştığını doğrulamak için kullanılabilir.

---

### Senaryo 1 — Kullanıcı Kaydı ve Girişi

| Adım | Eylem | Beklenen Sonuç |
|---|---|---|
| 1 | Uygulamayı aç | Giriş ekranı görüntülenir |
| 2 | "Kayıt Ol" butonuna bas | Kayıt formu açılır |
| 3 | Ad, e-posta ve şifre gir | Form doğrulama aktif |
| 4 | "Kayıt Ol" butonuna bas | Hesap oluşturulur, ana sayfaya yönlendirilir |
| 5 | Çıkış yap, "Giriş Yap"a bas | Giriş formu açılır |
| 6 | `demo@evently.app` / `Test1234!` ile giriş yap | Ana ekrana yönlendirilir |

---

### Senaryo 2 — Etkinlik Keşfetme ve Arama

| Adım | Eylem | Beklenen Sonuç |
|---|---|---|
| 1 | Ana ekranı aşağı kaydır | Öne çıkan, yaklaşan ve popüler etkinlikler listelenir |
| 2 | Alt menüde "Keşfet" sekmesine bas | Arama ekranı açılır |
| 3 | Arama kutusuna "Teknoloji" yaz | Teknoloji kategorisindeki etkinlikler listelenir |
| 4 | "Bootcamp" yaz | İlgili etkinlikler başlık + açıklama + kategori adında aranır |
| 5 | Arama kutusunu temizle (✕ butonu) | Sonuç listesi temizlenir |

---

### Senaryo 3 — Etkinlik Detayı ve Favori Ekleme

| Adım | Eylem | Beklenen Sonuç |
|---|---|---|
| 1 | Herhangi bir etkinlik kartına bas | Detay sayfası açılır |
| 2 | Koltuk doluluk çubuğunu gör | Renk kodu: yeşil (müsait) → sarı → kırmızı (dolu) |
| 3 | Geçmiş tarihli etkinliği aç | "Bu etkinlik sona ermiştir" banner'ı görünür, bilet butonu pasif |
| 4 | ❤️ / 🤍 butonuna bas | Etkinlik favorilere eklenir / çıkarılır |
| 5 | Alt menüde "Favoriler" sekmesine git | Eklenen etkinlik listede görünür |

---

### Senaryo 4 — Bilet Satın Alma (Ana Akış)

| Adım | Eylem | Beklenen Sonuç |
|---|---|---|
| 1 | Gelecek tarihli etkinlik detayına git | "Bilet Al 🎫" butonu aktif görünür |
| 2 | `+` / `−` butonlarıyla adet seç | Toplam fiyat güncellenir |
| 3 | "Bilet Al 🎫" butonuna bas | Sipariş onay ekranı açılır |
| 4 | Sipariş özetini incele | Etkinlik, adet ve toplam tutar doğru |
| 5 | Kullanım koşulları onay kutusunu işaretle | Onay butonu aktif olur |
| 6 | "Onayla & Satın Al 🎉" butonuna bas | Yükleniyor animasyonu çalışır |
| 7 | İşlem tamamlanır | "Biletiniz Hazır! 🎉" başarı modalı açılır |
| 8 | "Bileti Görüntüle 🎫" butonuna bas | QR kodlu bilet detay ekranı açılır |

---

### Senaryo 5 — Biletleri Görüntüleme

| Adım | Eylem | Beklenen Sonuç |
|---|---|---|
| 1 | Alt menüde "Biletlerim" sekmesine bas | Satın alınan biletler listelenir |
| 2 | Bir bilete bas | Bilet detay ekranı açılır |
| 3 | QR kodu görüntüle | Etkinlik adı + bilet numarası içeren QR kod gösterilir |
| 4 | Bilet durumu kontrol et | `ACTIVE` → yeşil rozet |

---

### Senaryo 6 — Tema Değiştirme

| Adım | Eylem | Beklenen Sonuç |
|---|---|---|
| 1 | Alt menüde "Profil" sekmesine bas | Profil ekranı açılır |
| 2 | Tema seçici bölümünü bul | Koyu / Açık seçeneği görünür |
| 3 | "Açık" temaya geç | Tüm ekranlar (sipariş onayı dahil) anında açık temaya geçer |
| 4 | "Koyu" temaya geri dön | Arka planlar ve metinler koyu temaya döner |

---

## Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────┐
│                   React Native (Expo)                    │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Auth    │  │  Events  │  │ Tickets  │  │Profile │  │
│  │  Stack   │  │  Stack   │  │  Stack   │  │ Stack  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       └─────────────┴─────────────┴─────────────┘       │
│                    AppNavigator                          │
│                   AuthContext  ThemeContext              │
│                    services/api.ts (Axios)               │
└──────────────────────┬──────────────────────────────────┘
                       │  HTTP (Bearer Token)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Laravel 12 REST API                     │
│                                                          │
│  routes/api.php → Controllers → Models → SQLite DB      │
│                                                          │
│  Auth (Sanctum)  Events  Tickets  Favorites  Categories  │
└─────────────────────────────────────────────────────────┘
```

## Güvenlik Notları

- Tüm korumalı endpoint'ler `auth:sanctum` middleware'i ile güvence altındadır.
- Bilet satın alma işleminde tarih kontrolü backend tarafında `Carbon` ile yapılır.
- Kapasite kontrolü `soldSeats + quantity <= totalSeats` koşuluyla sağlanır.
- Şifreler `bcrypt` ile hashlenmektedir.
- Token'lar kullanıcı başına veritabanında saklanır ve `/auth/logout` ile geçersiz kılınır.


## Bilinen Sınırlamalar

- Ödeme sistemi: Gerçek para transferi entegrasyonu yoktur (demo amaçlıdır).
- Veritabanı: SQLite kullanılmaktadır; üretim ortamı için MySQL/PostgreSQL önerilir.
- Bildirimler: Push notification entegrasyonu bulunmamaktadır.
