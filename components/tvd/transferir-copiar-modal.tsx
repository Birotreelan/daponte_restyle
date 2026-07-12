'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { useAgendas } from '@/hooks/use-agendas'
import type { Turno } from '@/app/api/turnos/route'

interface TransferirCopiarModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (turnoDestinoId: string) => void
  modo: 'transferir' | 'copiar'
  sedeId: string
  profesionalId: string
  busy?: boolean
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Selector de destino para transferir/copiar un turno: primero elige una
 * fecha con agenda cargada (mismo listado que usa Vista Diaria), despues
 * elige un horario libre de esa fecha (turno='0' y block='0'). Equivalente
 * simplificado de tvd_turno_tranfer.php (el original mostraba una grilla
 * completa del mes; aca se resuelve en dos pasos mas compactos).
 */
export default function TransferirCopiarModal({
  open,
  onClose,
  onConfirm,
  modo,
  sedeId,
  profesionalId,
  busy = false,
}: TransferirCopiarModalProps) {
  const { fechas, loading: fechasLoading } = useAgendas(open ? profesionalId : null, open ? sedeId : null, todayISO())
  const [fechaDestino, setFechaDestino] = useState<string>('')
  const [slots, setSlots] = useState<Turno[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setFechaDestino('')
      setSlots([])
    }
  }, [open])

  useEffect(() => {
    if (!fechaDestino || !sedeId || !profesionalId) return
    setSlotsLoading(true)
    const params = new URLSearchParams({ sede_id: sedeId, profesional_id: profesionalId, fecha: fechaDestino })
    fetch(`/api/turnos?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        const data: Turno[] = Array.isArray(json.data) ? json.data : []
        setSlots(data.filter((t) => t.turno === '0' && t.block === '0'))
      })
      .finally(() => setSlotsLoading(false))
  }, [fechaDestino, sedeId, profesionalId])

  return (
    <Modal open={open} onClose={onClose} title={modo === 'transferir' ? 'Transferir turno' : 'Copiar turno'} maxWidth="max-w-md">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Fecha destino</label>
          <select
            value={fechaDestino}
            onChange={(e) => setFechaDestino(e.target.value)}
            disabled={fechasLoading}
            className="h-8 rounded border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">{fechasLoading ? 'Cargando...' : '— Seleccionar —'}</option>
            {fechas.map((f) => (
              <option key={f.fecha} value={f.fecha}>{f.fecha_formateada ?? f.fecha}</option>
            ))}
          </select>
        </div>

        {fechaDestino && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Horario libre</label>
            {slotsLoading ? (
              <p className="text-xs text-muted-foreground">Cargando horarios...</p>
            ) : slots.length === 0 ? (
              <p className="text-xs text-muted-foreground">No hay horarios libres ese día.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {slots.map((s) => (
                  <button
                    key={s.Id}
                    type="button"
                    disabled={busy}
                    onClick={() => onConfirm(s.Id)}
                    className="rounded border border-primary/40 bg-primary/5 px-2.5 py-1 text-xs font-mono font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                  >
                    {s.Hora.slice(0, 5)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          disabled={busy}
          className="rounded border border-border bg-background px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  )
}
