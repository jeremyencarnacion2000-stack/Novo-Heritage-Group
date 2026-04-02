import type { Metadata } from "next"
import SegurosClientPage from "@/components/seguros-client-page"
import DivisionSubmenu from "@/components/division-submenu"

export const metadata: Metadata = {
  title: "Nuestros Productos - Novo Heritage",
  description: "Descubre nuestra amplia gama de productos en seguros, bienes raíces y turismo. Soluciones personalizadas para proteger tu futuro en República Dominicana.",
  keywords: 'productos, seguros, bienes raíces, turismo, República Dominicana, Novo Heritage, protección financiera, propiedades, viajes de lujo',
  openGraph: {
    title: 'Nuestros Productos - Novo Heritage',
    description: 'Descubre nuestra amplia gama de productos en seguros, bienes raíces y turismo',
    url: 'https://novo-heritage-group-3n0yr22o7.vercel.app/seguros',
    siteName: 'Novo Heritage',
    locale: 'es_DO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nuestros Productos - Novo Heritage',
    description: 'Descubre nuestra amplia gama de productos en seguros, bienes raíces y turismo',
    creator: '@novoheritage',
  },
}

export default function SegurosPage() {
  return (
    <>
      <DivisionSubmenu />
      <SegurosClientPage />
    </>
  )
}
