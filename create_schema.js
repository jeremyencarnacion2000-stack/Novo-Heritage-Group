const postgres = require('postgres');

const sql = postgres('postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full');

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
