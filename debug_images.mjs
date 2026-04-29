import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = 'postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  const res = await client.query('SELECT message FROM evolution."Message" WHERE "messageType" = \'imageMessage\' LIMIT 1');
  console.log(JSON.stringify(res.rows[0], null, 2));
  await client.end();
}

run().catch(console.error);
