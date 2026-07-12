'use client'

import { usePacienteProtocolos } from '@/hooks/use-pacientes'

function formatFecha(fecha: string | null) {
  if (!fecha) return ''
  const [y, m, d] = fecha.split('-').map(Number)
  if (!y || !m || !d) return fecha
  return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`
}

/** Pestaña Protocolos -- listado de protocolos quirúrgicos, solo lectura. */
export default function TabProtocolos({ pId }: { pId: string }) {
  const { protocolos, loading, error } = usePacienteProtocolos(pId)

  if (loading) return <p className="py-6 text-center text-sm text-muted-foreground">Cargando...</p>
  if (error) return <p className="py-6 text-center text-sm text-destructive">Error al cargar.</p>
  if (protocolos.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No hay protocolos cargados.</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {protocolos.map((p) => (
        <li key={p.Id} className="rounded border border-border bg-background px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-foreground">{p.Protocolo_Nombre}</span>
            <span className="text-xs text-muted-foreground">
              {formatFecha(p.Fecha_QX ?? p.Fecha)} {p.Ojo ? `· Ojo ${p.Ojo}` : ''}
            </span>
          </div>
          {p.Cirujano_Nombre && (
            <p className="mt-1 text-xs text-muted-foreground">Cirujano: {p.Cirujano_Nombre}</p>
          )}
          {p.Ayudante_Nombre && (
            <p className="text-xs text-muted-foreground">Ayudante: {p.Ayudante_Nombre}</p>
          )}
        </li>
      ))}
    </ul>
  )
}
