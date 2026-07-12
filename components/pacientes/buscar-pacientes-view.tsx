'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDeudores, useProcedencia } from '@/hooks/use-catalogos'
import { usePacientesBuscarAvanzado, type PacienteBusquedaAvanzadaParams } from '@/hooks/use-pacientes'

const inputCls =
  'h-8 w-full rounded border border-border bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring'
const labelCls = 'text-xs font-medium text-muted-foreground'
const selectCls = inputCls

function formatFecha(fecha: string | null) {
  if (!fecha) return ''
  const [y, m, d] = fecha.split('-').map(Number)
  if (!y || !m || !d) return fecha
  return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`
}

/**
 * Búsqueda avanzada de pacientes -- equivalente a pacientes.php. Mismo
 * esquema de precedencia que el original: cada campo completado pisa al
 * anterior, salvo "Cobertura" que se agrega como filtro adicional.
 */
export default function BuscarPacientesView() {
  const router = useRouter()
  const { deudores } = useDeudores()
  const { procedencias } = useProcedencia()
  const { resultados, buscando, error, buscado, buscar } = usePacientesBuscarAvanzado()

  const [form, setForm] = useState({
    paciente_apellido: '',
    paciente_nombres: '',
    paciente_dni: '',
    paciente_f_nacimiento: '',
    paciente_hc: '',
    deudor_id: '',
    hc_anterior: '',
    paciente_nro_afiliado: '',
    provincia: '',
    localidad: '',
    condicion: '',
    empresa: '',
    procedencia: '',
  })

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    buscar(form as PacienteBusquedaAvanzadaParams)
  }

  function irAFicha(pId: string) {
    router.push(`/dashboard/pacientes/${pId}`)
  }

  return (
    <div className="flex flex-col gap-4 font-sans">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground">Búsqueda de pacientes</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Apellido</label>
            <input value={form.paciente_apellido} onChange={(e) => set('paciente_apellido', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Nombres</label>
            <input value={form.paciente_nombres} onChange={(e) => set('paciente_nombres', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>DNI</label>
            <input value={form.paciente_dni} onChange={(e) => set('paciente_dni', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>F. Nacimiento</label>
            <input
              type="date"
              value={form.paciente_f_nacimiento}
              onChange={(e) => set('paciente_f_nacimiento', e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>HC</label>
            <input value={form.paciente_hc} onChange={(e) => set('paciente_hc', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>HC Anterior</label>
            <input value={form.hc_anterior} onChange={(e) => set('hc_anterior', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Nro Afiliado</label>
            <input value={form.paciente_nro_afiliado} onChange={(e) => set('paciente_nro_afiliado', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Cobertura</label>
            <select value={form.deudor_id} onChange={(e) => set('deudor_id', e.target.value)} className={selectCls}>
              <option value="">Seleccionar</option>
              {deudores.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Búsqueda avanzada</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Provincia</label>
            <input value={form.provincia} onChange={(e) => set('provincia', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Localidad</label>
            <input value={form.localidad} onChange={(e) => set('localidad', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Estado</label>
            <select value={form.condicion} onChange={(e) => set('condicion', e.target.value)} className={selectCls}>
              <option value="">Ninguno</option>
              <option value="M">Moroso</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Empresa</label>
            <input value={form.empresa} onChange={(e) => set('empresa', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Procedencia</label>
            <select value={form.procedencia} onChange={(e) => set('procedencia', e.target.value)} className={selectCls}>
              <option value="">-----</option>
              {procedencias.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={buscando}
            className="h-8 rounded bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {buscando ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {buscado && !error && resultados.length === 0 && (
        <div className="rounded border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          No se encontraron pacientes con esos criterios.
        </div>
      )}

      {resultados.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2">HC</th>
                <th className="px-3 py-2">Paciente</th>
                <th className="px-3 py-2">Nro Doc.</th>
                <th className="px-3 py-2">F. Nacimiento</th>
                <th className="px-3 py-2">Domicilio</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Procedencia</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((p) => (
                <tr
                  key={p.Id}
                  onClick={() => irAFicha(p.Id)}
                  className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent"
                >
                  <td className="px-3 py-2 font-mono text-foreground">{p.HC}</td>
                  <td className="px-3 py-2 text-foreground">{p.Apellido}, {p.Nombres}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.Nrodoc}</td>
                  <td className="px-3 py-2 text-muted-foreground">{formatFecha(p.Fecha_Nac)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.Domicilio}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.Condicion}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.Procedencia_Nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
