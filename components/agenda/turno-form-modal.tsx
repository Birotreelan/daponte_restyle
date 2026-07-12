'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Modal } from '@/components/ui/modal'
import { useMotivos, useDeudores, usePlanes } from '@/hooks/use-catalogos'
import type { Turno } from '@/app/api/turnos/route'

const TIPOS_DOC = ['DNI', 'PASAPORTE', 'CUIL', 'CE']

// ---- Tipos ----

interface PacienteResult {
  Id: string
  Apellido: string
  Nombres: string
  Tipo_Doc?: string
  Nro_Doc?: string
  Telefono?: string
  Celular?: string
  Domicilio?: string
  Mail?: string
  Deudor_Id?: string
  Deudor_Nombre?: string
}

interface TurnoFormData {
  turno_id: string
  paciente_id: string
  apellido: string
  nombres: string
  tipo_doc: string
  nro_doc: string
  telefono: string
  celular: string
  domicilio: string
  mail: string
  deudor_id: string
  deudor_nombre: string
  plan_id: string
  plan_nombre: string
  motivo_id: string
  motivo_nombre: string
  comentario: string
  usa_lc: boolean
  envia_recordatorio: boolean
}

function emptyForm(turnoId = ''): TurnoFormData {
  return {
    turno_id: turnoId,
    paciente_id: '',
    apellido: '',
    nombres: '',
    tipo_doc: 'DNI',
    nro_doc: '',
    telefono: '',
    celular: '',
    domicilio: '',
    mail: '',
    deudor_id: '',
    deudor_nombre: '',
    plan_id: '',
    plan_nombre: '',
    motivo_id: '',
    motivo_nombre: '',
    comentario: '',
    usa_lc: false,
    envia_recordatorio: true,
  }
}

function fromTurno(turno: Turno): TurnoFormData {
  return {
    ...emptyForm(turno.Id),
    paciente_id: '',
    apellido: turno.Paciente_Apellido ?? '',
    nombres: turno.Paciente_Nombres ?? '',
    nro_doc: turno.Paciente_Nro_Doc ?? '',
    deudor_nombre: turno.Deudor_Nombre ?? '',
    envia_recordatorio: true,
  }
}

// ---- Sub-componente: Buscador de paciente ----

interface PacienteBuscadorProps {
  onSelect: (p: PacienteResult) => void
}

function PacienteBuscador({ onSelect }: PacienteBuscadorProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PacienteResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Detecta si la query parece un número (DNI) o texto (apellido)
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return }
    setSearching(true)
    setSearchError(null)
    try {
      const isNum = /^\d+$/.test(q.trim())
      const params = isNum
        ? new URLSearchParams({ dni: q.trim() })
        : new URLSearchParams({ apellido: q.trim() })
      const res = await fetch(`/api/pacientes/buscar?${params}`)
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setResults(json.data)
        setOpen(json.data.length > 0)
      } else {
        setResults([])
        setOpen(false)
        if (!json.success) setSearchError(json.message ?? 'Sin resultados')
      }
    } catch {
      setSearchError('Error de conexión')
    } finally {
      setSearching(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(v), 350)
  }

  function handleSelect(p: PacienteResult) {
    setQuery(`${p.Apellido}, ${p.Nombres}`)
    setOpen(false)
    setResults([])
    onSelect(p)
  }

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const inputCls =
    'h-8 w-full rounded border border-border bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring'

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">
        Buscar paciente <span className="text-muted-foreground/60">(DNI o Apellido)</span>
      </label>
      <div className="relative flex items-center">
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          className={inputCls}
          placeholder="Ej: 28345678 o García..."
          autoComplete="off"
        />
        {searching && (
          <span className="absolute right-2 text-muted-foreground">
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9" /></svg>
          </span>
        )}
      </div>
      {searchError && (
        <p className="text-xs text-destructive">{searchError}</p>
      )}
      {open && results.length > 0 && (
        <ul className="absolute top-full z-50 mt-0.5 w-full rounded border border-border bg-card shadow-md">
          {results.slice(0, 8).map((p) => (
            <li key={p.Id}>
              <button
                type="button"
                onClick={() => handleSelect(p)}
                className="flex w-full flex-col gap-0 px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <span className="font-medium text-foreground">{p.Apellido}, {p.Nombres}</span>
                <span className="text-xs text-muted-foreground">
                  {p.Tipo_Doc ?? 'DNI'} {p.Nro_Doc}{p.Deudor_Nombre ? ` · ${p.Deudor_Nombre}` : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---- Modal principal ----

interface TurnoFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  turno?: Turno
  busy?: boolean
}

export function TurnoFormModal({ open, onClose, onSubmit, turno, busy = false }: TurnoFormModalProps) {
  const isEdit = !!turno
  const [form, setForm] = useState<TurnoFormData>(() =>
    turno ? fromTurno(turno) : emptyForm(),
  )

  // Catálogos reales
  const { motivos } = useMotivos()
  const { deudores } = useDeudores()
  const { planes } = usePlanes(form.deudor_id || null)

  useEffect(() => {
    if (open) setForm(turno ? fromTurno(turno) : emptyForm(turno?.Id ?? ''))
  }, [open, turno])

  function set<K extends keyof TurnoFormData>(key: K, value: TurnoFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handlePacienteSelect(p: PacienteResult) {
    setForm((prev) => ({
      ...prev,
      paciente_id: p.Id,
      apellido: p.Apellido,
      nombres: p.Nombres,
      tipo_doc: p.Tipo_Doc ?? 'DNI',
      nro_doc: p.Nro_Doc ?? '',
      telefono: p.Telefono ?? '',
      celular: p.Celular ?? '',
      domicilio: p.Domicilio ?? '',
      mail: p.Mail ?? '',
      deudor_id: p.Deudor_Id ?? '',
      deudor_nombre: p.Deudor_Nombre ?? '',
      // Resetear plan al cambiar paciente/deudor
      plan_id: '',
      plan_nombre: '',
    }))
  }

  function handleDeudorChange(deudorId: string) {
    const nombre = deudores.find((d) => d.id === deudorId)?.nombre ?? ''
    setForm((prev) => ({
      ...prev,
      deudor_id: deudorId,
      deudor_nombre: nombre,
      plan_id: '',
      plan_nombre: '',
    }))
  }

  function handlePlanChange(planId: string) {
    const nombre = planes.find((p) => p.id === planId)?.nombre ?? ''
    setForm((prev) => ({ ...prev, plan_id: planId, plan_nombre: nombre }))
  }

  function handleMotivoChange(motivoId: string) {
    const nombre = motivos.find((m) => m.id === motivoId)?.nombre ?? ''
    setForm((prev) => ({ ...prev, motivo_id: motivoId, motivo_nombre: nombre }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: Record<string, unknown> = {
      turno_id: form.turno_id,
      apellido: form.apellido,
      nombres: form.nombres,
      tipo_doc: form.tipo_doc,
      nro_doc: form.nro_doc,
      telefono: form.telefono,
      celular: form.celular,
      domicilio: form.domicilio,
      mail: form.mail,
      deudor_id: form.deudor_id,
      deudor_nombre: form.deudor_nombre,
      plan_id: form.plan_id,
      plan_nombre: form.plan_nombre,
      motivo_id: form.motivo_id,
      motivo_nombre: form.motivo_nombre,
      comentario: form.comentario,
      usa_lc: form.usa_lc ? '1' : '0',
      envia_recordatorio: form.envia_recordatorio ? '1' : '0',
    }
    if (!isEdit && form.paciente_id) payload.paciente_id = form.paciente_id
    onSubmit(payload)
  }

  const inputCls =
    'h-8 w-full rounded border border-border bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring'
  const labelCls = 'text-xs font-medium text-muted-foreground'
  const selectCls = inputCls

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modificar turno' : 'Asignar turno'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Búsqueda de paciente (solo en modo Asignar) */}
        {!isEdit && (
          <PacienteBuscador onSelect={handlePacienteSelect} />
        )}

        {/* Separador */}
        {!isEdit && (
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">o completar manualmente</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

        {/* Apellido + Nombres */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Apellido *</label>
            <input required value={form.apellido} onChange={(e) => set('apellido', e.target.value)} className={inputCls} placeholder="Apellido" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Nombres *</label>
            <input required value={form.nombres} onChange={(e) => set('nombres', e.target.value)} className={inputCls} placeholder="Nombres" />
          </div>
        </div>

        {/* Tipo doc + Nro doc */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Tipo doc</label>
            <select value={form.tipo_doc} onChange={(e) => set('tipo_doc', e.target.value)} className={selectCls}>
              {TIPOS_DOC.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className={labelCls}>Nro. documento</label>
            <input value={form.nro_doc} onChange={(e) => set('nro_doc', e.target.value)} className={inputCls} placeholder="00.000.000" />
          </div>
        </div>

        {/* Teléfono + Celular */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Teléfono</label>
            <input value={form.telefono} onChange={(e) => set('telefono', e.target.value)} className={inputCls} placeholder="011-XXXX-XXXX" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Celular</label>
            <input value={form.celular} onChange={(e) => set('celular', e.target.value)} className={inputCls} placeholder="15-XXXX-XXXX" />
          </div>
        </div>

        {/* Domicilio + Mail */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Domicilio</label>
            <input value={form.domicilio} onChange={(e) => set('domicilio', e.target.value)} className={inputCls} placeholder="Calle 123" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Mail</label>
            <input type="email" value={form.mail} onChange={(e) => set('mail', e.target.value)} className={inputCls} placeholder="paciente@mail.com" />
          </div>
        </div>

        {/* Deudor (select real) + Plan (filtrado por deudor) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Cobertura / Obra social</label>
            <select
              value={form.deudor_id}
              onChange={(e) => handleDeudorChange(e.target.value)}
              className={selectCls}
            >
              <option value="">— Seleccionar —</option>
              {deudores.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Plan</label>
            <select
              value={form.plan_id}
              onChange={(e) => handlePlanChange(e.target.value)}
              disabled={!form.deudor_id || planes.length === 0}
              className={selectCls}
            >
              <option value="">— Seleccionar —</option>
              {planes.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Motivo (select real) */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Motivo de consulta</label>
          <select
            value={form.motivo_id}
            onChange={(e) => handleMotivoChange(e.target.value)}
            className={selectCls}
          >
            <option value="">— Seleccionar —</option>
            {motivos.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>

        {/* Comentario */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Comentario</label>
          <textarea
            value={form.comentario}
            onChange={(e) => set('comentario', e.target.value)}
            rows={2}
            className="w-full resize-none rounded border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Observaciones adicionales..."
          />
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.usa_lc}
              onChange={(e) => set('usa_lc', e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Usa lentes de contacto
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.envia_recordatorio}
              onChange={(e) => set('envia_recordatorio', e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Enviar recordatorio
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded border border-border bg-background px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Asignar turno'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
