const postgres = require('postgres');

const sql = postgres('postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function createSchema() {
    try {
        await sql`CREATE SCHEMA IF NOT EXISTS evolution;`;
        console.log("Schema 'evolution' created successfully.");
    } catch (err) {
        console.error("Error creating schema:", err);
    } finally {
        process.exit(0);
    }
}

createSchema();
