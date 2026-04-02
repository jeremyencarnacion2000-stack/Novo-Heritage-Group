import type { Metadata } from "next"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Shield, Home, Plane, CircleHelp } from "lucide-react"

export const metadata: Metadata = {
  title: "Contacto - Novo Heritage",
  description: "Contáctanos para más información sobre nuestros servicios de seguros, bienes raíces y turismo en República Dominicana. Estamos aquí para ayudarte.",
  keywords: 'contacto, información, servicios, seguros, bienes raíces, turismo, República Dominicana, Novo Heritage',
  openGraph: {
    title: 'Contacto - Novo Heritage',
    description: 'Contáctanos para más información sobre nuestros servicios',
    url: 'https://novoheritage.com/faq',
    siteName: 'Novo Heritage',
    locale: 'es_DO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contacto - Novo Heritage',
    description: 'Contáctanos para más información sobre nuestros servicios',
    creator: '@novoheritage',
  },
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <CircleHelp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Centro de Ayuda</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-light leading-tight mb-6">
          Preguntas Frecuentes
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          Encuentra respuestas rápidas a las preguntas más comunes sobre nuestros servicios
        </p>
      </div>
    </div>
  )
}
