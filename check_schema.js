import pkg from 'pg';
const { Client } = pkg;

const c = new Client({ 
  host: 'ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech', 
  database: 'neondb', 
  user: 'neondb_owner', 
  password: 'npg_Yhvk2DzABn6P', 
  port: 5432, 
  ssl: true 
});

async function checkSchema() {
  await c.connect();
  const res = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'properties'");
  console.log('--- PROPERTIES SCHEMA ---');
  res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
  await c.end();
}

checkSchema().catch(console.error);
