import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = "postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function alter() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to Neon Postgres.');

    console.log('Adding columns to "properties" table...');
    await client.query(`
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS whatsapp_id TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
    `);
    console.log('✅ Columns "whatsapp_id" and "is_published" added (or already exist).');

    // Optionally check result
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'properties' AND column_name IN ('whatsapp_id', 'is_published')");
    console.log('Verification:', res.rows.map(r => r.column_name));

  } catch (err) {
    console.error('Error altering schema:', err);
  } finally {
    await client.end();
  }
}

alter();
