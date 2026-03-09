const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_sql',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '258052',
});

const updates = [
    // iPhone 15 Pro - Official Apple/Retailer look
    { name: 'iPhone 15 Pro', url: 'https://cdn.vatanbilgisayar.com/Upload/PRODUCT/apple/thumb/140220-1_large.jpg' },

    // Samsung Galaxy S24
    { name: 'Samsung Galaxy S24', url: 'https://cdn.vatanbilgisayar.com/Upload/PRODUCT/samsung/thumb/143534-1_large.jpg' },

    // Kadın Elbise - LC Waikiki Real Product
    { name: 'Kadın Elbise', url: 'https://img-lcwaikiki.mncdn.com/mnresize/1024/-/pim/productimages/20231/6407028/v1/l_20231-s3gn18z8-lfe_a.jpg' },

    // Kanepe Takımı - IKEA Real Product
    { name: 'Kanepe Takımı', url: 'https://cdn.ikea.com.tr/urunler/2000_2000/PE838612.jpg' },

    // Laptop Dell XPS 15
    { name: 'Laptop Dell XPS 15', url: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/15/9520/media-gallery/black/notebook-xps-15-9520-black-gallery-3.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=536&qlt=100,0&resMode=sharp2&size=536,402&chrss=full' },

    // Dekoratif Vazo - IKEA Real Product
    { name: 'Dekoratif Vazo', url: 'https://cdn.ikea.com.tr/urunler/2000_2000/PE707621.jpg' },

    // Erkek Polo Tişört - LC Waikiki Real Product
    { name: 'Erkek Polo Tişört', url: 'https://img-lcwaikiki.mncdn.com/mnresize/1024/-/pim/productimages/20221/5766863/v1/l_20221-s26315z8-cvl_a.jpg' },

    // Gaming Mouse - Logitech Official
    { name: 'Gaming Mouse', url: 'https://resource.logitech.com/w_692,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/g502-hero/g502-hero-gallery-1.png?v=1' },

    // Premium Üyelik - Yıllık (Gold Card concept)
    { name: 'Premium Üyelik - Yıllık', url: 'https://img.freepik.com/premium-vector/luxury-gold-member-card-template-vector-vip-card-design_6869-2342.jpg' },

    // Premium Üyelik - Aylık (Silver/Standard Card concept)
    { name: 'Premium Üyelik - Aylık', url: 'https://img.freepik.com/premium-vector/modern-vip-member-card-template-vector-premium-card-design_6869-2346.jpg' }
];

async function updateProductImages() {
    try {
        console.log('Updating products with specific, non-copyright-worried real images...');
        for (const prod of updates) {
            await pool.query('UPDATE products SET image_url = $1 WHERE product_name = $2', [prod.url, prod.name]);
            console.log(`Updated ${prod.name}`);
        }
        console.log('All product images updated with real photos.');
    } catch (err) {
        console.error('Error updating products:', err);
    } finally {
        await pool.end();
    }
}

updateProductImages();
