'use client'

import useSWR from 'swr'
import { useCallback, useState } from 'react'

// ---------------------------------------------------------------------
// Tipos devueltos por los endpoints de Pacientes (api/pacientes_*.php,
// api/paciente_*.php)
// ---------------------------------------------------------------------

/** Fila de `pacientes` (SELECT * sin Pass/User/Google_Id). */
export interface PacienteRow {
  Id: string
  HC: string
  HC_Anterior: string | null
  Apellido: string
  Nombres: string
  Domicilio: string | null
  Codpost: string | null
  Localidad_Codigo: string | null
  Provincia_Codigo: string | null
  Telefono: string | null
  Celular: string | null
  Tipo_Doc_Codigo: string | null
  Nrodoc: string | null
  Fecha_Nac: string | null
  Sexo: string | null
  Tipo_Deudor_Codigo: string | null
  Deudor_Id: string | null
  Deudor_Nombre: string | null
  Plan_Nombre: string | null
  Nro_Afiliado_Ppal: string | null
  Empresa_Nombre: string | null
  Empresa_Cuit: string | null
  Primera_Visita: string | null
  Ultima_Visita: string | null
  // Nota: el driver legacy mysql_* devuelve TODO como string (incluidos
  // numéricos/tinyint) -- Total_De_Visitas y LC llegan como "67"/"1"/"0",
  // no como number, por eso se tipan como string acá.
  Total_De_Visitas: string | null
  Cuit: string | null
  IVA: string | null
  Mail: string | null
  Notas: string | null
  Notas_HC: string | null
  Condicion: string | null
  Procedencia_Nombre: string | null
  Covid19: string | null
  Sede_Id: string | null
  LC: string | null
  [key: string]: unknown
}

export interface PacienteBusquedaAvanzadaParams {
  paciente_apellido?: string
  paciente_nombres?: string
  paciente_f_nacimiento?: string
  paciente_dni?: string
  paciente_hc?: string
  hc_anterior?: string
  paciente_nro_afiliado?: string
  provincia?: string
  localidad?: string
  empresa?: string
  condicion?: string
  procedencia?: string
  deudor_id?: string
}

export interface TreeAntecedente {
  Paciente_Id: string
  Fecha: string
  Practica_Codigo: string
  Parentesco: string | null
  Ant_Desde: string | null
  Antecedentes: string
}

export interface EtiquetaPaciente {
  Id: string
  Nombre: string
  Tipo: string | null
  deletable: boolean
}

export interface PacienteFicha {
  paciente: PacienteRow
  sede_nombre: string | null
  es_art: boolean
  foto: string | null
  antecedentes: TreeAntecedente[]
  etiquetas: EtiquetaPaciente[]
}

export interface TreeEntrada {
  Id: string
  Fecha: string
  Hora: string
  Practica_Codigo: string
  Practica_Nombre: string
  Profesional_Id: string
  Profesional_Apellido: string
  Profesional_Nombres: string
  Es_Administrador: boolean
}

export interface TreeProtocolo {
  Id: string
  Protocolo_Nombre: string
  Protocolo_Descripcion: string
  Fecha_QX: string | null
  Ojo: string
  Fecha: string | null
  Hora: string | null
  Cirujano_Nombre: string | null
  Ayudante_Nombre: string | null
  [key: string]: unknown
}

export interface HistoricoTurno {
  Id: string
  Fecha: string
  Hora: string
  Profesional_Nombre: string
  Motivo_Nombre: string | null
  admision: '0' | '1'
  [key: string]: unknown
}

export interface HistoricoTurnos {
  turnos: HistoricoTurno[]
  total: number
  presentes: number
  ausentes: number
}

export interface ArchivoPaciente {
  Id: string
  Fecha: string
  Nombre_Archivo: string
  Nombre_Original?: string
  Publica_Web?: '0' | '1'
  Imagen_Id?: string
  [key: string]: unknown
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

async function getFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const json = await res.json()
  if (!json.success) throw new Error(json.message ?? 'Error')
  return json.data as T
}

// ---------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------

/** Búsqueda avanzada de pacientes (pacientes.php), disparada manualmente. */
export function usePacientesBuscarAvanzado() {
  const [resultados, setResultados] = useState<PacienteRow[]>([])
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buscado, setBuscado] = useState(false)

  const buscar = useCallback(async (params: PacienteBusquedaAvanzadaParams) => {
    setBuscando(true)
    setError(null)
    try {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.set(k, v)
      })
      const res = await fetch(`/api/pacientes/buscar-avanzado?${query.toString()}`)
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
      setBuscado(true)
    }
  }, [])

  return { resultados, buscando, error, buscado, buscar }
}

export function usePacienteFicha(pId: string | null) {
  const key = pId ? `/api/pacientes/ficha?p_id=${pId}` : null
  const { data, error, isLoading, mutate } = useSWR<PacienteFicha>(key, getFetcher<PacienteFicha>, {
    revalidateOnFocus: false,
  })
  return { ficha: data ?? null, loading: isLoading, error, refetch: mutate }
}

export function usePacienteTree(id: string | null, filtro: 'hc' | 'drv' | 'dia' | 'cir', orden: 'asc' | 'desc' = 'desc') {
  const key = id ? `/api/pacientes/tree?id=${id}&filtro=${filtro}&orden=${orden}` : null
  const { data, error, isLoading } = useSWR<TreeEntrada[]>(key, getFetcher<TreeEntrada[]>, {
    revalidateOnFocus: false,
  })
  return { entradas: data ?? [], loading: isLoading, error }
}

export function usePacienteProtocolos(pId: string | null) {
  const key = pId ? `/api/pacientes/protocolos?p_id=${pId}` : null
  const { data, error, isLoading } = useSWR<TreeProtocolo[]>(key, getFetcher<TreeProtocolo[]>, {
    revalidateOnFocus: false,
  })
  return { protocolos: data ?? [], loading: isLoading, error }
}

export function usePacienteHistorico(pId: string | null) {
  const key = pId ? `/api/pacientes/historico?p_id=${pId}` : null
  const { data, error, isLoading } = useSWR<HistoricoTurnos>(key, getFetcher<HistoricoTurnos>, {
    revalidateOnFocus: false,
  })
  return {
    turnos: data?.turnos ?? [],
    total: data?.total ?? 0,
    presentes: data?.presentes ?? 0,
    ausentes: data?.ausentes ?? 0,
    loading: isLoading,
    error,
  }
}

export function usePacienteArchivos(
  pId: string | null,
  id: string | null,
  tipo: 'estudios' | 'imagenes' | 'ordenes' | 'ordenes_turnos' | 'consentimientos',
) {
  const necesitaId = tipo === 'estudios' || tipo === 'imagenes' || tipo === 'consentimientos'
  const necesitaPId = tipo === 'ordenes' || tipo === 'ordenes_turnos'
  const listo = necesitaId ? !!id : necesitaPId ? !!pId : false

  const key = listo
    ? `/api/pacientes/archivos?tipo=${tipo}${pId ? `&p_id=${pId}` : ''}${id ? `&id=${id}` : ''}`
    : null

  const { data, error, isLoading } = useSWR<ArchivoPaciente[]>(key, getFetcher<ArchivoPaciente[]>, {
    revalidateOnFocus: false,
  })
  return { archivos: data ?? [], loading: isLoading, error }
}
