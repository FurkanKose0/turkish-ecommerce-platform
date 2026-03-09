const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_sql',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '258052',
});

const updates = [
    { name: 'Elektronik', url: 'https://cdn-icons-png.flaticon.com/128/3659/3659899.png' },
    { name: 'Moda', url: 'https://cdn-icons-png.flaticon.com/128/3659/3659905.png' },
    { name: 'Ev & Yaşam', url: 'https://cdn-icons-png.flaticon.com/128/3659/3659929.png' },
    { name: 'Kitap & Hobi', url: 'https://cdn-icons-png.flaticon.com/128/2232/2232688.png' },
    { name: 'Kozmetik', url: 'https://cdn-icons-png.flaticon.com/128/3050/3050215.png' },
    { name: 'Spor', url: 'https://cdn-icons-png.flaticon.com/128/857/857418.png' },
    { name: 'Anne & Bebek', url: 'https://cdn-icons-png.flaticon.com/128/3050/3050253.png' }
];

async function updateCategoryImages() {
    try {
        for (const cat of updates) {
            await pool.query('UPDATE categories SET image_url = $1 WHERE category_name = $2', [cat.url, cat.name]);
            console.log(`Updated ${cat.name}`);
        }
        console.log('All updates finished.');
    } catch (err) {
        console.error('Error updating categories:', err);
    } finally {
        await pool.end();
    }
}

updateCategoryImages();
