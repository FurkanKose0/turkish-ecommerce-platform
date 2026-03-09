
-- Skorry Ticaret satıcısı oluştur
INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id)
VALUES (
  'skorry@ticaret.com', 
  '$2a$10$X7vQk6Y9jJ1j1j1j1j1j1O1j1j1j1j1j1j1j1j1j1j1j1j1j1j1j1', -- Placeholder hash
  'sKorry', 
  'Ticaret', 
  '05555555555', 
  2 -- Varsayılan olarak müşteri, satıcı rolü tanımlı değilse
)
ON CONFLICT (email) DO NOTHING;

-- Eğer satıcı rolü tanımlıysa (örneğin 3), güncelle
-- UPDATE users SET role_id = 3 WHERE email = 'skorry@ticaret.com';

-- Ürünlere satıcı alanı ekle (eğer yoksa)
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_id INTEGER;
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_seller;
ALTER TABLE products ADD CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- Tüm ürünleri Skorry Ticaret'e ata
UPDATE products SET seller_id = (SELECT user_id FROM users WHERE email = 'skorry@ticaret.com');
