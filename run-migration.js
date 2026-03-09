
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eticaret_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'database', 'migration_add_guest_columns.sql'), 'utf8');
        await pool.query(sql);
        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
