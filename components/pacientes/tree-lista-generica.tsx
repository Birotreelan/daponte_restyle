'use client'

import { useState } from 'react'
import { usePacienteTree } from '@/hooks/use-pacientes'

interface TreeListaGenericaProps {
  hc: string
  filtro: 'hc' | 'drv' | 'dia' | 'cir'
  emptyText: string
}

function formatFecha(fecha: string) {
  const [y, m, d] = fecha.split('-').map(Number)
  if (!y || !m || !d) return fecha
  return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`
}

/**
 * Listado genérico de entradas de la bitácora clínica (`tree`), usado por
 * las pestañas H.C., Derivaciones, Diagnosticos y Quirurgico. Muestra
 * fecha, quién intervino (profesional o administrador) y el tipo de
 * práctica -- SIN el detalle clínico interno de cada consulta (los ~40
 * formatters del original quedan fuera de esta primera migración).
 */
export default function TreeListaGenerica({ hc, filtro, emptyText }: TreeListaGenericaProps) {
  const [orden, setOrden] = useState<'asc' | 'desc'>('desc')
  const { entradas, loading, error } = usePacienteTree(hc || null, filtro, orden)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOrden((o) => (o === 'desc' ? 'asc' : 'desc'))}
          className="rounded border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
        >
          {orden === 'desc' ? 'Más recientes primero' : 'Más antiguos primero'}
        </button>
      </div>

      {loading && <p className="py-6 text-center text-sm text-muted-foreground">Cargando...</p>}
      {error && <p className="py-6 text-center text-sm text-destructive">Error al cargar.</p>}

      {!loading && !error && entradas.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
      )}

      {!loading && entradas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {entradas.map((e) => (
            <li key={e.Id} className="rounded border border-border bg-background px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">
                  {formatFecha(e.Fecha)} {e.Hora?.slice(0, 5)}
                </span>
                <span
                  className="text-xs"
                  style={e.Es_Administrador ? { color: '#c0392b', fontWeight: 700 } : undefined}
                >
                  {e.Es_Administrador ? 'Administrador' : 'Dr.'} {e.Profesional_Apellido}, {e.Profesional_Nombres}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {e.Practica_Nombre || e.Practica_Codigo}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
