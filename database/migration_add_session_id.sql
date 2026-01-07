-- Migration: Add session_id columns for guest users
-- Run this script if your database doesn't have session_id columns yet

-- 1. Create guest_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS guest_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- 2. Add session_id column to cart table if it doesn't exist
DO $$ 
BEGIN
    -- Make user_id nullable first (if it's not already)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cart' 
        AND column_name = 'user_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE cart ALTER COLUMN user_id DROP NOT NULL;
    END IF;
    
    -- Add session_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cart' AND column_name = 'session_id'
    ) THEN
        ALTER TABLE cart ADD COLUMN session_id VARCHAR(255);
        ALTER TABLE cart ADD CONSTRAINT fk_cart_session 
            FOREIGN KEY (session_id) REFERENCES guest_sessions(session_id) ON DELETE CASCADE;
    END IF;
    
    -- Drop old unique constraint if exists (might fail if doesn't exist, that's ok)
    BEGIN
        ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_user_id_product_id_key;
    EXCEPTION WHEN OTHERS THEN
        -- Ignore if constraint doesn't exist
    END;
    
    -- Drop old unique index if exists
    DROP INDEX IF EXISTS cart_user_product_unique;
    DROP INDEX IF EXISTS cart_session_product_unique;
    
    -- Add new unique constraints (partial indexes for NULL handling)
    CREATE UNIQUE INDEX IF NOT EXISTS cart_user_product_unique 
        ON cart(user_id, product_id) WHERE user_id IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS cart_session_product_unique 
        ON cart(session_id, product_id) WHERE session_id IS NOT NULL;
    
    -- Drop old check constraint if exists
    ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_user_or_session_check;
    
    -- Add check constraint
    ALTER TABLE cart ADD CONSTRAINT cart_user_or_session_check 
        CHECK ((user_id IS NOT NULL AND session_id IS NULL) OR (user_id IS NULL AND session_id IS NOT NULL));
END $$;

-- 3. Add session_id column to favorites table if it doesn't exist
DO $$ 
BEGIN
    -- Make user_id nullable first (if it's not already)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'favorites' 
        AND column_name = 'user_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE favorites ALTER COLUMN user_id DROP NOT NULL;
    END IF;
    
    -- Add session_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'favorites' AND column_name = 'session_id'
    ) THEN
        ALTER TABLE favorites ADD COLUMN session_id VARCHAR(255);
        ALTER TABLE favorites ADD CONSTRAINT fk_favorites_session 
            FOREIGN KEY (session_id) REFERENCES guest_sessions(session_id) ON DELETE CASCADE;
    END IF;
    
    -- Drop old unique constraint if exists
    BEGIN
        ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_product_id_key;
    EXCEPTION WHEN OTHERS THEN
        -- Ignore if constraint doesn't exist
    END;
    
    -- Drop old unique index if exists
    DROP INDEX IF EXISTS favorites_user_product_unique;
    DROP INDEX IF EXISTS favorites_session_product_unique;
    
    -- Add new unique constraints (partial indexes for NULL handling)
    CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_product_unique 
        ON favorites(user_id, product_id) WHERE user_id IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS favorites_session_product_unique 
        ON favorites(session_id, product_id) WHERE session_id IS NOT NULL;
    
    -- Drop old check constraint if exists
    ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_or_session_check;
    
    -- Add check constraint
    ALTER TABLE favorites ADD CONSTRAINT favorites_user_or_session_check 
        CHECK ((user_id IS NOT NULL AND session_id IS NULL) OR (user_id IS NULL AND session_id IS NOT NULL));
END $$;

-- 4. Add session_id column to orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'session_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN session_id VARCHAR(255);
        ALTER TABLE orders ADD CONSTRAINT fk_orders_session 
            FOREIGN KEY (session_id) REFERENCES guest_sessions(session_id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart(session_id);
CREATE INDEX IF NOT EXISTS idx_favorites_session ON favorites(session_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires ON guest_sessions(expires_at);

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
END $$;
