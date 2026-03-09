// Migration çalıştırma scripti - Kampanya ve Kupon tabloları
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'eticaret_sql',
    user: 'postgres',
    password: '258052'
})

async function runMigration() {
    try {
        console.log('Migration başlatılıyor...')

        const migrationPath = path.join(__dirname, 'database/migrations/005_add_campaigns_coupons.sql')
        const sql = fs.readFileSync(migrationPath, 'utf8')

        await pool.query(sql)

        console.log('✓ Kampanya ve Kupon tabloları başarıyla oluşturuldu!')
        console.log('')
        console.log('Oluşturulan tablolar:')
        console.log('  - campaigns (Kampanyalar)')
        console.log('  - campaign_products (Kampanya Ürünleri)')
        console.log('  - coupons (Kuponlar)')
        console.log('  - coupon_products (Kupon Ürünleri)')
        console.log('  - coupon_usages (Kupon Kullanımları)')
        console.log('  - followed_stores (Takip Edilen Mağazalar)')
        console.log('')
        console.log('Yeni özellikler:')
        console.log('  ✓ Satıcılar kendi ürünlerinde kampanya oluşturabilir')
        console.log('  ✓ Satıcılar kupon kodu oluşturabilir')
        console.log('  ✓ Takipçilere özel kupon desteği')
        console.log('  ✓ Kullanım limitleri ve istatistikler')

    } catch (error) {
        console.error('Migration hatası:', error)
    } finally {
        await pool.end()
    }
}

runMigration()
