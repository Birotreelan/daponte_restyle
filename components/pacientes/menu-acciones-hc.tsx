'use client'

import { useState } from 'react'
import { useHeaderInfo } from '@/hooks/use-header'
import NuevaConsultaModal from './nueva-consulta-modal'

/**
 * Menu lateral de acciones de carga de paciente.php (líneas 1153-1362):
 * cada link ahí abre un popup con un formulario que ESCRIBE en la base
 * (hcin_*.php) -- es la fase de "edición/creación" explícitamente diferida
 * en la primera pasada de solo lectura.
 *
 * Alcance de esta pasada (decisión del usuario): el menú completo se
 * replica visualmente, pero por ahora solo "NUEVA CONSULTA" está
 * conectado a un formulario funcional (hcin_proceso1.php). El resto queda
 * visible pero marcado "Próximamente" -- se van conectando en etapas
 * posteriores.
 */
const ITEMS_PROXIMAMENTE = [
  'Biomicroscopia',
  'Oftalmoscopia',
  'EXPLICO',
  'Diagnosticos ICD10',
  'Cirugias',
  'Protocolos',
  'Ex Oculoplastica',
  'Cover-test',
  'Derivaciones',
  'Proxima Visita',
  'Crear Receta',
  'Coord. Quirurgica',
  'Solicitar Lenstar/IOL',
  'Firmar Consentimiento',
  'Observaciones Administrador',
]

export default function MenuAccionesHc({
  pId,
  hc,
  pacienteNombre,
  onConsultaGuardada,
}: {
  pId: string
  hc: string
  pacienteNombre: string
  onConsultaGuardada: () => void
}) {
  const { headerInfo } = useHeaderInfo()
  const [modalAbierto, setModalAbierto] = useState(false)
  const profesionalId = headerInfo?.usuario.profesional_id ?? ''

  return (
    <>
      <div className="flex w-full flex-col gap-1 rounded-lg border border-border bg-card p-2 shadow-sm lg:w-[190px]">
        <button
          type="button"
          disabled={!profesionalId}
          onClick={() => setModalAbierto(true)}
          className="rounded bg-primary px-2 py-1.5 text-left text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          title={!profesionalId ? 'Este usuario no tiene un profesional vinculado' : undefined}
        >
          NUEVA CONSULTA
        </button>
        {ITEMS_PROXIMAMENTE.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => alert(`"${label}" todavía no está disponible en el nuevo sistema.`)}
            className="rounded px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent"
          >
            {label}
          </button>
        ))}
      </div>

      {modalAbierto && profesionalId && (
        <NuevaConsultaModal
          pId={pId}
          hc={hc}
          profesionalId={profesionalId}
          pacienteNombre={pacienteNombre}
          onClose={() => setModalAbierto(false)}
          onSaved={onConsultaGuardada}
        />
      )}
    </>
  )
}
