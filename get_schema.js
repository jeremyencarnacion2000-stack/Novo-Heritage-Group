const postgres = require('postgres');
const sql = postgres('postgresql://angel:3dZYY-CDYXI07q_XqV6MIw@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb', {
  ssl: 'require'
});

async function getColumns() {
    try {
        console.log('Querying information_schema...');
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'inventario_digital'
            AND table_schema = 'public'
        `;
        console.log('COLUMNS_FOUND:');
        console.log(columns);
        
        console.log('Fetching one sample row:');
        const sample = await sql`SELECT * FROM public.inventario_digital LIMIT 1`;
        console.log('SAMPLE_ROW:');
        console.log(sample[0]);
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await sql.end();
        process.exit(0);
    }
}
getColumns();
