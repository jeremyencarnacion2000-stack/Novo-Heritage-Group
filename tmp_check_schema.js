const db = require('./lib/db').default;
async function checkSchema() {
  try {
    const columns = await db`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'properties'
    `;
    console.log(JSON.stringify(columns, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
checkSchema();
