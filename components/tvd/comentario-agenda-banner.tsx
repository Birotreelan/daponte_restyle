'use client'

import type { TvdComentarioAgenda } from '@/hooks/use-tvd'

interface ComentarioAgendaBannerProps {
  comentario: TvdComentarioAgenda | null
}

/**
 * Banner de comentario de agenda (vigente para la sede/profesional/fecha
 * seleccionados). Solo lectura por ahora -- la edicion
 * (update_comentario_agenda.php) se dejó explícitamente fuera de esta
 * primera migración.
 */
export default function ComentarioAgendaBanner({ comentario }: ComentarioAgendaBannerProps) {
  if (!comentario || !comentario.Comentario) return null

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <p className="font-semibold uppercase tracking-wide text-amber-700">Comentario de agenda</p>
      <p className="mt-0.5 whitespace-pre-wrap">{comentario.Comentario}</p>
    </div>
  )
}
