-- Migration: Add seller_id column to products table
-- Tüm ürünlerin satıcısını admin user yap

DO $$ 
DECLARE
    admin_user_id INTEGER;
BEGIN
    -- seller_id sütununu ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'seller_id'
    ) THEN
        ALTER TABLE products ADD COLUMN seller_id INTEGER;
        ALTER TABLE products ADD CONSTRAINT fk_products_seller 
            FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
        RAISE NOTICE 'seller_id sütunu eklendi';
    ELSE
        RAISE NOTICE 'seller_id sütunu zaten mevcut';
    END IF;
    
    -- Admin user'ı bul (email = 'admin@example.com' veya role_id = 1)
    SELECT user_id INTO admin_user_id 
    FROM users 
    WHERE email = 'admin@example.com' OR role_id = 1 
    LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'Admin user bulunamadı, lütfen önce admin user oluşturun';
    ELSE
        -- Tüm ürünlerin seller_id'sini admin user yap
        UPDATE products 
        SET seller_id = admin_user_id 
        WHERE seller_id IS NULL;
        
        RAISE NOTICE 'Tüm ürünlerin satıcısı admin user olarak ayarlandı (user_id: %)', admin_user_id;
    END IF;
END $$;
