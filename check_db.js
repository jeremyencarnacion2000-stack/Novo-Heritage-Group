import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = "postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

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
