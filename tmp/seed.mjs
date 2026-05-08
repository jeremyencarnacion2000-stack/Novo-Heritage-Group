import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Manual env parse
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
    }
});

const url = env.COCKROACH_DATABASE_URL || env.DATABASE_URL;

if (!url) {
    console.error("No database URL found in .env.local");
    process.exit(1);
}

const sql = postgres(url, { ssl: 'require' });

async function seed() {
    console.log("Seeding CockroachDB...");

    // 1. Ensure table exists
    await sql`
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
    `;

    // 2. Ensure extra columns exist (in case table was created previously without them)
    try {
        await sql`ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS fuente VARCHAR(100) DEFAULT 'seeder'`;
        await sql`ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS es_constructora_oficial BOOLEAN DEFAULT false`;
        await sql`ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT true`;
        await sql`ALTER TABLE public.inventario_digital ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    } catch (e) {
        console.log("Note: Some columns might already exist.");
    }

    // 3. Clear existing seeder data
    await sql`DELETE FROM public.inventario_digital WHERE fuente = 'seeder'`;

    const properties = [
        {
            titulo: "Villa Renaissance - Cap Cana",
            proyecto: "Renaissance Residences",
            precio: "$2,850,000",
            zona: "Cap Cana",
            hab: 5,
            banos: 6,
            area: 950,
            desc: "Impresionante villa de lujo con diseño ultramoderno, techos de doble altura y piscina infinita con vistas al mar. Ubicada en el exclusivo enclave de Cap Cana.",
            multimedia: ["https://images.unsplash.com/photo-1613490908571-9ce224eba83a?q=80&w=2070&auto=format&fit=crop"]
        },
        {
            titulo: "Penthouse Naco Signature",
            proyecto: "Naco Signature Tower",
            precio: "$890,000",
            zona: "Naco",
            hab: 3,
            banos: 3,
            area: 320,
            desc: "Penthouse de dos niveles con vistas 360 de la ciudad. Acabados en mármol italiano, cocina de diseño y domótica integrada.",
            multimedia: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"]
        },
        {
            titulo: "Altos de Chavón Heritage",
            proyecto: "Chavón Heritage Estate",
            precio: "$1,450,000",
            zona: "La Romana",
            hab: 4,
            banos: 5,
            area: 550,
            desc: "Propiedad clásica inspirada en la arquitectura colonial con comodidades modernas. Extensos jardines y acceso preferencial al club de golf.",
            multimedia: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"]
        },
        {
            titulo: "Venice Luxury Loft",
            proyecto: "Venice Gardens",
            precio: "$420,000",
            zona: "Piantini",
            hab: 2,
            banos: 2,
            area: 145,
            desc: "Loft ejecutivo con ventanales de piso a techo. Ubicación envidiable cerca de los principales centros comerciales de la ciudad.",
            multimedia: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop"]
        }
    ];

    for (const p of properties) {
        await sql`
            INSERT INTO public.inventario_digital (
                titulo_profesional, nombre_proyecto, precio, zona, habitaciones, banos, area_m2, descripcion_limpia, multimedia, es_constructora_oficial, featured, fuente
            ) VALUES (
                ${p.titulo}, ${p.proyecto}, ${p.precio}, ${p.zona}, ${p.hab}, ${p.banos}, ${p.area}, ${p.desc}, ${JSON.stringify(p.multimedia)}, true, true, 'seeder'
            )
        `;
    }

    console.log("✅ Seeding complete successfully.");
    process.exit(0);
}

seed().catch(err => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
});
