import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * POST /api/tvd/proximos-turnos   { sede_id, profesional_id, max_turnos }
 *
 * Proxy a tvd_proximos_turnos.php -- proximos turnos disponibles (sin
 * asignar, sin bloquear), para el acceso rapido de la columna central.
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const token = await getSessionToken()
  const { status, body: resBody } = await phpFetch('/tvd_proximos_turnos.php', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  })
  return NextResponse.json(resBody, { status })
}
