import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const connectionString = 'postgresql://neondb_owner:npg_Yhvk2DzABn6P@ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sql = postgres(connectionString);

async function migrate() {
  try {
    console.log('🚀 Iniciando migración en Neon...');
    const setupSqlPath = path.join(process.cwd(), 'db', 'setup_complete.sql');
    const setupSql = fs.readFileSync(setupSqlPath, 'utf8');

    // Ejecutar el script SQL completo
    await sql.unsafe(setupSql);

    console.log('✅ Migración completada con éxito.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sql.end();
  }
}

migrate();
