'use client'

import { useState, useEffect } from 'react'
import { useSedes, useSubespecialidades } from '@/hooks/use-catalogos'
import {
  useTvdProfesionales,
  useTvdCalendario,
  useTvdGrafico,
  useTvdProximosTurnos,
  useTvdTurnosDelDia,
  type TvdAgendaRow,
} from '@/hooks/use-tvd'
import { useToast, useAgendaActions } from '@/hooks/use-agenda-actions'
import { ToastStack } from '@/components/ui/toast-stack'
import { NotaModal } from '@/components/agenda/nota-modal'
import SobreturnoForm from '@/components/agenda/sobreturno-form'
import CalendarioSemaforo from './calendario-semaforo'
import GraficoTorta from './grafico-torta'
import ProximosTurnosList from './proximos-turnos-list'
import BuscadorPacienteTurno from './buscador-paciente-turno'
import ComentarioAgendaBanner from './comentario-agenda-banner'
import TvdTurnoRow from './tvd-turno-row'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const selectCls =
  'h-8 w-full rounded border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50'
const labelCls = 'text-xs font-medium text-muted-foreground'

/**
 * Vista Detallada de turnos -- equivalente a tvd_home.php. A diferencia de
 * Vista Diaria (agenda.php / turno_list.php, un solo profesional a la vez
 * elegido a mano), esta pantalla agrega: filtro por subespecialidad,
 * calendario mensual "semaforo" de disponibilidad, grafico de
 * disponibilidad, acceso rapido a proximos turnos libres, busqueda de
 * pacientes ya con turno asignado, y el set completo de acciones sobre
 * un turno (transferir, copiar, cancelar admisión, bloqueo puntual,
 * recordatorio imprimible).
 */
export default function VistaDetalladaView() {
  // ---- Columna izquierda: selectores ----
  const { sedes, loading: sedesLoading } = useSedes()
  const { subespecialidades } = useSubespecialidades()
  const [sedeId, setSedeId] = useState('')
  const [subespecialidadId, setSubespecialidadId] = useState('all')
  const [profesionalId, setProfesionalId] = useState('')

  const { profesionales, loading: profsLoading } = useTvdProfesionales(sedeId || null, subespecialidadId)

  useEffect(() => {
    if (sedes.length > 0 && !sedeId) setSedeId(sedes[0].id)
  }, [sedes, sedeId])

  useEffect(() => {
    setProfesionalId('')
  }, [sedeId, subespecialidadId])

  useEffect(() => {
    if (profesionales.length > 0 && !profesionalId) setProfesionalId(profesionales[0].Id)
  }, [profesionales, profesionalId])

  // ---- Fecha seleccionada ----
  const [fecha, setFecha] = useState(todayISO())

  // ---- Datos de la columna central ----
  const { eventos, loading: calendarioLoading, refetch: refetchCalendario } = useTvdCalendario(sedeId || null, profesionalId || null, fecha)
  const { series, loading: graficoLoading, refetch: refetchGrafico } = useTvdGrafico(sedeId || null, profesionalId || null)
  const { turnos: proximosTurnos, loading: proximosLoading, refetch: refetchProximos } = useTvdProximosTurnos(sedeId || null, profesionalId || null)

  // ---- Turnos del dia (columna derecha) ----
  const {
    turnos,
    comentarioAgenda,
    loading: turnosLoading,
    refetch: refetchTurnos,
  } = useTvdTurnosDelDia(sedeId || null, profesionalId || null, fecha || null)

  const sedeNombre = sedes.find((s) => s.id === sedeId)?.nombre ?? ''
  const profesional = profesionales.find((p) => p.Id === profesionalId)
  const profesionalNombre = profesional?.Nombre ?? ''

  const { toasts, addToast, removeToast } = useToast()

  function refrescarTodo() {
    refetchTurnos()
    refetchCalendario()
    refetchGrafico()
    refetchProximos()
  }

  const ctx = { sedeId, sede: sedeNombre, profesionalId, profesional: profesionalNombre, fecha }
  const actions = useAgendaActions(ctx, refrescarTodo, addToast)

  const [bloquearDiaModal, setBloquearDiaModal] = useState(false)

  function handleEncontradoPaciente(t: TvdAgendaRow) {
    setProfesionalId(t.Profesional_Id)
    setFecha(t.Fecha)
  }

  function handleGenerarProximo(t: TvdAgendaRow) {
    setFecha(t.Fecha)
  }

  return (
    <div className="flex flex-col gap-4 font-sans">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr_360px]">

        {/* ---- Columna izquierda ---- */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Sede</label>
                <select value={sedeId} onChange={(e) => setSedeId(e.target.value)} disabled={sedesLoading} className={selectCls}>
                  {sedesLoading && <option>Cargando...</option>}
                  {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Subespecialidad</label>
                <select value={subespecialidadId} onChange={(e) => setSubespecialidadId(e.target.value)} className={selectCls}>
                  <option value="all">Todas</option>
                  {subespecialidades.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Profesional</label>
                <select
                  value={profesionalId}
                  onChange={(e) => setProfesionalId(e.target.value)}
                  disabled={!sedeId || profsLoading}
                  className={selectCls}
                >
                  {profsLoading && <option>Cargando...</option>}
                  {!profsLoading && profesionales.length === 0 && <option value="">Sin profesionales</option>}
                  {profesionales.map((p) => <option key={p.Id} value={p.Id}>{p.Nombre}</option>)}
                </select>
              </div>
            </div>
          </div>

          <BuscadorPacienteTurno sedeId={sedeId} onEncontrado={handleEncontradoPaciente} />
        </div>

        {/* ---- Columna central ---- */}
        <div className="flex flex-col gap-3">
          <CalendarioSemaforo
            eventos={eventos}
            fechaSeleccionada={fecha}
            onSelectFecha={setFecha}
            loading={calendarioLoading}
          />
          <GraficoTorta series={series} loading={graficoLoading} />
          <ProximosTurnosList turnos={proximosTurnos} loading={proximosLoading} onGenerar={handleGenerarProximo} />
        </div>

        {/* ---- Columna derecha ---- */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-foreground">{profesionalNombre}</p>
              <p className="text-xs text-muted-foreground">
                {sedeNombre} —{' '}
                {(() => {
                  const [y, m, d] = fecha.split('-').map(Number)
                  return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                })()}
              </p>
            </div>
            <button
              onClick={() => setBloquearDiaModal(true)}
              disabled={!profesionalId}
              className="rounded border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              Bloquear día
            </button>
          </div>

          <ComentarioAgendaBanner comentario={comentarioAgenda} />

          {turnosLoading && (
            <div className="rounded border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">Cargando...</div>
          )}

          {!turnosLoading && profesionalId && turnos.length === 0 && (
            <div className="rounded border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              No hay turnos para esta agenda.
            </div>
          )}

          {!turnosLoading && !profesionalId && (
            <div className="rounded border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              Seleccioná sede y profesional para ver la agenda.
            </div>
          )}

          {!turnosLoading && turnos.length > 0 && (
            <div className="flex flex-col gap-1">
              {turnos.map((t) => (
                <TvdTurnoRow
                  key={t.Id}
                  turno={t}
                  sedeId={sedeId}
                  profesionalId={profesionalId}
                  busy={actions.busy}
                  onAdmitir={actions.admitir}
                  onCancelar={actions.cancelar}
                  onEliminar={actions.eliminar}
                  onCancelarAdmision={actions.cancelarAdmision}
                  onDesbloquear={actions.desbloquear}
                  onBloquear={actions.bloquear}
                  onConfirmarOnline={actions.confirmarOnline}
                  onCancelarOnline={actions.cancelarOnline}
                  onModificar={actions.modificar}
                  onAsignar={actions.generar}
                  onTransferir={actions.transferir}
                  onCopiar={actions.copiar}
                />
              ))}
            </div>
          )}

          <SobreturnoForm onSubmit={actions.sobreturno} busy={actions.busy} />
        </div>
      </div>

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
