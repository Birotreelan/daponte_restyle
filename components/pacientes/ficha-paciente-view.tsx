'use client'

import { useState } from 'react'
import { usePacienteFicha } from '@/hooks/use-pacientes'
import { legacyUrl } from '@/lib/legacy-url'
import TreeListaGenerica from './tree-lista-generica'
import TabProtocolos from './tab-protocolos'
import TabHistorico from './tab-historico'
import PanelArchivos from './panel-archivos'
import MenuAccionesHc from './menu-acciones-hc'

type TabKey = 'hc' | 'ficha' | 'drv' | 'dia' | 'protocolos' | 'cir' | 'historico'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hc', label: 'H. C.' },
  { key: 'ficha', label: 'Ficha' },
  { key: 'drv', label: 'Derivaciones' },
  { key: 'dia', label: 'Diagnosticos' },
  { key: 'protocolos', label: 'Protocolos' },
  { key: 'cir', label: 'Quirurgico' },
  { key: 'historico', label: 'Historico' },
]

function formatFecha(fecha: string | null | undefined) {
  if (!fecha) return ''
  const [y, m, d] = String(fecha).split('-').map(Number)
  if (!y || !m || !d) return String(fecha)
  return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`
}

function calcularEdad(fechaNac: string | null | undefined): number | null {
  if (!fechaNac) return null
  const [y, m, d] = fechaNac.split('-').map(Number)
  if (!y || !m || !d) return null
  const hoy = new Date()
  let edad = hoy.getFullYear() - y
  const noHaCumplido = hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)
  if (noHaCumplido) edad--
  return edad
}

const dt = 'text-xs font-medium text-muted-foreground'
const dd = 'text-sm text-foreground'

export default function FichaPacienteView({ pId }: { pId: string }) {
  const { ficha, loading, error } = usePacienteFicha(pId)
  const [tab, setTab] = useState<TabKey>('hc')
  const [hcRefreshKey, setHcRefreshKey] = useState(0)

  if (loading) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Cargando ficha...</p>
  }
  if (error || !ficha) {
    return <p className="py-10 text-center text-sm text-destructive">No se pudo cargar la ficha del paciente.</p>
  }

  const { paciente, sede_nombre, foto, antecedentes, etiquetas } = ficha
  const edad = calcularEdad(paciente.Fecha_Nac)
  const hc = String(paciente.HC)

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Encabezado de identidad */}
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={legacyUrl(foto)} alt="Foto del paciente" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">Sin foto</span>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-base font-semibold text-foreground">
            {paciente.Apellido}, {paciente.Nombres}
          </p>
          <p className="text-xs text-muted-foreground">
            HC {paciente.HC} {paciente.HC_Anterior ? `(HC Anterior: ${paciente.HC_Anterior})` : ''} · {paciente.Tipo_Doc_Codigo} {paciente.Nrodoc}
            {sede_nombre ? ` · ${sede_nombre}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[190px_1fr_320px]">
        {/* Columna izquierda: menu de acciones de carga */}
        <MenuAccionesHc
          pId={pId}
          hc={hc}
          pacienteNombre={`${paciente.Apellido}, ${paciente.Nombres}`}
          onConsultaGuardada={() => setHcRefreshKey((k) => k + 1)}
        />

        {/* Columna principal: tabs */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            {tab === 'hc' && (
              <div className="flex flex-col gap-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                  <div><dt className={dt}>Teléfono</dt><dd className={dd}>{paciente.Telefono || '—'}</dd></div>
                  <div><dt className={dt}>Celular</dt><dd className={dd}>{paciente.Celular || '—'}</dd></div>
                  <div><dt className={dt}>Cobertura</dt><dd className={dd}>{paciente.Deudor_Nombre} {paciente.Plan_Nombre}</dd></div>
                  <div><dt className={dt}>F. Nacimiento</dt><dd className={dd}>{formatFecha(paciente.Fecha_Nac)}{edad !== null ? ` (${edad} años)` : ''}</dd></div>
                  <div><dt className={dt}>Domicilio</dt><dd className={dd}>{paciente.Domicilio}</dd></div>
                  <div><dt className={dt}>Primera / Última Visita</dt><dd className={dd}>{formatFecha(paciente.Primera_Visita)} — {formatFecha(paciente.Ultima_Visita)}</dd></div>
                  <div><dt className={dt}>Usa LC</dt><dd className={dd}>{paciente.LC === '1' ? 'Sí' : paciente.LC === '0' ? 'No' : '—'}</dd></div>
                  <div><dt className={dt}>Dosis COVID19</dt><dd className={dd}>{paciente.Covid19 ?? '0'}</dd></div>
                </dl>
                {paciente.Notas_HC && (
                  <p className="text-sm text-foreground"><span className={dt}>Notas: </span>{paciente.Notas_HC}</p>
                )}

                {antecedentes.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Antecedentes personales y familiares
                    </p>
                    <ul className="flex flex-col gap-1 text-sm text-foreground">
                      {antecedentes.map((a, i) => (
                        <li key={i}>
                          {a.Antecedentes} desde: {formatFecha(a.Ant_Desde)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {etiquetas.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Etiquetas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {etiquetas.map((e) => (
                        <span
                          key={e.Id}
                          className="rounded px-2 py-0.5 text-xs font-medium text-white"
                          style={{
                            background:
                              e.Tipo === 'finalizado' || e.Tipo === 'global - cirugias' ? '#2d7a2d' : '#e67e22',
                          }}
                        >
                          {e.Nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <TreeListaGenerica key={hcRefreshKey} hc={hc} filtro="hc" emptyText="No hay entradas en la historia clínica." />
                </div>
              </div>
            )}

            {tab === 'ficha' && (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                <div><dt className={dt}>Sede</dt><dd className={dd}>{sede_nombre || '—'}</dd></div>
                <div><dt className={dt}>HC / HC Anterior</dt><dd className={dd}>{paciente.HC} / {paciente.HC_Anterior || '—'}</dd></div>
                <div><dt className={dt}>{paciente.Tipo_Doc_Codigo || 'Doc.'}</dt><dd className={dd}>{paciente.Nrodoc}</dd></div>
                <div><dt className={dt}>Teléfono / Celular</dt><dd className={dd}>{paciente.Telefono} / {paciente.Celular}</dd></div>
                <div><dt className={dt}>Mail</dt><dd className={dd}>{paciente.Mail || '—'}</dd></div>
                <div><dt className={dt}>F. Nacimiento / Edad / Sexo</dt><dd className={dd}>{formatFecha(paciente.Fecha_Nac)} {edad !== null ? `· ${edad} años` : ''} · {paciente.Sexo}</dd></div>
                <div><dt className={dt}>Domicilio / Localidad</dt><dd className={dd}>{paciente.Domicilio} — {paciente.Localidad_Codigo}</dd></div>
                <div><dt className={dt}>Provincia / CP</dt><dd className={dd}>{paciente.Provincia_Codigo} — {paciente.Codpost}</dd></div>
                <div><dt className={dt}>CUIT / IVA</dt><dd className={dd}>{paciente.Cuit || '—'} — {paciente.IVA || '—'}</dd></div>
                <div><dt className={dt}>Cobertura / Plan / Nro Afiliado</dt><dd className={dd}>{paciente.Deudor_Nombre} — {paciente.Plan_Nombre} — {paciente.Nro_Afiliado_Ppal}</dd></div>
                <div><dt className={dt}>Primera / Última Visita</dt><dd className={dd}>{formatFecha(paciente.Primera_Visita)} — {formatFecha(paciente.Ultima_Visita)}</dd></div>
                <div><dt className={dt}>Total de Visitas</dt><dd className={dd}>{paciente.Total_De_Visitas ?? 0}</dd></div>
                <div><dt className={dt}>Procedencia</dt><dd className={dd}>{paciente.Procedencia_Nombre || '—'}</dd></div>
                <div className="sm:col-span-2"><dt className={dt}>Notas</dt><dd className={dd}>{paciente.Notas || '—'}</dd></div>
              </dl>
            )}

            {tab === 'drv' && <TreeListaGenerica hc={hc} filtro="drv" emptyText="No hay derivaciones cargadas." />}
            {tab === 'dia' && <TreeListaGenerica key={hcRefreshKey} hc={hc} filtro="dia" emptyText="No hay diagnósticos cargados." />}
            {tab === 'protocolos' && <TabProtocolos pId={pId} />}
            {tab === 'cir' && <TreeListaGenerica hc={hc} filtro="cir" emptyText="No hay cirugías cargadas." />}
            {tab === 'historico' && <TabHistorico pId={pId} />}
          </div>
        </div>

        {/* Columna lateral: archivos */}
        <PanelArchivos pId={pId} hc={hc} />
      </div>
    </div>
  )
}
