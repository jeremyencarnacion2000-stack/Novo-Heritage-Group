const properties = [
    {
        nombre_proyecto: "Ocean Bay - Cap Cana",
        titulo: "Lujoso Apartamento Vista al Mar",
        descripcion: "Exclusivo apartamento de 3 habitaciones en el corazón de Cap Cana. Acabados de lujo y acceso privado a la playa.",
        zona: "Cap Cana, Punta Cana",
        precio: "US$ 850,000",
        habitaciones: 3,
        banos: 3,
        area_m2: 245,
        es_oficial: true,
        multimedia: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop"
        ]
    },
    {
        nombre_proyecto: "Torre Novo Heritage",
        titulo: "Penthouse en el Centro de la Ciudad",
        descripcion: "Impresionante penthouse con vista 360 de Santo Domingo. Piscina privada y 4 parqueos.",
        zona: "Piantini, Santo Domingo",
        precio: "US$ 1,200,000",
        habitaciones: 4,
        banos: 4,
        area_m2: 450,
        es_oficial: true,
        multimedia: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
        ]
    }
];

async function backfill() {
    console.log("Starting manual backfill to CockroachDB via Ingest API...");
    for (const p of properties) {
        try {
            const res = await fetch("https://novo-heritage.vercel.app/api/properties/ingest", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOTY1ZWIxY2MtYmIyMi00MzZhLWIxYTUtNTA2ZjgzNmU5MzU3IiwiaWF0IjoxNzc4Mjc2MzU3fQ.03tz7CfKCJyUP_pdDLwk1r7aK4XLc5W6dQPgFtcsl1w"
                },
                body: JSON.stringify(p)
            });
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                console.log(`Ingested ${p.titulo}:`, data.success ? "OK" : data);
            } catch (jsonErr) {
                console.error(`Status ${res.status} for ${p.titulo}. Response raw:`, text.substring(0, 500));
            }
        } catch (e) {
            console.error(`Failed to ingest ${p.titulo}:`, e.message);
        }
    }
}
backfill();
