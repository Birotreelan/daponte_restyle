import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { user, pass } = await req.json()

  const baseUrl = process.env.PHP_API_BASE_URL
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: 'Error de configuración del servidor' },
      { status: 500 }
    )
  }

  let phpRes: Response
  try {
    phpRes = await fetch(`${baseUrl}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass }),
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'No se pudo conectar con el servidor' },
      { status: 502 }
    )
  }

  const payload = await phpRes.json()

  if (!payload.success) {
    return NextResponse.json(
      { success: false, message: payload.message ?? 'Credenciales incorrectas' },
      { status: 401 }
    )
  }

  const token: string = payload.data?.token
  const usuario = payload.data?.usuario

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Respuesta inesperada del servidor' },
      { status: 500 }
    )
  }

  const isProduction = process.env.NODE_ENV === 'production'

  const cookieStore = await cookies()
  cookieStore.set('session_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  // Guardamos el nombre de usuario (NO sensible) en cookie legible por servidor
  // para mostrarlo en el header del dashboard
  const usuarioNombre = typeof usuario === 'string'
    ? usuario
    : (usuario?.nombre ?? usuario?.user ?? 'Usuario')

  cookieStore.set('session_user', usuarioNombre, {
    httpOnly: false, // necesita ser legible por el layout servidor
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  return NextResponse.json({ success: true, usuario })
}
