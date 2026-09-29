# Laravel REST API Entegrasyonu — Tam Kurulum ve Kullanım Raporu

Projemize hoca eleştirilerini ve kurumsal standartları tam olarak karşılayan, sıfırdan ve eksiksiz bir **Laravel 12 REST API backend** altyapısı (`laravel-backend/`) kurulmuştur.

---

## 📁 1. Kurulan Yapı ve Dosya Ağacı

```
laravel-backend/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php        # Register, Login, Me, UpdateMe, Logout
│   │   ├── CategoryController.php    # Kategoriler ve etkinlik sayıları (_count)
│   │   ├── EventController.php       # Arama, filtreleme, sayfalama, öne çıkanlar, detay
│   │   ├── FavoriteController.php    # Favorileri listeleme, ekleme, çıkarma, kontrol
│   │   └── TicketController.php      # Biletlerim (all/active/past), bilet alma, bilet detay
│   └── Models/
│       ├── User.php                  # Sanctum HasApiTokens, HasUuids, hasMany(Ticket/Favorite)
│       ├── Category.php              # HasUuids, hasMany(Event)
│       ├── Event.php                 # HasUuids, belongsTo(Category), hasMany(Ticket/Favorite)
│       ├── Ticket.php                # HasUuids, belongsTo(User), belongsTo(Event)
│       └── Favorite.php              # HasUuids, belongsTo(User), belongsTo(Event)
├── config/
│   └── cors.php                      # Mobil / Web istemcileri için tam CORS desteği
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 2026_09_11_104441_create_personal_access_tokens_table.php (UUID Sanctum)
│   │   ├── 2026_09_11_110001_create_categories_table.php
│   │   ├── 2026_09_11_110002_create_events_table.php
│   │   ├── 2026_09_11_110003_create_tickets_table.php
│   │   └── 2026_09_11_110004_create_favorites_table.php
│   └── seeders/
│       └── DatabaseSeeder.php        # 8 Kategori, 20 Detaylı Gerçekçi Etkinlik, Test Biletleri & Favoriler
├── routes/
│   └── api.php                       # Tüm REST API uç noktaları (/api/... ve /api/v1/...)
└── tests/Feature/
    └── ApiEndpointsTest.php          # 5 test, 131 doğrulama (PASS)
```

---

## 🚀 2. Nasıl Çalıştırılır? (Adım Adım)

### Adım 1: Laravel Sunucusunu Başlatma
Terminalde `laravel-backend` klasörüne gidip şu komutu çalıştırın:

```bash
cd "c:\Users\SEMA\Desktop\yeni staj projesi\laravel-backend"
php artisan serve --host=0.0.0.0 --port=8000
```
> Sunucu `http://127.0.0.1:8000` (ve yerel ağ IP'niz) üzerinden dinlemeye başlayacaktır.

### Adım 2: Veritabanını Sıfırlama ve Tohumlama (Gerekirse)
```bash
php artisan migrate:fresh --seed
```

---

## 🔑 3. Test Kullanıcı Giriş Bilgileri
- **E-posta:** `demo@evently.app`
- **Şifre:** `Test1234!`
- **Yönetici/Organizatör:** `ahmet@evently.app` (Şifre: `Test1234!`)

---

## 🌐 4. Mobil Uygulama Entegrasyonu

Mobil uygulamayı Laravel API'ye bağlamak için:
`mobile/src/constants/config.ts` dosyasında port ve base URL ayarını `8000` portuna yönlendirebilirsiniz:

```typescript
const BACKEND_PORT = 8000;
// URL: http://<LAN_IP>:8000/api
```
Laravel API, `routes/api.php` sayesinde hem `/api/...` hem de `/api/v1/...` isteklerini karşılar.

---

## ✅ 5. Otomatik Test Sonuçları

`php artisan test` komutu çalıştırılmış ve tüm senaryolar başarıyla doğrulanmıştır:
- `can_login_and_get_sanctum_token` -> **PASS**
- `can_get_events_list_and_categories` -> **PASS**
- `can_get_single_event_and_favorites` -> **PASS**
- 5 passed (131 assertions), 1.08s
