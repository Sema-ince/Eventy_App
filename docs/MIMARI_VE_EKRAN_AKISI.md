# Evently — Mimari ve Ekran Akışı Dokümanı

Bu doküman, **Evently** mobil uygulamasının sistem mimarisini, katmanlı yapısını ve kullanıcı ekran akışlarını (User Flow) anlaşılır bir özet halinde sunar.

---

## 1. Genel Sistem Mimarisi

Evently, **Frontend (İstemci)** ve **Backend (Sunucu)** katmanlarının birbirinden tamamen bağımsız çalıştığı, modern bir **REST API Mimarisi** üzerine kurulmuştur.

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT NATIVE MOBİL İSTEMCİ                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐  │
│  │ UI & Screens     │  │ Context / State  │  │ Services  │  │
│  │ (12+ Ekran)      │  │ (Auth, Favorites,│  │ (Axios API│  │
│  │                  │  │  Theme Context)  │  │  Client)  │  │
│  └────────▲─────────┘  └────────▲─────────┘  └─────┬─────┘  │
└───────────┼─────────────────────┼───────────────────┼───────┘
            │                     │                   │ JSON / Bearer Token
            │                     │                   ▼
┌───────────┴─────────────────────┴───────────────────────────┐
│                    LARAVEL 12 REST API BACKEND              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐  │
│  │ API Routing      │  │ Controllers      │  │ Eloquent  │  │
│  │ (/api/v1/...)    │  │ (Auth, Events,   │  │ Models    │  │
│  │ (Sanctum Auth)   │  │  Tickets, Favs)  │  │ & SQLite  │  │
│  └──────────────────┘  └──────────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Temel Katmanlar:
1. **Görünüm Katmanı (Presentation Layer):** Yeniden kullanılabilir bileşenler (`EventCard`, `TicketCard`, `CategoryChip`, `Button`, `Input`) ve modern responsive ekranlar.
2. **Durum Yönetimi Katmanı (State Management):** React Context API tabanlı `AuthContext` (kullanıcı oturumu), `FavoriteContext` (favori senkronizasyonu) ve `ThemeContext` (dinamik Koyu/Açık tema).
3. **Servis Katmanı (Network Layer):** Doğrudan ekranlardan API çağrısı yapılmasını önleyen, istek/cevap interceptor'larına sahip merkezi `services/api.ts` soyutlaması.
4. **Backend Katmanı (Server & DB):** Laravel 12, Sanctum Token Kimlik Doğrulaması, Eloquent ORM ve tam ilişkisel veritabanı şeması.

---

## 2. Navigasyon Ağacı ve Ekran Akışı

Uygulama içinde **React Navigation (Stack + Bottom Tab Navigator)** hibrit yapısı kullanılmıştır:

```
[ Root Navigation ]
 │
 ├── (Oturum Yoksa) ──► [ Auth Stack ]
 │                       ├── SplashScreen (Oturum kontrolü)
 │                       ├── LoginScreen (Giriş)
 │                       └── RegisterScreen (Kayıt)
 │
 └── (Oturum Varsa) ──► [ Main Tab Navigator (Alt Menü) ]
                         │
                         ├── 🏠 Home Tab
                         │    ├── HomeScreen (Ana Sayfa)
                         │    ├── EventListScreen (Kategori Listesi)
                         │    ├── EventDetailScreen (Etkinlik Detayı)
                         │    ├── OrderConfirmationScreen (Sipariş Onayı)
                         │    ├── TicketDetailScreen (QR Kodlu Bilet)
                         │    └── ChatbotScreen (AI Asistanı)
                         │
                         ├── 🔍 Search Tab
                         │    ├── SearchScreen (Anlık Arama & Filtreleme)
                         │    └── EventDetailScreen ──► Bilet Alma Akışı
                         │
                         ├── ❤️ Favorites Tab
                         │    ├── FavoritesScreen (Favorilenen Etkinlikler)
                         │    └── EventDetailScreen ──► Bilet Alma Akışı
                         │
                         ├── 🎟️ Tickets Tab
                         │    ├── TicketsScreen (Aktif & Geçmiş Biletler)
                         │    └── TicketDetailScreen (Dijital Bilet & QR)
                         │
                         └── 👤 Profile Tab
                              ├── ProfileScreen (İstatistikler, Tema Seçimi, Çıkış)
                              └── EditProfileScreen (Profil & Avatar Düzenleme)
```

---

## 3. Kullanıcı Akışları (User Journeys)

### A. Etkinlik Keşfi ve Bilet Satın Alma Akışı
`Ana Sayfa / Arama` ➔ `Etkinlik Seçimi` ➔ `Detay Sayfası (Kapasite & Fiyat)` ➔ `Bilet Adedi Seçimi` ➔ `Sipariş Onay Ekranı` ➔ `QR Kodlu Dijital Bilet Üretimi` ➔ `Biletlerim Sekmesi`.

### B. Favorileme Akışı
`Etkinlik Kartı Üzerindeki Kalp İkonu` ➔ `Anlık Favori Durumu Güncellemesi` ➔ `Favorilerim Ekranında Listelenme`.

### C. Tema ve Profil Yönetimi Akışı
`Profil Ekranı` ➔ `Koyu/Açık Tema Aç-Kapa Butonu` ➔ `Tüm Uygulama Renklerinin Global Olarak Değişmesi` / `Profili Düzenle` ➔ `Avatar ve Biyografi Güncelleme`.
