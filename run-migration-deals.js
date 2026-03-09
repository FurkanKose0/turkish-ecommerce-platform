const { Pool } = require('pg')

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'eticaret_sql',
    user: 'postgres',
    password: '258052'
})

async function runMigration() {
    try {
        console.log('Günün Fırsatı migration başlatılıyor...')

        // is_deal_of_day kolonu ekle
        await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deal_of_day BOOLEAN DEFAULT FALSE`)
        console.log('✓ is_deal_of_day kolonu eklendi')

        // deal_discount_percent kolonu ekle
        await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_discount_percent INTEGER DEFAULT 0`)
        console.log('✓ deal_discount_percent kolonu eklendi')

        // deal_start_date kolonu ekle
        await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_start_date TIMESTAMP`)
        console.log('✓ deal_start_date kolonu eklendi')

        // deal_end_date kolonu ekle
        await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_end_date TIMESTAMP`)
        console.log('✓ deal_end_date kolonu eklendi')

        // Index ekle
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_deal_of_day ON products(is_deal_of_day) WHERE is_deal_of_day = TRUE`)
        console.log('✓ Index eklendi')

        console.log('\n✅ Migration başarıyla tamamlandı!')
    } catch (error) {
        console.error('Migration hatası:', error)
    } finally {
        await pool.end()
    }
}

runMigration()
