import { NextResponse } from "next/server"
import cockroachDb from "@/lib/cockroach-db"
import { mapCockroachProperty } from "@/lib/property-utils"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const debug = searchParams.get('debug') === 'true';

  try {
    const data = await cockroachDb`
      SELECT *
      FROM public.inventario_digital
      WHERE (nombre_proyecto IS NOT NULL AND nombre_proyecto NOT IN ('Sin nombre', 'Parseo fallido', 'No disponible', ''))
         OR (titulo_profesional IS NOT NULL AND titulo_profesional NOT IN ('', 'Proyecto Novo'))
      ORDER BY id DESC
      LIMIT 100
    `;

    if (debug) {
      return NextResponse.json({
        count: data?.length || 0,
        sample: data?.[0] || null,
        raw: data
      });
    }

    if (!data || data.length === 0) {
      return NextResponse.json([])
    }

    const mapped = (data || []).map((p: any) => mapCockroachProperty(p));

    return NextResponse.json(mapped)
  } catch (err: any) {
    console.error('Properties fetch error:', err);
    
    // Fallback: Si hay error de conexión (ECONNREFUSED), devolver array vacío o loguear
    if (err.message?.includes('ECONNREFUSED')) {
      return NextResponse.json({ 
        error: "Database connectivity issue", 
        message: "Estamos actualizando el inventario. Por favor, intente más tarde." 
      }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Error al cargar propiedades" },
      { status: 500 }
    )
  }
}
