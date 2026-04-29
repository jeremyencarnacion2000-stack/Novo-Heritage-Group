import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = "postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

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
