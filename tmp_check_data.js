const db = require('./lib/db').default;
async function checkData() {
  try {
    const properties = await db`SELECT * FROM properties LIMIT 5`;
    console.log(JSON.stringify(properties, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
checkData();
