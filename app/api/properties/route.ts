import { NextResponse } from "next/server"
import sql from "@/lib/db"
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await sql`
      SELECT 
        id, title, price, transaction_type, type, location, city, sector, 
        bedrooms, bathrooms, area, description, features, image, is_published, created_at
      FROM properties 
      ORDER BY created_at DESC 
      LIMIT 100
    `;

    if (!data || data.length === 0) {
      return NextResponse.json([])
    }

    const mapped = (data || []).map((p) => {
      const price = parseFloat(p.price) || 0;
      const images = p.image ? [p.image] : ["/luxury-modern-villa-renaissance.png"];
      const primaryImage = images[0];

      return ({
        id: String(p.id),
        title: p.title || "Propiedad Novo Heritage",
        location: p.location || "República Dominicana",
        address: p.sector || p.city || p.location || "Ubicación Premium",
        status: 'available',
        price,
        type: p.type?.toLowerCase() || "apartamento",
        bedrooms: p.bedrooms || 3,
        bathrooms: p.bathrooms || 2,
        area: p.area || 120,
        yearBuilt: new Date(p.created_at || Date.now()).getFullYear(),
        description: p.description || "Residencia exclusiva gestionada por Novo Heritage Group.",
        features: Array.isArray(p.features) ? p.features : ["Seguridad 24/7", "Premium Finish"],
        agent: {
          name: 'Novo Heritage Real Estate',
          phone: '+1 809-555-0123',
        },
        image: primaryImage,
        images: images,
        reference: `NH-ID${String(p.id).substring(0,8)}`,
        featured: !!p.title.toLowerCase().includes("lujo"), 
        city: p.city || 'Santo Domingo',
        sector: p.sector || 'N/A',
        parking: parseInt(String(p.parking || "1")),
        amenities: Array.isArray(p.features) ? p.features : [],
        transactionType: p.transaction_type?.toLowerCase() || 'venta',
      })
    })

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('Neon properties fetch failed:', err)
    return NextResponse.json([])
  }
}
