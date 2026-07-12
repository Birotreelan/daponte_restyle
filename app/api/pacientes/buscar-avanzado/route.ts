import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * GET /api/pacientes/buscar-avanzado?...
 *
 * Pasa todos los query params directamente a /pacientes_buscar_avanzado.php
 * (búsqueda avanzada de pacientes.php, distinta de /api/pacientes/buscar
 * que es la búsqueda simple usada para asignar turno).
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const token = await getSessionToken()
  const { status, body } = await phpFetch(`/pacientes_buscar_avanzado.php?${params.toString()}`, { token })
  return NextResponse.json(body, { status })
}
