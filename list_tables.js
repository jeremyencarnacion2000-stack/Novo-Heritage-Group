import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = "postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

async function check() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in database:');
    res.rows.forEach(r => console.log(`- ${r.table_name}`));
  } catch (err) {
    console.error('Error querying tables:', err);
  } finally {
    await client.end();
  }
}

check();
