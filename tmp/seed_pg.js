const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full'
});

async function main() {
  await client.connect();
  console.log("Connected to CockroachDB (pg client)");

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

  await client.query("ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS fuente VARCHAR(100) DEFAULT 'seeder'");
  await client.query("ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS es_constructora_oficial BOOLEAN DEFAULT false");
  await client.query("ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT true");

  await client.query("DELETE FROM public.inventario_digital WHERE fuente = 'seeder'");

  const properties = [
    { title: "Villa Imperial Cap Cana", price: "$4,500,000", img: "https://images.unsplash.com/photo-1613490908571-9ce224eba83a?q=80&w=2070&auto=format&fit=crop" },
    { title: "Penthouse Signature Piantini", price: "$1,800,000", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop" },
    { title: "Mansión de Cristal Casa de Campo", price: "$7,200,000", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop" }
  ];

  for (const p of properties) {
    await client.query(
      "INSERT INTO public.inventario_digital (titulo_profesional, precio, multimedia, fuente, created_at) VALUES ($1, $2, $3, 'seeder', NOW())", 
      [p.title, p.price, JSON.stringify([p.img])]
    );
  }

  console.log("Seeding complete with pg client.");
  await client.end();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
