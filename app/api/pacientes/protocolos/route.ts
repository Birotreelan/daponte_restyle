import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * GET /api/pacientes/protocolos?p_id=
 *
 * Proxy a /paciente_protocolos_listar.php -- pestaña Protocolos.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const token = await getSessionToken()
  const { status, body } = await phpFetch(`/paciente_protocolos_listar.php?${params.toString()}`, { token })
  return NextResponse.json(body, { status })
}
