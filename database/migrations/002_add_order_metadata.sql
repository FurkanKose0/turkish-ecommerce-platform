
-- Add metadata columns to orders table for better order management
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS cargo_company VARCHAR(100);

-- Make sure these columns are available for queries
COMMENT ON COLUMN orders.cancellation_reason IS 'Reason for order cancellation';
COMMENT ON COLUMN orders.tracking_number IS 'Cargo tracking number';
COMMENT ON COLUMN orders.cargo_company IS 'Shipping carrier company name';
