-- VIEWS (Görünümler)
-- Raporlama için karmaşık sorguları basitleştirir

-- En Çok Satan Ürünler View
CREATE OR REPLACE VIEW v_top_selling_products AS
SELECT 
    p.product_id,
    p.product_name,
    p.sku,
    SUM(oi.quantity) AS total_sold,
    SUM(oi.subtotal) AS total_revenue,
    COUNT(DISTINCT oi.order_id) AS order_count,
    p.price AS current_price,
    p.stock_quantity
FROM products p
INNER JOIN order_items oi ON p.product_id = oi.product_id
INNER JOIN orders o ON oi.order_id = o.order_id
WHERE o.status_id IN (2, 3, 4) -- Onaylandı, Kargoda, Teslim Edildi
GROUP BY p.product_id, p.product_name, p.sku, p.price, p.stock_quantity
ORDER BY total_sold DESC;

-- Aylık Ciro Takibi View
CREATE OR REPLACE VIEW v_monthly_revenue AS
SELECT 
    DATE_TRUNC('month', o.order_date) AS month,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COUNT(DISTINCT o.user_id) AS total_customers,
    SUM(o.total_amount) AS total_revenue,
    AVG(o.total_amount) AS average_order_value
FROM orders o
WHERE o.status_id IN (2, 3, 4) -- Onaylandı, Kargoda, Teslim Edildi
GROUP BY DATE_TRUNC('month', o.order_date)
ORDER BY month DESC;

-- Kategori Bazlı Satış Performansı View
CREATE OR REPLACE VIEW v_category_sales AS
SELECT 
    c.category_id,
    c.category_name,
    COUNT(DISTINCT oi.order_id) AS total_orders,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.subtotal) AS total_revenue,
    COUNT(DISTINCT oi.product_id) AS unique_products_sold
FROM categories c
INNER JOIN products p ON c.category_id = p.category_id
INNER JOIN order_items oi ON p.product_id = oi.product_id
INNER JOIN orders o ON oi.order_id = o.order_id
WHERE o.status_id IN (2, 3, 4) -- Onaylandı, Kargoda, Teslim Edildi
GROUP BY c.category_id, c.category_name
ORDER BY total_revenue DESC;

-- Müşteri Sipariş Geçmişi View
CREATE OR REPLACE VIEW v_customer_orders AS
SELECT 
    u.user_id,
    u.email,
    u.first_name || ' ' || u.last_name AS full_name,
    o.order_id,
    o.order_date,
    os.status_name AS order_status,
    o.total_amount,
    COUNT(oi.order_item_id) AS item_count
FROM users u
INNER JOIN orders o ON u.user_id = o.user_id
INNER JOIN order_status os ON o.status_id = os.status_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY u.user_id, u.email, u.first_name, u.last_name, o.order_id, o.order_date, os.status_name, o.total_amount
ORDER BY o.order_date DESC;

-- Stok Uyarıları View (Düşük stoklu ürünler)
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT 
    p.product_id,
    p.product_name,
    p.sku,
    p.stock_quantity,
    p.price,
    c.category_name,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'Tükendi'
        WHEN p.stock_quantity < 10 THEN 'Kritik'
        WHEN p.stock_quantity < 50 THEN 'Düşük'
        ELSE 'Normal'
    END AS stock_status
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
WHERE p.stock_quantity < 50 AND p.is_active = TRUE
ORDER BY p.stock_quantity ASC;
