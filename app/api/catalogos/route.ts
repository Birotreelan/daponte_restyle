import { NextRequest, NextResponse } from 'next/server'
import { phpFetch } from '@/lib/php-fetch'

/**
 * GET /api/catalogos?tipo=sedes|profesionales|motivos|deudores|planes&[...extras]
 *
 * Parámetros relevantes por tipo:
 *   profesionales: sede_id (opcional, filtra por sede)
 *   planes:        deudor_id (obligatorio)
 *
 * El resto de los query params se pasa tal cual al backend.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const tipo = params.get('tipo')
  if (!tipo) {
    return NextResponse.json({ success: false, message: 'Falta el parámetro tipo' }, { status: 400 })
  }

  // Reenviar TODOS los query params al backend
  const { status, body } = await phpFetch(`/catalogos.php?${params.toString()}`)
  return NextResponse.json(body, { status })
}
