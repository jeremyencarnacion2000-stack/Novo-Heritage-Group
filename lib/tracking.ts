/**
 * Intelligent Tracking Utility
 * Used to send behavioral data from the frontend to n8n and Neon.
 */

export interface TrackingEvent {
  usuario_id: string;
  evento: 'view' | 'click' | 'scroll' | 'stay';
  seccion: 'seguros' | 'bienes-raices' | 'turismo' | 'inicio' | 'blog' | string;
  tiempo_en_segundos?: number;
  metadata?: Record<string, any>;
}

/**
 * Sends a tracking event to the backend proxy which forwards it to n8n behavioral workflow.
 */
export async function trackBehavior(event: TrackingEvent): Promise<boolean> {
  try {
    const response = await fetch('/api/tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Tracking failed with status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Track error:', error);
    return false;
  }
}
