import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * GET /api/pacientes/archivos?p_id=&id=&tipo=estudios|imagenes|ordenes|ordenes_turnos|consentimientos
 *
 * Proxy a /paciente_archivos_listar.php -- panel lateral de archivos.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const token = await getSessionToken()
  const { status, body } = await phpFetch(`/paciente_archivos_listar.php?${params.toString()}`, { token })
  return NextResponse.json(body, { status })
}
