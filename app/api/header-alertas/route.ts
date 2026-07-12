import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get('tipo')
  if (!tipo) {
    return NextResponse.json({ success: false, message: 'Falta el parámetro tipo', data: null }, { status: 400 })
  }

  const token = await getSessionToken()
  const { status, body } = await phpFetch(`/header_alertas.php?tipo=${encodeURIComponent(tipo)}`, { token })
  return NextResponse.json(body, { status })
}
