import type { Metadata } from "next"
import TurismoClientPage from "@/components/turismo-client-page"
import DivisionSubmenu from "@/components/division-submenu"

export const metadata: Metadata = {
  title: "Paquetes de Viajes y Turismo en República Dominicana",
  description: "Explora los mejores destinos de República Dominicana con nuestros paquetes turísticos. Viajes a Punta Cana, Santo Domingo y más. ¡Reserva tus vacaciones soñadas!",
  keywords: 'turismo, viajes, paquetes turísticos, República Dominicana, Punta Cana, Santo Domingo, vacaciones, Novo Heritage',
  openGraph: {
    title: 'Paquetes de Viajes y Turismo en República Dominicana',
    description: 'Explora los mejores destinos de República Dominicana con nuestros paquetes turísticos',
    url: 'https://novo-heritage-group-3n0yr22o7.vercel.app/turismo',
    siteName: 'Novo Heritage',
    locale: 'es_DO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paquetes de Viajes y Turismo en República Dominicana',
    description: 'Explora los mejores destinos de República Dominicana con nuestros paquetes turísticos',
    creator: '@novoheritage',
  },
}

export default function TurismoPage() {
  return (
    <>
      <DivisionSubmenu />
      <TurismoClientPage />
    </>
  )
}
