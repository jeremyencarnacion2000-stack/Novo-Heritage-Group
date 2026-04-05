import sql from './lib/db';
async function check() {
  try {
    const cols = await sql.unsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'inventario_digital'");
    console.log(JSON.stringify(cols, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
check();
