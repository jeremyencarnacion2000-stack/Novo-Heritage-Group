import postgres from 'postgres';
const sql = postgres('postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full');

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
