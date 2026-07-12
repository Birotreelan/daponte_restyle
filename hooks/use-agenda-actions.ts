'use client'

import { useCallback, useRef, useState } from 'react'

// ---- Toast mínimo en-memoria (sin dependencia externa) ----
export interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

let nextId = 1

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

// ---- Hook principal de acciones ----
export interface AgendaContext {
  sedeId: string
  sede: string
  profesionalId: string
  profesional: string
  fecha: string
}

async function apiPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json() as Promise<{ success: boolean; message: string; data: unknown }>
}

export function useAgendaActions(
  ctx: AgendaContext,
  onRefresh: () => void,
  addToast: (msg: string, type: 'success' | 'error') => void,
) {
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)

  const run = useCallback(
    async (fn: () => Promise<{ success: boolean; message: string; data: unknown }>) => {
      if (busyRef.current) return
      busyRef.current = true
      setBusy(true)
      try {
        const res = await fn()
        addToast(res.message ?? (res.success ? 'Listo' : 'Error'), res.success ? 'success' : 'error')
        if (res.success) onRefresh()
      } catch {
        addToast('No se pudo conectar con el servidor', 'error')
      } finally {
        busyRef.current = false
        setBusy(false)
      }
    },
    [onRefresh, addToast],
  )

  const generar = useCallback(
    (body: Record<string, unknown>) => run(() => apiPost('/api/turnos/generar', body)),
    [run],
  )

  const modificar = useCallback(
    (body: Record<string, unknown>) => run(() => apiPost('/api/turnos/modificar', body)),
    [run],
  )

  const admitir = useCallback(
    (turnoId: string) => run(() => apiPost('/api/turnos/admitir', { turno_id: turnoId })),
    [run],
  )

  const cancelar = useCallback(
    (turnoId: string) => run(() => apiPost('/api/turnos/cancelar', { turno_id: turnoId })),
    [run],
  )

  const eliminar = useCallback(
    (turnoId: string) => run(() => apiPost('/api/turnos/eliminar', { turno_id: turnoId })),
    [run],
  )

  const cancelarAdmision = useCallback(
    (turnoId: string, pacienteId: string) =>
      run(() => apiPost('/api/turnos/cancelar-admision', { turno_id: turnoId, paciente_id: pacienteId })),
    [run],
  )

  const transferir = useCallback(
    (turnoId: string, turnoOldId: string) =>
      run(() => apiPost('/api/turnos/transferir', { turno_id: turnoId, turno_old_id: turnoOldId })),
    [run],
  )

  const copiar = useCallback(
    (turnoId: string, turnoOldId: string) =>
      run(() => apiPost('/api/turnos/copiar', { turno_id: turnoId, turno_old_id: turnoOldId })),
    [run],
  )

  const bloquear = useCallback(
    (turnoId: string, blockTxt: string) =>
      run(() => apiPost('/api/turnos/bloqueo', { modo: 'bloquear', turno_id: turnoId, block_txt: blockTxt })),
    [run],
  )

  const bloquearDia = useCallback(
    (blockTxt: string) =>
      run(() =>
        apiPost('/api/turnos/bloqueo', {
          modo: 'bloquear_dia',
          profesional_id: ctx.profesionalId,
          sede_id: ctx.sedeId,
          fecha: ctx.fecha,
          block_txt: blockTxt,
        }),
      ),
    [run, ctx],
  )

  const desbloquear = useCallback(
    (turnoId: string) =>
      run(() => apiPost('/api/turnos/bloqueo', { modo: 'desbloquear', turno_id: turnoId })),
    [run],
  )

  const confirmarOnline = useCallback(
    (turnoId: string, notaMail: string) =>
      run(() => apiPost('/api/turnos/confirmar-online', { turno_id: turnoId, nota_mail: notaMail })),
    [run],
  )

  const cancelarOnline = useCallback(
    (turnoId: string, notaMail: string) =>
      run(() => apiPost('/api/turnos/cancelar-online', { turno_id: turnoId, nota_mail: notaMail })),
    [run],
  )

  const sobreturno = useCallback(
    (hh: string, mm: string) =>
      run(() =>
        apiPost('/api/turnos/sobreturno', {
          hh,
          mm,
          sede_id: ctx.sedeId,
          sede: ctx.sede,
          fecha: ctx.fecha,
          profesional_id: ctx.profesionalId,
          profesional: ctx.profesional,
        }),
      ),
    [run, ctx],
  )

  return {
    busy,
    generar,
    modificar,
    admitir,
    cancelar,
    eliminar,
    cancelarAdmision,
    transferir,
    copiar,
    bloquear,
    bloquearDia,
    desbloquear,
    confirmarOnline,
    cancelarOnline,
    sobreturno,
  }
}
