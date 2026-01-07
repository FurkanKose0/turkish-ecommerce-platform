-- Admin kullanıcısını kontrol et
SELECT 
    user_id,
    email,
    first_name,
    last_name,
    role_id,
    is_active,
    created_at
FROM users 
WHERE email = 'admin@example.com';

-- Eğer role_id 1 değilse güncelle
UPDATE users 
SET role_id = 1 
WHERE email = 'admin@example.com' AND role_id != 1;

-- Güncelleme sonrası kontrol
SELECT 
    user_id,
    email,
    role_id,
    is_active
FROM users 
WHERE email = 'admin@example.com';
