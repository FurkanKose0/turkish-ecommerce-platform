const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_sql',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '258052',
});

async function checkCategories() {
    try {
        const res = await pool.query('SELECT category_id, category_name, image_url FROM categories ORDER BY category_id');
        console.log('Categories in DB:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkCategories();
