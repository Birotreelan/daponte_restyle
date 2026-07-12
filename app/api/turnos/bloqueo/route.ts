import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

// turnos_acc.php usa los mismos codigos "acc" que el legacy (blck /
// block_all / desblck) en vez del "modo" que manda el frontend.
const MODO_A_ACC: Record<string, string> = {
  bloquear: 'blck',
  bloquear_dia: 'block_all',
  desbloquear: 'desblck',
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { modo, ...rest } = body
  const acc = MODO_A_ACC[modo]
  if (!acc) {
    return NextResponse.json(
      { success: false, message: `modo inválido: ${modo}`, data: null },
      { status: 422 }
    )
  }
  const token = await getSessionToken()
  const { status, body: resBody } = await phpFetch('/turnos_acc.php', {
    method: 'POST',
    body: JSON.stringify({ ...rest, acc }),
    token,
  })
  return NextResponse.json(resBody, { status })
}
