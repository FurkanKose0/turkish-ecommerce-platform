const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Simple .env parser
try {
    const envPath = path.resolve(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1'); // Remove quotes if present
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.log('Error loading .env.local', e);
}

const pool = new Pool({
    user: process.env.POSTGRES_USER || process.env.DB_USER || 'postgres',
    host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
    database: process.env.POSTGRES_DATABASE || process.env.DB_NAME || 'ecommerce_db',
    password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT || '5432'),
});

const migrationSql = `
DO $$ 
BEGIN 
    -- Add is_premium if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_premium') THEN
        ALTER TABLE users ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add premium_expires_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'premium_expires_at') THEN
        ALTER TABLE users ADD COLUMN premium_expires_at TIMESTAMP;
    END IF;

    -- Create product_questions table if not exists
    CREATE TABLE IF NOT EXISTS product_questions (
        question_id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        answer_text TEXT,
        is_answered BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        answered_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for product_questions
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_product') THEN
        CREATE INDEX idx_questions_product ON product_questions(product_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_user') THEN
        CREATE INDEX idx_questions_user ON product_questions(user_id);
    END IF;

    -- Add sizes to products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sizes') THEN
        ALTER TABLE products ADD COLUMN sizes TEXT;
    END IF;

    -- Add selected_size to cart
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart' AND column_name = 'selected_size') THEN
        ALTER TABLE cart ADD COLUMN selected_size VARCHAR(50);
    END IF;

    -- Add selected_size to order_items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'selected_size') THEN
        ALTER TABLE order_items ADD COLUMN selected_size VARCHAR(50);
    END IF;

    -- Update uniqueness for cart to include selected_size
    DROP INDEX IF EXISTS cart_user_product_unique;
    DROP INDEX IF EXISTS cart_session_product_unique;

    CREATE UNIQUE INDEX cart_user_product_unique ON cart(user_id, product_id, COALESCE(selected_size, '')) WHERE (user_id IS NOT NULL);
    CREATE UNIQUE INDEX cart_session_product_unique ON cart(session_id, product_id, COALESCE(selected_size, '')) WHERE (session_id IS NOT NULL);

    -- Update clothing categories (4, 5, 6) products with default sizes
    UPDATE products SET sizes = 'S,M,L,XL' WHERE category_id IN (4, 5, 6) AND (sizes IS NULL OR sizes = '');

END $$;
`;

async function runMigration() {
    try {
        console.log('Running migration...');
        await pool.query(migrationSql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
