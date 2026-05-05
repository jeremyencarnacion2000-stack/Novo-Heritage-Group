import { NextResponse } from "next/server"
import cockroachDb from "@/lib/cockroach-db"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch from CockroachDB inventario_digital (populated by n8n multimedia ingestor)
    const data = await cockroachDb`
      SELECT
        id,
        nombre_proyecto,
        titulo_profesional,
        descripcion_limpia,
        es_constructora_oficial,
        zona,
        precio,
        multimedia
      FROM public.inventario_digital
      WHERE nombre_proyecto IS NOT NULL
        AND nombre_proyecto NOT IN ('Sin nombre', 'Parseo fallido', 'No disponible', '')
        AND descripcion_limpia IS NOT NULL
        AND LENGTH(descripcion_limpia) > 5
      ORDER BY id DESC
      LIMIT 100
    `;

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

      // Parse multimedia JSON and transform Dropbox links for direct rendering
      let images: string[] = [];
      try {
        const parsed = typeof p.multimedia === 'string' ? JSON.parse(p.multimedia) : (p.multimedia || []);
        if (Array.isArray(parsed)) {
          images = parsed
            .filter((u: string) => u && u.startsWith('http'))
            .map((u: string) => {
              if (u.includes('dropbox.com')) {
                return u.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('?dl=1', '');
              }
              return u;
            });
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
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        sqft: 1292,
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
        parking: 1,
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
