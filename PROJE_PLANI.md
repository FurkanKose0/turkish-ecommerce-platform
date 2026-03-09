# Proje Yönetim Planı ve Takvimi

Aşağıdaki takvim, E-Ticaret projesinin geliştirilme sürecini, veritabanı tasarımından başlayarak Full-Stack uygulama geliştirme ve son teslim aşamasına kadar kapsamaktadır. 

## Proje Takvimi (2025-2026)

| Faz / Görev Adı | Başlangıç | Bitiş | Süre (Gün) | Kaynak |
| :--- | :--- | :--- | :---: | :--- |
| **ANALİZ VE TASARIM FAZI** | **23.10.2025** | **11.11.2025** | **20** | **Furkan KÖSE** |
| Gereksinimlerin Belirlenmesi | 23.10.2025 | 29.10.2025 | 7 | Furkan KÖSE |
| UI/UX Tasarım Taslakları (Wireframes) | 30.10.2025 | 03.11.2025 | 5 | Furkan KÖSE |
| ER Diyagramı Tasarımı | 28.10.2025 | 03.11.2025 | 7 | Furkan KÖSE |
| 3NF Normalizasyon Süreçleri | 04.11.2025 | 11.11.2025 | 8 | Furkan KÖSE |
| | | | | |
| **VERİTABANI GELİŞTİRME (BACKEND - I)** | **12.11.2025** | **30.11.2025** | **19** | **Furkan KÖSE** |
| PostgreSQL Kurulumu ve Yapılandırma | 12.11.2025 | 13.11.2025 | 2 | Furkan KÖSE |
| Tablolar ve Kısıtlamaların (DDL) Oluşturulması | 14.11.2025 | 20.11.2025 | 7 | Furkan KÖSE |
| Stok Yönetimi Stored Procedure Yazımı | 21.11.2025 | 25.11.2025 | 5 | Furkan KÖSE |
| Fiyat Geçmişi & Loglama Trigger Geliştirme | 26.11.2025 | 30.11.2025 | 5 | Furkan KÖSE |
| | | | | |
| **WEB UYGULAMA GELİŞTİRME (FULL-STACK)** | **01.12.2025** | **25.12.2025** | **25** | **Furkan KÖSE** |
| Next.js Proje Kurulumu ve Yapılandırma | 01.12.2025 | 02.12.2025 | 2 | Furkan KÖSE |
| Auth Sistemi (Login/Register/JWT) Entegrasyonu | 03.12.2025 | 07.12.2025 | 5 | Furkan KÖSE |
| Ürün Listeleme ve Kategori Sayfaları | 08.12.2025 | 14.12.2025 | 7 | Furkan KÖSE |
| Sepet ve Sipariş Yönetimi Arayüzleri | 15.12.2025 | 20.12.2025 | 6 | Furkan KÖSE |
| Admin Paneli ve Raporlama Arayüzleri | 21.12.2025 | 25.12.2025 | 5 | Furkan KÖSE |
| | | | | |
| **GELİŞMİŞ ÖZELLİKLER & OPTİMİZASYON** | **26.12.2025** | **05.01.2026** | **11** | **Furkan KÖSE** |
| Satıcı Paneli ve Kampanya Sistemi | 26.12.2025 | 30.12.2025 | 5 | Furkan KÖSE |
| Kupon ve İndirim Sistemleri | 31.12.2025 | 02.01.2026 | 3 | Furkan KÖSE |
| Kişiselleştirilmiş Öneri Motoru Entegrasyonu | 03.01.2026 | 05.01.2026 | 3 | Furkan KÖSE |
| | | | | |
| **RAPORLAMA, GÜVENLİK VE FİNAL** | **06.01.2026** | **10.01.2026** | **5** | **Furkan KÖSE** |
| Satış Performans Views (Görünümler) | 06.01.2026 | 07.01.2026 | 2 | Furkan KÖSE |
| Güvenlik Auditi ve RBAC Kontrolleri | 07.01.2026 | 08.01.2026 | 2 | Furkan KÖSE |
| Veri Bütünlüğü ve Performans Testleri | 08.01.2026 | 09.01.2026 | 2 | Furkan KÖSE |
| Proje Tanım Dokümanı ve Final Teslim | 10.01.2026 | 10.01.2026 | 1 | Furkan KÖSE |

## Faz Detayları

### 1. Analiz ve Tasarım (5 Hafta)
Projenin temellerinin atıldığı, gereksinimlerin belirlendiği ve veritabanı şemasının (ER Diagram) kağıt üzerinde ve dijital ortamda tasarlandığı dönem.

### 2. Backend Geliştirme (3 Hafta)
Veritabanının fiziksel olarak oluşturulması. PostgreSQL üzerinde tabloların, prosedürlerin ve triggerların kodlanması.

### 3. Frontend & Full-Stack (4 Hafta)
Kullanıcı arayüzünün (Next.js) geliştirilmesi. Tasarımların koda dökülmesi ve API entegrasyonlarının yapılması.

### 4. Gelişmiş Özellikler (2 Hafta)
Proje isterlerine eklenen "Satıcı Sistemi", "Kampanyalar" ve "Öneri Motoru" gibi katma değerli özelliklerin geliştirilmesi.

### 5. Finalizasyon (1 Hafta)
Sistemin test edilmesi, hataların giderilmesi ve proje teslim dokümanlarının hazırlanması.

## Bütçe ve Kaynaklar

| İhtiyaç Açıklama | İhtiyaç Duyulan | Sahip Olunan | Tahmini Bütçe (Yıllık) | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| **DONANIM VE YAZILIM** | | | | |
| Geliştirme Bilgisayarı (MacBook) | 1 Adet | 1 Adet | 0 ₺ | Mevcut geliştirme ortamı kullanılacak. |
| **SUNUCU VE ALTYAPI** | | | | |
| Domain (Alan Adı - .com/.net) | 1 Adet | 0 | 600 ₺ | Marka tescili ve global erişim için. |
| Bulut Sunucu (VPS - 4GB RAM) | 1 Yıllık | 0 | 4.500 ₺ | Uygulama ve Veritabanı barındırma (Ubuntu/Linux). |
| SSL Sertifikası (Wildcard) | 1 Yıllık | 0 | 0 ₺ | Let's Encrypt ile ücretsiz sağlanacak. |
| Object Storage (S3/R2) | 1 Yıllık | 0 | 800 ₺ | Ürün resimleri ve medya dosyaları yedekleme/CDN. |
| **SERVİSLER** | | | | |
| E-posta Servisi (SMTP/Transactional)| 1 Yıllık | 0 | 1.500 ₺ | Sipariş onayları ve üyelik mailleri (Resend/SendGrid). |
| İzleme ve Loglama Servisleri | 1 Yıllık | 0 | 0 ₺ | Açık kaynak çözümler (Grafana/Prometheus) veya Free Tier. |
| **TASARIM VE DİĞER** | | | | |
| UI/UX Materyalleri (Icon/Font) | 1 Paket | 0 | 2.000 ₺ | Lisanslı ikon setleri, fontlar ve stok görseller .
| Geliştirici Eforu | 3 Ay | 1 Kişi | 0 ₺ | İç kaynak (Furkan KÖSE) tarafından karşılanacak. |
| | | | | |
| **GENEL TOPLAM** | | | **~9.400 ₺** | İlk yıl için öngörülen tahmini operasyonel maliyet. |

## Sürdürülebilirlik

### 1. Teknolojik Sürdürülebilirlik
*   **Modern Teknoloji Yığını:** Next.js ve PostgreSQL gibi uzun süreli desteği olan ve geniş komüniteye sahip teknolojilerin seçilmesi.
*   **Modüler Mimari:** Sistemin yeni özelliklerin kolayca eklenebileceği modüler bir yapıda (Component-based) tasarlanması.
*   **Düzenli Bakım:** Bağımlılıkların (npm packages) ve güvenlik yamalarının düzenli olarak güncellenmesi.

### 2. Operasyonel Sürdürülebilirlik
*   **Otomasyon (CI/CD):** Geliştirme ve dağıtım süreçlerinin otomatikleştirilerek insan hatasının minimize edilmesi.
*   **Dokümantasyon:** Kod ve sistem dokümantasyonunun sürekli güncel tutulması.
*   **Yedekleme Stratejisi:** Veritabanı ve medya dosyalarının düzenli ve otomatik yedeklenmesi (Daily Backups).

### 3. Çevresel Sürdürülebilirlik
*   **Green Hosting:** Sunucu sağlayıcısı olarak yenilenebilir enerji kullanan veri merkezlerinin tercih edilmesi.
*   **Optimize Kod:** Gereksiz işlemci gücü tüketimini azaltacak performans optimizasyonları.

## Gelir Modeli

Projenin kendi kendini finanse edebilmesi ve kar elde edebilmesi için planlanan gelir kalemleri:

1.  **Satış Komisyonları (Transaction Fees):** Platform üzerinden gerçekleşen her satıştan alınan %X oranında komisyon.
2.  **Premium Satıcı Üyelikleri:** Satıcılara gelişmiş analiz raporları, öne çıkarma ve ekstra kampanya hakları sunan aylık abonelik paketleri.
3.  **Reklam ve Sponsorluk:** Kategori sayfalarında veya ana sayfada "Öne Çıkan Ürünler" alanlarının satıcılara kiralanması.
4.  **Kargo Anlaşmaları:** Lojistik firmalarıyla yapılacak toplu anlaşmalar üzerinden elde edilecek marj gelirleri.

## Finansal Sürdürülebilirlik İçin Aksiyon Planı

### Faz 1: Başlangıç ve Büyüme (İlk 6 Ay)
*   **Amaç:** Kullanıcı tabanını oluşturmak ve işlem hacmini artırmak.
*   **Aksiyon:** Düşük komisyon oranları ile satıcıları platforma çekmek.
*   **Bütçe:** Pazarlama ve sunucu maliyetlerine odaklanılacak. Kar beklentisi minimumda tutulacak.

### Faz 2: Optimizasyon ve Gelir Artışı (6-12 Ay)
*   **Amaç:** Gelir kalemlerini çeşitlendirmek ve karlılığa geçmek.
*   **Aksiyon:** Premium satıcı paketlerinin devreye alınması ve reklam alanlarının satışa açılması.
*   **Hedef:** Operasyonel maliyetlerin (9.400 ₺) tamamen karşılanması ve %20 kar marjına ulaşılması.

### Faz 3: Ölçeklenme (12. Aydan Sonra)
*   **Amaç:** Pazar payını artırmak ve yeni pazarlara açılmak.
*   **Aksiyon:** Elde edilen karın altyapı güçlendirme ve pazarlama faaliyetlerine yeniden yatırılması (Re-investment).
