'use client'

import { Modal } from '@/components/ui/modal'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  busy?: boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  danger = false,
  busy = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-foreground">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          disabled={busy}
          className="rounded border border-border bg-background px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className={`rounded px-3.5 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
            danger
              ? 'bg-destructive hover:bg-destructive/90'
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {busy ? 'Procesando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
