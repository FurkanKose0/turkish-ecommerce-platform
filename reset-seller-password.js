const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_sql',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '258052',
});

async function resetSellerPassword() {
    try {
        const password = 'seller_password_123'; // New password
        const hash = await bcrypt.hash(password, 10);

        await pool.query(
            "UPDATE users SET password_hash = $1 WHERE email = 'skorry@ticaret.com'",
            [hash]
        );

        console.log(`Password reset for 'skorry@ticaret.com'. New password is: ${password}`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

resetSellerPassword();
