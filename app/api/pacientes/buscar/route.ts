import { NextRequest, NextResponse } from 'next/server'
import { phpFetch } from '@/lib/php-fetch'

/**
 * GET /api/pacientes/buscar?[dni|hc|telefono|apellido|nombres|...]
 *
 * Pasa todos los query params directamente a /pacientes_buscar.php.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const { status, body } = await phpFetch(`/pacientes_buscar.php?${params.toString()}`)
  return NextResponse.json(body, { status })
}
