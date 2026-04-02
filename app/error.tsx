'use client'

import { ErrorBoundary } from '@/components/error-boundary'

export const metadata = {
  title: "Error - Novo Heritage",
  description: "Ha ocurrido un error en el sitio web de Novo Heritage. Estamos trabajando para solucionarlo.",
  keywords: 'error, problema, sitio web, Novo Heritage',
  openGraph: {
    title: 'Error - Novo Heritage',
    description: 'Ha ocurrido un error en el sitio web de Novo Heritage',
    url: 'https://novoheritage.com/error',
    siteName: 'Novo Heritage',
    locale: 'es_DO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Error - Novo Heritage',
    description: 'Ha ocurrido un error en el sitio web de Novo Heritage',
    creator: '@novoheritage',
  },
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundary error={error} reset={reset} />
}
