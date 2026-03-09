const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_sql',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '258052',
});

const updates = [
    { name: 'Giyim', url: 'https://cdn-icons-png.flaticon.com/128/3659/3659905.png' },
    { name: 'Bilgisayar', url: 'https://cdn-icons-png.flaticon.com/128/3059/3059129.png' },
    { name: 'Telefon', url: 'https://cdn-icons-png.flaticon.com/128/2920/2920329.png' }
];

async function updateCategoryImages() {
    try {
        for (const cat of updates) {
            await pool.query('UPDATE categories SET image_url = $1 WHERE category_name = $2', [cat.url, cat.name]);
            console.log(`Updated ${cat.name}`);
        }
        console.log('Correction updates finished.');
    } catch (err) {
        console.error('Error updating categories:', err);
    } finally {
        await pool.end();
    }
}

updateCategoryImages();
