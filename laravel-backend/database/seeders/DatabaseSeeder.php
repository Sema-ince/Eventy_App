<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Event;
use App\Models\Favorite;
use App\Models\Ticket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ─── 1. Seed Categories ─────────────────────────────────────
        $teknoloji = Category::create([
            'name'  => 'Teknoloji',
            'icon'  => '💻',
            'color' => '#6C3CE1',
        ]);

        $egitim = Category::create([
            'name'  => 'Eğitim',
            'icon'  => '📚',
            'color' => '#2ED573',
        ]);

        $muzik = Category::create([
            'name'  => 'Müzik',
            'icon'  => '🎵',
            'color' => '#FF6B35',
        ]);

        $sanat = Category::create([
            'name'  => 'Sanat',
            'icon'  => '🎨',
            'color' => '#00F5A0',
        ]);

        $spor = Category::create([
            'name'  => 'Spor',
            'icon'  => '⚽',
            'color' => '#FF4757',
        ]);

        $yemek = Category::create([
            'name'  => 'Yemek',
            'icon'  => '🍜',
            'color' => '#FFA502',
        ]);

        $film = Category::create([
            'name'  => 'Film',
            'icon'  => '🎬',
            'color' => '#1E90FF',
        ]);

        $komedi = Category::create([
            'name'  => 'Komedi',
            'icon'  => '😂',
            'color' => '#FF6EB4',
        ]);

        // ─── 2. Seed Demo Users ─────────────────────────────────────
        $hashedPassword = Hash::make('Test1234!');

        $demoUser = User::create([
            'name'     => 'Demo Kullanıcı',
            'email'    => 'demo@evently.app',
            'password' => $hashedPassword,
            'bio'      => 'Teknoloji ve etkinlik tutkunu 🚀',
            'avatar'   => '👩',
        ]);

        $adminUser = User::create([
            'name'     => 'Ahmet Yılmaz',
            'email'    => 'ahmet@evently.app',
            'password' => $hashedPassword,
            'bio'      => 'FÜBET Yönetim Kurulu Üyesi',
            'avatar'   => '👨',
        ]);

        // Helper function for relative dates
        $futureDate = function (int $daysFromNow, int $hour = 14, int $minute = 0): Carbon {
            return Carbon::now()->addDays($daysFromNow)->setTime($hour, $minute, 0);
        };

        // ─── 3. Seed Events (20 Detaylı ve Gerçekçi Etkinlik) ───────────
        $eventsData = [
            // 1. Yapay Zeka ve Görüntü İşleme Bootcamp (Özel İstenen 1 - 2 gün sonra)
            [
                'title'           => 'Yapay Zeka ve Görüntü İşleme Bootcamp',
                'description'     => 'OpenCV ve YOLO mimarileri ile nesne tespiti, gerçek zamanlı video işleme ve derin öğrenme modellerinin uçtan uca anlatılacağı yoğun bir eğitim. Katılımcılar bilgisayarlı görü projelerini canlı uygulayacaktır.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800',
                'date'            => $futureDate(2, 13, 30),
                'endDate'         => $futureDate(2, 18, 0),
                'location'        => 'Elazığ',
                'address'         => 'Fırat Üniversitesi Mühendislik Fakültesi Konferans Salonu, Elazığ',
                'latitude'        => 38.6748,
                'longitude'       => 39.1982,
                'price'           => 0,
                'currency'        => 'TRY',
                'totalSeats'      => 250,
                'soldSeats'       => 185,
                'isFeatured'      => true,
                'isActive'        => true,
                'organizerName'   => 'FÜBET (Fırat Üniversitesi Bilişim ve İnovasyon Topluluğu)',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=FUBET',
                'tags'            => json_encode(['yapay zeka', 'opencv', 'yolo', 'bootcamp', 'python', 'fubet']),
                'categoryId'      => $teknoloji->id,
            ],

            // 2. DevFest 2026 (Özel İstenen 2)
            [
                'title'           => 'DevFest 2026',
                'description'     => 'Yazılım dünyasının en büyük buluşması! Web, mobil teknolojiler (Flutter/React Native), Bulut Bilişim ve Üretken Yapay Zeka oturumları. Sektör lideri mühendislerle tanışma ve networking imkanı.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
                'date'            => $futureDate(5, 10, 0),
                'endDate'         => $futureDate(5, 17, 30),
                'location'        => 'Elazığ',
                'address'         => 'Bünyamin Eroğlu Kültür ve Kongre Merkezi, Elazığ',
                'latitude'        => 38.6710,
                'longitude'       => 39.2240,
                'price'           => 150,
                'currency'        => 'TRY',
                'totalSeats'      => 600,
                'soldSeats'       => 490,
                'isFeatured'      => true,
                'isActive'        => true,
                'organizerName'   => 'GDG & Dev Community',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=DevFest',
                'tags'            => json_encode(['yazılım', 'devfest', 'teknoloji', 'flutter', 'react', 'cloud']),
                'categoryId'      => $teknoloji->id,
            ],

            // 3. Kahve ve Çikolata Festivali (Özel İstenen 3)
            [
                'title'           => 'Kahve ve Çikolata Festivali',
                'description'     => 'Dünyanın dört bir yanından gelen 3. nesil nitelikli kahve çekirdekleri, el yapımı gurme çikolatalar, barista şovları, latte art yarışmaları ve akustik canlı müzik dinletileriyle dolu keyifli bir festival.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
                'date'            => $futureDate(3, 11, 0),
                'endDate'         => $futureDate(4, 21, 0),
                'location'        => 'Elazığ',
                'address'         => 'Ahmet Tevfik Ozan Fuar ve Kongre Merkezi, Elazığ',
                'latitude'        => 38.6812,
                'longitude'       => 39.2155,
                'price'           => 120,
                'currency'        => 'TRY',
                'totalSeats'      => 1500,
                'soldSeats'       => 1120,
                'isFeatured'      => true,
                'isActive'        => true,
                'organizerName'   => 'Gurme Fest Organizasyon',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=KahveFest',
                'tags'            => json_encode(['kahve', 'çikolata', 'gurme', 'festival', 'yemek', 'canlı müzik']),
                'categoryId'      => $yemek->id,
            ],

            // 4. Teknofest İnsansız Sualtı Sistemleri Atölyesi (Özel İstenen 4)
            [
                'title'           => 'Teknofest İnsansız Sualtı Sistemleri Atölyesi',
                'description'     => 'Teknofest K3 İnsansız Sualtı Sistemleri yarışmasına hazırlanan takımlar için otonom görev icrası, sensör füzyonu, ROS tabanlı sualtı navigasyonu ve sızdırmazlık mekaniği teknik atölyesi.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
                'date'            => $futureDate(1, 14, 0),
                'endDate'         => $futureDate(1, 18, 30),
                'location'        => 'Elazığ',
                'address'         => 'Atatürk Stadyumu Genç Ofis Atölye Salonu, Elazığ',
                'latitude'        => 38.6755,
                'longitude'       => 39.2100,
                'price'           => 0,
                'currency'        => 'TRY',
                'totalSeats'      => 80,
                'soldSeats'       => 68,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'Gençlik ve Spor Bakanlığı Genç Ofis',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=Teknofest',
                'tags'            => json_encode(['teknofest', 'robotik', 'sualtı', 'otonom', 'mühendislik']),
                'categoryId'      => $egitim->id,
            ],

            // 5. Akustik Açık Hava Konseri: Senforock
            [
                'title'           => 'Senforock: Senfonik Rock Gecesi',
                'description'     => 'Klasik rock başyapıtları 40 kişilik senfoni orkestrası ve rock grubu eşliğinde sahnede. Queen, Metallica, Pink Floyd ve Scorpions efsaneleri dev prodüksiyonla buluşuyor.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
                'date'            => $futureDate(4, 20, 30),
                'endDate'         => $futureDate(4, 23, 0),
                'location'        => 'İstanbul',
                'address'         => 'Harbiye Cemil Topuzlu Açıkhava Tiyatrosu, İstanbul',
                'latitude'        => 41.0411,
                'longitude'       => 28.9940,
                'price'           => 450,
                'currency'        => 'TRY',
                'totalSeats'      => 3500,
                'soldSeats'       => 3200,
                'isFeatured'      => true,
                'isActive'        => true,
                'organizerName'   => 'Kültür Sanat Prodüksiyon',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=Senforock',
                'tags'            => json_encode(['rock', 'senfoni', 'konser', 'müzik', 'canlı']),
                'categoryId'      => $muzik->id,
            ],

            // 6. Modern Sanat ve İllüstrasyon Sergisi
            [
                'title'           => 'Yansımalar: Modern Sanat & Dijital İllüstrasyon Sergisi',
                'description'     => 'Çağdaş Türk illüstratörleri ve dijital sanatçılarının yapay zeka ile geleneksel sanatı harmanlayan interaktif eserleri. Sergi boyunca sanatçılarla canlı çizim performansları gerçekleştirilecektir.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800',
                'date'            => $futureDate(3, 10, 0),
                'endDate'         => $futureDate(10, 19, 0),
                'location'        => 'Ankara',
                'address'         => 'CerModern Sanat Merkezi, Sıhhiye, Ankara',
                'latitude'        => 39.9320,
                'longitude'       => 32.8520,
                'price'           => 75,
                'currency'        => 'TRY',
                'totalSeats'      => 500,
                'soldSeats'       => 240,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'CerModern Galerisi',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=CerModern',
                'tags'            => json_encode(['sanat', 'sergi', 'illüstrasyon', 'dijital sanat']),
                'categoryId'      => $sanat->id,
            ],

            // 7. Doğu Anadolu Doğa Yürüyüşü ve Kampçılık
            [
                'title'           => 'Hazar Gölü Çevresi Trekking & Yıldız Gözlem Kampı',
                'description'     => 'Hazar Gölü kıyısında 14 km doğa yürüyüşü, profesyonel teleskoplarla yıldız gözlemi, kamp ateşi başında astronomi söyleşileri ve temel hayatta kalma eğitimleri.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
                'date'            => $futureDate(6, 8, 30),
                'endDate'         => $futureDate(7, 14, 0),
                'location'        => 'Elazığ',
                'address'         => 'Sivrice Hazar Gölü Tabiat Parkı, Elazığ',
                'latitude'        => 38.4850,
                'longitude'       => 39.3120,
                'price'           => 250,
                'currency'        => 'TRY',
                'totalSeats'      => 60,
                'soldSeats'       => 48,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'Doğa Gezginleri Kulübü',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=Doga',
                'tags'            => json_encode(['trekking', 'kamp', 'yıldız gözlemi', 'doğa', 'spor']),
                'categoryId'      => $spor->id,
            ],

            // 8. Stand-up Gecesi: Açık Mikrofon
            [
                'title'           => 'Komedi Kulübü: Stand-Up Açık Mikrofon',
                'description'     => 'Gülmeye hazır mısınız? Türkiye’nin en sevilen komedyenleri ve yeni yeteneklerin sahne alacağı 2 saatlik kesintisiz kahkaha tufanı.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800',
                'date'            => $futureDate(1, 20, 0),
                'endDate'         => $futureDate(1, 22, 30),
                'location'        => 'İzmir',
                'address'         => 'Bostanlı Suat Taşer Tiyatrosu, Karşıyaka, İzmir',
                'latitude'        => 38.4550,
                'longitude'       => 27.0980,
                'price'           => 180,
                'currency'        => 'TRY',
                'totalSeats'      => 400,
                'soldSeats'       => 360,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'BKM Ege',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=StandUp',
                'tags'            => json_encode(['komedi', 'stand-up', 'eğlence', 'tiyatro']),
                'categoryId'      => $komedi->id,
            ],

            // 9. Açık Hava Sineması: Yıldızlar Altında Bilim Kurgu
            [
                'title'           => 'Açık Hava Sineması: Interstellar & Dune Maratonu',
                'description'     => 'Dev perdede 4K projeksiyon ve Dolby surround ses deneyimi ile sinema tarihinin başyapıtları. Minder, patlamış mısır ve sıcak içecekler fiyata dahildir.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
                'date'            => $futureDate(2, 20, 0),
                'endDate'         => $futureDate(3, 1, 30),
                'location'        => 'İstanbul',
                'address'         => 'KüçükÇiftlik Park, Maçka, İstanbul',
                'latitude'        => 41.0425,
                'longitude'       => 28.9955,
                'price'           => 200,
                'currency'        => 'TRY',
                'totalSeats'      => 800,
                'soldSeats'       => 710,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'Açık Hava Sinema Kulübü',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=Sinema',
                'tags'            => json_encode(['film', 'sinema', 'açıkhava', 'bilim kurgu']),
                'categoryId'      => $film->id,
            ],

            // 10. İtalyan Makarnaları & Pizza Masterclass
            [
                'title'           => 'İtalyan Mutfağı Masterclass: Taze Makarna ve Napolitano Pizza',
                'description'     => 'Şef eşliğinde sıfırdan el yapımı taze makarna hamuru açma, ravioli dolguları ve taş fırında gerçek Napoliten pizza pişirme teknikleri. Workshop sonunda hazırladığınız lezzetleri tadacaksınız.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
                'date'            => $futureDate(4, 15, 0),
                'endDate'         => $futureDate(4, 18, 30),
                'location'        => 'İstanbul',
                'address'         => 'Mutfak Sanatları Akademisi (MSA), Maslak, İstanbul',
                'latitude'        => 41.1105,
                'longitude'       => 29.0235,
                'price'           => 850,
                'currency'        => 'TRY',
                'totalSeats'      => 25,
                'soldSeats'       => 22,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'Mutfak Sanatları Akademisi',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=MSA',
                'tags'            => json_encode(['yemek', 'makarna', 'pizza', 'workshop', 'masterclass']),
                'categoryId'      => $yemek->id,
            ],

            // 11. Siber Güvenlik ve Ethical Hacking Eğitimi
            [
                'title'           => 'Siber Güvenlik Zirvesi: CTF ve Sızma Testleri',
                'description'     => 'Web uygulama güvenliği, tersine mühendislik ve ağ sızma testleri üzerine uygulamalı laboratuvar ortamı. Gün sonunda ödüllü canlı CTF (Capture The Flag) yarışması.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
                'date'            => $futureDate(7, 9, 30),
                'endDate'         => $futureDate(7, 17, 0),
                'location'        => 'Elazığ',
                'address'         => 'Fırat Teknokent Konferans Salonu, Elazığ',
                'latitude'        => 38.6780,
                'longitude'       => 39.2020,
                'price'           => 0,
                'currency'        => 'TRY',
                'totalSeats'      => 180,
                'soldSeats'       => 165,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'Siber Vatan & Fırat Siber Kulübü',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=Siber',
                'tags'            => json_encode(['siber güvenlik', 'ctf', 'hacking', 'teknoloji', 'network']),
                'categoryId'      => $teknoloji->id,
            ],

            // 12. Anadolu Ateşi Dans Gösterisi
            [
                'title'           => 'Anadolu Ateşi: Doğu ile Batının Dansı',
                'description'     => '3000 yıllık Anadolu kültürünün efsaneleri, halk dansları ve modern bale ile harmanlanan dünyaca ünlü büyüleyici koreografi.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
                'date'            => $futureDate(8, 20, 0),
                'endDate'         => $futureDate(8, 22, 30),
                'location'        => 'Antalya',
                'address'         => 'Aspendos Antik Tiyatrosu, Serik, Antalya',
                'latitude'        => 36.9389,
                'longitude'       => 31.1728,
                'price'           => 380,
                'currency'        => 'TRY',
                'totalSeats'      => 4000,
                'soldSeats'       => 3450,
                'isFeatured'      => true,
                'isActive'        => true,
                'organizerName'   => 'Anadolu Gösteri Sanatları',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=AnadoluAtesi',
                'tags'            => json_encode(['dans', 'kültür', 'tiyatro', 'gösteri', 'müzik']),
                'categoryId'      => $sanat->id,
            ],

            // 13. Mobil Uygulama Geliştirme Hackathonu (48 Saat)
            [
                'title'           => 'Hack-Future 2026: 48 Saatlik Mobil Hackathon',
                'description'     => 'Sağlık, çevre ve eğitim odaklı problemlere mobil çözümler üretin. Mentorluk desteği, 100.000 TL toplam ödül havuzu ve yatırımcı görüşmeleri.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
                'date'            => $futureDate(12, 10, 0),
                'endDate'         => $futureDate(14, 18, 0),
                'location'        => 'İstanbul',
                'address'         => 'Kolektif House Levent, Beşiktaş, İstanbul',
                'latitude'        => 41.0790,
                'longitude'       => 29.0120,
                'price'           => 0,
                'currency'        => 'TRY',
                'totalSeats'      => 300,
                'soldSeats'       => 280,
                'isFeatured'      => true,
                'isActive'        => true,
                'organizerName'   => 'Girişimcilik Vakfı',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=Hackathon',
                'tags'            => json_encode(['hackathon', 'kodlama', 'mobil', 'startup', 'teknoloji']),
                'categoryId'      => $teknoloji->id,
            ],

            // 14. Fotoğrafçılık ve Işık Atölyesi
            [
                'title'           => 'Sokak ve Portre Fotoğrafçılığı Atölyesi',
                'description'     => 'Manuel çekim teknikleri, doğal ışık kullanımı, kompozisyon kuralları ve Adobe Lightroom ile renk düzenleme temelleri.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800',
                'date'            => $futureDate(5, 13, 0),
                'endDate'         => $futureDate(5, 17, 0),
                'location'        => 'Eskişehir',
                'address'         => 'Odunpazarı Tarihi Evleri Meydanı, Eskişehir',
                'latitude'        => 39.7615,
                'longitude'       => 30.5255,
                'price'           => 160,
                'currency'        => 'TRY',
                'totalSeats'      => 30,
                'soldSeats'       => 19,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'Fotoğraf Sanatı Derneği (EFSAD)',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=EFSAD',
                'tags'            => json_encode(['fotoğrafçılık', 'atölye', 'sanat', 'portre']),
                'categoryId'      => $sanat->id,
            ],

            // 15. Kış Sporları ve Snowboard Festivali
            [
                'title'           => 'Palandöken SnowFest & Kış Sporları',
                'description'     => 'Gece kayağı, snowboard yarışları, DJ performansları ve sıcak içecek ikramları eşliğinde kışın en coşkulu dağ festivali.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800',
                'date'            => $futureDate(15, 9, 0),
                'endDate'         => $futureDate(17, 18, 0),
                'location'        => 'Erzurum',
                'address'         => 'Palandöken Kayak Merkezi, Erzurum',
                'latitude'        => 39.8510,
                'longitude'       => 41.2820,
                'price'           => 650,
                'currency'        => 'TRY',
                'totalSeats'      => 1200,
                'soldSeats'       => 980,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'Snowfest Türkiye',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=SnowFest',
                'tags'            => json_encode(['kayak', 'snowboard', 'kış sporları', 'festival', 'spor']),
                'categoryId'      => $spor->id,
            ],

            // 16. Caz ve Blues Akşamı
            [
                'title'           => 'Bebek Caz Geceleri: Kerem Görsev Trio',
                'description'     => 'Türkiye’nin yetiştirdiği en önemli caz piyanistlerinden Kerem Görsev ve grubu ile Boğaz kenarında büyülü bir caz ziyafeti.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
                'date'            => $futureDate(3, 21, 0),
                'endDate'         => $futureDate(3, 23, 30),
                'location'        => 'İstanbul',
                'address'         => 'The Badau Akasya Caz Kulübü, Kadıköy, İstanbul',
                'latitude'        => 40.9920,
                'longitude'       => 29.0550,
                'price'           => 320,
                'currency'        => 'TRY',
                'totalSeats'      => 120,
                'soldSeats'       => 110,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'Jazz Club Istanbul',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=JazzClub',
                'tags'            => json_encode(['caz', 'jazz', 'blues', 'piyano', 'müzik']),
                'categoryId'      => $muzik->id,
            ],

            // 17. UX/UI Tasarım ve Prototipleme Kampı
            [
                'title'           => 'Figma ile İleri Seviye UI/UX Tasarım ve Design System',
                'description'     => 'Kullanıcı araştırması, wireframe, autolayout, component variants ve interaktif prototipleme eğitimi. Kendi portfolyo projenizi oluşturun.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800',
                'date'            => $futureDate(6, 14, 0),
                'endDate'         => $futureDate(6, 18, 0),
                'location'        => 'Ankara',
                'address'         => 'ODTÜ Teknokent Co-working Alanı, Çankaya, Ankara',
                'latitude'        => 39.8910,
                'longitude'       => 32.7810,
                'price'           => 220,
                'currency'        => 'TRY',
                'totalSeats'      => 60,
                'soldSeats'       => 52,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'UX Design Community',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=UXDesign',
                'tags'            => json_encode(['tasarım', 'figma', 'ui', 'ux', 'prototip', 'teknoloji']),
                'categoryId'      => $egitim->id,
            ],

            // 18. E-Spor Turnuvası: Valorant & LoL Şampiyonası
            [
                'title'           => 'Üniversiteler Arası E-Spor Şampiyonası Büyük Final',
                'description'     => '16 üniversite takımının kıyasıya mücadele ettiği Valorant ve League of Legends finalleri. Canlı sunumlar, cosplay yarışması ve hediyeli mini turnuvalar.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
                'date'            => $futureDate(9, 11, 0),
                'endDate'         => $futureDate(9, 21, 0),
                'location'        => 'İstanbul',
                'address'         => 'FDR Oyun Cumhuriyeti, Kadıköy, İstanbul',
                'latitude'        => 40.9880,
                'longitude'       => 29.0290,
                'price'           => 90,
                'currency'        => 'TRY',
                'totalSeats'      => 500,
                'soldSeats'       => 480,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'Türkiye E-Spor Federasyonu',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=Esport',
                'tags'            => json_encode(['espor', 'valorant', 'league of legends', 'oyun', 'turnuva']),
                'categoryId'      => $spor->id,
            ],

            // 19. Vegan ve Glutensiz Gurme Tatlar Atölyesi
            [
                'title'           => 'Bitki Bazlı Beslenme: Vegan ve Glutensiz Mutfak',
                'description'     => 'Sağlıklı, lezzetli ve pratik bitkisel tarifler. Şekersiz tatlılar, fermente içecekler (Kombucha) ve çiğ beslenme (Raw Food) workshopu.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
                'date'            => $futureDate(11, 13, 0),
                'endDate'         => $futureDate(11, 16, 30),
                'location'        => 'İzmir',
                'address'         => 'Alsancak Gastronomi Evi, Konak, İzmir',
                'latitude'        => 38.4380,
                'longitude'       => 27.1420,
                'price'           => 290,
                'currency'        => 'TRY',
                'totalSeats'      => 25,
                'soldSeats'       => 16,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'Sağlıklı Yaşam Platformu',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=Vegan',
                'tags'            => json_encode(['vegan', 'glutensiz', 'sağlık', 'yemek', 'atölye']),
                'categoryId'      => $yemek->id,
            ],

            // 20. Kısa Film Festivali ve Yönetmen Söyleşileri
            [
                'title'           => 'Uluslararası Bağımsız Kısa Film Günleri',
                'description'     => 'Dünya festivallerinden ödülle dönen 24 seçkin kısa film gösterimi ve yönetmenlerle soru-cevap oturumları. Jüri özel ödül töreni.',
                'imageUrl'        => 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
                'date'            => $futureDate(8, 14, 0),
                'endDate'         => $futureDate(9, 22, 0),
                'location'        => 'İstanbul',
                'address'         => 'Atlas 1948 Sineması, Beyoğlu, İstanbul',
                'latitude'        => 41.0345,
                'longitude'       => 28.9785,
                'price'           => 110,
                'currency'        => 'TRY',
                'totalSeats'      => 350,
                'soldSeats'       => 290,
                'isFeatured'      => false,
                'isActive'        => true,
                'organizerName'   => 'Bağımsız Sinemacılar Birliği',
                'organizerAvatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=KisaFilm',
                'tags'            => json_encode(['kısa film', 'sinema', 'yönetmen', 'sanat', 'festival']),
                'categoryId'      => $film->id,
            ],
        ];

        $createdEvents = [];
        foreach ($eventsData as $data) {
            $createdEvents[] = Event::create($data);
        }

        // ─── 4. Seed Demo Tickets & Favorites ───────────────────────
        $bootcampEvent = $createdEvents[0];
        $devfestEvent = $createdEvents[1];
        $coffeeEvent = $createdEvents[2];

        // Demo Ticket 1
        Ticket::create([
            'ticketNumber' => 'TKT-2026-FUBET01',
            'qrCode'       => "EVENTLY:TKT-2026-FUBET01:{$bootcampEvent->id}:{$demoUser->id}:1",
            'status'       => 'ACTIVE',
            'quantity'     => 1,
            'totalPrice'   => 0,
            'purchasedAt'  => Carbon::now()->subDays(1),
            'userId'       => $demoUser->id,
            'eventId'      => $bootcampEvent->id,
        ]);

        // Demo Ticket 2
        Ticket::create([
            'ticketNumber' => 'TKT-2026-DEVFEST99',
            'qrCode'       => "EVENTLY:TKT-2026-DEVFEST99:{$devfestEvent->id}:{$demoUser->id}:2",
            'status'       => 'ACTIVE',
            'quantity'     => 2,
            'totalPrice'   => $devfestEvent->price * 2,
            'purchasedAt'  => Carbon::now()->subHours(5),
            'userId'       => $demoUser->id,
            'eventId'      => $devfestEvent->id,
        ]);

        // Demo Favorites
        Favorite::create([
            'userId'  => $demoUser->id,
            'eventId' => $bootcampEvent->id,
        ]);

        Favorite::create([
            'userId'  => $demoUser->id,
            'eventId' => $coffeeEvent->id,
        ]);
    }
}
