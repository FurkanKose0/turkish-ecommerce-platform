const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_sql',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '258052',
});

const updates = [
    { name: 'iPhone 15 Pro', url: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&auto=format&fit=crop&q=60' },
    { name: 'Samsung Galaxy S24', url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=60' },
    { name: 'Kadın Elbise', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=60' },
    { name: 'Kanepe Takımı', url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&auto=format&fit=crop&q=60' },
    { name: 'Laptop Dell XPS 15', url: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=500&auto=format&fit=crop&q=60' },
    { name: 'Dekoratif Vazo', url: 'https://images.unsplash.com/photo-1581783342308-f792ca11dfdd?w=500&auto=format&fit=crop&q=60' },
    { name: 'Erkek Polo Tişört', url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500&auto=format&fit=crop&q=60' },
    { name: 'Gaming Mouse', url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&auto=format&fit=crop&q=60' },
    { name: 'Premium Üyelik - Yıllık', url: 'https://images.unsplash.com/photo-1556742046-8069509dfac5?w=500&auto=format&fit=crop&q=60' }, // Abstract Gold/Premium
    { name: 'Premium Üyelik - Aylık', url: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=500&auto=format&fit=crop&q=60' }  // Abstract Silver
];

async function updateProductImages() {
    try {
        console.log('Updating product images...');
        for (const prod of updates) {
            await pool.query('UPDATE products SET image_url = $1 WHERE product_name = $2', [prod.url, prod.name]);
            console.log(`Updated ${prod.name}`);
        }
        console.log('All product images updated.');
    } catch (err) {
        console.error('Error updating products:', err);
    } finally {
        await pool.end();
    }
}

updateProductImages();
