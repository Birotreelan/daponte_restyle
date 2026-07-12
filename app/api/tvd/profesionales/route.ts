import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * POST /api/tvd/profesionales   { sede_id, subespecialidad_id }
 *
 * Proxy a tvd_profesionales_listar.php -- lista de profesionales filtrada
 * por permisos y (opcionalmente) por subespecialidad, para el selector de
 * la columna izquierda de Vista Detallada.
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const token = await getSessionToken()
  const { status, body: resBody } = await phpFetch('/tvd_profesionales_listar.php', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  })
  return NextResponse.json(resBody, { status })
}
