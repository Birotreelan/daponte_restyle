import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * GET /api/hc-nueva-consulta?accion=check|antecedentes|pio|diagnosticos&...
 * POST /api/hc-nueva-consulta  (body con "acc")
 *
 * Proxy a /hc_nueva_consulta_acc.php -- dispatcher del flujo "NUEVA
 * CONSULTA" (guardado final + antecedentes/pio/diagnosticos incrementales).
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const token = await getSessionToken()
  const { status, body } = await phpFetch(`/hc_nueva_consulta_acc.php?${params.toString()}`, { token })
  return NextResponse.json(body, { status })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const token = await getSessionToken()
  const { status, body: resBody } = await phpFetch('/hc_nueva_consulta_acc.php', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  })
  return NextResponse.json(resBody, { status })
}
