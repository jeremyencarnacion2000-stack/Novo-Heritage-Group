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

async function checkCounts() {
  await c.connect();
  const r1 = await c.query('SELECT COUNT(*) FROM evolution."Message" WHERE "messageType" IN (\'conversation\', \'extendedTextMessage\')');
  const r2 = await c.query('SELECT COUNT(*) FROM evolution."Message" WHERE "messageType" = \'imageMessage\'');
  console.log('--- DATA AUDIT ---');
  console.log('Text Messages:', r1.rows[0].count);
  console.log('Image Messages:', r2.rows[0].count);
  await c.end();
}

checkCounts().catch(console.error);
