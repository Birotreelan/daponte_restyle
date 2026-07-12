'use client'

import { useState, useRef, useEffect } from 'react'
import type { TvdTurnoConLogs } from '@/hooks/use-tvd'
import { ConfirmModal } from '@/components/agenda/confirm-modal'
import { NotaModal } from '@/components/agenda/nota-modal'
import { TurnoFormModal } from '@/components/agenda/turno-form-modal'
import TransferirCopiarModal from './transferir-copiar-modal'
import RecordatorioModal from './recordatorio-modal'

interface TvdTurnoRowProps {
  turno: TvdTurnoConLogs
  sedeId: string
  profesionalId: string
  busy: boolean
  onAdmitir: (id: string) => void
  onCancelar: (id: string) => void
  onEliminar: (id: string) => void
  onCancelarAdmision: (id: string, pacienteId: string) => void
  onDesbloquear: (id: string) => void
  onBloquear: (id: string, blockTxt: string) => void
  onConfirmarOnline: (id: string, nota: string) => void
  onCancelarOnline: (id: string, nota: string) => void
  onModificar: (data: Record<string, unknown>) => void
  onAsignar: (data: Record<string, unknown>) => void
  onTransferir: (turnoId: string, turnoOldId: string) => void
  onCopiar: (turnoId: string, turnoOldId: string) => void
}

function Badge({ children, variant }: { children: React.ReactNode; variant: 'green' | 'blue' | 'yellow' | 'gray' }) {
  const cls = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    yellow: 'bg-amber-100 text-amber-700 border-amber-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  }[variant]
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {children}
    </span>
  )
}

const ChevronIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

type AccionKey = 'modificar' | 'cancelar' | 'admitir' | 'cancelar_admision' | 'eliminar' | 'transferir' | 'copiar' | 'bloquear' | 'recordatorio'

function AccionesMenu({ acciones, onSelect }: { acciones: { label: string; key: AccionKey; danger?: boolean }[]; onSelect: (key: AccionKey) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded border border-border bg-card px-2 py-1 text-xs text-foreground transition-colors hover:bg-accent"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Acciones <ChevronIcon />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-md border border-border bg-card shadow-lg">
          {acciones.map((a) => (
            <button
              key={a.key}
              className={`flex w-full items-center px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent ${a.danger ? 'text-destructive hover:bg-red-50' : 'text-foreground'}`}
              onClick={() => { setOpen(false); onSelect(a.key) }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function formatHora(hora: string) {
  return hora.slice(0, 5)
}

/**
 * Fila de turno para Vista Detallada: mismo criterio visual que TurnoRow
 * (columna derecha de Vista Diaria), pero con el set completo de acciones
 * del turno_acc.php original (transferir, copiar, cancelar admisión,
 * bloquear puntual, recordatorio imprimible) en vez del subconjunto
 * reducido de Vista Diaria.
 */
export default function TvdTurnoRow({
  turno,
  sedeId,
  profesionalId,
  busy,
  onAdmitir,
  onCancelar,
  onEliminar,
  onCancelarAdmision,
  onDesbloquear,
  onBloquear,
  onConfirmarOnline,
  onCancelarOnline,
  onModificar,
  onAsignar,
  onTransferir,
  onCopiar,
}: TvdTurnoRowProps) {
  const hora = formatHora(turno.Hora)
  const esBloque = turno.block === '1'
  const esOcupado = turno.turno === '1'
  const esPendienteOnline = turno.turno === '2'

  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; danger?: boolean }>({ open: false, title: '', message: '', onConfirm: () => {} })
  const [notaModal, setNotaModal] = useState<{ open: boolean; title: string; confirmLabel: string; notaLabel?: string; onConfirm: (nota: string) => void }>({ open: false, title: '', confirmLabel: 'Confirmar', onConfirm: () => {} })
  const [formModal, setFormModal] = useState(false)
  const [transferModal, setTransferModal] = useState<{ open: boolean; modo: 'transferir' | 'copiar' }>({ open: false, modo: 'transferir' })
  const [recordatorioModal, setRecordatorioModal] = useState(false)

  function openConfirm(title: string, message: string, onConfirm: () => void, danger = false) {
    setConfirmModal({ open: true, title, message, onConfirm, danger })
  }
  function openNota(title: string, confirmLabel: string, onConfirm: (nota: string) => void, notaLabel?: string) {
    setNotaModal({ open: true, title, confirmLabel, onConfirm, notaLabel })
  }

  function handleAccion(key: AccionKey) {
    switch (key) {
      case 'modificar':
        setFormModal(true)
        break
      case 'recordatorio':
        setRecordatorioModal(true)
        break
      case 'transferir':
        setTransferModal({ open: true, modo: 'transferir' })
        break
      case 'copiar':
        setTransferModal({ open: true, modo: 'copiar' })
        break
      case 'bloquear':
        openNota('Bloquear turno', 'Bloquear', (nota) => {
          setNotaModal((p) => ({ ...p, open: false }))
          onBloquear(turno.Id, nota)
        }, 'Motivo del bloqueo')
        break
      case 'cancelar':
        openConfirm('Cancelar turno', `¿Cancelar el turno de ${turno.Paciente_Apellido}, ${turno.Paciente_Nombres}?`, () => {
          setConfirmModal((p) => ({ ...p, open: false })); onCancelar(turno.Id)
        })
        break
      case 'admitir':
        openConfirm('Admitir paciente', `¿Admitir a ${turno.Paciente_Apellido}, ${turno.Paciente_Nombres}?`, () => {
          setConfirmModal((p) => ({ ...p, open: false })); onAdmitir(turno.Id)
        })
        break
      case 'cancelar_admision':
        openConfirm('Cancelar admisión', `¿Cancelar la admisión de ${turno.Paciente_Apellido}, ${turno.Paciente_Nombres}?`, () => {
          setConfirmModal((p) => ({ ...p, open: false })); onCancelarAdmision(turno.Id, turno.Paciente_Id ?? '')
        })
        break
      case 'eliminar':
        openConfirm('Eliminar turno', `¿Eliminar definitivamente el turno de ${turno.Paciente_Apellido}, ${turno.Paciente_Nombres}? Esta acción no se puede deshacer.`, () => {
          setConfirmModal((p) => ({ ...p, open: false })); onEliminar(turno.Id)
        }, true)
        break
    }
  }

  const modalesComunes = (
    <>
      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal((p) => ({ ...p, open: false }))} busy={busy} />
      <NotaModal {...notaModal} onClose={() => setNotaModal((p) => ({ ...p, open: false }))} busy={busy} />
      <TransferirCopiarModal
        open={transferModal.open}
        modo={transferModal.modo}
        onClose={() => setTransferModal((p) => ({ ...p, open: false }))}
        onConfirm={(destinoId) => {
          setTransferModal((p) => ({ ...p, open: false }))
          if (transferModal.modo === 'transferir') onTransferir(destinoId, turno.Id)
          else onCopiar(destinoId, turno.Id)
        }}
        sedeId={sedeId}
        profesionalId={profesionalId}
        busy={busy}
      />
      <RecordatorioModal open={recordatorioModal} onClose={() => setRecordatorioModal(false)} turnoId={turno.Id} />
    </>
  )

  // --- Bloqueado ---
  if (esBloque) {
    return (
      <>
        <div className="flex items-center gap-4 rounded border border-border bg-muted/60 px-4 py-2.5">
          <span className="w-12 shrink-0 text-sm font-mono font-medium text-muted-foreground">{hora}</span>
          <div className="flex flex-1 items-center gap-2">
            <span className="text-sm text-muted-foreground">Bloqueado{turno.block_txt ? `: ${turno.block_txt}` : ''}</span>
          </div>
          <button
            onClick={() => openConfirm('Desbloquear horario', '¿Desbloquear este horario?', () => {
              setConfirmModal((p) => ({ ...p, open: false })); onDesbloquear(turno.Id)
            })}
            className="rounded border border-border bg-card px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-accent"
          >
            Desbloquear
          </button>
        </div>
        {modalesComunes}
      </>
    )
  }

  // --- Reservado online pendiente ---
  if (esPendienteOnline) {
    return (
      <>
        <div className="flex items-center gap-4 rounded border border-amber-200 bg-amber-50 px-4 py-2.5">
          <span className="w-12 shrink-0 text-sm font-mono font-medium text-amber-700">{hora}</span>
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-amber-800">{turno.Paciente_Apellido}, {turno.Paciente_Nombres}</span>
              <Badge variant="yellow">Pendiente online</Badge>
            </div>
            <span className="text-xs text-amber-600">DNI {turno.Paciente_Nro_Doc} — {turno.Deudor_Nombre}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openNota('Confirmar reserva online', 'Confirmar', (nota) => {
                setNotaModal((p) => ({ ...p, open: false })); onConfirmarOnline(turno.Id, nota)
              })}
              className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Confirmar
            </button>
            <button
              onClick={() => openNota('Rechazar reserva online', 'Rechazar', (nota) => {
                setNotaModal((p) => ({ ...p, open: false })); onCancelarOnline(turno.Id, nota)
              })}
              className="rounded border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              Rechazar
            </button>
          </div>
        </div>
        {modalesComunes}
      </>
    )
  }

  // --- Ocupado ---
  if (esOcupado) {
    const acciones: { label: string; key: AccionKey; danger?: boolean }[] = [
      { label: 'Modificar', key: 'modificar' },
      { label: 'Recordatorio', key: 'recordatorio' },
      { label: 'Transferir', key: 'transferir' },
      { label: 'Copiar', key: 'copiar' },
      turno.admision === '1'
        ? { label: 'Cancelar admisión', key: 'cancelar_admision' }
        : { label: 'Admitir', key: 'admitir' },
      { label: 'Cancelar turno', key: 'cancelar' },
      { label: 'Eliminar', key: 'eliminar', danger: true },
    ]
    return (
      <>
        <div className="flex items-center gap-4 rounded border border-border bg-card px-4 py-2.5">
          <span className="w-12 shrink-0 text-sm font-mono font-medium text-foreground">{hora}</span>
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">{turno.Paciente_Apellido}, {turno.Paciente_Nombres}</span>
              {turno.admision === '1' && <Badge variant="green">Admitido</Badge>}
              {turno.Confirmado === '1' && <Badge variant="blue">Confirmado</Badge>}
              {turno.sobreturno === '1' && <Badge variant="yellow">Sobreturno</Badge>}
            </div>
            <span className="text-xs text-muted-foreground">DNI {turno.Paciente_Nro_Doc} — {turno.Deudor_Nombre}</span>
          </div>
          <AccionesMenu acciones={acciones} onSelect={handleAccion} />
        </div>

        {modalesComunes}
        <TurnoFormModal
          open={formModal}
          onClose={() => setFormModal(false)}
          onSubmit={(data) => { setFormModal(false); onModificar(data) }}
          turno={turno}
          busy={busy}
        />
      </>
    )
  }

  // --- Libre ---
  return (
    <>
      <div className="flex items-center gap-4 rounded border border-border bg-background px-4 py-2.5">
        <span className="w-12 shrink-0 text-sm font-mono font-medium text-muted-foreground">{hora}</span>
        <span className="flex-1 text-sm text-muted-foreground/70">Disponible</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleAccion('bloquear')}
            className="rounded border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
          >
            Bloquear
          </button>
          <button
            onClick={() => setFormModal(true)}
            className="rounded border border-primary/40 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Asignar turno
          </button>
        </div>
      </div>

      {modalesComunes}
      <TurnoFormModal
        open={formModal}
        onClose={() => setFormModal(false)}
        onSubmit={(data) => { setFormModal(false); onAsignar({ ...data, turno_id: turno.Id }) }}
        busy={busy}
      />
    </>
  )
}
