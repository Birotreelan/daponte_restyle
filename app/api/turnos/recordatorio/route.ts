import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * POST /api/turnos/recordatorio   { turno_id }
 *
 * Proxy a turnos_acc.php (acc=rcd_t) -- datos (turno + sede) para armar
 * el recordatorio imprimible de un turno.
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const token = await getSessionToken()
  const { status, body: resBody } = await phpFetch('/turnos_acc.php', {
    method: 'POST',
    body: JSON.stringify({ ...body, acc: 'rcd_t' }),
    token,
  })
  return NextResponse.json(resBody, { status })
}
