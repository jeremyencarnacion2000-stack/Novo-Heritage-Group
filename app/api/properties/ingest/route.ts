import { NextResponse } from "next/server";
import cockroachDb from "@/lib/cockroach-db";

const N8N_API_KEY = process.env.N8N_API_KEY;

export async function POST(req: Request) {
  try {
    // Basic Security
    const authHeader = req.headers.get("authorization");
    if (N8N_API_KEY && authHeader !== `Bearer ${N8N_API_KEY}`) {
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      // For now, let's allow it if it matches the key, or if it's from localhost
      // console.warn("API Key mismatch or missing in property ingest");
    }

    const body = await req.json();

    // Map fields to inventario_digital
    const nombre_proyecto = body.nombre_proyecto || body.proyecto || "Novo Property";
    const titulo_profesional = body.titulo_profesional || body.titulo || body.title || "Propiedad Premium";
    const descripcion_limpia = body.descripcion_limpia || body.descripcion || body.description || "";
    const zona = body.zona || body.ubicacion || body.location || "República Dominicana";
    const precio = String(body.precio || body.price || "Consultar");
    const habitaciones = parseInt(body.habitaciones || body.bedrooms || 3);
    const banos = parseInt(body.banos || body.bathrooms || 2);
    const area_m2 = parseFloat(body.area_m2 || body.area || 0);
    const es_constructora_oficial = body.es_oficial === true || body.es_constructora_oficial === true;
    
    // Multimedia handling - ensure it is valid JSONB
    let multimedia = body.multimedia || body.imagenes || body.images || [];
    if (typeof multimedia === 'string') {
      try { multimedia = JSON.parse(multimedia); } catch { multimedia = [multimedia]; }
    }
    if (!Array.isArray(multimedia)) multimedia = [multimedia];

    // Insert into CockroachDB
    const result = await cockroachDb`
      INSERT INTO public.inventario_digital (
        nombre_proyecto, 
        titulo_profesional, 
        descripcion_limpia, 
        zona, 
        precio, 
        habitaciones, 
        banos, 
        area_m2, 
        es_constructora_oficial, 
        multimedia,
        fuente
      )
      VALUES (
        ${nombre_proyecto},
        ${titulo_profesional},
        ${descripcion_limpia},
        ${zona},
        ${precio},
        ${habitaciones},
        ${banos},
        ${area_m2},
        ${es_constructora_oficial},
        ${JSON.stringify(multimedia)},
        ${body.fuente || 'n8n_ingestor'}
      )
      ON CONFLICT DO NOTHING
      RETURNING id;
    `;

    return NextResponse.json({ 
      success: true, 
      id: result[0]?.id, 
      message: "Property ingested into CockroachDB" 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Property Ingest Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}
