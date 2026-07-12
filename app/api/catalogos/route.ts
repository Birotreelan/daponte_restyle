import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const tipo = params.get('tipo')
  if (!tipo) {
    return NextResponse.json({ success: false, message: 'Falta el parámetro tipo' }, { status: 400 })
  }

  const token = await getSessionToken()
  const { status, body } = await phpFetch(`/catalogos.php?${params.toString()}`, { token })
  return NextResponse.json(body, { status })
}
