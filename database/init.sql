-- E-Ticaret Veritabanı Başlatma Scripti
-- Tüm tabloları, trigger'ları, procedure'ları ve view'ları oluşturur

-- Veritabanı oluştur (PostgreSQL'de manuel olarak yapılmalı)
-- CREATE DATABASE eticaret_db;

-- Tüm scriptleri sırayla çalıştır
\i schema.sql
\i triggers.sql
\i procedures.sql
\i views.sql
\i seed_data.sql

-- Başarı mesajı
DO $$
BEGIN
    RAISE NOTICE 'Veritabanı başarıyla oluşturuldu!';
END $$;
