'use client'

import { useState } from 'react'
import { usePacienteTree, usePacientePracticaDetalle } from '@/hooks/use-pacientes'
import { PracticaDetalleHtml } from './practica-formatters'

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
 * Detalle clínico puntual de una entrada -- réplica de uno de los ~35
 * frmt_*.php del legacy (ver components/pacientes/practica-formatters.tsx).
 * Se consulta bajo demanda por entrada (cada fila de `tree` dispara su
 * propia consulta a paciente_practica_detalle.php, igual que el original
 * incluye un formatter por fila al construir la página).
 */
function TreeEntradaDetalle({
  pacienteId,
  codigo,
  fecha,
  hora,
}: {
  pacienteId: string
  codigo: string
  fecha: string
  hora: string
}) {
  const { detalle, loading } = usePacientePracticaDetalle(pacienteId, codigo, fecha, hora, true)

  if (loading) {
    return <p className="mt-1 text-xs text-muted-foreground">Cargando detalle...</p>
  }
  if (!detalle) return null

  return (
    <div className="mt-1.5 border-t border-border/60 pt-1.5">
      <PracticaDetalleHtml codigo={detalle.codigo} practica={detalle.practica} tree={{ Fecha: fecha, Hora: hora }} />
    </div>
  )
}

/**
 * Listado genérico de entradas de la bitácora clínica (`tree`), usado por
 * las pestañas H.C., Derivaciones, Diagnosticos y Quirurgico. Muestra
 * fecha, quién intervino (profesional o administrador), el tipo de
 * práctica, y el detalle clínico real de cada entrada (réplica de los
 * frmt_*.php del legacy vía practica-formatters.tsx).
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
              <TreeEntradaDetalle pacienteId={e.Paciente_Id} codigo={e.Practica_Codigo} fecha={e.Fecha} hora={e.Hora} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
