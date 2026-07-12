import { NextRequest, NextResponse } from 'next/server'
import { phpFetch } from '@/lib/php-fetch'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { status, body: resBody } = await phpFetch('/turnos_admitir.php', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return NextResponse.json(resBody, { status })
}
