
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

async function checkColumns() {
    try {
        const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders'
    `);
        console.log('Orders table columns:', res.rows.map(r => r.column_name));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkColumns();
