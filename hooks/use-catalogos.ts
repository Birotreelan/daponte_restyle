'use client'

import useSWR from 'swr'

// ---- Tipos devueltos por el backend ----
export interface Sede {
  id: string
  nombre: string
  /** Alias comunes del backend */
  Id?: string
  Nombre?: string
}

export interface Profesional {
  id: string
  nombre: string
  Id?: string
  Nombre?: string
}

export interface Motivo {
  id: string
  nombre: string
  Id?: string
  Nombre?: string
}

export interface Deudor {
  id: string
  nombre: string
  Id?: string
  Nombre?: string
}

export interface Plan {
  id: string
  nombre: string
  Id?: string
  Nombre?: string
}

export interface Subespecialidad {
  id: string
  nombre: string
  Id?: string
  Nombre?: string
}

// Normaliza el ítem sin importar si el backend usa Id/Nombre o id/nombre
function normalize(item: Record<string, string>): { id: string; nombre: string } {
  return {
    id: item.id ?? item.Id ?? '',
    nombre: item.nombre ?? item.Nombre ?? '',
  }
}

async function fetcher<T>(url: string): Promise<T[]> {
  const res = await fetch(url)
  const json = await res.json()
  if (!json.success) throw new Error(json.message ?? 'Error')
  const raw = Array.isArray(json.data) ? json.data : []
  return raw.map(normalize) as T[]
}

// ---- Hooks ----

export function useSedes() {
  const { data, error, isLoading } = useSWR<Sede[]>(
    '/api/catalogos?tipo=sedes',
    fetcher,
    { revalidateOnFocus: false },
  )
  return { sedes: data ?? [], loading: isLoading, error }
}

export function useProfesionales(sedeId: string | null) {
  const key = sedeId ? `/api/catalogos?tipo=profesionales&sede_id=${sedeId}` : null
  const { data, error, isLoading } = useSWR<Profesional[]>(key, fetcher, {
    revalidateOnFocus: false,
  })
  return { profesionales: data ?? [], loading: isLoading, error }
}

export function useMotivos() {
  const { data, error, isLoading } = useSWR<Motivo[]>(
    '/api/catalogos?tipo=motivos',
    fetcher,
    { revalidateOnFocus: false },
  )
  return { motivos: data ?? [], loading: isLoading, error }
}

export function useDeudores() {
  const { data, error, isLoading } = useSWR<Deudor[]>(
    '/api/catalogos?tipo=deudores',
    fetcher,
    { revalidateOnFocus: false },
  )
  return { deudores: data ?? [], loading: isLoading, error }
}

export function usePlanes(deudorId: string | null) {
  const key = deudorId ? `/api/catalogos?tipo=planes&deudor_id=${deudorId}` : null
  const { data, error, isLoading } = useSWR<Plan[]>(key, fetcher, {
    revalidateOnFocus: false,
  })
  return { planes: data ?? [], loading: isLoading, error }
}

export function useSubespecialidades() {
  const { data, error, isLoading } = useSWR<Subespecialidad[]>(
    '/api/catalogos?tipo=subespecialidades',
    fetcher,
    { revalidateOnFocus: false },
  )
  return { subespecialidades: data ?? [], loading: isLoading, error }
}

export interface Procedencia {
  id: string
  nombre: string
  Id?: string
  Nombre?: string
}

export function useProcedencia() {
  const { data, error, isLoading } = useSWR<Procedencia[]>(
    '/api/catalogos?tipo=procedencia',
    fetcher,
    { revalidateOnFocus: false },
  )
  return { procedencias: data ?? [], loading: isLoading, error }
}
