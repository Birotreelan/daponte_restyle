import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * GET /api/agendas?profesional_id=&centro_id=&fecha_desde=
 *
 * Devuelve la lista de fechas con agenda para el profesional/sede dados.
 * Todos los query params se reenvían a /agendas_listar.php.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const token = await getSessionToken()
  const { status, body } = await phpFetch(`/agendas_listar.php?${params.toString()}`, { token })
  return NextResponse.json(body, { status })
}
