import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * GET /api/pacientes/tree?id=&filtro=hc|drv|dia|cir&orden=asc|desc
 *
 * Proxy a /paciente_tree_listar.php -- listado genérico de la bitácora
 * clínica (H.C./Derivaciones/Diagnosticos/Quirurgico).
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const token = await getSessionToken()
  const { status, body } = await phpFetch(`/paciente_tree_listar.php?${params.toString()}`, { token })
  return NextResponse.json(body, { status })
}
