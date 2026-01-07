-- Admin Kullanıcısı Oluşturma Script'i
-- Email: admin@example.com
-- Şifre: admin1234!

-- Önce user_roles tablosuna Admin rolünü ekle (eğer yoksa)
INSERT INTO user_roles (role_id, role_name, description) 
VALUES (1, 'Admin', 'Sistem yöneticisi')
ON CONFLICT (role_id) DO NOTHING;

-- Müşteri rolünü ekle (eğer yoksa)
INSERT INTO user_roles (role_id, role_name, description) 
VALUES (2, 'Müşteri', 'Standart kullanıcı')
ON CONFLICT (role_id) DO NOTHING;

-- Admin kullanıcısını oluştur
-- Şifre: admin1234! (bcrypt hash: $2a$10$Lw1Bq7rXaP462yK5EDV1..MBaCp2p10xKyZdX9s3g8O.xVFpuv3T.)
INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active) 
VALUES (
    'admin@example.com',
    '$2a$10$Lw1Bq7rXaP462yK5EDV1..MBaCp2p10xKyZdX9s3g8O.xVFpuv3T.',
    'Admin',
    'User',
    1, -- role_id = 1 (Admin)
    TRUE
)
ON CONFLICT (email) DO UPDATE 
SET 
    password_hash = EXCLUDED.password_hash,
    role_id = EXCLUDED.role_id,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- Başarı mesajı
DO $$ 
BEGIN
    RAISE NOTICE 'Admin kullanıcısı başarıyla oluşturuldu!';
    RAISE NOTICE 'Email: admin@example.com';
    RAISE NOTICE 'Şifre: admin1234!';
END $$;
