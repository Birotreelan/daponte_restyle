'use client'

import useSWR from 'swr'

export interface HeaderUsuario {
  id: string
  apellido: string
  nombres: string
  sede_id: string
  sede_nombre: string
  foto: string
  profesional_id: string
}

export interface HeaderInfo {
  usuario: HeaderUsuario
  sede_logo: string | null
  alertas: {
    visitas: number | null
    online: number | null
    autogestion: number | null
  }
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const json = await res.json()
  if (!json.success) throw new Error(json.message ?? 'Error')
  return json.data as T
}

export function useHeaderInfo() {
  const { data, error, isLoading } = useSWR<HeaderInfo>('/api/header-info', fetcher, {
    revalidateOnFocus: false,
  })
  return { headerInfo: data, loading: isLoading, error }
}

export interface AlertaPolling {
  cantidad: number
  alerta: boolean
}

/**
 * Polling de una alerta puntual, cada 1 segundo -- igual que el
 * original (ver js/functions_header_alertas.js, un setInterval por
 * cada uno de los 3 contadores). Solo corre si "habilitado" es true
 * (equivale a que el usuario tenga el permiso correspondiente,
 * data_user_in[11/12/13] > 0 en el legacy).
 */
export function useAlertaPolling(tipo: 'bot_ap' | 'bot_to' | 'bot_a', habilitado: boolean) {
  const { data } = useSWR<AlertaPolling>(
    habilitado ? `/api/header-alertas?tipo=${tipo}` : null,
    fetcher,
    { refreshInterval: 1000, revalidateOnFocus: false, dedupingInterval: 500 }
  )
  return data
}
