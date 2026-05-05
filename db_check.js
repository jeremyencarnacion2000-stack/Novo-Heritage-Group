const postgres = require('postgres');

const sql = postgres('postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full');

async function checkDb() {
    try {
        const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
        console.log("Tables:", tables.map(t => t.table_name));

        if (tables.some(t => t.table_name === 'Typebot')) {
            const typebots = await sql`SELECT * FROM "Typebot"`;
            console.log("Typebots:", typebots);
        }

        // Check for Typebot tables, or Instance tables, or Bot tables
        const relatedTables = tables.filter(t => t.table_name.toLowerCase().includes('typebot') || t.table_name.toLowerCase().includes('bot') || t.table_name.toLowerCase().includes('integration'));

        for (const table of relatedTables) {
            console.log(`\nTable: ${table.table_name}`);
            const rows = await sql`SELECT * FROM ${sql(table.table_name)} LIMIT 5`;
            console.log(rows);
        }

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkDb();
