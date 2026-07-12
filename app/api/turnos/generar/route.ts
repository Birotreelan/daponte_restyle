import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const token = await getSessionToken()
  // "gnr" y "gnr_src" comparten el mismo bloque en turnos_acc.php (la
  // rama interna la decide la presencia de "paciente_id" en el body).
  const { status, body: resBody } = await phpFetch('/turnos_acc.php', {
    method: 'POST',
    body: JSON.stringify({ ...body, acc: 'gnr' }),
    token,
  })
  return NextResponse.json(resBody, { status })
}
