
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkCategories() {
    try {
        const res = await pool.query('SELECT * FROM categories');
        console.log('Category Count:', res.rowCount);
        console.log('Categories:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error querying categories:', err);
    } finally {
        await pool.end();
    }
}

checkCategories();
