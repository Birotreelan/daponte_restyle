import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * GET /api/pacientes/practica-detalle?p_id=&codigo=&fecha=&hora=
 *
 * Proxy a /paciente_practica_detalle.php -- detalle clínico puntual de una
 * entrada de la Historia Clínica (equivalente a los frmt_*.php del
 * dispatcher legacy).
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const token = await getSessionToken()
  const { status, body } = await phpFetch(`/paciente_practica_detalle.php?${params.toString()}`, { token })
  return NextResponse.json(body, { status })
}
