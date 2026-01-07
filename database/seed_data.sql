-- SEED DATA (Örnek Veriler)
-- Test ve geliştirme için başlangıç verileri

-- Kullanıcı Rolleri
INSERT INTO user_roles (role_id, role_name, description) VALUES
(1, 'Admin', 'Sistem yöneticisi - Tüm yetkilere sahip'),
(2, 'Müşteri', 'Standart kullanıcı - Alışveriş yapabilir')
ON CONFLICT DO NOTHING;

-- Sipariş Durumları
INSERT INTO order_status (status_id, status_name, description) VALUES
(1, 'Beklemede', 'Sipariş oluşturuldu, onay bekliyor'),
(2, 'Onaylandı', 'Sipariş onaylandı ve hazırlanıyor'),
(3, 'Kargoda', 'Sipariş kargoya verildi'),
(4, 'Teslim Edildi', 'Sipariş teslim edildi'),
(5, 'İptal', 'Sipariş iptal edildi')
ON CONFLICT DO NOTHING;

-- Kategoriler (Hiyerarşik yapı)
INSERT INTO categories (category_id, category_name, parent_category_id, description) VALUES
(1, 'Elektronik', NULL, 'Elektronik ürünler'),
(2, 'Bilgisayar', 1, 'Bilgisayar ve aksesuarları'),
(3, 'Telefon', 1, 'Cep telefonu ve aksesuarları'),
(4, 'Giyim', NULL, 'Giyim ve moda'),
(5, 'Erkek Giyim', 4, 'Erkek giyim ürünleri'),
(6, 'Kadın Giyim', 4, 'Kadın giyim ürünleri'),
(7, 'Ev & Yaşam', NULL, 'Ev ve yaşam ürünleri'),
(8, 'Mobilya', 7, 'Mobilya ürünleri'),
(9, 'Dekorasyon', 7, 'Ev dekorasyon ürünleri')
ON CONFLICT DO NOTHING;

-- Örnek Ürünler
INSERT INTO products (product_id, product_name, description, category_id, price, stock_quantity, sku, is_active) VALUES
(1, 'Laptop Dell XPS 15', 'Yüksek performanslı iş ve oyun laptopu', 2, 25000.00, 15, 'LAP-DELL-XPS15', TRUE),
(2, 'iPhone 15 Pro', 'Apple''ın en yeni flagship telefonu', 3, 45000.00, 25, 'PHN-APP-IP15P', TRUE),
(3, 'Samsung Galaxy S24', 'Android flagship telefon', 3, 35000.00, 30, 'PHN-SAM-S24', TRUE),
(4, 'Erkek Polo Tişört', 'Klasik polo tişört, %100 pamuk', 5, 299.99, 100, 'CLT-MEN-POLO', TRUE),
(5, 'Kadın Elbise', 'Yazlık elbise, çok renk seçeneği', 6, 599.99, 75, 'CLT-WOM-DRESS', TRUE),
(6, 'Kanepe Takımı', '3+2 kanepe takımı, kumaş kaplama', 8, 15000.00, 5, 'FUR-SOF-SET', TRUE),
(7, 'Dekoratif Vazo', 'Modern tasarım dekoratif vazo', 9, 199.99, 50, 'DEC-VASE-01', TRUE),
(8, 'Gaming Mouse', 'RGB aydınlatmalı oyun faresi', 2, 899.99, 40, 'ACC-MOU-GAM', TRUE),
(999, 'Premium Üyelik - Aylık', 'sKorry Premium Üyelik (Aylık) - Ücretsiz kargo, özel indirimler ve daha fazlası', 1, 49.00, 9999, 'MEMBERSHIP-MONTHLY', TRUE),
(1000, 'Premium Üyelik - Yıllık', 'sKorry Premium Üyelik (Yıllık) - Ücretsiz kargo, özel indirimler ve daha fazlası. 2 ay bedava!', 1, 399.00, 9999, 'MEMBERSHIP-YEARLY', TRUE)
ON CONFLICT DO NOTHING;

-- Örnek Admin Kullanıcı (Şifre: admin123 - bcrypt hash)
INSERT INTO users (user_id, email, password_hash, first_name, last_name, phone, role_id) VALUES
(1, 'admin@eticaret.com', '$2a$10$C93AIepkQHNKwOCV089r1e/3IMsd8qig8yG.V4qMoZ6K///muFKpC', 'Admin', 'User', '05551234567', 1)
ON CONFLICT DO NOTHING;

-- Örnek Müşteri Kullanıcı (Şifre: customer123 - bcrypt hash)
INSERT INTO users (user_id, email, password_hash, first_name, last_name, phone, role_id) VALUES
(2, 'musteri@example.com', '$2a$10$g18SVqJX5uOBs9b6zJU7Oe.Rjw5io3o8/4l9W.8uglD9scHsll1Uy', 'Ahmet', 'Yılmaz', '05559876543', 2)
ON CONFLICT DO NOTHING;

-- Örnek Adres
INSERT INTO addresses (address_id, user_id, address_line1, city, postal_code, is_default) VALUES
(1, 2, 'Atatürk Caddesi No:123 Daire:5', 'İstanbul', '34000', TRUE)
ON CONFLICT DO NOTHING;
