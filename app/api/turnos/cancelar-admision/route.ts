import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

/**
 * POST /api/turnos/cancelar-admision   { turno_id, paciente_id }
 *
 * Proxy a turnos_acc.php (acc=cadmsn) -- revierte una admisión completa
 * (bloqueado si ya hay prácticas facturadas).
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const token = await getSessionToken()
  const { status, body: resBody } = await phpFetch('/turnos_acc.php', {
    method: 'POST',
    body: JSON.stringify({ ...body, acc: 'cadmsn' }),
    token,
  })
  return NextResponse.json(resBody, { status })
}
