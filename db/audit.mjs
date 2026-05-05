import postgres from 'postgres';

const connectionString = 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full';
const sql = postgres(connectionString);

async function audit() {
    try {
        console.log('--- AUDITANDO TABLAS EN NEON ---');
        const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
        console.log('Tablas encontradas:', tables.map(t => t.table_name).join(', '));

        for (const table of tables) {
            const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = ${table.table_name}
        `;
            console.log(`\nTabla: ${table.table_name}`);
            columns.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
        }

    } catch (error) {
        console.error('Error durante la auditoría:', error);
    } finally {
        await sql.end();
    }
}

audit();
