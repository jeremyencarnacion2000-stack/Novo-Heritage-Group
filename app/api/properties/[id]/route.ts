import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

type DbProperty = {
  id: string
  title: string
  address: string | null
  location: string | null
  status: string | null
  price: number | null
  type: string | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  year_built: number | null
  description: string | null
  features: string[] | null
  agent_name: string | null
  agent_phone: string | null
  image: string | null
  images: string[] | null
  estimated_rent_monthly: number | null
  hoa_fee_monthly: number | null
  taxes_annual: number | null
  maintenance_annual: number | null
  occupancy_rate: number | null
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const price = data.price ?? undefined
    const rentMonthly = data.estimated_rent_monthly ?? undefined
    const hoaMonthly = data.hoa_fee_monthly ?? undefined
    const taxesAnnual = data.taxes_annual ?? undefined
    const maintAnnual = data.maintenance_annual ?? undefined
    const occRate = data.occupancy_rate ?? undefined

    const annualRentGross = rentMonthly && occRate ? rentMonthly * 12 * occRate : (rentMonthly ? rentMonthly * 12 : undefined)
    const closingCosts = price ? price * 0.03 : undefined
    const annualHOA = hoaMonthly ? hoaMonthly * 12 : 0
    const annualMaint = maintAnnual ?? (price ? price * 0.01 : 0)
    const annualTaxes = taxesAnnual ?? 0
    const netAnnual = (annualRentGross ?? 0) - annualHOA - annualMaint - annualTaxes
    const roi = price && closingCosts ? (netAnnual / (price + closingCosts)) * 100 : undefined

    const mapped = {
      id: data.id,
      title: data.title,
      address: data.address ?? undefined,
      location: data.location ?? undefined,
      status: data.status ?? undefined,
      price,
      type: data.type ?? undefined,
      bedrooms: data.bedrooms ?? undefined,
      bathrooms: data.bathrooms ?? undefined,
      area: data.area ?? undefined,
      yearBuilt: data.year_built ?? undefined,
      description: data.description ?? undefined,
      features: data.features ?? undefined,
      agent: {
        name: data.agent_name ?? 'Agente Novo Heritage',
        phone: data.agent_phone ?? 'N/D',
      },
      image: data.image ?? undefined,
      images: data.images ?? undefined,
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
    console.error('Supabase property by id failed, using fallback:', err)
    const fallback = {
      id,
      title: 'Propiedad de ejemplo',
      location: 'Santo Domingo',
      address: 'Dirección no disponible',
      price: 3500000,
      type: 'apartamento' as const,
      bedrooms: 3,
      bathrooms: 2,
      area: 160,
      status: 'available' as const,
      image: '/placeholder.jpg',
      images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
      yearBuilt: 2019,
      featured: false,
      description: 'Detalle no disponible. Este es un contenido de ejemplo.',
      features: ['Balcón', 'Parqueo', 'Seguridad 24/7'],
      agent: { name: 'Agente Novo Heritage', phone: 'N/D' },
    }
    return NextResponse.json(fallback)
  }
}
