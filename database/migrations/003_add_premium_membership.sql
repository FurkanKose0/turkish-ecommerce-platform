
-- Add premium membership columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP;

-- Comment for clarity
COMMENT ON COLUMN users.is_premium IS 'Indicates if the user has active premium membership';
COMMENT ON COLUMN users.premium_expires_at IS 'Expiration date of the premium membership';
