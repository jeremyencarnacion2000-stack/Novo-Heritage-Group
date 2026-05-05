import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = "postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

async function check() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    const resCount = await client.query('SELECT COUNT(*) FROM properties');
    const resLatest = await client.query('SELECT title, sector, price, whatsapp_id, created_at FROM properties ORDER BY created_at DESC LIMIT 5');
    
    console.log('--- DATABASE STATUS ---');
    console.log('Record Count in "properties":', resCount.rows[0].count);
    console.log('\nLatest 5 Properties (V40.1):');
    resLatest.rows.forEach(r => {
      const idStr = r.whatsapp_id ? `[WA: ${r.whatsapp_id.slice(-8)}]` : '[NO ID]';
      console.log(`- ${idStr} ${r.title} (${r.sector}) - $${r.price} - Created: ${r.created_at}`);
    });
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await client.end();
  }
}

check();
