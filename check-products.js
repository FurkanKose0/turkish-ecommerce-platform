const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_sql',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '258052',
});

async function checkProducts() {
    try {
        const res = await pool.query('SELECT product_id, product_name, category_id, image_url FROM products LIMIT 20');
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkProducts();
