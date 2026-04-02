import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackBehavior } from '@/lib/tracking';

/**
 * Intelligent Tracking Hook
 * Extends basic tracking with 'time on page' and behavioral profiling.
 */
export function useIntelligentTracking(userId: string | null) {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const activeRef = useRef<boolean>(true);

  useEffect(() => {
    if (!userId || !pathname) return;

    // Reset timer on path change
    startTimeRef.current = Date.now();
    
    // Track Initial View
    const section = getSection(pathname);
    trackBehavior({
      usuario_id: userId,
      evento: 'view',
      seccion: section,
      metadata: { path: pathname }
    });

    // Cleanup: Track Time on Page when leaving
    return () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 2) { // Only track if they stayed more than 2 seconds
        trackBehavior({
          usuario_id: userId,
          evento: 'stay',
          seccion: section,
          tiempo_en_segundos: duration,
          metadata: { path: pathname }
        });
      }
    };
  }, [pathname, userId]);

  // Click Tracking (Event delegation)
  useEffect(() => {
    if (!userId) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const trackable = target.closest('[data-track]') as HTMLElement;
      
      if (trackable) {
        const action = trackable.getAttribute('data-track') || 'click';
        const label = trackable.innerText || trackable.getAttribute('aria-label') || 'unlabeled';
        
        trackBehavior({
          usuario_id: userId,
          evento: 'click',
          seccion: getSection(pathname),
          metadata: { label, action, path: pathname }
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [userId, pathname]);
}

function getSection(path: string): string {
  if (path === '/') return 'inicio';
  const parts = path.split('/').filter(Boolean);
  return parts[0] || 'unknown';
}
