import type { Metadata } from "next"
import BienesRaicesClientPage from "@/components/bienes-raices-client-page"
import DivisionSubmenu from "@/components/division-submenu"
import cockroachDb from "@/lib/cockroach-db"
import { mapCockroachProperty } from "@/lib/property-utils"

export const metadata: Metadata = {
  title: "Bienes Raíces en Santo Domingo - Casas y Apartamentos en Venta",
  description: "Encuentra casas, apartamentos y propiedades en venta en Santo Domingo. Asesoría experta y las mejores oportunidades de inversión inmobiliaria con Novo Heritage.",
  keywords: 'bienes raíces, propiedades, casas, apartamentos, venta, Santo Domingo, República Dominicana, inversión inmobiliaria, Novo Heritage',
  openGraph: {
    title: 'Bienes Raíces en Santo Domingo - Casas y Apartamentos en Venta',
    description: 'Encuentra casas, apartamentos y propiedades en venta en Santo Domingo',
    url: 'https://novo-heritage-group-3n0yr22o7.vercel.app/bienes-raices',
    siteName: 'Novo Heritage',
    locale: 'es_DO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bienes Raíces en Santo Domingo - Casas y Apartamentos en Venta',
    description: 'Encuentra casas, apartamentos y propiedades en venta en Santo Domingo',
    creator: '@novoheritage',
  },
}

async function getProperties() {
  try {
    const data = await cockroachDb`
      SELECT * 
      FROM public.inventario_digital 
      WHERE (nombre_proyecto IS NOT NULL AND nombre_proyecto NOT IN ('Sin nombre', 'Parseo fallido', 'No disponible', ''))
         OR (titulo_profesional IS NOT NULL AND titulo_profesional NOT IN ('', 'Proyecto Novo'))
      ORDER BY created_at DESC 
      LIMIT 100
    `
    return (data || []).map(mapCockroachProperty)
  } catch (error) {
    console.error('Error fetching properties from CockroachDB:', error)
    return []
  }
}

export default async function BienesRaicesPage() {
  const properties = await getProperties()
  
  return (
    <>
      <DivisionSubmenu />
      <BienesRaicesClientPage properties={properties} />
    </>
  )
}
