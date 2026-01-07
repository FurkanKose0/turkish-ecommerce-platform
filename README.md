# E-Ticaret Platformu

PostgreSQL veritabanı tabanlı, modern e-ticaret web uygulaması. Proje dokümantasyonuna göre geliştirilmiştir.

## Özellikler

### Veritabanı
- ✅ PostgreSQL ile 3NF normalizasyon
- ✅ Hiyerarşik kategori yapısı (Recursive)
- ✅ Rol bazlı kullanıcı yönetimi (Admin/Müşteri)
- ✅ Stored Procedures (Sipariş işleme, stok yönetimi)
- ✅ Triggers (Fiyat değişiklik logları)
- ✅ Views (Raporlama: En çok satan, aylık ciro, kategori bazlı satış)
- ✅ ACID uyumlu işlemler
- ✅ Güvenli şifre hash'leme (bcrypt)

### Web Uygulaması
- ✅ Next.js 14 (App Router)
- ✅ TypeScript
- ✅ Tailwind CSS (Responsive tasarım)
- ✅ Kullanıcı kayıt/giriş sistemi
- ✅ Ürün listeleme ve arama
- ✅ Sepet yönetimi
- ✅ Sipariş oluşturma
- ✅ Admin paneli ve raporlar
- ✅ JWT tabanlı kimlik doğrulama

## Kurulum

### 1. Veritabanı Kurulumu

PostgreSQL'in yüklü olduğundan emin olun:

```bash
# Veritabanı oluştur
createdb eticaret_db

# SQL scriptlerini çalıştır
cd database
psql -U postgres -d eticaret_db -f schema.sql
psql -U postgres -d eticaret_db -f triggers.sql
psql -U postgres -d eticaret_db -f procedures.sql
psql -U postgres -d eticaret_db -f views.sql
psql -U postgres -d eticaret_db -f seed_data.sql
```

### 2. Ortam Değişkenleri

`.env.local` dosyası oluşturun:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eticaret_sql
DB_USER=postgres
DB_PASSWORD=258052
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### 3. Bağımlılıkları Yükle

```bash
npm install
```

### 4. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## Test Kullanıcıları

Veritabanı seed data ile birlikte gelir:

- **Admin**: admin@eticaret.com / admin123
- **Müşteri**: musteri@example.com / customer123

*Not: Production'da mutlaka şifreleri değiştirin!*

## Proje Yapısı

```
eticaret/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Kimlik doğrulama
│   │   ├── products/     # Ürünler
│   │   ├── cart/         # Sepet
│   │   ├── orders/       # Siparişler
│   │   └── admin/        # Admin API
│   ├── login/            # Giriş sayfası
│   ├── register/         # Kayıt sayfası
│   ├── products/         # Ürün listesi
│   ├── cart/             # Sepet sayfası
│   ├── checkout/         # Ödeme sayfası
│   └── admin/            # Admin paneli
├── components/           # React bileşenleri
├── database/             # SQL scriptleri
│   ├── schema.sql       # Tablo yapıları
│   ├── triggers.sql     # Trigger'lar
│   ├── procedures.sql   # Stored procedures
│   ├── views.sql        # View'lar
│   └── seed_data.sql   # Test verileri
├── lib/                  # Yardımcı fonksiyonlar
│   ├── db.ts            # Veritabanı bağlantısı
│   ├── auth.ts          # Kimlik doğrulama
│   └── auth-helpers.ts  # Auth helper'lar
└── hooks/               # React hooks
```

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş
- `POST /api/auth/logout` - Çıkış
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi

### Ürünler
- `GET /api/products` - Ürün listesi (query: categoryId, search)
- `GET /api/categories` - Kategori listesi

### Sepet
- `GET /api/cart` - Sepet içeriği
- `POST /api/cart` - Sepete ürün ekle
- `DELETE /api/cart?cartId=X` - Sepetten ürün çıkar

### Siparişler
- `GET /api/orders` - Sipariş listesi
- `POST /api/orders` - Yeni sipariş oluştur

### Admin
- `GET /api/admin/reports?type=top-products` - En çok satan ürünler
- `GET /api/admin/reports?type=monthly-revenue` - Aylık ciro
- `GET /api/admin/reports?type=category-sales` - Kategori bazlı satış
- `GET /api/admin/reports?type=low-stock` - Düşük stoklu ürünler

## Teknolojiler

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Veritabanı**: PostgreSQL
- **Kimlik Doğrulama**: JWT, bcrypt
- **İkonlar**: React Icons

## Güvenlik

- ✅ SQL Injection koruması (Prepared Statements)
- ✅ Şifre hash'leme (bcrypt)
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Rol bazlı yetkilendirme
- ✅ En az yetki prensibi (Principle of Least Privilege)

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
