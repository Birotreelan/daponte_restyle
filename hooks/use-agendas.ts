'use client'

import useSWR from 'swr'

export interface AgendaFecha {
  fecha: string          // 'YYYY-MM-DD'
  fecha_formateada?: string
  /** Alias del backend */
  Fecha?: string
  Fecha_Formateada?: string
}

function normalizeFecha(item: Record<string, string>): AgendaFecha {
  const fecha = item.fecha ?? item.Fecha ?? ''
  return { fecha, fecha_formateada: item.fecha_formateada ?? item.Fecha_Formateada ?? fecha }
}

async function fetcher(url: string): Promise<AgendaFecha[]> {
  const res = await fetch(url)
  const json = await res.json()
  if (!json.success) throw new Error(json.message ?? 'Error')
  const raw = Array.isArray(json.data) ? json.data : []
  return raw.map(normalizeFecha)
}

/**
 * Devuelve la lista de fechas con agenda para un profesional+sede dados.
 * Se suspende automáticamente cuando faltan parámetros.
 *
 * @param profesionalId  ID del profesional
 * @param centroId       ID de la sede / centro
 * @param fechaDesde     'YYYY-MM-DD' — buscar desde esta fecha (default: hoy)
 */
export function useAgendas(
  profesionalId: string | null,
  centroId: string | null,
  fechaDesde: string,
) {
  const key =
    profesionalId && centroId
      ? `/api/agendas?profesional_id=${profesionalId}&centro_id=${centroId}&fecha_desde=${fechaDesde}`
      : null

  const { data, error, isLoading, mutate } = useSWR<AgendaFecha[]>(key, fetcher, {
    revalidateOnFocus: false,
  })

  return {
    fechas: data ?? [],
    loading: isLoading,
    error,
    refetch: mutate,
  }
}
