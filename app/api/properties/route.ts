import { NextResponse } from "next/server"
import cockroachDb from "@/lib/cockroach-db"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const debug = searchParams.get('debug') === 'true';

  try {
    // Fetch all columns to prevent hardcoding
    const data = await cockroachDb`
      SELECT *
      FROM public.inventario_digital
      WHERE (nombre_proyecto IS NOT NULL AND nombre_proyecto NOT IN ('Sin nombre', 'Parseo fallido', 'No disponible', ''))
         OR (titulo_profesional IS NOT NULL AND titulo_profesional NOT IN ('', 'Proyecto Novo'))
      ORDER BY id DESC
      LIMIT 100
    `;

    if (debug) {
      return NextResponse.json({
        count: data?.length || 0,
        sample: data?.[0] || null,
        raw: data
      });
    }

    if (!data || data.length === 0) {
      return NextResponse.json([])
    }

    const mapped = (data || []).map((p: any) => {
      // Parse price string to number
      let priceNum = 0;
      if (p.precio) {
        const cleaned = String(p.precio).replace(/[^0-9.,]/g, '').replace(',', '.');
        priceNum = parseFloat(cleaned) || 0;
      }

      // Multimedia handling (CockroachDB often returns JSON objects or strings)
      let images: string[] = [];
      try {
        const rawMultimedia = p.multimedia || p.imagenes || [];
        const parsed = typeof rawMultimedia === 'string' ? JSON.parse(rawMultimedia) : rawMultimedia;
        if (Array.isArray(parsed)) {
          images = parsed.filter((u: any) => u && typeof u === 'string' && u.startsWith('http'));
        } else if (typeof parsed === 'object' && parsed !== null) {
          // If it's a single object, extract values
          images = Object.values(parsed).filter((u: any) => typeof u === 'string' && u.startsWith('http')) as string[];
        }
      } catch { /* ignore */ }

      const primaryImage = images[0] || "/luxury-modern-villa-renaissance.png";

      return {
        id: String(p.id),
        title: p.titulo_profesional || p.nombre_proyecto || "Propiedad Novo Heritage",
        location: p.zona || "República Dominicana",
        address: p.zona || "Ubicación Premium",
        status: 'available',
        price: priceNum,
        priceLabel: p.precio || 'Consultar',
        type: "propiedad",
        bedrooms: parseInt(p.habitaciones || 3),
        bathrooms: parseInt(p.banos || 2),
        area: parseFloat(p.area_m2 || 150),
        sqft: Math.round(parseFloat(p.area_m2 || 150) * 10.764),
        yearBuilt: new Date().getFullYear(),
        description: p.descripcion_limpia || "Propiedad gestionada por Novo Heritage Group.",
        features: p.es_constructora_oficial ? ["Constructora Oficial", "Proyecto Verificado"] : ["Novo Exclusive"],
        agent: {
          name: 'Novo Heritage Real Estate',
          phone: '+1 809-555-0123',
        },
        image: primaryImage,
        images: images.length > 0 ? images : [primaryImage],
        reference: `NH-${String(p.id).padStart(4, '0')}`,
        featured: p.es_constructora_oficial === true,
        city: p.zona || 'Santo Domingo',
        sector: p.zona || 'N/A',
        parking: parseInt(p.parqueos || 1),
        amenities: [],
        transactionType: 'venta',
        isOfficial: p.es_constructora_oficial,
        subtitle: p.nombre_proyecto || '',
      }
    })

    return NextResponse.json(mapped)
  } catch (err: any) {
    console.error('Properties fetch error:', err);
    
    // Fallback: Si hay error de conexión (ECONNREFUSED), devolver array vacío o loguear
    if (err.message?.includes('ECONNREFUSED')) {
      return NextResponse.json({ 
        error: "Database connectivity issue", 
        message: "Estamos actualizando el inventario. Por favor, intente más tarde." 
      }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Error al cargar propiedades" },
      { status: 500 }
    )
  }
}
