-- Günün Fırsatı özelliği için products tablosuna kolon ekle
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deal_of_day BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_discount_percent INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_start_date TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_end_date TIMESTAMP;

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_products_deal_of_day ON products(is_deal_of_day) WHERE is_deal_of_day = TRUE;

-- Yorum: Satıcılar ürünlerini "Günün Fırsatı" olarak işaretleyebilir
-- is_deal_of_day: Ürün günün fırsatı mı?
-- deal_discount_percent: İndirim yüzdesi (opsiyonel, kampanya sisteminden farklı olarak)
-- deal_start_date: Fırsat başlangıç tarihi
-- deal_end_date: Fırsat bitiş tarihi
