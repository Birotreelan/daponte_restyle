'use client'

import { useMemo, useState, useEffect } from 'react'
import type { TvdCalendarioEvento } from '@/hooks/use-tvd'

interface CalendarioSemaforoProps {
  eventos: TvdCalendarioEvento[]
  fechaSeleccionada: string
  onSelectFecha: (fecha: string) => void
  loading?: boolean
}

const DIAS_SEMANA = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseISO(fecha: string): [number, number, number] {
  const [y, m, d] = fecha.split('-').map(Number)
  return [y, (m || 1) - 1, d || 1]
}

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      {dir === 'left' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  )
}

/**
 * Calendario mensual "semaforo": cada dia se colorea segun disponibilidad
 * (verde = disponible, rojo = completa sin bloqueos, amarillo = completa
 * con bloqueos, gris = pasado, celeste = seleccionado) -- misma logica de
 * colores que tvd_calendario.php, en un grid moderno en vez de FullCalendar.
 */
export default function CalendarioSemaforo({
  eventos,
  fechaSeleccionada,
  onSelectFecha,
  loading = false,
}: CalendarioSemaforoProps) {
  const [y0, m0] = parseISO(fechaSeleccionada || toISO(new Date().getFullYear(), new Date().getMonth(), 1))
  const [mesVisible, setMesVisible] = useState<{ y: number; m: number }>({ y: y0, m: m0 })

  // Si cambia la fecha seleccionada desde afuera (ej. al elegir profesional
  // nuevo), sincronizar el mes visible.
  useEffect(() => {
    if (!fechaSeleccionada) return
    const [y, m] = parseISO(fechaSeleccionada)
    setMesVisible({ y, m })
  }, [fechaSeleccionada])

  const eventosPorFecha = useMemo(() => {
    const map = new Map<string, TvdCalendarioEvento>()
    for (const ev of eventos) map.set(ev.start, ev)
    return map
  }, [eventos])

  const celdas = useMemo(() => {
    const primerDia = new Date(mesVisible.y, mesVisible.m, 1)
    const offsetInicio = primerDia.getDay() // 0=domingo
    const diasEnMes = new Date(mesVisible.y, mesVisible.m + 1, 0).getDate()

    const out: { fecha: string | null; dia: number | null }[] = []
    for (let i = 0; i < offsetInicio; i++) out.push({ fecha: null, dia: null })
    for (let d = 1; d <= diasEnMes; d++) out.push({ fecha: toISO(mesVisible.y, mesVisible.m, d), dia: d })
    return out
  }, [mesVisible])

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMesVisible((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))}
          className="rounded border border-border bg-background p-0.5 text-muted-foreground transition-colors hover:bg-accent"
          aria-label="Mes anterior"
        >
          <ChevronIcon dir="left" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MESES[mesVisible.m]} {mesVisible.y}
        </span>
        <button
          type="button"
          onClick={() => setMesVisible((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))}
          className="rounded border border-border bg-background p-0.5 text-muted-foreground transition-colors hover:bg-accent"
          aria-label="Mes siguiente"
        >
          <ChevronIcon dir="right" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS_SEMANA.map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-muted-foreground">{d}</span>
        ))}
        {celdas.map((c, i) => {
          if (!c.fecha) return <span key={i} />
          const ev = eventosPorFecha.get(c.fecha)
          const seleccionado = c.fecha === fechaSeleccionada
          const color = ev?.backgroundColor
          return (
            <button
              key={c.fecha}
              type="button"
              onClick={() => onSelectFecha(c.fecha!)}
              disabled={loading}
              title={ev ? `${ev.turnos_disp}/${ev.cant_tur} ocupados, ${ev.turnos_block} bloqueados` : undefined}
              className={`flex h-7 items-center justify-center rounded text-xs transition-transform hover:scale-105 disabled:opacity-50 ${
                seleccionado ? 'ring-2 ring-offset-1 ring-[#1094bf]' : ''
              }`}
              style={{
                backgroundColor: color ?? 'transparent',
                color: color ? '#fff' : 'var(--muted-foreground, #888)',
                fontWeight: seleccionado ? 700 : 400,
              }}
            >
              {c.dia}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: '#94BF10' }} /> Disponible</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: '#DE0B0B' }} /> Completa</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: '#FAD42E' }} /> Completa c/bloqueos</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: '#AFAFAF' }} /> Pasado</span>
      </div>
    </div>
  )
}
