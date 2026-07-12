import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * POST /api/tvd/calendario   { sede_id, profesional_id, turno_fecha }
 *
 * Proxy a tvd_calendario.php -- eventos de calendario coloreados segun
 * disponibilidad (semaforo), para la columna central de Vista Detallada.
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const token = await getSessionToken()
  const { status, body: resBody } = await phpFetch('/tvd_calendario.php', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  })
  return NextResponse.json(resBody, { status })
}
