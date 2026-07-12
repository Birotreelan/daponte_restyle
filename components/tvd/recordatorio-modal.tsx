'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/modal'

interface RecordatorioData {
  turno: {
    Fecha: string
    Hora: string
    Paciente_Apellido: string
    Paciente_Nombres: string
    Profesional_Nombre: string
  }
  dia_nombre: string
  sede: {
    Nombre: string
    Domicilio: string
    Telefono: string
  } | null
}

interface RecordatorioModalProps {
  open: boolean
  onClose: () => void
  turnoId: string | null
}

/**
 * Recordatorio imprimible de un turno (equivalente a turno_acc.php /
 * tvd_turno_acc.php case "rcd_t"). El original armaba el HTML server-side;
 * aca se pide el dato estructurado (api/turnos/recordatorio) y se arma la
 * vista imprimible en el cliente.
 */
export default function RecordatorioModal({ open, onClose, turnoId }: RecordatorioModalProps) {
  const [data, setData] = useState<RecordatorioData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !turnoId) return
    setLoading(true)
    setError(null)
    setData(null)
    fetch('/api/turnos/recordatorio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turno_id: turnoId }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) {
          setError(json.message ?? 'Error al cargar el recordatorio')
          return
        }
        setData(json.data)
      })
      .catch(() => setError('No se pudo conectar con el servidor'))
      .finally(() => setLoading(false))
  }, [open, turnoId])

  return (
    <Modal open={open} onClose={onClose} title="Recordatorio de turno" maxWidth="max-w-sm">
      {loading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {data && (
        <div id="recordatorio-imprimir" className="flex flex-col gap-1.5 text-sm text-foreground">
          <p>
            <span className="font-semibold">Fecha:</span> {data.dia_nombre} {data.turno.Fecha}
          </p>
          <p>
            <span className="font-semibold">Hora:</span> {data.turno.Hora}
          </p>
          <p>
            <span className="font-semibold">Paciente:</span> {data.turno.Paciente_Apellido} {data.turno.Paciente_Nombres}
          </p>
          <p>
            <span className="font-semibold">Profesional:</span> {data.turno.Profesional_Nombre}
          </p>
          {data.sede && (
            <>
              <p className="mt-2">
                <span className="font-semibold">Sede:</span> {data.sede.Nombre}
              </p>
              <p>
                <span className="font-semibold">Dirección:</span> {data.sede.Domicilio}
              </p>
              <p>
                <span className="font-semibold">Tel:</span> {data.sede.Telefono}
              </p>
            </>
          )}
        </div>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded border border-border bg-background px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
        >
          Cerrar
        </button>
        <button
          onClick={() => window.print()}
          disabled={!data}
          className="rounded bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          Imprimir
        </button>
      </div>
    </Modal>
  )
}
