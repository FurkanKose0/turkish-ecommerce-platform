const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_sql',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '258052',
});

// Using Unsplash source URLs for realistic images
const updates = [
    { name: 'Elektronik', url: 'https://images.unsplash.com/photo-1498049394049-71471d0ae657?w=500&auto=format&fit=crop&q=60' },
    { name: 'Bilgisayar', url: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=500&auto=format&fit=crop&q=60' },
    { name: 'Telefon', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60' },
    { name: 'Giyim', url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop&q=60' },
    { name: 'Erkek Giyim', url: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=500&auto=format&fit=crop&q=60' },
    { name: 'Kadın Giyim', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=60' },
    { name: 'Ev & Yaşam', url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&auto=format&fit=crop&q=60' },
    { name: 'Mobilya', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60' },
    { name: 'Dekorasyon', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=60' }
];

async function updateCategoryImages() {
    try {
        console.log('Updating category images to realistic photos...');
        for (const cat of updates) {
            await pool.query('UPDATE categories SET image_url = $1 WHERE category_name = $2', [cat.url, cat.name]);
            console.log(`Updated ${cat.name}`);
        }
        console.log('All categories updated with realistic images.');
    } catch (err) {
        console.error('Error updating categories:', err);
    } finally {
        await pool.end();
    }
}

updateCategoryImages();
