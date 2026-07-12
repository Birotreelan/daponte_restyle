import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * POST /api/tvd/grafico   { sede_id, profesional_id }
 *
 * Proxy a tvd_grafico.php -- conteo de turnos disponibles/ocupados/
 * bloqueados desde hoy, para el grafico de torta de Vista Detallada.
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const token = await getSessionToken()
  const { status, body: resBody } = await phpFetch('/tvd_grafico.php', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  })
  return NextResponse.json(resBody, { status })
}
