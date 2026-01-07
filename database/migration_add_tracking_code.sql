-- Migration: Add tracking_code column to orders table
-- Kargo takip kodu için sütun ekle

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'tracking_code'
    ) THEN
        ALTER TABLE orders ADD COLUMN tracking_code VARCHAR(100);
        CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_code);
        RAISE NOTICE 'tracking_code sütunu eklendi';
    ELSE
        RAISE NOTICE 'tracking_code sütunu zaten mevcut';
    END IF;
END $$;
