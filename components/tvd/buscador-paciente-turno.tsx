'use client'

import { useState } from 'react'
import { useTvdBuscadorPacientesConTurno, type TvdAgendaRow } from '@/hooks/use-tvd'

interface BuscadorPacienteTurnoProps {
  sedeId: string
  onEncontrado: (turno: TvdAgendaRow) => void
}

/**
 * Busca, dentro de los turnos ya asignados de la sede seleccionada, los
 * que coincidan con el paciente buscado (por DNI, o por apellido/nombres).
 * Al elegir un resultado, salta a esa fecha/profesional en la vista.
 */
export default function BuscadorPacienteTurno({ sedeId, onEncontrado }: BuscadorPacienteTurnoProps) {
  const [dni, setDni] = useState('')
  const [apellido, setApellido] = useState('')
  const [nombres, setNombres] = useState('')
  const { resultados, buscando, error, buscar } = useTvdBuscadorPacientesConTurno()

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    if (!sedeId) return
    buscar({ sedeId, dni: dni.trim(), apellido: apellido.trim(), nombres: nombres.trim() })
  }

  const inputCls =
    'h-8 w-full rounded border border-border bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring'

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Buscar paciente con turno
      </p>
      <form onSubmit={handleBuscar} className="flex flex-col gap-2">
        <input
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          placeholder="DNI"
          className={inputCls}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            placeholder="Apellido"
            className={inputCls}
          />
          <input
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            placeholder="Nombres"
            className={inputCls}
          />
        </div>
        <button
          type="submit"
          disabled={!sedeId || buscando || (!dni.trim() && !apellido.trim() && !nombres.trim())}
          className="h-8 rounded bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      {resultados.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
          {resultados.slice(0, 10).map((t) => (
            <li key={t.Id}>
              <button
                type="button"
                onClick={() => onEncontrado(t)}
                className="flex w-full flex-col gap-0 rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
              >
                <span className="font-medium text-foreground">
                  {t.Paciente_Apellido}, {t.Paciente_Nombres}
                </span>
                <span className="text-muted-foreground">
                  {t.Fecha} · {t.Hora.slice(0, 5)} — DNI {t.Paciente_Nro_Doc}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
