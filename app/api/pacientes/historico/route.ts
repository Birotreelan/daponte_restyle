import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * GET /api/pacientes/historico?p_id=
 *
 * Proxy a /paciente_historico_turnos.php -- pestaña Historico (turnos +
 * contadores de presentes/ausentes).
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const token = await getSessionToken()
  const { status, body } = await phpFetch(`/paciente_historico_turnos.php?${params.toString()}`, { token })
  return NextResponse.json(body, { status })
}
