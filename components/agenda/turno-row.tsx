'use client'

import { useState, useRef, useEffect } from 'react'
import type { Turno } from '@/app/api/turnos/route'
import { ConfirmModal } from './confirm-modal'
import { NotaModal } from './nota-modal'
import { TurnoFormModal } from './turno-form-modal'

interface TurnoRowProps {
  turno: Turno
  onAdmitir: (id: string) => void
  onCancelar: (id: string) => void
  onEliminar: (id: string) => void
  onDesbloquear: (id: string) => void
  onConfirmarOnline: (id: string, nota: string) => void
  onCancelarOnline: (id: string, nota: string) => void
  onModificar: (data: Record<string, unknown>) => void
  onAsignar: (data: Record<string, unknown>) => void
  busy: boolean
}

// ---- Icon helpers ----
const ChevronIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

// ---- Badge ----
function Badge({ children, variant }: { children: React.ReactNode; variant: 'green' | 'blue' | 'yellow' }) {
  const cls = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    yellow: 'bg-amber-100 text-amber-700 border-amber-200',
  }[variant]
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {children}
    </span>
  )
}

// ---- Acciones dropdown ----
type AccionKey = 'modificar' | 'cancelar' | 'admitir' | 'eliminar'

const ACCIONES: { label: string; key: AccionKey; icon: string; danger?: boolean }[] = [
  { label: 'Modificar', key: 'modificar', icon: 'M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { label: 'Cancelar', key: 'cancelar', icon: 'M18 6 6 18M6 6l12 12' },
  { label: 'Admitir', key: 'admitir', icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
  { label: 'Eliminar', key: 'eliminar', icon: 'M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16', danger: true },
]

function AccionesMenu({ onSelect }: { onSelect: (key: AccionKey) => void }) {
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
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-md border border-border bg-card shadow-lg">
          {ACCIONES.map((a) => (
            <button
              key={a.key}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent ${a.danger ? 'text-destructive hover:bg-red-50' : 'text-foreground'}`}
              onClick={() => { setOpen(false); onSelect(a.key) }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                <path d={a.icon} />
              </svg>
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

// ---- Main ----
export default function TurnoRow({
  turno,
  onAdmitir,
  onCancelar,
  onEliminar,
  onDesbloquear,
  onConfirmarOnline,
  onCancelarOnline,
  onModificar,
  onAsignar,
  busy,
}: TurnoRowProps) {
  const hora = formatHora(turno.Hora)
  const esBloque = turno.block === '1'
  const esOcupado = turno.turno === '1'
  const esPendienteOnline = turno.turno === '2'

  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean; title: string; message: string; onConfirm: () => void; danger?: boolean
  }>({ open: false, title: '', message: '', onConfirm: () => {} })

  const [notaModal, setNotaModal] = useState<{
    open: boolean; title: string; confirmLabel: string; onConfirm: (nota: string) => void
  }>({ open: false, title: '', confirmLabel: 'Confirmar', onConfirm: () => {} })

  const [formModal, setFormModal] = useState(false)

  function openConfirm(title: string, message: string, onConfirm: () => void, danger = false) {
    setConfirmModal({ open: true, title, message, onConfirm, danger })
  }

  function openNota(title: string, confirmLabel: string, onConfirm: (nota: string) => void) {
    setNotaModal({ open: true, title, confirmLabel, onConfirm })
  }

  function handleAccion(key: AccionKey) {
    switch (key) {
      case 'modificar':
        setFormModal(true)
        break
      case 'cancelar':
        openConfirm(
          'Cancelar turno',
          `¿Cancelar el turno de ${turno.Paciente_Apellido}, ${turno.Paciente_Nombres}?`,
          () => { setConfirmModal((p) => ({ ...p, open: false })); onCancelar(turno.Id) },
        )
        break
      case 'admitir':
        openConfirm(
          'Admitir paciente',
          `¿Admitir a ${turno.Paciente_Apellido}, ${turno.Paciente_Nombres}?`,
          () => { setConfirmModal((p) => ({ ...p, open: false })); onAdmitir(turno.Id) },
        )
        break
      case 'eliminar':
        openConfirm(
          'Eliminar turno',
          `¿Eliminar definitivamente el turno de ${turno.Paciente_Apellido}, ${turno.Paciente_Nombres}? Esta acción no se puede deshacer.`,
          () => { setConfirmModal((p) => ({ ...p, open: false })); onEliminar(turno.Id) },
          true,
        )
        break
    }
  }

  // --- Bloqueado ---
  if (esBloque) {
    return (
      <>
        <div className="flex items-center gap-4 rounded border border-border bg-muted/60 px-4 py-2.5">
          <span className="w-12 shrink-0 text-sm font-mono font-medium text-muted-foreground">{hora}</span>
          <div className="flex flex-1 items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-sm text-muted-foreground">
              Bloqueado{turno.block_txt ? `: ${turno.block_txt}` : ''}
            </span>
          </div>
          <button
            onClick={() =>
              openConfirm(
                'Desbloquear horario',
                '¿Desbloquear este horario?',
                () => { setConfirmModal((p) => ({ ...p, open: false })); onDesbloquear(turno.Id) },
              )
            }
            className="rounded border border-border bg-card px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-accent"
          >
            Desbloquear
          </button>
        </div>
        <ConfirmModal
          {...confirmModal}
          onClose={() => setConfirmModal((p) => ({ ...p, open: false }))}
          busy={busy}
        />
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
              <span className="text-sm font-medium text-amber-800">
                {turno.Paciente_Apellido}, {turno.Paciente_Nombres}
              </span>
              <Badge variant="yellow">Pendiente online</Badge>
            </div>
            <span className="text-xs text-amber-600">
              DNI {turno.Paciente_Nro_Doc} — {turno.Deudor_Nombre}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                openNota('Confirmar reserva online', 'Confirmar', (nota) => {
                  setNotaModal((p) => ({ ...p, open: false }))
                  onConfirmarOnline(turno.Id, nota)
                })
              }
              className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Confirmar
            </button>
            <button
              onClick={() =>
                openNota('Rechazar reserva online', 'Rechazar', (nota) => {
                  setNotaModal((p) => ({ ...p, open: false }))
                  onCancelarOnline(turno.Id, nota)
                })
              }
              className="rounded border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              Rechazar
            </button>
          </div>
        </div>
        <NotaModal
          {...notaModal}
          onClose={() => setNotaModal((p) => ({ ...p, open: false }))}
          busy={busy}
        />
      </>
    )
  }

  // --- Turno ocupado ---
  if (esOcupado) {
    return (
      <>
        <div className="flex items-center gap-4 rounded border border-border bg-card px-4 py-2.5">
          <span className="w-12 shrink-0 text-sm font-mono font-medium text-foreground">{hora}</span>
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {turno.Paciente_Apellido}, {turno.Paciente_Nombres}
              </span>
              {turno.admision === '1' && <Badge variant="green">Admitido</Badge>}
              {turno.Confirmado === '1' && <Badge variant="blue">Confirmado</Badge>}
              {turno.sobreturno === '1' && <Badge variant="yellow">Sobreturno</Badge>}
            </div>
            <span className="text-xs text-muted-foreground">
              DNI {turno.Paciente_Nro_Doc} — {turno.Deudor_Nombre}
            </span>
          </div>
          <AccionesMenu onSelect={handleAccion} />
        </div>

        <ConfirmModal
          {...confirmModal}
          onClose={() => setConfirmModal((p) => ({ ...p, open: false }))}
          busy={busy}
        />

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
        <button
          onClick={() => setFormModal(true)}
          className="rounded border border-primary/40 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          Asignar turno
        </button>
      </div>

      <TurnoFormModal
        open={formModal}
        onClose={() => setFormModal(false)}
        onSubmit={(data) => { setFormModal(false); onAsignar({ ...data, turno_id: turno.Id }) }}
        busy={busy}
      />
    </>
  )
}
