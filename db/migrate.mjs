import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

const connectionString = 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full';

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
