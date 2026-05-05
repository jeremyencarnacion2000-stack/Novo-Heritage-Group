import pkg from 'pg';
const { Client } = pkg;

async function testDB() {
    const connectionString = "postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";
    const client = new Client({ connectionString });

    console.log("🐘 Intentando conectar a Neon...");
    try {
        await client.connect();
        const res = await client.query('SELECT current_database(), now();');
        console.log("✅ Conexión EXITOSA:");
        console.log(res.rows[0]);

        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
        console.log(`📊 Tablas encontradas: ${tables.rows.length}`);
        console.log(tables.rows.map(t => t.table_name).join(', '));

    } catch (err) {
        console.error("❌ ERROR de conexión:");
        console.error(err.message);
    } finally {
        await client.end();
    }
}

testDB();
