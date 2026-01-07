-- TRIGGERS (Tetikleyiciler)
-- Fiyat değişikliklerini otomatik olarak loglar

-- Fiyat değişikliği için Trigger Fonksiyonu
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Eğer fiyat değiştiyse log tablosuna kaydet
    IF OLD.price != NEW.price THEN
        INSERT INTO price_history (product_id, old_price, new_price, changed_by, changed_at)
        VALUES (NEW.product_id, OLD.price, NEW.price, NULL, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Ürün fiyatı değiştiğinde çalışır
CREATE TRIGGER trigger_price_change
    AFTER UPDATE OF price ON products
    FOR EACH ROW
    WHEN (OLD.price IS DISTINCT FROM NEW.price)
    EXECUTE FUNCTION log_price_change();

-- Updated_at otomatik güncelleme için Trigger Fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Users tablosu için updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Products tablosu için updated_at
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Cart tablosu için updated_at
CREATE TRIGGER trigger_cart_updated_at
    BEFORE UPDATE ON cart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
