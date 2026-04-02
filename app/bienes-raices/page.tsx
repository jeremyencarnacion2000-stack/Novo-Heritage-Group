import type { Metadata } from "next"
import BienesRaicesClientPage from "@/components/bienes-raices-client-page"
import DivisionSubmenu from "@/components/division-submenu"

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

export default function BienesRaicesPage() {
  return (
    <>
      <DivisionSubmenu />
      <BienesRaicesClientPage />
    </>
  )
}
