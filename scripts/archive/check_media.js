import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = "postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

async function check() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    const resCount = await client.query('SELECT COUNT(*) FROM media_assets');
    console.log('Record Count in "media_assets":', resCount.rows[0].count);
  } catch (err) {
    console.error('Error querying media_assets:', err);
  } finally {
    await client.end();
  }
}

check();
