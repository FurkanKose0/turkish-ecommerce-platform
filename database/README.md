# E-Ticaret Veritabanı Dokümantasyonu

Bu klasör, PostgreSQL veritabanı şeması, trigger'lar, stored procedure'lar ve view'ları içerir.

## Kurulum

1. PostgreSQL'in yüklü olduğundan emin olun
2. Veritabanı oluşturun:
```sql
CREATE DATABASE eticaret_db;
```

3. Tüm scriptleri sırayla çalıştırın:
```bash
psql -U postgres -d eticaret_db -f schema.sql
psql -U postgres -d eticaret_db -f triggers.sql
psql -U postgres -d eticaret_db -f procedures.sql
psql -U postgres -d eticaret_db -f views.sql
psql -U postgres -d eticaret_db -f seed_data.sql
```

Veya tek seferde:
```bash
psql -U postgres -d eticaret_db -f init.sql
```

## Dosya Açıklamaları

- **schema.sql**: Tüm tablolar, ilişkiler ve indeksler
- **triggers.sql**: Fiyat değişiklik logları ve otomatik güncellemeler
- **procedures.sql**: Sipariş işleme, stok yönetimi stored procedure'ları
- **views.sql**: Raporlama için görünümler
- **seed_data.sql**: Test verileri
- **init.sql**: Tüm scriptleri çalıştıran master script

## Özellikler

- ✅ 3NF Normalizasyon
- ✅ Hiyerarşik kategori yapısı
- ✅ Rol bazlı kullanıcı yönetimi
- ✅ Otomatik stok yönetimi
- ✅ Fiyat değişiklik logları
- ✅ ACID uyumlu işlemler
- ✅ Raporlama view'ları

## Test Kullanıcıları

- **Admin**: admin@eticaret.com / admin123
- **Müşteri**: musteri@example.com / customer123

*Not: Şifreler SHA256 ile hash'lenmiştir. Production'da bcrypt veya Argon2 kullanılmalıdır.*
