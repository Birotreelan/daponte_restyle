'use client'

import type { TvdGraficoSerie } from '@/hooks/use-tvd'

interface GraficoTortaProps {
  series: TvdGraficoSerie[]
  loading?: boolean
}

/**
 * Torta de disponibilidad (Disponibles/Local/Web/Bloqueados), armada con
 * SVG puro (stroke-dasharray por segmento) para no agregar una dependencia
 * nueva solo por esto -- equivalente moderno de jquery.flot.pie.
 */
export default function GraficoTorta({ series, loading = false }: GraficoTortaProps) {
  const total = series.reduce((acc, s) => acc + s.data, 0)
  const radio = 40
  const circunferencia = 2 * Math.PI * radio

  let acumulado = 0
  const segmentos = series
    .filter((s) => s.data > 0)
    .map((s) => {
      const fraccion = total > 0 ? s.data / total : 0
      const largo = fraccion * circunferencia
      const offset = -acumulado * circunferencia
      acumulado += fraccion
      return { ...s, largo, offset }
    })

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Disponibilidad
      </p>
      {loading ? (
        <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">Cargando...</div>
      ) : total === 0 ? (
        <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">Sin datos</div>
      ) : (
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 -rotate-90">
            <circle cx="50" cy="50" r={radio} fill="none" stroke="var(--border, #e5e5e5)" strokeWidth="16" />
            {segmentos.map((s) => (
              <circle
                key={s.label}
                cx="50"
                cy="50"
                r={radio}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={`${s.largo} ${circunferencia - s.largo}`}
                strokeDashoffset={s.offset}
              />
            ))}
          </svg>
          <ul className="flex flex-col gap-1">
            {series.map((s) => (
              <li key={s.label} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
                <span className="text-foreground">{s.label}</span>
                <span className="font-mono text-muted-foreground">{s.data}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
