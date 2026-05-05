import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = "postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

async function testInsert() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    console.log('Testing dummy insert into "properties"...');
    const res = await client.query(`
      INSERT INTO properties (title, price, sector, whatsapp_id, is_published) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id`, 
      ['Test Pipeline Insertion', 999.99, 'Test Sector', 'TEST_ID_' + Date.now(), true]
    );
    console.log('Successfully inserted test record ID:', res.rows[0].id);
    
    // Cleanup the test record
    await client.query('DELETE FROM properties WHERE id = $1', [res.rows[0].id]);
    console.log('Test record cleaned up.');
    
  } catch (err) {
    console.error('CRITICAL: Manual insertion failed!', err);
  } finally {
    await client.end();
  }
}

testInsert();
