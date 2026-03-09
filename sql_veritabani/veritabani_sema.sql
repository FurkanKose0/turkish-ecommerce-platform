-- Online Mağaza Veritabanı Şeması

-- 1. Kullanıcı Rolleri Tablosu
CREATE TABLE IF NOT EXISTS user_roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id INTEGER NOT NULL DEFAULT 2, -- 1: Admin, 2: Müşteri, 3: Satıcı
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES user_roles(role_id) ON DELETE RESTRICT
);

-- 3. Adresler Tablosu
CREATE TABLE IF NOT EXISTS addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Türkiye',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Kategoriler Tablosu
CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id INTEGER,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- 5. Ürünler Tablosu
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku VARCHAR(100) UNIQUE,
    image_url VARCHAR(500),
    seller_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    is_deal_of_day BOOLEAN DEFAULT FALSE,
    deal_discount_percent INTEGER DEFAULT 0,
    deal_start_date TIMESTAMP,
    deal_end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 6. Fiyat Geçmişi Tablosu
CREATE TABLE IF NOT EXISTS price_history (
    history_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    old_price DECIMAL(10, 2) NOT NULL,
    new_price DECIMAL(10, 2) NOT NULL,
    changed_by INTEGER,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 7. Misafir Oturumları Tablosu
CREATE TABLE IF NOT EXISTS guest_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- 8. Sepet Tablosu
CREATE TABLE IF NOT EXISTS cart (
    cart_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_id VARCHAR(255),
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES guest_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CHECK ((user_id IS NOT NULL AND session_id IS NULL) OR (user_id IS NULL AND session_id IS NOT NULL)),
    UNIQUE(user_id, product_id),
    UNIQUE(session_id, product_id)
);

-- 9. Favoriler Tablosu
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_id VARCHAR(255),
    product_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES guest_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CHECK ((user_id IS NOT NULL AND session_id IS NULL) OR (user_id IS NULL AND session_id IS NOT NULL)),
    UNIQUE(user_id, product_id),
    UNIQUE(session_id, product_id)
);

-- 10. Sipariş Durumları Tablosu
CREATE TABLE IF NOT EXISTS order_status (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- 11. Siparişler Tablosu
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_id VARCHAR(255),
    address_id INTEGER,
    -- Misafir bilgileri
    guest_first_name VARCHAR(100),
    guest_last_name VARCHAR(100),
    guest_email VARCHAR(255),
    guest_phone VARCHAR(20),
    guest_address_line1 VARCHAR(255),
    guest_address_line2 VARCHAR(255),
    guest_city VARCHAR(100),
    guest_postal_code VARCHAR(20),
    
    status_id INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    
    -- Kargo ve İptal bilgileri
    tracking_code VARCHAR(100),
    tracking_number VARCHAR(100),
    cargo_company VARCHAR(100),
    cancellation_reason TEXT,
    
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_date TIMESTAMP,
    delivered_date TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (session_id) REFERENCES guest_sessions(session_id) ON DELETE SET NULL,
    FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON DELETE RESTRICT,
    FOREIGN KEY (status_id) REFERENCES order_status(status_id) ON DELETE RESTRICT,
    
    CHECK (
        (user_id IS NOT NULL AND address_id IS NOT NULL) OR 
        (user_id IS NULL AND session_id IS NOT NULL AND guest_first_name IS NOT NULL AND guest_email IS NOT NULL)
    )
);

-- 12. Sipariş Detayları Tablosu
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
);

-- 13. Ürün Soruları Tablosu
CREATE TABLE IF NOT EXISTS product_questions (
    question_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    is_answered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 14. Kampanyalar Tablosu
CREATE TABLE IF NOT EXISTS campaigns (
    campaign_id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL,
    campaign_name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CHECK (end_date > start_date)
);

-- 15. Kampanya Ürünleri
CREATE TABLE IF NOT EXISTS campaign_products (
    campaign_product_id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE(campaign_id, product_id)
);

-- 16. Satıcı Kuponları Tablosu
CREATE TABLE IF NOT EXISTS seller_coupons (
    coupon_id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL,
    coupon_code VARCHAR(50) NOT NULL,
    coupon_name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    is_followers_only BOOLEAN DEFAULT FALSE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(seller_id, coupon_code),
    CHECK (end_date > start_date)
);

-- 17. Satıcı Kupon Ürünleri
CREATE TABLE IF NOT EXISTS seller_coupon_products (
    coupon_product_id SERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    FOREIGN KEY (coupon_id) REFERENCES seller_coupons(coupon_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE(coupon_id, product_id)
);

-- 18. Satıcı Kupon Kullanım Geçmişi
CREATE TABLE IF NOT EXISTS seller_coupon_usages (
    usage_id SERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL,
    user_id INTEGER,
    session_id VARCHAR(255),
    order_id INTEGER,
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES seller_coupons(coupon_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (session_id) REFERENCES guest_sessions(session_id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL
);

-- 19. Ürün Değerlendirmeleri ve Yorumları
CREATE TABLE IF NOT EXISTS product_reviews (
    review_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 20. Kullanıcı Görüntüleme Geçmişi (Öneri Motoru için)
CREATE TABLE IF NOT EXISTS user_view_history (
    history_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_id VARCHAR(255),
    product_id INTEGER NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES guest_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 21. Öneri Sistemi Geri Bildirimi (MC, MN, MA, MD)
CREATE TABLE IF NOT EXISTS product_feedback (
    feedback_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_id VARCHAR(255),
    product_id INTEGER NOT NULL,
    feedback_type VARCHAR(2) NOT NULL CHECK (feedback_type IN ('MC', 'MN', 'MA', 'MD')), -- MC: Çok beğendim, MN: Beğendim, MA: İdare eder, MD: Beğenmedim
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES guest_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 22. Kişiselleştirilmiş Öneriler (Öneri Motoru Çıktıları)
CREATE TABLE IF NOT EXISTS user_recommendations (
    recommendation_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    score DECIMAL(5, 4), -- Uygunluk skoru (0.0000 - 1.0000 arası)
    algorithm_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- İndeksler

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_deal ON products(is_deal_of_day) WHERE is_deal_of_day = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart(session_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_session ON favorites(session_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_seller ON campaigns(seller_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_seller_coupons_seller ON seller_coupons(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_coupons_code ON seller_coupons(coupon_code);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_view_history_user ON user_view_history(user_id);
CREATE INDEX IF NOT EXISTS idx_view_history_session ON user_view_history(session_id);
CREATE INDEX IF NOT EXISTS idx_view_history_product ON user_view_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_feedback_product ON product_feedback(product_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user ON user_recommendations(user_id);


-- Roller
INSERT INTO user_roles (role_id, role_name, description) VALUES
(1, 'admin', 'Sistem Yöneticisi'),
(2, 'customer', 'Müşteri'),
(3, 'seller', 'Satıcı')
ON CONFLICT (role_name) DO NOTHING;

-- Sipariş Durumları
INSERT INTO order_status (status_id, status_name, description) VALUES
(1, 'Beklemede', 'Ödeme bekleniyor veya onay bekliyor'),
(2, 'Onaylandı', 'Sipariş onaylandı, hazırlanıyor'),
(3, 'Kargoda', 'Sipariş kargoya verildi'),
(4, 'Teslim Edildi', 'Sipariş müşteriye ulaştı'),
(5, 'İptal', 'Sipariş iptal edildi')
ON CONFLICT (status_name) DO NOTHING;
