import postgres from 'postgres';

const connectionString = 'postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
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
