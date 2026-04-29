import postgres from 'postgres';
const sql = postgres('postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function check() {
  const bad = await sql`
    SELECT id, title, description, price, type 
    FROM properties
    ORDER BY created_at DESC
    LIMIT 20
  `;
  console.log("Top 20 freshest properties in Neon:");
  console.log(JSON.stringify(bad, null, 2));
  process.exit(0);
}
check();
