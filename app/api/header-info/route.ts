import { NextResponse } from 'next/server'
import { phpFetch, getSessionToken } from '@/lib/php-fetch'

export async function GET() {
  const token = await getSessionToken()
  const { status, body } = await phpFetch('/header_info.php', { token })
  return NextResponse.json(body, { status })
}
