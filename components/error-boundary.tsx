"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
// @ts-ignore - lucide-react types not resolving correctly
import { TriangleAlert, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error boundary caught an error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl rounded-none border border-border/20 p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 rounded-none flex items-center justify-center mx-auto mb-6">
          <TriangleAlert className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-4">
          ¡Oops! Algo salió mal
        </h2>

        <p className="text-muted-foreground mb-6 leading-relaxed">
          Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y estamos trabajando para solucionarlo.
        </p>

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 rounded-none"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar de nuevo
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full hover:bg-primary/5 transition-colors duration-300 rounded-none"
          >
            Volver al inicio
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              Detalles técnicos (desarrollo)
            </summary>
            <pre className="mt-2 text-xs text-muted-foreground bg-muted p-3 rounded-none overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
