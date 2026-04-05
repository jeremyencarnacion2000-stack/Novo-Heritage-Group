import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET() {
  try {
    // Query the new inventario_digital table from the WhatsApp backfill
    const data = await sql`
      SELECT 
        id,
        nombre_propiedad,
        tipo_activo,
        url_activo,
        stock_disponible,
        zona,
        condicion,
        metadata,
        descripcion,
        contacto,
        precio,
        fecha_creacion
      FROM inventario_digital 
      WHERE stock_disponible = TRUE
      ORDER BY fecha_creacion DESC 
      LIMIT 100
    `;

    if (!data || data.length === 0) {
      return NextResponse.json([])
    }

    const mapped = (data || []).map((p) => {
      // Robust price parsing (removes $, commas, and non-numeric chars except decimal)
      const rawPrice = p.precio ? String(p.precio).replace(/[^\d.]/g, '') : '0'
      const price = parseFloat(rawPrice) || 0
      
      // Handle multiple images if url_activo is a comma-separated list
      const images = p.url_activo ? String(p.url_activo).split(',').map(img => img.trim()) : ["/luxury-modern-villa-renaissance.png"]
      const primaryImage = images[0]

      // Extract amenities from metadata JSON if available
      let amenities = []
      try {
        if (p.metadata) {
          const meta = typeof p.metadata === 'string' ? JSON.parse(p.metadata) : p.metadata
          if (meta.amenities && Array.isArray(meta.amenities)) {
            amenities = meta.amenities
          } else if (meta.features && Array.isArray(meta.features)) {
            amenities = meta.features
          }
        }
      } catch (e) {
        // Skip metadata errors
      }

      // Detect "Bono Primera Vivienda" in description
      const hasBono = p.descripcion?.toLowerCase().includes("bono") || p.descripcion?.toLowerCase().includes("vivienda")

      return ({
        id: String(p.id),
        title: p.nombre_propiedad || "Propiedad Novo Heritage",
        location: p.zona || "República Dominicana",
        address: p.zona || "Ubicación Premium",
        status: p.condicion?.toLowerCase() === 'nuevo' ? 'available' : 'available',
        price,
        type: p.tipo_activo?.toLowerCase() || "apartamento",
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        yearBuilt: new Date(p.fecha_creacion || Date.now()).getFullYear(),
        description: p.descripcion || "Residencia exclusiva gestionada por Novo Heritage Group.",
        features: amenities.length > 0 ? amenities : ["Seguridad 24/7", "Premium Finish"],
        agent: {
          name: 'Novo Heritage Real Estate',
          phone: p.contacto || '+1 809-555-0123',
        },
        image: primaryImage,
        images: images,
        reference: `NH-ID${p.id}`,
        featured: hasBono, 
        city: 'Santo Domingo',
        sector: p.zona || 'N/A',
        parking: 1,
        amenities: amenities,
        transactionType: 'venta',
      })
    })

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('Neon properties fetch failed:', err)
    return NextResponse.json([])
  }
}
