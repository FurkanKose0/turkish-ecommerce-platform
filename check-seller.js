const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_sql',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '258052',
});

async function checkSellerUser() {
    try {
        const res = await pool.query("SELECT user_id, email, password_hash, role_id, first_name FROM users WHERE email = 'skorry@ticaret.com'");
        console.log('Seller User Check:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkSellerUser();
