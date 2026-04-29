const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require' });
async function run() {
  await client.connect();
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'properties';");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run();
