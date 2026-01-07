
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// require('dotenv').config({ path: '.env.local' });

// Configuration for connecting to the default 'postgres' database
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default db first
};

const targetDbName = process.env.DB_NAME || 'eticaret_db';

async function setup() {
    const pool = new Pool(config);

    try {
        // 1. Create Database
        console.log(`Connecting to ${config.database}...`);
        const client = await pool.connect();

        try {
            // Check if db exists
            const checkRes = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDbName]);
            if (checkRes.rowCount === 0) {
                console.log(`Creating database ${targetDbName}...`);
                await client.query(`CREATE DATABASE ${targetDbName}`);
                console.log(`Database ${targetDbName} created.`);
            } else {
                console.log(`Database ${targetDbName} already exists.`);
            }
        } catch (err) {
            console.error('Error checking/creating database:', err);
            process.exit(1);
        } finally {
            client.release();
        }

        // Close pool to postgres
        await pool.end();

        // 2. Connect to the new database
        console.log(`Connecting to ${targetDbName}...`);
        const dbPool = new Pool({ ...config, database: targetDbName });
        const dbClient = await dbPool.connect();

        try {
            // execute scripts in order
            const scripts = [
                'schema.sql',
                'triggers.sql',
                'procedures.sql',
                'views.sql',
                'seed_data.sql'
            ];

            for (const script of scripts) {
                const filePath = path.join(__dirname, 'database', script);
                console.log(`Executing ${script}...`);
                const sql = fs.readFileSync(filePath, 'utf8');
                await dbClient.query(sql);
                console.log(`✅ ${script} completed.`);
            }

            console.log('🎉 Database setup completed successfully!');

        } catch (err) {
            console.error('Error executing scripts:', err);
        } finally {
            dbClient.release();
            await dbPool.end();
        }

    } catch (err) {
        console.error('Setup failed:', err);
    }
}

setup();
