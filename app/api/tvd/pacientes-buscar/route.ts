import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * POST /api/tvd/pacientes-buscar
 *   { sede_id, paciente_apellido?, paciente_nombres?, paciente_dni? }
 *
 * Proxy a tvd_pacientes_con_turno_buscar.php -- busca, entre los turnos ya
 * asignados de una sede desde hoy, los que coincidan con el paciente
 * buscado (columna izquierda de Vista Detallada).
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const token = await getSessionToken()
  const { status, body: resBody } = await phpFetch('/tvd_pacientes_con_turno_buscar.php', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  })
  return NextResponse.json(resBody, { status })
}
