'use client'

import { useState } from 'react'

interface SobreturnoFormProps {
  onSubmit: (hh: string, mm: string) => void
  busy: boolean
}

export default function SobreturnoForm({ onSubmit, busy }: SobreturnoFormProps) {
  const [hora, setHora] = useState('')
  const [minuto, setMinuto] = useState('')

  function handleSubmit() {
    if (!hora || !minuto) return
    onSubmit(hora.padStart(2, '0'), minuto.padStart(2, '0'))
    setHora('')
    setMinuto('')
  }

  return (
    <div className="mt-3 rounded border border-dashed border-border bg-card px-4 py-3">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Agregar sobreturno
      </p>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <label htmlFor="st-hora" className="text-xs text-muted-foreground">Hora</label>
          <input
            id="st-hora"
            type="number"
            min={0}
            max={23}
            placeholder="HH"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-14 rounded border border-border bg-background px-2 py-1 text-center text-sm tabular-nums text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <span className="text-muted-foreground">:</span>
        <div className="flex items-center gap-1.5">
          <label htmlFor="st-minuto" className="text-xs text-muted-foreground">Min</label>
          <input
            id="st-minuto"
            type="number"
            min={0}
            max={59}
            step={5}
            placeholder="MM"
            value={minuto}
            onChange={(e) => setMinuto(e.target.value)}
            className="w-14 rounded border border-border bg-background px-2 py-1 text-center text-sm tabular-nums text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          disabled={!hora || !minuto || busy}
          onClick={handleSubmit}
          className="ml-1 rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? 'Agregando...' : 'Agregar'}
        </button>
      </div>
    </div>
  )
}
