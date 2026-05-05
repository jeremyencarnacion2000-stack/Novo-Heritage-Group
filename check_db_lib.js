// We need to polyfill process.env for the lib to work outside of Next.js if it uses it.
process.env.COCKROACH_DATABASE_URL = 'postgresql://angel:3dZYY-CDYXI07q_XqV6MIw@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full';

const cockroachDb = require('./lib/cockroach-db').default;

async function check() {
  console.log('Connecting to CockroachDB via lib...');
  try {
    const res = await cockroachDb`
      SELECT id, nombre_proyecto, created_at
      FROM public.inventario_digital 
      ORDER BY id DESC 
      LIMIT 5
    `;
    console.log('LATEST_ENTRIES:', JSON.stringify(res, null, 2));
    
    const count = await cockroachDb`SELECT COUNT(*) FROM public.inventario_digital`;
    console.log('TOTAL_COUNT:', count[0].count);
    
  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    process.exit(0);
  }
}

check();
