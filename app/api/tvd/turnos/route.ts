import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * GET /api/tvd/turnos?profesional_id=&sede_id=&fecha=
 *
 * Proxy a tvd_turnos_listar.php -- turnos del dia seleccionado MAS el
 * comentario de agenda vigente y, por cada sobreturno, su historial de
 * logs. Distinto de /api/turnos (que usa Vista Diaria) porque devuelve
 * un objeto { turnos, comentario_agenda, puede_editar_comentario } en
 * vez de un array plano.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const params = new URLSearchParams({
    profesional_id: searchParams.get('profesional_id') ?? '',
    sede_id: searchParams.get('sede_id') ?? '',
    fecha: searchParams.get('fecha') ?? '',
  })

  const token = await getSessionToken()
  const { status, body } = await phpFetch(`/tvd_turnos_listar.php?${params.toString()}`, { token })
  return NextResponse.json(body, { status })
}
