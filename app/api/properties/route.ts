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
      WHERE nombre_proyecto IS NOT NULL
        AND nombre_proyecto NOT IN ('Sin nombre', 'Parseo fallido', 'No disponible', '')
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

      // Multimedia handling
      let images: string[] = [];
      try {
        const parsed = typeof p.multimedia === 'string' ? JSON.parse(p.multimedia) : (p.multimedia || []);
        if (Array.isArray(parsed)) {
          images = parsed.filter((u: string) => u && typeof u === 'string' && u.startsWith('http'));
        }
      } catch { /* ignore */ }

      const primaryImage = images[0] || "/luxury-modern-villa-renaissance.png";

      return {
        id: String(p.id),
        title: p.nombre_proyecto || "Propiedad Novo Heritage",
        location: p.zona || "República Dominicana",
        address: p.zona || "Ubicación Premium",
        status: 'available',
        price: priceNum,
        priceLabel: p.precio || 'Consultar',
        type: "propiedad",
        // Extract from dynamic columns if present, otherwise fallback
        bedrooms: parseInt(p.habitaciones || p.cuartos || 3),
        bathrooms: parseInt(p.banos || p.sanitarios || 2),
        area: parseFloat(p.area_m2 || p.metros || p.construccion || 150),
        sqft: Math.round(parseFloat(p.area_m2 || 150) * 10.764),
        yearBuilt: new Date().getFullYear(),
        description: p.descripcion_limpia || "Propiedad gestionada por Novo Heritage Group.",
        features: p.es_constructora_oficial ? ["Constructora Oficial", "Proyecto Verificado"] : ["Verificación Pendiente"],
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
        subtitle: p.titulo_profesional || '',
      }
    })

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('Properties fetch error:', err)
    return NextResponse.json(
      { error: "Error al cargar propiedades" },
      { status: 500 }
    )
  }
}
