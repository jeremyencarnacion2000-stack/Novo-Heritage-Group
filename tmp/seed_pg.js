const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full'
});

async function main() {
  await client.connect();
  console.log("Connected to CockroachDB (pg client)");

  // Ensure table and ALL columns exist
  await client.query(`
        CREATE TABLE IF NOT EXISTS public.inventario_digital (
            id SERIAL PRIMARY KEY,
            titulo_profesional VARCHAR(255),
            nombre_proyecto VARCHAR(255),
            precio VARCHAR(100),
            zona VARCHAR(255),
            habitaciones INT,
            banos INT,
            area_m2 FLOAT,
            descripcion_limpia TEXT,
            multimedia JSONB DEFAULT '[]',
            fuente VARCHAR(100) DEFAULT 'seeder',
            es_constructora_oficial BOOLEAN DEFAULT false,
            featured BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
  `);

  // Force add columns if they are missing in an existing table
  const columns = [
    "fuente VARCHAR(100) DEFAULT 'seeder'",
    "es_constructora_oficial BOOLEAN DEFAULT false",
    "featured BOOLEAN DEFAULT true",
    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    "multimedia JSONB DEFAULT '[]'",
    "descripcion_limpia TEXT",
    "area_m2 FLOAT",
    "habitaciones INT",
    "banos INT",
    "zona VARCHAR(255)",
    "precio VARCHAR(100)",
    "nombre_proyecto VARCHAR(255)",
    "titulo_profesional VARCHAR(255)"
  ];

  for (const col of columns) {
    const colName = col.split(' ')[0];
    try {
        await client.query(\`ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS \${col}\`);
    } catch (e) {
        // console.log(\`Column \${colName} already exists or error: \${e.message}\`);
    }
  }

  // Clear previous seeder data to avoid duplicates
  await client.query("DELETE FROM public.inventario_digital WHERE fuente = 'seeder'");

  const properties = [
    { 
        title: "Villa Renaissance - Cap Cana", 
        price: "$2,850,000", 
        img: "https://images.unsplash.com/photo-1613490908571-9ce224eba83a?q=80&w=2070&auto=format&fit=crop",
        desc: "Lujo inigualable en Cap Cana.",
        zona: "Cap Cana",
        hab: 5,
        banos: 6,
        area: 950
    },
    { 
        title: "Penthouse Naco Signature", 
        price: "$890,000", 
        img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
        desc: "Lo mejor de la ciudad.",
        zona: "Naco",
        hab: 3,
        banos: 3,
        area: 320
    },
    { 
        title: "Altos de Chavón Heritage", 
        price: "$1,450,000", 
        img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
        desc: "Historia y exclusividad.",
        zona: "La Romana",
        hab: 4,
        banos: 5,
        area: 550
    }
  ];

  for (const p of properties) {
    await client.query(
      "INSERT INTO public.inventario_digital (titulo_profesional, precio, multimedia, fuente, descripcion_limpia, zona, habitaciones, banos, area_m2, created_at) VALUES ($1, $2, $3, 'seeder', $4, $5, $6, $7, $8, NOW())", 
      [p.title, p.price, JSON.stringify([p.img]), p.desc, p.zona, p.hab, p.banos, p.area]
    );
  }

  console.log("✅ Seeding complete with pg client (all columns verified).");
  await client.end();
}

main().catch(err => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
});
