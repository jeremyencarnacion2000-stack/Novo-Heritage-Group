import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full';

async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  const res = await client.query('SELECT message FROM evolution."Message" WHERE "messageType" = \'imageMessage\' LIMIT 1');
  console.log(JSON.stringify(res.rows[0], null, 2));
  await client.end();
}

run().catch(console.error);
