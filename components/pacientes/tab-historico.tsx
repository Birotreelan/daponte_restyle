'use client'

import { usePacienteHistorico } from '@/hooks/use-pacientes'

/** Pestaña Historico -- turnos del paciente + contadores presentes/ausentes. */
export default function TabHistorico({ pId }: { pId: string }) {
  const { turnos, total, presentes, ausentes, loading, error } = usePacienteHistorico(pId)

  if (loading) return <p className="py-6 text-center text-sm text-muted-foreground">Cargando...</p>
  if (error) return <p className="py-6 text-center text-sm text-destructive">Error al cargar.</p>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="font-medium text-foreground">Turnos Asignados: {total}</span>
        <span className="font-medium text-emerald-600">Turnos Presentes: {presentes}</span>
        <span className="font-medium text-destructive">Turnos Ausentes: {ausentes}</span>
      </div>

      {turnos.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No hay turnos registrados.</p>
      ) : (
        <div className="overflow-hidden rounded border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-1.5">Fecha</th>
                <th className="px-3 py-1.5">Profesional</th>
                <th className="px-3 py-1.5">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {turnos.map((t, i) => (
                <tr
                  key={i}
                  className={`border-b border-border/60 last:border-0 ${
                    t.admision === '1' ? 'text-emerald-700' : 'text-destructive'
                  }`}
                >
                  <td className="px-3 py-1.5">{t.Fecha}</td>
                  <td className="px-3 py-1.5">{t.Profesional_Nombre}</td>
                  <td className="px-3 py-1.5">{t.Motivo_Nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
