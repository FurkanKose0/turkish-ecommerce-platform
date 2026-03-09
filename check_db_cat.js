
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'eticaret_sql',
    user: 'postgres',
    password: '258052',
});

async function check() {
    try {
        const res = await pool.query('SELECT * FROM categories LIMIT 10');
        console.log('Categories Sample:', res.rows);
        const count = await pool.query('SELECT COUNT(*) FROM categories');
        console.log('Total Count:', count.rows[0].count);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

check();
