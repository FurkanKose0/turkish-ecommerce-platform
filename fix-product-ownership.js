const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_sql',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '258052',
});

async function checkProductOwnership() {
    try {
        // Get Seller ID
        const sellerRes = await pool.query("SELECT user_id FROM users WHERE email = 'skorry@ticaret.com'");
        if (sellerRes.rows.length === 0) {
            console.log("Seller not found");
            return;
        }
        const sellerId = sellerRes.rows[0].user_id;
        console.log(`Seller ID: ${sellerId}`);

        // Check products
        const productsRes = await pool.query("SELECT product_id, product_name, seller_id FROM products LIMIT 10");
        console.table(productsRes.rows);

        // Check mismatch
        const mismatch = productsRes.rows.filter(p => p.seller_id !== sellerId);
        if (mismatch.length > 0) {
            console.log("Found products NOT owned by seller:");
            console.table(mismatch);

            // Fix ownership
            console.log("Fixing ownership for all products...");
            await pool.query("UPDATE products SET seller_id = $1", [sellerId]);
            console.log("Ownership fixed.");
        } else {
            console.log("All checked products are owned by the seller.");
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkProductOwnership();
