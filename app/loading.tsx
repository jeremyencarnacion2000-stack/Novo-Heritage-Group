import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: "Cargando - Novo Heritage",
  description: "Cargando el contenido de Novo Heritage. Por favor espera un momento.",
  keywords: 'cargando, loading, Novo Heritage',
  openGraph: {
    title: 'Cargando - Novo Heritage',
    description: 'Cargando el contenido de Novo Heritage',
    url: 'https://novoheritage.com/loading',
    siteName: 'Novo Heritage',
    locale: 'es_DO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cargando - Novo Heritage',
    description: 'Cargando el contenido de Novo Heritage',
    creator: '@novoheritage',
  },
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero section skeleton */}
      <div className="min-h-[90vh] flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-5xl mx-auto">
          <Skeleton className="h-6 w-32 mx-auto mb-8 rounded-full" />
          <Skeleton className="h-16 sm:h-20 md:h-24 lg:h-32 w-full mb-8" />
          <Skeleton className="h-6 w-3/4 mx-auto mb-12" />
          <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
            <Skeleton className="h-12 w-32 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Content sections skeleton */}
      <div className="py-20 px-4">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-64 mx-auto mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

