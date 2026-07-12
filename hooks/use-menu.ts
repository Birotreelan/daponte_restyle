'use client'

import useSWR from 'swr'

export interface MenuSubItem {
  id: string | number | null
  nombre: string
  link: string
  acceskey?: string
}

export interface MenuProceso {
  id: string | null
  nombre: string
  link: string
  subprocesos: MenuSubItem[]
}

export interface MenuData {
  menu: MenuProceso[]
  ayuda: MenuProceso
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const json = await res.json()
  if (!json.success) throw new Error(json.message ?? 'Error')
  return json.data as T
}

export function useMenu() {
  const { data, error, isLoading } = useSWR<MenuData>('/api/menu', fetcher, {
    revalidateOnFocus: false,
  })
  return { menu: data?.menu ?? [], ayuda: data?.ayuda ?? null, loading: isLoading, error }
}

export interface AccesoRapido {
  id: string | number
  nombre: string
  link: string
  imagen: string
}

/**
 * Fila de iconos de acceso rapido de la seccion activa. Equivale a lo
 * que en el original decide $Proceso_Padre (cada pagina legacy lo fija
 * antes de incluir header.php); aca lo pasa el componente segun la
 * seccion en la que esta parado el usuario.
 */
export function useAccesosRapidos(procesoId: string | null) {
  const key = procesoId ? `/api/menu?accesos_rapidos=${encodeURIComponent(procesoId)}` : null
  const { data, isLoading } = useSWR<{ accesos_rapidos: AccesoRapido[] }>(key, fetcher, {
    revalidateOnFocus: false,
  })
  return { accesosRapidos: data?.accesos_rapidos ?? [], loading: isLoading }
}
