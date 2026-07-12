'use client'

import type { TvdAgendaRow } from '@/hooks/use-tvd'

interface ProximosTurnosListProps {
  turnos: TvdAgendaRow[]
  loading?: boolean
  onGenerar: (turno: TvdAgendaRow) => void
}

function formatFechaCorta(fecha: string) {
  const [y, m, d] = fecha.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

/**
 * Acceso rapido a los proximos turnos disponibles, para no tener que
 * navegar el calendario buscando el primer hueco libre.
 */
export default function ProximosTurnosList({ turnos, loading = false, onGenerar }: ProximosTurnosListProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Próximos turnos disponibles
      </p>
      {loading ? (
        <p className="py-3 text-center text-xs text-muted-foreground">Cargando...</p>
      ) : turnos.length === 0 ? (
        <p className="py-3 text-center text-xs text-muted-foreground">No hay turnos disponibles.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {turnos.map((t) => (
            <li key={t.Id} className="flex items-center justify-between rounded border border-border/60 bg-background px-2 py-1 text-xs">
              <span className="font-mono text-foreground">
                {formatFechaCorta(t.Fecha)} · {t.Hora.slice(0, 5)}
              </span>
              <button
                type="button"
                onClick={() => onGenerar(t)}
                className="rounded border border-primary/40 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/10"
              >
                Generar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
