-- Migration: Satıcı Kampanya ve Kupon Sistemi
-- Satıcıların kendi ürünlerinde kampanya ve kupon oluşturabilmesi için

-- Kampanyalar Tablosu
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

-- Kampanya Ürünleri (Hangi ürünlerde kampanya geçerli)
CREATE TABLE IF NOT EXISTS campaign_products (
    campaign_product_id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE(campaign_id, product_id)
);

-- Satıcı Kuponları Tablosu (mevcut coupons tablosundan ayrı)
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

-- Satıcı Kupon Ürünleri
CREATE TABLE IF NOT EXISTS seller_coupon_products (
    coupon_product_id SERIAL PRIMARY KEY,
    coupon_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    FOREIGN KEY (coupon_id) REFERENCES seller_coupons(coupon_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE(coupon_id, product_id)
);

-- Satıcı Kupon Kullanım Geçmişi
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

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_campaigns_seller ON campaigns(seller_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_seller_coupons_seller ON seller_coupons(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_coupons_code ON seller_coupons(coupon_code);
CREATE INDEX IF NOT EXISTS idx_seller_coupons_dates ON seller_coupons(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_seller_coupons_active ON seller_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_seller_coupons_followers ON seller_coupons(is_followers_only);
CREATE INDEX IF NOT EXISTS idx_seller_coupon_usages_coupon ON seller_coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_seller_coupon_usages_user ON seller_coupon_usages(user_id);

-- Başarı mesajı
DO $$
BEGIN
    RAISE NOTICE 'Satıcı Kampanya ve Kupon sistemi tabloları başarıyla oluşturuldu!';
END $$;
