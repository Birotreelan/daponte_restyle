'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSedes, useProfesionales } from '@/hooks/use-catalogos'
import { useAgendas } from '@/hooks/use-agendas'
import TurnoRow from './turno-row'
import SobreturnoForm from './sobreturno-form'
import { NotaModal } from './nota-modal'
import { ToastStack } from '@/components/ui/toast-stack'
import { useToast, useAgendaActions } from '@/hooks/use-agenda-actions'
import type { Turno } from '@/app/api/turnos/route'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  )
}

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      {dir === 'left'
        ? <path d="m15 18-6-6 6-6" />
        : <path d="m9 18 6-6-6-6" />}
    </svg>
  )
}

function CalendarDayButton({
  fecha,
  label,
  active,
  onClick,
}: {
  fecha: string
  label: string
  active: boolean
  onClick: () => void
}) {
  // Parsear fecha YYYY-MM-DD como local (sin UTC shift)
  const [y, m, d] = fecha.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  const dayName = dateObj.toLocaleDateString('es-AR', { weekday: 'short' })
  const dayNum = dateObj.getDate()

  return (
    <button
      type="button"
      onClick={onClick}
      title={label || fecha}
      className={`flex flex-col items-center justify-center rounded-md border px-2 py-1.5 text-center transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:bg-accent'
      }`}
      style={{ minWidth: '3rem' }}
    >
      <span className="text-[10px] capitalize leading-none">{dayName}</span>
      <span className="text-base font-semibold leading-tight">{dayNum}</span>
    </button>
  )
}

export default function AgendaView() {
  // ---- Catálogos ----
  const { sedes, loading: sedesLoading } = useSedes()
  const [sedeId, setSedeId] = useState<string>('')
  const [profesionalId, setProfesionalId] = useState<string>('')

  const { profesionales, loading: profsLoading } = useProfesionales(sedeId || null)

  // Cuando cargan las sedes, seleccionar la primera automáticamente
  useEffect(() => {
    if (sedes.length > 0 && !sedeId) {
      setSedeId(sedes[0].id)
    }
  }, [sedes, sedeId])

  // Cuando cambia la sede, resetear profesional
  useEffect(() => {
    setProfesionalId('')
  }, [sedeId])

  // Cuando cargan los profesionales, seleccionar el primero
  useEffect(() => {
    if (profesionales.length > 0 && !profesionalId) {
      setProfesionalId(profesionales[0].id)
    }
  }, [profesionales, profesionalId])

  // ---- Agendas (fechas disponibles) ----
  const { fechas, loading: agendasLoading } = useAgendas(
    profesionalId || null,
    sedeId || null,
    todayISO(),
  )

  // Fecha seleccionada: primera disponible en la agenda, o hoy
  const [fecha, setFecha] = useState<string>(todayISO)

  useEffect(() => {
    if (fechas.length > 0) {
      setFecha(fechas[0].fecha)
    }
  }, [fechas])

  // Paginación del carrusel de fechas (ventana de 7)
  const [pageOffset, setPageOffset] = useState(0)
  const windowSize = 7
  const visibleFechas = fechas.slice(pageOffset, pageOffset + windowSize)
  const canPrev = pageOffset > 0
  const canNext = pageOffset + windowSize < fechas.length

  // ---- Turnos ----
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const [bloquearDiaModal, setBloquearDiaModal] = useState(false)

  const sedeName = sedes.find((s) => s.id === sedeId)?.nombre ?? ''
  const profName = profesionales.find((p) => p.id === profesionalId)?.nombre ?? ''

  const { toasts, addToast, removeToast } = useToast()

  const fetchTurnos = useCallback(async () => {
    if (!sedeId || !profesionalId || !fecha) return
    setLoading(true)
    setFetchError(null)
    try {
      const params = new URLSearchParams({ sede_id: sedeId, profesional_id: profesionalId, fecha })
      const res = await fetch(`/api/turnos?${params.toString()}`)
      const json = await res.json()
      if (!res.ok || !json.success) {
        setFetchError(json.message ?? 'Error al cargar los turnos')
        setTurnos([])
      } else {
        const data: Turno[] = Array.isArray(json.data) ? json.data : []
        data.sort((a, b) => a.Hora.localeCompare(b.Hora))
        setTurnos(data)
      }
    } catch {
      setFetchError('No se pudo conectar con el servidor')
      setTurnos([])
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }, [sedeId, profesionalId, fecha])

  const ctx = { sedeId, sede: sedeName, profesionalId, profesional: profName, fecha }
  const actions = useAgendaActions(ctx, fetchTurnos, addToast)

  const selectCls =
    'h-8 rounded border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50'

  return (
    <div className="flex flex-col gap-4 font-sans">

      {/* Filtros: Sede + Profesional */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
        {/* Sede */}
        <div className="flex flex-col gap-1">
          <label htmlFor="sel-sede" className="text-xs font-medium text-muted-foreground">Sede</label>
          <select
            id="sel-sede"
            value={sedeId}
            onChange={(e) => setSedeId(e.target.value)}
            disabled={sedesLoading}
            className={selectCls}
          >
            {sedesLoading && <option>Cargando...</option>}
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        {/* Profesional */}
        <div className="flex flex-col gap-1">
          <label htmlFor="sel-prof" className="text-xs font-medium text-muted-foreground">Profesional</label>
          <select
            id="sel-prof"
            value={profesionalId}
            onChange={(e) => setProfesionalId(e.target.value)}
            disabled={!sedeId || profsLoading}
            className={selectCls}
            style={{ minWidth: '16rem' }}
          >
            {profsLoading && <option>Cargando...</option>}
            {!profsLoading && profesionales.length === 0 && (
              <option value="">Sin profesionales</option>
            )}
            {profesionales.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchTurnos}
          disabled={loading || !sedeId || !profesionalId || !fecha}
          className="flex h-8 items-center gap-1.5 rounded bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshIcon spinning={loading} />
          {loading ? 'Cargando...' : 'Consultar'}
        </button>
      </div>

      {/* Selector de fecha por agenda (carrusel) */}
      {profesionalId && sedeId && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {agendasLoading ? 'Cargando fechas...' : fechas.length === 0 ? 'Sin agenda próxima' : 'Fechas con agenda'}
            </span>
            {fechas.length > windowSize && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPageOffset((o) => Math.max(0, o - windowSize))}
                  disabled={!canPrev}
                  className="rounded border border-border bg-background p-0.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-30"
                  aria-label="Semana anterior"
                >
                  <ChevronIcon dir="left" />
                </button>
                <button
                  type="button"
                  onClick={() => setPageOffset((o) => Math.min(fechas.length - 1, o + windowSize))}
                  disabled={!canNext}
                  className="rounded border border-border bg-background p-0.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-30"
                  aria-label="Semana siguiente"
                >
                  <ChevronIcon dir="right" />
                </button>
              </div>
            )}
          </div>
          {!agendasLoading && fechas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {visibleFechas.map((f) => (
                <CalendarDayButton
                  key={f.fecha}
                  fecha={f.fecha}
                  label={f.fecha_formateada ?? f.fecha}
                  active={fecha === f.fecha}
                  onClick={() => setFecha(f.fecha)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grilla */}
      {searched && (
        <div className="flex flex-col gap-2">
          {/* Encabezado */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-foreground">{profName}</p>
              <p className="text-xs text-muted-foreground">
                {sedeName} —{' '}
                {(() => {
                  const [y, m, d] = fecha.split('-').map(Number)
                  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })
                })()}
              </p>
            </div>

            <button
              onClick={() => setBloquearDiaModal(true)}
              className="flex items-center gap-1.5 rounded border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Bloquear todo el día
            </button>
          </div>

          {fetchError && (
            <div className="rounded border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {fetchError}
            </div>
          )}

          {!fetchError && turnos.length === 0 && (
            <div className="rounded border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              No hay turnos para esta agenda.
            </div>
          )}

          {!fetchError && turnos.length > 0 && (
            <div className="flex flex-col gap-1">
              {turnos.map((t) => (
                <TurnoRow
                  key={t.Id}
                  turno={t}
                  busy={actions.busy}
                  onAdmitir={actions.admitir}
                  onCancelar={actions.cancelar}
                  onEliminar={actions.eliminar}
                  onDesbloquear={actions.desbloquear}
                  onConfirmarOnline={actions.confirmarOnline}
                  onCancelarOnline={actions.cancelarOnline}
                  onModificar={actions.modificar}
                  onAsignar={actions.generar}
                />
              ))}
            </div>
          )}

          <SobreturnoForm onSubmit={actions.sobreturno} busy={actions.busy} />
        </div>
      )}

      {/* Estado inicial */}
      {!searched && (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card py-16 text-sm text-muted-foreground">
          {!sedeId || !profesionalId
            ? 'Seleccioná sede y profesional para ver las fechas disponibles.'
            : 'Elegí una fecha y presioná Consultar.'}
        </div>
      )}

      {/* Modal bloquear día */}
      <NotaModal
        open={bloquearDiaModal}
        onClose={() => setBloquearDiaModal(false)}
        onConfirm={(nota) => {
          setBloquearDiaModal(false)
          actions.bloquearDia(nota)
        }}
        title="Bloquear todo el día"
        confirmLabel="Bloquear"
        notaLabel="Motivo del bloqueo"
        busy={actions.busy}
      />

      <ToastStack toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
