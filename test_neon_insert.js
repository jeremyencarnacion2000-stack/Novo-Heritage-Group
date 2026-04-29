import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = "postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

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
