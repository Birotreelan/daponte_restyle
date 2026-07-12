import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const token = await getSessionToken()
  const { status, body: resBody } = await phpFetch('/turnos_bloqueo.php', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  })
  return NextResponse.json(resBody, { status })
}
