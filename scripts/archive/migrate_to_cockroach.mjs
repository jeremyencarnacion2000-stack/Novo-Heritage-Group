import pkg from 'pg';
const { Client } = pkg;

const NEON_URL = "postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";
const COCKROACH_URL = "postgresql://angel:3dZYY-CDYXI07q_XqV6MIw@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

// Note: For verify-full in Node.js without certificate file, we might need to use rejectUnauthorized: false 
// if the system doesn't have the CA. But let's try the URL first.

async function migrate() {
  const neon = new Client({ connectionString: NEON_URL });
  const cockroach = new Client({ 
    user: 'angel',
    host: 'long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud',
    database: 'defaultdb',
    password: 'NegdPai-zZFnyyNsT2jdmg',
    port: 26257,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await neon.connect();
    await cockroach.connect();
    console.log('Connected to both databases.');

    // 1. Create table in CockroachDB
    console.log('Creating table in CockroachDB...');
    await cockroach.query(`
      CREATE TABLE IF NOT EXISTS public.inventario_digital (
        id SERIAL PRIMARY KEY,
        nombre_proyecto TEXT UNIQUE,
        tipo_activo TEXT,
        url_activo TEXT,
        stock_disponible BOOLEAN,
        zona TEXT,
        comision TEXT,
        precio TEXT,
        descripcion TEXT,
        contacto TEXT,
        metadata JSONB,
        multimedia JSONB DEFAULT '[]',
        titulo_profesional TEXT,
        es_constructora_oficial BOOLEAN DEFAULT FALSE,
        descripcion_limpia TEXT,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Fetch data from Neon
    console.log('Fetching data from Neon...');
    const res = await neon.query('SELECT * FROM public.inventario_digital');
    console.log(`Found ${res.rows.length} rows.`);

    // 3. Insert into CockroachDB
    console.log('Inserting data into CockroachDB...');
    for (const row of res.rows) {
      await cockroach.query(`
        INSERT INTO public.inventario_digital 
        (nombre_proyecto, tipo_activo, url_activo, stock_disponible, zona, comision, precio, descripcion, contacto, metadata, multimedia, titulo_profesional, es_constructora_oficial, descripcion_limpia)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (nombre_proyecto) DO NOTHING
      `, [
        row.nombre_proyecto, row.tipo_activo, row.url_activo, row.stock_disponible, 
        row.zona, row.comision, row.precio, row.descripcion, row.contacto, 
        row.metadata, row.multimedia || [], row.titulo_profesional || null, 
        row.es_constructora_oficial || false, row.descripcion_limpia || null
      ]);
    }

    console.log('SUCCESS: Migration complete.');

  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await neon.end();
    await cockroach.end();
  }
}

migrate();
