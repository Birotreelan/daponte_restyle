'use client'

import useSWR from 'swr'
import { useCallback } from 'react'

// ---------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------

export interface ConsultaCheck {
  existe: boolean
  hora: string | null
  fecha: string
}

export interface Antecedente {
  Paciente_Id: string
  Paciente_HC: string
  Fecha: string
  Hora: string
  Parentesco: string | null
  Ant_Desde: string | null
  Antecedentes: string
}

export interface PioLectura {
  Paciente_Id: string
  Fecha: string
  Hora: string
  OD: string
  OI: string
  Hora_de_Toma: string
  Nada_Patologico: string
  Tonometro: string
  paq_od: string
  paq_oi: string
  vc_od: string
  vc_oi: string
}

export interface DiagnosticoRapido {
  Paciente_Id: string
  Fecha: string
  Hora: string
  Descripcion: string
}

async function getFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const json = await res.json()
  if (!json.success) throw new Error(json.message ?? 'Error')
  return json.data as T
}

async function postAccion<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch('/api/hc-nueva-consulta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message ?? 'Error al guardar')
  return json.data as T
}

// ---------------------------------------------------------------------
// Hooks de lectura
// ---------------------------------------------------------------------

export function useConsultaCheck(pId: string | null, profesionalId: string | null) {
  const key =
    pId && profesionalId ? `/api/hc-nueva-consulta?accion=check&p_id=${pId}&profesional_id=${profesionalId}` : null
  const { data, error, isLoading, mutate } = useSWR<ConsultaCheck>(key, getFetcher<ConsultaCheck>, {
    revalidateOnFocus: false,
  })
  return { check: data ?? null, loading: isLoading, error, refetch: mutate }
}

export function useAntecedentesConsulta(pId: string | null, hc: string | null) {
  const key = pId && hc ? `/api/hc-nueva-consulta?accion=antecedentes&p_id=${pId}&hc=${hc}` : null
  const { data, error, isLoading, mutate } = useSWR<Antecedente[]>(key, getFetcher<Antecedente[]>, {
    revalidateOnFocus: false,
  })
  return { antecedentes: data ?? [], loading: isLoading, error, refetch: mutate }
}

export function usePioDelDia(pId: string | null, hc: string | null, profesionalId: string | null) {
  const key =
    pId && hc && profesionalId
      ? `/api/hc-nueva-consulta?accion=pio&p_id=${pId}&hc=${hc}&profesional_id=${profesionalId}`
      : null
  const { data, error, isLoading, mutate } = useSWR<PioLectura[]>(key, getFetcher<PioLectura[]>, {
    revalidateOnFocus: false,
  })
  return { lecturas: data ?? [], loading: isLoading, error, refetch: mutate }
}

export function useDiagnosticosDelDia(pId: string | null, hc: string | null, profesionalId: string | null) {
  const key =
    pId && hc && profesionalId
      ? `/api/hc-nueva-consulta?accion=diagnosticos&p_id=${pId}&hc=${hc}&profesional_id=${profesionalId}`
      : null
  const { data, error, isLoading, mutate } = useSWR<DiagnosticoRapido[]>(key, getFetcher<DiagnosticoRapido[]>, {
    revalidateOnFocus: false,
  })
  return { diagnosticos: data ?? [], loading: isLoading, error, refetch: mutate }
}

// ---------------------------------------------------------------------
// Acciones de escritura
// ---------------------------------------------------------------------

export function useNuevaConsultaAcciones() {
  const crearAntecedente = useCallback(
    (params: {
      p_id: string
      hc: string
      profesional_id: string
      antecedente: string
      parentesco?: string
      ant_desde?: string
    }) => postAccion({ acc: 'crear_antecedente', ...params }),
    [],
  )

  const eliminarAntecedente = useCallback(
    (params: { p_id: string; hc: string; profesional_id: string; hora: string; antecedente?: string }) =>
      postAccion({ acc: 'eliminar_antecedente', ...params }),
    [],
  )

  const agregarPio = useCallback(
    (
      params: {
        p_id: string
        hc: string
        profesional_id: string
        pio_od?: string
        pio_oi?: string
        pio_hora_toma?: string
        n_patologico?: string
        tonometro?: string
        paq_od?: string
        paq_oi?: string
        vc_od?: string
        vc_oi?: string
      },
    ) => postAccion({ acc: 'agregar_pio', ...params }),
    [],
  )

  const eliminarPio = useCallback(
    (params: { p_id: string; hc: string; profesional_id: string; hora: string }) =>
      postAccion({ acc: 'eliminar_pio', ...params }),
    [],
  )

  const eliminarDiagnostico = useCallback(
    (params: { p_id: string; hc: string; profesional_id: string; hora: string }) =>
      postAccion({ acc: 'eliminar_diagnostico', ...params }),
    [],
  )

  const guardarConsulta = useCallback(
    (params: Record<string, unknown>) => postAccion<{ Fecha: string; Hora: string; Resumen: string[] }>({ acc: 'guardar', ...params }),
    [],
  )

  return { crearAntecedente, eliminarAntecedente, agregarPio, eliminarPio, eliminarDiagnostico, guardarConsulta }
}
