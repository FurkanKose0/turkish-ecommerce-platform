-- STORED PROCEDURES (Saklı Yordamlar)
-- Sipariş işleme ve stok yönetimi için

-- Sipariş Oluşturma ve Stok Düşürme Prosedürü
CREATE OR REPLACE FUNCTION create_order(
    p_user_id INTEGER,
    p_address_id INTEGER,
    OUT p_order_id INTEGER,
    OUT p_status TEXT,
    OUT p_message TEXT
)
RETURNS RECORD AS $$
DECLARE
    v_cart_item RECORD;
    v_total_amount DECIMAL(10, 2) := 0;
    v_product_stock INTEGER;
    v_size_stock INTEGER;
    v_order_id INTEGER;
BEGIN
    -- Transaction başlat
    BEGIN
        -- Sepetteki ürünleri kontrol et ve toplam tutarı hesapla
        FOR v_cart_item IN 
            SELECT c.product_id, c.quantity, c.selected_size, p.price, p.stock_quantity, p.product_name, p.size_stocks
            FROM cart c
            INNER JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = p_user_id
        LOOP
            -- Genel Stok kontrolü
            IF v_cart_item.stock_quantity < v_cart_item.quantity THEN
                p_status := 'ERROR';
                p_message := format('Yetersiz stok: %s (Mevcut: %s, İstenen: %s)', 
                    v_cart_item.product_name, 
                    v_cart_item.stock_quantity, 
                    v_cart_item.quantity);
                RETURN;
            END IF;

            -- Beden Stoğu kontrolü (Eğer ürün bedenli ise)
            IF v_cart_item.selected_size IS NOT NULL AND v_cart_item.size_stocks IS NOT NULL THEN
                v_size_stock := (v_cart_item.size_stocks->>v_cart_item.selected_size)::INTEGER;
                IF v_size_stock < v_cart_item.quantity THEN
                    p_status := 'ERROR';
                    p_message := format('Yetersiz beden stoğu: %s - %s (Mevcut: %s, İstenen: %s)', 
                        v_cart_item.product_name,
                        v_cart_item.selected_size,
                        v_size_stock, 
                        v_cart_item.quantity);
                    RETURN;
                END IF;
            END IF;
            
            -- Toplam tutarı hesapla
            v_total_amount := v_total_amount + (v_cart_item.price * v_cart_item.quantity);
        END LOOP;
        
        -- Sepet boşsa hata döndür
        IF v_total_amount = 0 THEN
            p_status := 'ERROR';
            p_message := 'Sepetiniz boş!';
            RETURN;
        END IF;
        
        -- Sipariş oluştur
        INSERT INTO orders (user_id, address_id, total_amount, status_id)
        VALUES (p_user_id, p_address_id, v_total_amount, 1) -- 1: Beklemede
        RETURNING order_id INTO v_order_id;
        
        p_order_id := v_order_id;
        
        -- Sipariş detaylarını oluştur ve stok düşür
        FOR v_cart_item IN 
            SELECT c.product_id, c.quantity, c.selected_size, p.price, p.size_stocks
            FROM cart c
            INNER JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = p_user_id
        LOOP
            -- Sipariş detayı ekle
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, selected_size)
            VALUES (
                v_order_id,
                v_cart_item.product_id,
                v_cart_item.quantity,
                v_cart_item.price,
                v_cart_item.price * v_cart_item.quantity,
                v_cart_item.selected_size
            );
            
            -- Stok düşür
            IF v_cart_item.selected_size IS NOT NULL AND v_cart_item.size_stocks IS NOT NULL THEN
                -- Hem genel stoku hem de beden stoklarını güncelle
                UPDATE products
                SET stock_quantity = stock_quantity - v_cart_item.quantity,
                    size_stocks = jsonb_set(
                        size_stocks, 
                        array[v_cart_item.selected_size], 
                        ( (size_stocks->>v_cart_item.selected_size)::INTEGER - v_cart_item.quantity )::TEXT::jsonb
                    )
                WHERE product_id = v_cart_item.product_id;
            ELSE
                -- Sadece genel stoku güncelle
                UPDATE products
                SET stock_quantity = stock_quantity - v_cart_item.quantity
                WHERE product_id = v_cart_item.product_id;
            END IF;
            
            -- Stok kontrolü (double check)
            SELECT stock_quantity INTO v_product_stock
            FROM products
            WHERE product_id = v_cart_item.product_id;
            
            IF v_product_stock < 0 THEN
                -- Rollback için exception fırlat
                RAISE EXCEPTION 'Yetersiz stok: Ürün ID %', v_cart_item.product_id;
            END IF;
        END LOOP;
        
        -- Sepeti temizle
        DELETE FROM cart WHERE user_id = p_user_id;
        
        p_status := 'SUCCESS';
        p_message := format('Sipariş başarıyla oluşturuldu. Sipariş No: %s', v_order_id);
        
    EXCEPTION
        WHEN OTHERS THEN
            p_status := 'ERROR';
            p_message := format('Hata: %s', SQLERRM);
            -- Transaction otomatik rollback olur
    END;
END;
$$ LANGUAGE plpgsql;

-- Sipariş Onaylama Prosedürü
CREATE OR REPLACE FUNCTION approve_order(
    p_order_id INTEGER,
    OUT p_status TEXT,
    OUT p_message TEXT
)
RETURNS RECORD AS $$
DECLARE
    v_order_status INTEGER;
BEGIN
    -- Sipariş durumunu kontrol et
    SELECT status_id INTO v_order_status
    FROM orders
    WHERE order_id = p_order_id;
    
    IF NOT FOUND THEN
        p_status := 'ERROR';
        p_message := 'Sipariş bulunamadı!';
        RETURN;
    END IF;
    
    IF v_order_status != 1 THEN
        p_status := 'ERROR';
        p_message := 'Sadece beklemedeki siparişler onaylanabilir!';
        RETURN;
    END IF;
    
    -- Siparişi onayla
    UPDATE orders
    SET status_id = 2, -- 2: Onaylandı
        shipped_date = CURRENT_TIMESTAMP
    WHERE order_id = p_order_id;
    
    p_status := 'SUCCESS';
    p_message := 'Sipariş onaylandı!';
END;
$$ LANGUAGE plpgsql;

-- Stok Güncelleme Prosedürü
CREATE OR REPLACE FUNCTION update_product_stock(
    p_product_id INTEGER,
    p_quantity INTEGER,
    OUT p_status TEXT,
    OUT p_message TEXT
)
RETURNS RECORD AS $$
DECLARE
    v_current_stock INTEGER;
BEGIN
    -- Mevcut stoku al
    SELECT stock_quantity INTO v_current_stock
    FROM products
    WHERE product_id = p_product_id;
    
    IF NOT FOUND THEN
        p_status := 'ERROR';
        p_message := 'Ürün bulunamadı!';
        RETURN;
    END IF;
    
    -- Stok güncelle
    UPDATE products
    SET stock_quantity = stock_quantity + p_quantity
    WHERE product_id = p_product_id;
    
    -- Negatif stok kontrolü
    IF (v_current_stock + p_quantity) < 0 THEN
        p_status := 'ERROR';
        p_message := 'Stok miktarı negatif olamaz!';
        RETURN;
    END IF;
    
    p_status := 'SUCCESS';
    p_message := format('Stok güncellendi. Yeni stok: %s', v_current_stock + p_quantity);
END;
$$ LANGUAGE plpgsql;
