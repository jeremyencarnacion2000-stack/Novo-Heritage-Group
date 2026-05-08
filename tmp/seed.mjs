import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Manual env parse to avoid dependency issues
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
    console.log("Seeding CockroachDB from .env.local...");

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

    // Clear existing to avoid duplicates during this task
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
            multimedia: ["/luxury_modern_villa_renaissance.png"]
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
            multimedia: ["/modern_minimalist_house_pushkino.png"]
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
            multimedia: ["/contemporary_house_barminka.png"]
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
            multimedia: ["/elegant_modern_home_venice.png"]
        },
        {
            titulo: "Ocean View Estate - Las Terrenas",
            proyecto: "Terrenas Legacy",
            precio: "$1,200,000",
            zona: "Las Terrenas",
            hab: 4,
            banos: 4,
            area: 400,
            desc: "Santuario tropical frente al mar. Diseño abierto que integra la naturaleza con el lujo contemporáneo.",
            multimedia: ["/luxury-modern-villa-renaissance.png"]
        }
    ];

    for (const p of properties) {
        await sql`
            INSERT INTO public.inventario_digital (
                titulo_profesional, nombre_proyecto, precio, zona, habitaciones, banos, area_m2, descripcion_limpia, multimedia, es_constructora_oficial, featured
            ) VALUES (
                ${p.titulo}, ${p.proyecto}, ${p.precio}, ${p.zona}, ${p.hab}, ${p.banos}, ${p.area}, ${p.desc}, ${JSON.stringify(p.multimedia)}, true, true
            )
        `;
    }

    console.log("Seeding complete successfully with clean env.");
    process.exit(0);
}

seed().catch(err => {
    console.error("Seeding error:", err);
    process.exit(1);
});
