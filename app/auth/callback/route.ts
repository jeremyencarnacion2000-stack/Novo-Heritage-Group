import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  // El flujo de Supabase está desactivado. Redirigimos al inicio.
  return NextResponse.redirect(`${origin}/`)
}
