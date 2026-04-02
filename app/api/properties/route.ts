import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET() {
  try {
    const data = await sql`
      SELECT * FROM properties 
      ORDER BY created_at DESC 
      LIMIT 50
    `;

    if (!data || data.length === 0) {
      // Return empty array if no properties found
      return NextResponse.json([])
    }

    const mapped = data.map((p) => {
      const price = Number(p.price) || undefined
      const rentMonthly = Number(p.estimated_rent_monthly) || undefined
      const hoaMonthly = Number(p.hoa_fee_monthly) || undefined
      const taxesAnnual = Number(p.taxes_annual) || undefined
      const maintAnnual = Number(p.maintenance_annual) || undefined
      const occRate = Number(p.occupancy_rate) || undefined

      const annualRentGross = rentMonthly && occRate ? rentMonthly * 12 * occRate : (rentMonthly ? rentMonthly * 12 : undefined)
      const closingCosts = price ? price * 0.03 : undefined
      const annualHOA = hoaMonthly ? hoaMonthly * 12 : 0
      const annualMaint = maintAnnual ?? (price ? price * 0.01 : 0)
      const annualTaxes = taxesAnnual ?? 0
      const netAnnual = (annualRentGross ?? 0) - annualHOA - annualMaint - annualTaxes
      const roi = price && closingCosts ? (netAnnual / (price + closingCosts)) * 100 : undefined

      return ({
        id: p.id,
        title: p.title,
        address: p.address ?? undefined,
        location: p.location ?? undefined,
        status: p.status ?? undefined,
        price,
        type: p.type ?? undefined,
        bedrooms: p.bedrooms ?? undefined,
        bathrooms: p.bathrooms ?? undefined,
        area: p.area ?? undefined,
        yearBuilt: p.year_built ?? undefined,
        description: p.description ?? undefined,
        features: p.features ?? undefined,
        agent: {
          name: p.agent_name ?? 'Agente Novo Heritage',
          phone: p.agent_phone ?? 'N/D',
        },
        image: p.image ?? undefined,
        images: p.images ?? undefined,
        metrics: {
          estimatedRentMonthly: rentMonthly,
          hoaFeeMonthly: hoaMonthly,
          taxesAnnual: taxesAnnual,
          maintenanceAnnual: maintAnnual,
          occupancyRate: occRate,
        },
        roi: roi,
        reference: p.reference ?? `NH-${p.id.slice(0, 4).toUpperCase()}`,
        garage: p.garage ?? 0,
        peb: p.peb ?? 'B',
        city: p.city ?? 'Santo Domingo',
        sector: p.sector ?? 'Naco',
        parking: p.parking ?? 1,
        amenities: p.amenities ?? [],
        transactionType: p.transaction_type ?? 'venta',
      })
    })

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('Neon properties fetch failed, using fallback:', err)
    const fallback = [
      // ... same fallback as before
      {
        id: "prop-001",
        title: "Casa Moderna en Zona Residencial",
        location: "Polanco, Ciudad de México",
        address: "Av. Homero 123, Polanco, CDMX",
        price: 5800000,
        type: "casa" as const,
        bedrooms: 4,
        bathrooms: 3,
        area: 320,
        status: "available" as const,
        image: "/placeholder.jpg",
        images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
        yearBuilt: 2018,
        featured: true,
        description: "Residencia contemporánea con acabados premium, iluminación natural y amplio jardín.",
        features: ["Cocina equipada", "Sala de TV", "Terraza", "Estacionamiento para 2 autos"],
        agent: { name: "María López", phone: "+52 55 1234 5678" },
        reference: "NH-001",
        garage: 2,
        peb: "A",
        city: "sd",
        sector: "pi",
        parking: 2,
        amenities: ["piscina", "gimnasio", "terraza-exclusiva"],
        transactionType: "venta",
      },
      {
        id: "prop-002",
        title: "Departamento de Lujo con Vista",
        location: "Santa Fe, Ciudad de México",
        address: "Carretera México-Toluca 456, Santa Fe, CDMX",
        price: 3200000,
        type: "apartamento" as const,
        bedrooms: 3,
        bathrooms: 2,
        area: 180,
        status: "available" as const,
        image: "/placeholder.jpg",
        images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
        yearBuilt: 2020,
        featured: false,
        description: "Departamento con vista panorámica, área social abierta y seguridad 24/7.",
        features: ["Gimnasio", "Alberca", "Roof garden", "Salón de usos múltiples"],
        agent: { name: "Carlos Pérez", phone: "+52 55 9876 5432" },
        reference: "NH-002",
        garage: 1,
        peb: "B",
        city: "sd",
        sector: "na",
        parking: 1,
        amenities: ["gimnasio", "piscina"],
        transactionType: "venta",
      },
      {
        id: "prop-003",
        title: "Penthouse Exclusivo",
        location: "Condesa, Ciudad de México",
        address: "Av. Nuevo León 89, Condesa, CDMX",
        price: 8500000,
        type: "penthouse" as const,
        bedrooms: 5,
        bathrooms: 4,
        area: 450,
        status: "available" as const,
        image: "/placeholder.jpg",
        images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
        yearBuilt: 2015,
        featured: true,
        description: "Penthouse de doble altura con terraza privada y acabados de lujo.",
        features: ["Elevador privado", "Terraza panorámica", "Wine room", "Smart home"],
        agent: { name: "Ana García", phone: "+52 55 2468 1357" },
        reference: "NH-003",
        garage: 3,
        peb: "A",
        city: "sd",
        sector: "be",
        parking: 3,
        amenities: ["terraza-exclusiva", "virtual-tour", "linea-blanca"],
        transactionType: "venta",
      },
    ]
    return NextResponse.json(fallback)
  }
}
