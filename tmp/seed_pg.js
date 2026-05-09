const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full'
});

async function main() {
  await client.connect();
  console.log("Connected to CockroachDB (pg client)");

  // 1. Create table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.inventario_digital (
        id SERIAL PRIMARY KEY,
        titulo_profesional VARCHAR(255),
        fuente VARCHAR(100) DEFAULT 'seeder'
    );
  `);

  // 2. Ensure all columns (Robust approach)
  const cols = [
    "nombre_proyecto VARCHAR(255)",
    "precio VARCHAR(100)",
    "zona VARCHAR(255)",
    "habitaciones INT",
    "banos INT",
    "area_m2 FLOAT",
    "descripcion_limpia TEXT",
    "multimedia JSONB DEFAULT '[]'",
    "es_constructora_oficial BOOLEAN DEFAULT false",
    "featured BOOLEAN DEFAULT true",
    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
  ];

  for(const colSpec of cols) {
    try {
      await client.query(`ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS ${colSpec}`);
    } catch(e) {}
  }

  // 3. Clear seeder data
  await client.query("DELETE FROM public.inventario_digital WHERE fuente = 'seeder'");

  // 4. Seed 
  const props = [
    { 
        title: "Villa Renaissance - Cap Cana", 
        price: "$2,850,000", 
        img: "https://images.unsplash.com/photo-1613490908571-9ce224eba83a?q=80&w=2070&auto=format&fit=crop",
        desc: "Lujo en Cap Cana.",
        zona: "Cap Cana",
        hab: 5,
        banos: 6,
        area: 950
    },
    { 
        title: "Penthouse Naco Signature", 
        price: "$890,000", 
        img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
        desc: "Vista 360 Piantini.",
        zona: "Naco",
        hab: 3,
        banos: 3,
        area: 320
    }
  ];

  for (const p of props) {
    await client.query(
      `INSERT INTO public.inventario_digital (
        titulo_profesional, precio, multimedia, fuente, descripcion_limpia, zona, habitaciones, banos, area_m2, created_at
      ) VALUES ($1, $2, $3, 'seeder', $4, $5, $6, $7, $8, NOW())`, 
      [p.title, p.price, JSON.stringify([p.img]), p.desc, p.zona, p.hab, p.banos, p.area]
    );
  }

  console.log("✅ SEEDED SUCCESSFULLY");
  await client.end();
}

main().catch(err => {
    console.error("❌ ERROR:", err);
    process.exit(1);
});
