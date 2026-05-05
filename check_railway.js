const postgres = require('postgres');
const sql = postgres('postgresql://jencarnacion:p9K7tIu6M2O4R8@viaduct.proxy.rlwy.net:19315/railway', {
  ssl: 'require'
});

async function check() {
  console.log('Connecting to Railway...');
  try {
    const res = await sql`SELECT * FROM public.inventario_digital LIMIT 1`;
    console.log('RAILWAY_SAMPLE:');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}
check();
