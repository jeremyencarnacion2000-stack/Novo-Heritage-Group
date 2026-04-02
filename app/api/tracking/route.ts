import { NextResponse } from 'next/server';

const N8N_TRACKING_WEBHOOK = process.env.N8N_TRACKING_WEBHOOK || process.env.NEXT_PUBLIC_N8N_TRACKING_WEBHOOK || '';
const TRACKING_API_KEY = process.env.TRACKING_API_KEY || process.env.NEXT_PUBLIC_TRACKING_API_KEY || '';

export async function POST(request: Request) {
  try {
    if (!N8N_TRACKING_WEBHOOK) {
      // Silently accept tracking events when webhook is not configured
      return NextResponse.json({ success: true, note: 'tracking_disabled' });
    }

    const body = await request.json();

    try {
      const response = await fetch(N8N_TRACKING_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TRACKING_API_KEY}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.warn(`Tracking webhook returned ${response.status}:`, await response.text().catch(() => 'No body'));
        // Return 200 anyway to prevent client-side noise, but indicate failure in body
        return NextResponse.json({ success: false, error: 'webhook_error' });
      }

      return NextResponse.json({ success: true });
    } catch (fetchError) {
      console.error('Tracking fetch failed:', fetchError);
      return NextResponse.json({ success: false, error: 'fetch_failed' });
    }
  } catch (error) {
    console.error('API Track error:', error);
    return NextResponse.json({ success: false, error: 'internal_error' });
  }
}
