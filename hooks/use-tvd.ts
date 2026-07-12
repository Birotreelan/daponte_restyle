'use client'

import useSWR from 'swr'
import { useCallback, useState } from 'react'
import type { Turno } from '@/app/api/turnos/route'

// ---------------------------------------------------------------------
// Tipos devueltos por los endpoints de Vista Detallada (api/tvd_*.php)
// ---------------------------------------------------------------------

export interface TvdProfesional {
  Id: string
  Apellido: string
  Nombres: string
  Nombre: string
}

export interface TvdCalendarioEvento {
  id: string
  title: string
  start: string // YYYY-MM-DD
  backgroundColor: string
  borderColor: string
  cant_tur: number
  turnos_disp: number
  turnos_block: number
}

export interface TvdGraficoSerie {
  label: string
  color: string
  data: number
}

export interface TvdTurnoConLogs extends Turno {
  sobreturno_logs?: Record<string, unknown>[]
  Paciente_Id?: string
}

/** Fila cruda de `agenda` (SELECT *) -- superset de Turno con Profesional_Id,
 * usada por proximos-turnos y por la búsqueda de pacientes con turno. */
export interface TvdAgendaRow extends Turno {
  Profesional_Id: string
}

// Columnas reales de `agenda_comentarios` (sin Id propio -- la tabla no
// tiene clave primaria autoincremental, ver biro_treeDaponte.sql).
export interface TvdComentarioAgenda {
  Agenda_Id: string
  Sede_Id: string
  Profesional_Id: string
  Fecha_Desde: string
  Fecha_Hasta: string
  Comentario: string
  User_Id: string
  User_Nombre: string
}

export interface TvdTurnosDelDia {
  turnos: TvdTurnoConLogs[]
  comentario_agenda: TvdComentarioAgenda | null
  puede_editar_comentario: boolean
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

async function postFetcher<T>(url: string, bodyJson: string): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyJson,
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message ?? 'Error')
  return json.data as T
}

async function getFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const json = await res.json()
  if (!json.success) throw new Error(json.message ?? 'Error')
  return json.data as T
}

// ---------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------

/** Profesionales filtrados por permisos + subespecialidad (columna izquierda). */
export function useTvdProfesionales(sedeId: string | null, subespecialidadId: string) {
  const body = sedeId ? JSON.stringify({ sede_id: sedeId, subespecialidad_id: subespecialidadId || 'all' }) : null
  const key = sedeId ? (['/api/tvd/profesionales', body] as const) : null

  const { data, error, isLoading } = useSWR<TvdProfesional[]>(
    key,
    ([url, b]) => postFetcher<TvdProfesional[]>(url, b as string),
    { revalidateOnFocus: false },
  )
  return { profesionales: data ?? [], loading: isLoading, error }
}

/** Calendario semaforo (columna central). */
export function useTvdCalendario(sedeId: string | null, profesionalId: string | null, turnoFecha: string) {
  const body =
    sedeId && profesionalId
      ? JSON.stringify({ sede_id: sedeId, profesional_id: profesionalId, turno_fecha: turnoFecha })
      : null
  const key = sedeId && profesionalId ? (['/api/tvd/calendario', body] as const) : null

  const { data, error, isLoading, mutate } = useSWR<TvdCalendarioEvento[]>(
    key,
    ([url, b]) => postFetcher<TvdCalendarioEvento[]>(url, b as string),
    { revalidateOnFocus: false },
  )
  return { eventos: data ?? [], loading: isLoading, error, refetch: mutate }
}

/** Torta de disponibilidad (columna central). */
export function useTvdGrafico(sedeId: string | null, profesionalId: string | null) {
  const body = sedeId && profesionalId ? JSON.stringify({ sede_id: sedeId, profesional_id: profesionalId }) : null
  const key = sedeId && profesionalId ? (['/api/tvd/grafico', body] as const) : null

  const { data, error, isLoading, mutate } = useSWR<TvdGraficoSerie[]>(
    key,
    ([url, b]) => postFetcher<TvdGraficoSerie[]>(url, b as string),
    { revalidateOnFocus: false },
  )
  return { series: data ?? [], loading: isLoading, error, refetch: mutate }
}

/** Proximos turnos disponibles (columna central). */
export function useTvdProximosTurnos(sedeId: string | null, profesionalId: string | null, maxTurnos = 10) {
  const body =
    sedeId && profesionalId
      ? JSON.stringify({ sede_id: sedeId, profesional_id: profesionalId, max_turnos: maxTurnos })
      : null
  const key = sedeId && profesionalId ? (['/api/tvd/proximos-turnos', body] as const) : null

  const { data, error, isLoading, mutate } = useSWR<TvdAgendaRow[]>(
    key,
    ([url, b]) => postFetcher<TvdAgendaRow[]>(url, b as string),
    { revalidateOnFocus: false },
  )
  return { turnos: data ?? [], loading: isLoading, error, refetch: mutate }
}

/** Turnos del dia seleccionado + comentario de agenda (columna derecha). */
export function useTvdTurnosDelDia(sedeId: string | null, profesionalId: string | null, fecha: string | null) {
  const key =
    sedeId && profesionalId && fecha
      ? `/api/tvd/turnos?profesional_id=${profesionalId}&sede_id=${sedeId}&fecha=${fecha}`
      : null

  const { data, error, isLoading, mutate } = useSWR<TvdTurnosDelDia>(key, getFetcher<TvdTurnosDelDia>, {
    revalidateOnFocus: false,
  })
  return {
    turnos: data?.turnos ?? [],
    comentarioAgenda: data?.comentario_agenda ?? null,
    puedeEditarComentario: data?.puede_editar_comentario ?? false,
    loading: isLoading,
    error,
    refetch: mutate,
  }
}

/** Busqueda on-demand de pacientes con turno ya asignado (columna izquierda). */
export function useTvdBuscadorPacientesConTurno() {
  const [resultados, setResultados] = useState<TvdAgendaRow[]>([])
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscar = useCallback(
    async (params: { sedeId: string; apellido?: string; nombres?: string; dni?: string }) => {
      setBuscando(true)
      setError(null)
      try {
        const res = await fetch('/api/tvd/pacientes-buscar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sede_id: params.sedeId,
            paciente_apellido: params.apellido ?? '',
            paciente_nombres: params.nombres ?? '',
            paciente_dni: params.dni ?? '',
          }),
        })
        const json = await res.json()
        if (!json.success) {
          setError(json.message ?? 'Error al buscar')
          setResultados([])
          return
        }
        setResultados(Array.isArray(json.data) ? json.data : [])
      } catch {
        setError('No se pudo conectar con el servidor')
        setResultados([])
      } finally {
        setBuscando(false)
      }
    },
    [],
  )

  return { resultados, buscando, error, buscar }
}
