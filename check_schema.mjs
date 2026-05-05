import postgres from 'postgres';
const sql = postgres('postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full', { ssl: 'require' });

async function check() {
  const tables = ['properties', 'proyectos_data'];
  for (const table of tables) {
    const cols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = ${table}
      ORDER BY ordinal_position
    `;
    console.log(`--- Table: ${table} ---`);
    console.log(JSON.stringify(cols, null, 2));
  }
  process.exit(0);
}
check();
