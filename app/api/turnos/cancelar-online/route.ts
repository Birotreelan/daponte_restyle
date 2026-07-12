import { NextRequest, NextResponse } from 'next/server'
import { phpFetch } from '@/lib/php-fetch'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { status, body: resBody } = await phpFetch('/turnos_cancelar_online.php', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return NextResponse.json(resBody, { status })
}
