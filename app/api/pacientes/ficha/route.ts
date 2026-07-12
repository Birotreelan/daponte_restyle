import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * GET /api/pacientes/ficha?p_id=
 *
 * Proxy a /paciente_ficha.php -- datos generales, sede, foto, antecedentes
 * y etiquetas (solo lectura) de un paciente.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const token = await getSessionToken()
  const { status, body } = await phpFetch(`/paciente_ficha.php?${params.toString()}`, { token })
  return NextResponse.json(body, { status })
}
