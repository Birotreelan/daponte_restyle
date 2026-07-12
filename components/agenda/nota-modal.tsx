'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'

interface NotaModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (nota: string) => void
  title: string
  confirmLabel?: string
  notaLabel?: string
  busy?: boolean
}

export function NotaModal({
  open,
  onClose,
  onConfirm,
  title,
  confirmLabel = 'Confirmar',
  notaLabel = 'Nota (opcional)',
  busy = false,
}: NotaModalProps) {
  const [nota, setNota] = useState('')

  function handleClose() {
    setNota('')
    onClose()
  }

  function handleConfirm() {
    onConfirm(nota)
    setNota('')
  }

  return (
    <Modal open={open} onClose={handleClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">{notaLabel}</label>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          rows={3}
          className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          placeholder="Escribí una nota para incluir en el mail..."
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={handleClose}
          disabled={busy}
          className="rounded border border-border bg-background px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={busy}
          className="rounded bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? 'Procesando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
