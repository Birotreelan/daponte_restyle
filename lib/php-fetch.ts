import { cookies } from 'next/headers'

export interface PhpApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

/**
 * Helper reutilizable para llamar a la API PHP externa.
 * Lee la cookie `session_token` y agrega el header Authorization.
 * Si la cookie no existe, devuelve 401 sin llamar al backend.
 */
export async function phpFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; body: PhpApiResponse<T> }> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value

  if (!token) {
    return {
      status: 401,
      body: { success: false, message: 'No autenticado', data: null as T },
    }
  }

  const baseUrl = process.env.PHP_API_BASE_URL
  if (!baseUrl) {
    throw new Error('PHP_API_BASE_URL no está configurado')
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  })

  const body: PhpApiResponse<T> = await res.json()
  return { status: res.status, body }
}
