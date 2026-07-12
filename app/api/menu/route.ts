import { NextRequest, NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

export async function GET(req: NextRequest) {
  const accesosRapidos = req.nextUrl.searchParams.get('accesos_rapidos')
  const path = accesosRapidos
    ? `/menu.php?accesos_rapidos=${encodeURIComponent(accesosRapidos)}`
    : '/menu.php'

  const token = await getSessionToken()
  const { status, body } = await phpFetch(path, { token })
  return NextResponse.json(body, { status })
}
