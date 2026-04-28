import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const [data]: any = await sql`
      SELECT * FROM properties WHERE id = ${id} LIMIT 1
    `

    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const price = parseFloat(data.price) || 0
    const rentMonthly = parseFloat(data.estimated_rent_monthly) || 0
    const hoaMonthly = parseFloat(data.hoa_fee_monthly) || 0
    const taxesAnnual = parseFloat(data.taxes_annual) || 0
    const maintAnnual = parseFloat(data.maintenance_annual) || (price * 0.01)
    const occRate = parseFloat(data.occupancy_rate) || 0.9

    const annualRentGross = rentMonthly * 12 * occRate
    const closingCosts = price * 0.03
    const annualHOA = hoaMonthly * 12
    const netAnnual = annualRentGross - annualHOA - maintAnnual - taxesAnnual
    const roi = price > 0 ? (netAnnual / (price + closingCosts)) * 100 : 0

    const mapped = {
      id: String(data.id),
      title: data.title || "Propiedad Novo Heritage",
      address: data.sector || data.city || data.location || "Ubicación Premium",
      location: data.location || "República Dominicana",
      status: 'available',
      price,
      type: data.type?.toLowerCase() || "apartamento",
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      area: data.area || 0,
      yearBuilt: new Date(data.created_at || Date.now()).getFullYear(),
      description: data.description || "Residencia exclusiva gestionada por Novo Heritage Group.",
      features: Array.isArray(data.features) ? data.features : [],
      agent: {
        name: 'Agente Novo Heritage',
        phone: 'N/D',
      },
      image: data.image || "/luxury-modern-villa-renaissance.png",
      images: data.image ? [data.image] : ["/luxury-modern-villa-renaissance.png"],
      metrics: {
        estimatedRentMonthly: rentMonthly,
        hoaFeeMonthly: hoaMonthly,
        taxesAnnual: taxesAnnual,
        maintenanceAnnual: maintAnnual,
        occupancyRate: occRate,
      },
      roi: roi,
    }

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('Neon property by id failed:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
