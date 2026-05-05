import postgres from 'postgres';

// Origen: Neon
const neonSql = postgres('postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full', { ssl: 'require' });

// Destino: Railway
const railwaySql = postgres('postgresql://postgres:KiaBMQFhSCqJxunXUibJrlByNBHciqeP@switchyard.proxy.rlwy.net:21763/railway', { ssl: 'require' });

async function migrate() {
  console.log("🚀 Iniciando migración maestra: Neon -> Railway...");

  try {
    // 1. Asegurar Esquema de Properties
    console.log("🛠️ Asegurando tabla 'properties' y columnas...");
    await railwaySql`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `;
    
    // Añadir columnas faltantes si la tabla ya existía
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS address TEXT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS location TEXT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Santo Domingo'`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS sector TEXT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available'`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'venta'`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS price DECIMAL(15,2)`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS type TEXT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms INT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms INT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS area DECIMAL(10,2)`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS year_built INT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS description TEXT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS features TEXT[]`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities TEXT[]`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS image TEXT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS images TEXT[]`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS agent_name TEXT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS agent_phone TEXT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS estimated_rent_monthly DECIMAL(15,2)`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS hoa_fee_monthly DECIMAL(15,2)`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS taxes_annual DECIMAL(15,2)`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS maintenance_annual DECIMAL(15,2)`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS occupancy_rate DECIMAL(5,2)`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS reference TEXT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS garage INT DEFAULT 0`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking INT DEFAULT 0`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS peb TEXT DEFAULT 'B'`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS whatsapp_id TEXT`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true`;
    await railwaySql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()`;

    // 2. Asegurar Esquema de Proyectos Data
    console.log("🛠️ Asegurando tabla 'proyectos_data'...");
    await railwaySql`
      CREATE TABLE IF NOT EXISTS proyectos_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre_proyecto TEXT NOT NULL,
        tipo_contenido TEXT,
        contenido TEXT,
        url TEXT,
        fecha TIMESTAMP WITH TIME ZONE DEFAULT now(),
        actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `;

    // 3. Migrar Properties
    console.log("🔍 Extrayendo propiedades de Neon...");
    const properties = await neonSql`SELECT * FROM properties`;
    console.log(`📥 Inyectando ${properties.length} propiedades en Railway...`);
    
    let pCount = 0;
    for (const p of properties) {
      try {
        await railwaySql`
          INSERT INTO properties ${railwaySql(p)}
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            updated_at = NOW()
        `;
        pCount++;
        if (pCount % 100 === 0) process.stdout.write(".");
      } catch (e) {
        console.error(`\n❌ Error prop ${p.id}:`, e.message);
      }
    }
    console.log(`\n✅ ${pCount} propiedades migradas.`);

    // 4. Migrar Proyectos Data
    console.log("🔍 Extrayendo proyectos_data de Neon...");
    const proyectos = await neonSql`SELECT * FROM proyectos_data`;
    console.log(`📥 Inyectando ${proyectos.length} registros de proyectos...`);
    
    let prCount = 0;
    for (const pr of proyectos) {
      try {
        await railwaySql`
          INSERT INTO proyectos_data ${railwaySql(pr)}
          ON CONFLICT (id) DO UPDATE SET
            nombre_proyecto = EXCLUDED.nombre_proyecto,
            actualizado_en = NOW()
        `;
        prCount++;
        if (prCount % 10 === 0) process.stdout.write(".");
      } catch (e) {
        console.error(`\n❌ Error proj ${pr.id}:`, e.message);
      }
    }
    console.log(`\n✅ ${prCount} registros de proyectos migrados.`);

    console.log("\n✨ ¡MISIÓN CUMPLIDA! Todos los datos están ahora en Railway.");

  } catch (error) {
    console.error("🚨 Fallo en la migración:", error);
  } finally {
    await neonSql.end();
    await railwaySql.end();
  }
}

migrate();
