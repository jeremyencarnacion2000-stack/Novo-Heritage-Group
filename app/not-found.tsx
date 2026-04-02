'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: "Página no encontrada - Novo Heritage",
  description: "La página que buscas no existe o ha sido movida. Explora nuestros servicios de seguros, bienes raíces y turismo en Novo Heritage.",
  keywords: 'página no encontrada, 404, error, Novo Heritage, seguros, bienes raíces, turismo',
  openGraph: {
    title: 'Página no encontrada - Novo Heritage',
    description: 'La página que buscas no existe o ha sido movida',
    url: 'https://novo-heritage-group-3n0yr22o7.vercel.app/not-found',
    siteName: 'Novo Heritage',
    locale: 'es_DO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Página no encontrada - Novo Heritage',
    description: 'La página que buscas no existe o ha sido movida',
    creator: '@novoheritage',
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="text-8xl font-serif font-light text-primary mb-4">404</div>
          <h1 className="text-2xl font-serif font-light text-foreground mb-2">
            Página no encontrada
          </h1>
          <p className="text-muted-foreground">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            asChild
            className="w-full"
            size="lg"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Ir al inicio
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver atrás
          </Button>

          <Button
            variant="outline"
            asChild
            className="w-full"
            size="lg"
          >
            <Link href="/#search">
              <Search className="w-4 h-4 mr-2" />
              Buscar servicios
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            ¿Necesitas ayuda? Explora nuestros servicios principales:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seguros">Seguros</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bienes-raices">Bienes Raíces</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/turismo">Turismo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
