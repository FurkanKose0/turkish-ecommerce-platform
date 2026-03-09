const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_sql',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '258052',
});

async function updateElectronicsImage() {
    try {
        console.log('Updating Electronics image...');
        // New URL: A clean, modern workspace setup which represents electronics well
        const newUrl = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=500&auto=format&fit=crop';

        await pool.query('UPDATE categories SET image_url = $1 WHERE category_name = $2', [newUrl, 'Elektronik']);
        console.log('Updated Elektronik image successfully.');
    } catch (err) {
        console.error('Error updating category:', err);
    } finally {
        await pool.end();
    }
}

updateElectronicsImage();
