import { cookies } from 'next/headers'

export interface PhpApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

/**
 * Helper reutilizable para llamar a la API PHP externa.
 *
 * Puede recibir el token de dos formas:
 *   1. Automática: llama a cookies() internamente (funciona en Route Handlers Next.js)
 *   2. Explícita: pasar `token` en options para casos donde el contexto async no propaga
 *
 * Si no hay token, devuelve 401 sin llamar al backend.
 */
export async function phpFetch<T = unknown>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<{ status: number; body: PhpApiResponse<T> }> {
  const { token: explicitToken, ...fetchOptions } = options

  // Intentar obtener el token: primero el explícito, luego de cookies()
  let token = explicitToken
  if (!token) {
    try {
      const cookieStore = await cookies()
      token = cookieStore.get('session_token')?.value
    } catch {
      // cookies() puede fallar fuera del contexto de un Route Handler activo
    }
  }

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
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  })

  const body: PhpApiResponse<T> = await res.json()
  return { status: res.status, body }
}

/**
 * Extrae el session_token de las cookies del request actual.
 * Llamar desde Route Handlers para pasar el token explícitamente a phpFetch.
 */
export async function getSessionToken(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get('session_token')?.value
  } catch {
    return undefined
  }
}
