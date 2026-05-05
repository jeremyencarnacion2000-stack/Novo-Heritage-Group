const postgres = require('postgres');
const sql = postgres('postgresql://angel:3dZYY-CDYXI07q_XqV6MIw@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=require');

async function check() {
  console.log('Connecting to CockroachDB...');
  try {
    const res = await sql`
      SELECT *
      FROM public.inventario_digital 
      ORDER BY id DESC 
      LIMIT 1
    `;
    console.log('LATEST_FULL_ROW:');
    console.log(JSON.stringify(res, null, 2));
    
  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

check();
