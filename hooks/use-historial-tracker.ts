import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackBehavior } from '@/lib/tracking'

interface UseHistorialTrackerOptions {
  userId?: string
  enabled?: boolean
  trackPageViews?: boolean
  trackClicks?: boolean
  customAction?: string
}

/**
 * Hook para rastrear automáticamente la actividad del usuario
 * Registra visitas a rutas y clics en elementos marcados
 */
export function useHistorialTracker(options: UseHistorialTrackerOptions = {}) {
  const {
    userId,
    enabled = true,
    trackPageViews = true,
    trackClicks = true,
    customAction
  } = options

  const pathname = usePathname()
  const lastPathname = useRef<string>()
  const clickHandlerRef = useRef<((event: MouseEvent) => void) | null>(null)

  // Track page views
  useEffect(() => {
    if (!enabled || !trackPageViews || !userId || !pathname) return

    // Avoid tracking the same page multiple times
    if (lastPathname.current === pathname) return

    lastPathname.current = pathname

    // Extract section from pathname
    const getSectionFromPath = (path: string): string => {
      if (path === '/') return 'inicio'
      if (path.startsWith('/seguros')) return 'seguros'
      if (path.startsWith('/bienes-raices')) return 'bienes-raices'
      if (path.startsWith('/turismo')) return 'turismo'
      if (path.startsWith('/blog')) return 'blog'
      if (path.startsWith('/crm')) return 'crm'
      if (path.startsWith('/asesoria')) return 'asesoria'
      if (path.startsWith('/contacto')) return 'contacto'
      return path.replace('/', '').split('/')[0] || 'unknown'
    }

    const seccion = getSectionFromPath(pathname)

    // Track page view
    trackBehavior({
      usuario_id: userId,
      evento: customAction === 'page_view' ? 'view' : 'stay',
      seccion: seccion,
      metadata: { path: pathname, action: customAction }
    }).catch(error => {
      console.error('Error tracking page view:', error)
    })

  }, [pathname, userId, enabled, trackPageViews, customAction])

  // Track clicks on elements with data-track attribute
  useEffect(() => {
    if (!enabled || !trackClicks || !userId) return

    const handleClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const trackElement = target.closest('[data-track]') as HTMLElement

      if (trackElement) {
        const trackAction = trackElement.getAttribute('data-track')
        const trackDetails = trackElement.getAttribute('data-track-details')

        if (trackAction) {
          try {
            const details = trackDetails ? JSON.parse(trackDetails) : {}

            await trackBehavior({
              usuario_id: userId,
              evento: 'click',
              seccion: trackAction,
              metadata: details
            })
          } catch (error) {
            console.error('Error tracking click:', error)
          }
        }
      }
    }

    // Store handler reference to remove it later
    clickHandlerRef.current = handleClick

    document.addEventListener('click', handleClick)

    return () => {
      if (clickHandlerRef.current) {
        document.removeEventListener('click', clickHandlerRef.current)
      }
    }
  }, [userId, enabled, trackClicks])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clickHandlerRef.current) {
        document.removeEventListener('click', clickHandlerRef.current)
      }
    }
  }, [])
}

/**
 * Hook simplificado para tracking básico
 */
export function useSimpleTracker(userId?: string) {
  return useHistorialTracker({
    userId,
    enabled: !!userId,
    trackPageViews: true,
    trackClicks: false
  })
}

/**
 * Hook para tracking avanzado con opciones personalizadas
 */
export function useAdvancedTracker(userId?: string, options?: Partial<UseHistorialTrackerOptions>) {
  return useHistorialTracker({
    userId,
    enabled: !!userId,
    trackPageViews: true,
    trackClicks: true,
    ...options
  })
}