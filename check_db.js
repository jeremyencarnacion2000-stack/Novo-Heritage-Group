const postgres = require('postgres');
const sql = postgres('postgresql://angel:3dZYY-CDYXI07q_XqV6MIw@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=require');

async function check() {
  console.log('Connecting to CockroachDB...');
  try {
    const res = await sql`
      SELECT id, nombre_proyecto, created_at, multimedia 
      FROM public.inventario_digital 
      ORDER BY id DESC 
      LIMIT 10
    `;
    console.log('LATEST_ENTRIES:');
    console.log(JSON.stringify(res, null, 2));
    
    const count = await sql`SELECT COUNT(*) FROM public.inventario_digital`;
    console.log('TOTAL_COUNT:', count[0].count);
    
  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

check();
