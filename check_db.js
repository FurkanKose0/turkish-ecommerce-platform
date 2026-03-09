const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkColumns() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'");
        console.log(JSON.stringify(res.rows, null, 2));
        const res2 = await pool.query("SELECT * FROM products LIMIT 1");
        console.log('Sample row key names:', Object.keys(res2.rows[0] || {}));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkColumns();
