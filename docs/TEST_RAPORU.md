# Evently — Genel Test Raporu

**Proje Adı:** Evently (Etkinlik Keşif ve Bilet Yönetim Mobil Uygulaması)  
**Doküman Türü:** Staj Projesi Doğrulama ve Test Raporu  
**Test Edilen Bileşenler:** React Native Mobil Uygulaması + Laravel REST API Backend  
**Sonuç:** %100 Başarılı (Tüm Ana Akışlar Doğrulandı)

---

## 1. Test Kapsamı ve Yaklaşımı

Evently uygulamasının geliştirme sürecinde, hem mobil arayüz kullanıcı deneyimi (UX) hem de Laravel REST API backend haberleşmesi uçtan uca (End-to-End) test edilmiştir. Testler şu ana başlıkları kapsamaktadır:

1. **Kimlik Doğrulama ve Oturum Yönetimi** (Kayıt, Giriş, Otomatik Oturum Açma, Profil Güncelleme)
2. **Etkinlik Keşfi ve Filtreleme** (Ana sayfa bölümleri, Arama, Kategoriye göre listeleme, Sıralama)
3. **Favori Yönetimi** (Tek dokunuşla favorileme, kalıcı saklama)
4. **Biletleme ve QR Kod Simülasyonu** (Sipariş onayı, bilet üretimi, dinamik QR gösterimi, aktif/geçmiş bilet ayrımı)
5. **Dinamik Yardımcılar ve Arayüz Deneyimi** (Koyu/Açık Tema geçişi, AI Chatbot Asistanı)
6. **Backend Otomasyon Testleri** (PHPUnit / Laravel Feature Tests)

---

## 2. Fonksiyonel Test Senaryoları ve Sonuç Tablosu

| Test ID | Test Senaryosu | Beklenen Sonuç | Gerçekleşen Sonuç | Durum |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **Kullanıcı Kaydı ve Giriş (Auth)** | Geçerli bilgilerle kayıt olunmalı, Sanctum Bearer token üretilip AsyncStorage'a kaydedilmeli. | Token üretildi, kullanıcı otomatik olarak ana sayfaya yönlendirildi. | ✅ Başarılı |
| **TC-02** | **Oturum Sürekliliği (Auto-login)** | Uygulama kapatılıp açıldığında Splash ekranında token doğrulanıp doğrudan ana ekrana geçilmeli. | Token başarıyla okundu, kullanıcı tekrar giriş yapmadan oturum korundu. | ✅ Başarılı |
| **TC-03** | **Ana Sayfa Veri Akışı** | Öne çıkanlar carouseli, kategoriler ve yaklaşan etkinlikler API'den çekilerek yüklenmeli. | Skeleton yükleme ekranı sonrası 20 gerçekçi etkinlik ve 8 kategori sorunsuz listelendi. | ✅ Başarılı |
| **TC-04** | **Arama ve Debounce Filtreleme** | Arama kutusuna yazılan etkinlik ismi veya konuma göre liste anlık olarak filtrelenmeli. | Debounce optimizasyonuyla sunucu yorulmadan doğru sonuçlar listelendi. | ✅ Başarılı |
| **TC-05** | **Favori Ekleme/Çıkarma** | Kart üzerindeki kalp ikonuna basıldığında anında Favoriler sekmesine yansımalı ve kalıcı olmalı. | Favori durumu yerel ve sunucu veritabanında anında güncellendi. | ✅ Başarılı |
| **TC-06** | **Bilet Satın Alma Simülasyonu** | Etkinlik detayından adet seçilip sipariş onaylandığında benzersiz bilet oluşturulmalı. | Benzersiz `EVT-XXXXXXXX` bilet numarası üretildi, etkinlik kontenjanı güncellendi. | ✅ Başarılı |
| **TC-07** | **QR Kod Üretimi ve Gösterimi** | Bilet detay sayfasında bilet ve etkinlik bilgisini içeren vektörel QR kod çizilmeli. | `react-native-qrcode-svg` ile yüksek çözünürlüklü QR kod hatasız render edildi. | ✅ Başarılı |
| **TC-08** | **Aktif ve Geçmiş Bilet Ayrımı** | Tarihi geçmiş etkinlikler otomatik olarak "Geçmiş", güncel olanlar "Aktif" sekmesinde listelenmeli. | Tarih kontrolüyle biletler doğru sekmelere ayrıştırıldı. | ✅ Başarılı |
| **TC-09** | **Koyu / Açık Tema Geçişi** | Profil ekranından tema değiştirildiğinde tüm kart, metin ve arka plan renkleri anında adapte olmalı. | Global Theme Context üzerinden tam siyah (#000) ve kırık beyaz (#F5F5F5) temaları hatasız çalıştı. | ✅ Başarılı |
| **TC-10** | **Chatbot Asistanı Etkinlik Filtresi**| Chatbot ekranında etkinlik soruları sorulduğunda veritabanından dinamik filtreleme yapmalı. | Kullanıcının kategori ve tarih sorularına uygun etkinlikler önerildi. | ✅ Başarılı |

---

## 3. Backend Otomatik Test Sonuçları (Laravel Test Suite)

Laravel REST API backend tarafında yazılan özellik testleri (`tests/Feature/ApiEndpointsTest.php`) çalıştırılmış ve tam başarı elde edilmiştir:

```text
   PASS  Tests\Unit\ExampleTest
  ✓ that true is true                                     0.01s  

   PASS  Tests\Feature\ApiEndpointsTest
  ✓ can login and get sanctum token                       0.60s  
  ✓ can get events list and categories                    0.09s  
  ✓ can get single event and favorites                    0.09s  

   PASS  Tests\Feature\ExampleTest
  ✓ the application returns a successful response         0.05s  

  Tests:    5 passed (131 assertions)
  Duration: 1.08s
```
