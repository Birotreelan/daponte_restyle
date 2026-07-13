'use client'

import { useEffect, useState } from 'react'
import {
  useAntecedentesConsulta,
  useConsultaCheck,
  useDiagnosticosDelDia,
  useNuevaConsultaAcciones,
  usePioDelDia,
} from '@/hooks/use-nueva-consulta'
import { useAyudantes, useValorRefraccion } from '@/hooks/use-catalogos'

// -----------------------------------------------------------------------
// Tabla de correccion de paquimetria (réplica de mostrarPaq_od/oi en
// hcin_proceso1.php -- valor corregido = PIO + correccion segun paquimetria).
// -----------------------------------------------------------------------
const CORRECCION_PAQUIMETRIA: Record<string, number> = {
  '445': 7, '455': 6, '465': 6, '475': 5, '485': 4, '495': 4, '505': 3, '515': 2,
  '525': 1, '535': 1, '545': 0, '555': -1, '565': -1, '575': -2, '585': -3,
  '595': -4, '605': -4, '615': -5, '625': -6, '635': -6, '645': -7,
}
const OPCIONES_PAQUIMETRIA = Object.keys(CORRECCION_PAQUIMETRIA)

const inputCls =
  'w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
const labelCls = 'text-xs font-medium text-muted-foreground'
const sectionCls = 'rounded-lg border border-border bg-card p-3 shadow-sm'
const sectionTitleCls = 'mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'

function SelectValor({
  value,
  onChange,
  opciones,
}: {
  value: string
  onChange: (v: string) => void
  opciones: string[]
}) {
  return (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value=""> </option>
      {opciones.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

function CampoTexto({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      className={inputCls}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

const REFRACCION_TABS = [
  'AV sin Corrección',
  'AV con LC Anterior',
  'AV con Estenopeicos',
  'AV con Anteojos Anteriores',
  'Autorefractometria',
  'Subjetiva / Receta',
  'Contacto / Keratometria',
  'MAVD',
  'Observaciones',
] as const

export default function NuevaConsultaModal({
  pId,
  hc,
  profesionalId,
  pacienteNombre,
  onClose,
  onSaved,
}: {
  pId: string
  hc: string
  profesionalId: string
  pacienteNombre: string
  onClose: () => void
  onSaved: () => void
}) {
  const { check } = useConsultaCheck(pId, profesionalId)
  const { antecedentes, refetch: refetchAntecedentes } = useAntecedentesConsulta(pId, hc)
  const { diagnosticos, refetch: refetchDiagnosticos } = useDiagnosticosDelDia(pId, hc, profesionalId)
  const { lecturas: pioLecturas, refetch: refetchPio } = usePioDelDia(pId, hc, profesionalId)
  const { ayudantes } = useAyudantes()
  const { valores: valoresAV } = useValorRefraccion('AV')
  const { valores: valoresJ } = useValorRefraccion('J')
  const { crearAntecedente, eliminarAntecedente, agregarPio, eliminarPio, eliminarDiagnostico, guardarConsulta } =
    useNuevaConsultaAcciones()

  const [refTab, setRefTab] = useState<number>(0)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---- Antecedentes (agregado en vivo) ----
  const [nuevoAntecedente, setNuevoAntecedente] = useState('')
  const [parentesco, setParentesco] = useState('1')
  const [antDesde, setAntDesde] = useState(() => new Date().toISOString().slice(0, 10))

  // ---- Campos planos del formulario (nombres identicos al legacy) ----
  const [campos, setCampos] = useState<Record<string, string>>({})
  const set = (campo: string) => (valor: string) => setCampos((c) => ({ ...c, [campo]: valor }))
  const get = (campo: string) => campos[campo] ?? ''

  const [ayudanteSelect, setAyudanteSelect] = useState('')

  // ---- Presión ocular en vivo ----
  const [pioOd, setPioOd] = useState('')
  const [pioOi, setPioOi] = useState('')
  const [paqOd, setPaqOd] = useState('')
  const [paqOi, setPaqOi] = useState('')
  const [vcOd, setVcOd] = useState('')
  const [vcOi, setVcOi] = useState('')
  const [nadaPatologico, setNadaPatologico] = useState(false)
  const [tonometro, setTonometro] = useState('')
  const [horaToma, setHoraToma] = useState('')

  useEffect(() => {
    if (paqOd && CORRECCION_PAQUIMETRIA[paqOd] !== undefined) {
      const corr = CORRECCION_PAQUIMETRIA[paqOd]
      const base = parseInt(pioOd || '0', 10) || 0
      setVcOd(String(base + corr))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paqOd])

  useEffect(() => {
    if (paqOi && CORRECCION_PAQUIMETRIA[paqOi] !== undefined) {
      const corr = CORRECCION_PAQUIMETRIA[paqOi]
      const base = parseInt(pioOi || '0', 10) || 0
      setVcOi(String(base + corr))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paqOi])

  const [ecoOd, setEcoOd] = useState('')
  const [ecoOi, setEcoOi] = useState('')

  async function handleAgregarAntecedente() {
    const texto = nuevoAntecedente.trim()
    if (!texto) return
    await crearAntecedente({ p_id: pId, hc, profesional_id: profesionalId, antecedente: texto, parentesco, ant_desde: antDesde })
    setNuevoAntecedente('')
    refetchAntecedentes()
  }

  async function handleEliminarAntecedente(a: { Hora: string; Antecedentes: string }) {
    if (!confirm('¿Está seguro de que desea eliminar este antecedente?')) return
    await eliminarAntecedente({ p_id: pId, hc, profesional_id: profesionalId, hora: a.Hora, antecedente: a.Antecedentes })
    refetchAntecedentes()
  }

  async function handleAgregarPio() {
    if (!pioOd && !pioOi && !paqOd && !paqOi) return
    await agregarPio({
      p_id: pId,
      hc,
      profesional_id: profesionalId,
      pio_od: pioOd,
      pio_oi: pioOi,
      pio_hora_toma: horaToma,
      n_patologico: nadaPatologico ? '1' : '0',
      tonometro,
      paq_od: paqOd,
      paq_oi: paqOi,
      vc_od: vcOd,
      vc_oi: vcOi,
    })
    setPioOd('')
    setPioOi('')
    setPaqOd('')
    setPaqOi('')
    setVcOd('')
    setVcOi('')
    setNadaPatologico(false)
    setTonometro('')
    refetchPio()
  }

  async function handleEliminarPio(hora: string) {
    await eliminarPio({ p_id: pId, hc, profesional_id: profesionalId, hora })
    refetchPio()
  }

  async function handleEliminarDiagnostico(hora: string) {
    if (!confirm('¿Eliminar este diagnóstico?')) return
    await eliminarDiagnostico({ p_id: pId, hc, profesional_id: profesionalId, hora })
    refetchDiagnosticos()
  }

  async function handleGuardar() {
    setError(null)
    if (!get('diagnostico_texto').trim()) {
      setError('Debe ingresar un diagnóstico antes de guardar la consulta.')
      return
    }
    setGuardando(true)
    try {
      await guardarConsulta({
        p_id: pId,
        hc,
        profesional_id: profesionalId,
        ayudante_select: ayudanteSelect,
        ...campos,
        pio_od: pioOd,
        pio_oi: pioOi,
        pio_hora_toma: horaToma,
        n_patologico: nadaPatologico ? '1' : '0',
        tonometro,
        paq_od: paqOd,
        paq_oi: paqOi,
        vc_od: vcOd,
        vc_oi: vcOi,
        eco_od: ecoOd,
        eco_oi: ecoOi,
      })
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar la consulta.')
    } finally {
      setGuardando(false)
    }
  }

  const parOdOi = (labelOd: string, campoOd: string, labelOi: string, campoOi: string, tipo: 'AV' | 'J' | 'texto' = 'texto') => (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className={labelCls}>{labelOd}</label>
        {tipo === 'texto' ? (
          <CampoTexto value={get(campoOd)} onChange={set(campoOd)} />
        ) : (
          <SelectValor value={get(campoOd)} onChange={set(campoOd)} opciones={tipo === 'AV' ? valoresAV : valoresJ} />
        )}
      </div>
      <div>
        <label className={labelCls}>{labelOi}</label>
        {tipo === 'texto' ? (
          <CampoTexto value={get(campoOi)} onChange={set(campoOi)} />
        ) : (
          <SelectValor value={get(campoOi)} onChange={set(campoOi)} opciones={tipo === 'AV' ? valoresAV : valoresJ} />
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Nueva Consulta</h2>
            <p className="text-xs text-muted-foreground">{pacienteNombre} · HC {hc}</p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-4">
          {check?.existe && (
            <div className="rounded border border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Ya existe una consulta de hoy con este profesional (a las {check.hora?.slice(0, 5)}). Puede seguir
              cargando -- se agregarán entradas adicionales para el mismo día (la edición de una consulta ya
              cargada todavía no está disponible en este sistema).
            </div>
          )}
          {error && <div className="rounded border border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}

          {/* Ayudante */}
          <div className="flex items-center gap-2">
            <label className={labelCls}>Ayudante:</label>
            <select className={inputCls + ' max-w-xs'} value={ayudanteSelect} onChange={(e) => setAyudanteSelect(e.target.value)}>
              <option value="">Seleccionar Ayudante</option>
              {ayudantes.map((a) => (
                <option key={a.Profesional_Id} value={`${a.Profesional_Id},${a.Apellido} ${a.Nombres}`}>
                  {a.Apellido} {a.Nombres}
                </option>
              ))}
            </select>
          </div>

          {/* Antecedentes */}
          <div className={sectionCls}>
            <p className={sectionTitleCls}>Antecedentes</p>
            <div className="mb-2 flex flex-wrap items-end gap-2">
              <select className={inputCls + ' max-w-[140px]'} value={parentesco} onChange={(e) => setParentesco(e.target.value)}>
                <option value="1">Paciente</option>
                <option value="Padre">Padre</option>
                <option value="Madre">Madre</option>
                <option value="Abuelo">Abuelo</option>
                <option value="Abuela">Abuela</option>
                <option value="Hermano/a">Hermano/a</option>
              </select>
              <input type="date" className={inputCls + ' max-w-[160px]'} value={antDesde} onChange={(e) => setAntDesde(e.target.value)} />
              <input
                type="text"
                className={inputCls + ' flex-1'}
                placeholder="Ingrese antecedente y presione Enter"
                value={nuevoAntecedente}
                onChange={(e) => setNuevoAntecedente(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAgregarAntecedente()
                  }
                }}
              />
              <button type="button" onClick={handleAgregarAntecedente} className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground">
                Cargar
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {antecedentes.map((a) => (
                <li key={`${a.Fecha}_${a.Hora}`} className="flex items-center justify-between rounded bg-background px-2 py-1 text-xs">
                  <span>
                    {a.Parentesco ? `${a.Parentesco}: ` : ''}
                    {a.Antecedentes} desde <strong>{a.Ant_Desde}</strong>
                  </span>
                  <button type="button" onClick={() => handleEliminarAntecedente(a)} className="text-destructive">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Diagnostico (obligatorio) */}
          <div className={sectionCls}>
            <p className={sectionTitleCls}>Diagnósticos (obligatorio)</p>
            <textarea
              className={inputCls + ' min-h-[70px]'}
              placeholder="Ingrese el diagnóstico..."
              value={get('diagnostico_texto')}
              onChange={(e) => set('diagnostico_texto')(e.target.value)}
            />
            {diagnosticos.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {diagnosticos.map((d) => (
                  <li key={d.Hora} className="flex items-center justify-between rounded bg-background px-2 py-1 text-xs">
                    <span>{d.Descripcion}</span>
                    <button type="button" onClick={() => handleEliminarDiagnostico(d.Hora)} className="text-destructive">
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Motivo de consulta */}
          <div className={sectionCls}>
            <p className={sectionTitleCls}>Motivo de Consulta</p>
            <textarea className={inputCls + ' min-h-[70px]'} value={get('campo_txt')} onChange={(e) => set('campo_txt')(e.target.value)} />
          </div>

          {/* Presion ocular */}
          <div className={sectionCls}>
            <p className={sectionTitleCls}>Presión Ocular</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div>
                <label className={labelCls}>OD (mm Hg)</label>
                <CampoTexto value={pioOd} onChange={setPioOd} />
              </div>
              <div>
                <label className={labelCls}>OI (mm Hg)</label>
                <CampoTexto value={pioOi} onChange={setPioOi} />
              </div>
              <div>
                <label className={labelCls}>Hora de toma</label>
                <CampoTexto value={horaToma} onChange={setHoraToma} placeholder="HH:MM:SS" />
              </div>
              <div>
                <label className={labelCls}>Tonómetro</label>
                <select className={inputCls} value={tonometro} onChange={(e) => setTonometro(e.target.value)}>
                  <option value="">---</option>
                  <option value="Goldman">Goldman</option>
                  <option value="Neumatica">Neumatica</option>
                  <option value="Tonopen">Tonopen</option>
                </select>
              </div>
            </div>
            <label className="mt-2 flex items-center gap-1.5 text-xs text-foreground">
              <input type="checkbox" checked={nadaPatologico} onChange={(e) => setNadaPatologico(e.target.checked)} />
              Nada Patológico
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div>
                <label className={labelCls}>Paqui OD</label>
                <select className={inputCls} value={paqOd} onChange={(e) => setPaqOd(e.target.value)}>
                  <option value="">---</option>
                  {OPCIONES_PAQUIMETRIA.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                {paqOd && <span className="text-xs text-muted-foreground">({CORRECCION_PAQUIMETRIA[paqOd]})</span>}
              </div>
              <div>
                <label className={labelCls}>Paqui OI</label>
                <select className={inputCls} value={paqOi} onChange={(e) => setPaqOi(e.target.value)}>
                  <option value="">---</option>
                  {OPCIONES_PAQUIMETRIA.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                {paqOi && <span className="text-xs text-muted-foreground">({CORRECCION_PAQUIMETRIA[paqOi]})</span>}
              </div>
              <div>
                <label className={labelCls}>Valor corr. OD</label>
                <CampoTexto value={vcOd} onChange={setVcOd} />
              </div>
              <div>
                <label className={labelCls}>Valor corr. OI</label>
                <CampoTexto value={vcOi} onChange={setVcOi} />
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <button type="button" onClick={handleAgregarPio} className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground">
                + Agregar lectura
              </button>
            </div>
            {pioLecturas.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {pioLecturas.map((p) => (
                  <li key={p.Hora} className="flex items-center justify-between rounded bg-background px-2 py-1 text-xs">
                    <span>
                      PIO: OD: <strong>{p.OD}</strong> - OI: <strong>{p.OI}</strong>, tomada a las <strong>{p.Hora_de_Toma}</strong>
                    </span>
                    <button type="button" onClick={() => handleEliminarPio(p.Hora)} className="text-destructive">
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 border-t border-border pt-2">
              <p className={sectionTitleCls}>Ecometria</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>OD</label>
                  <CampoTexto value={ecoOd} onChange={setEcoOd} />
                </div>
                <div>
                  <label className={labelCls}>OI</label>
                  <CampoTexto value={ecoOi} onChange={setEcoOi} />
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className={sectionCls}>
            <p className={sectionTitleCls}>Observaciones</p>
            <textarea className={inputCls + ' min-h-[50px]'} value={get('observaciones')} onChange={(e) => set('observaciones')(e.target.value)} />
          </div>

          {/* Refraccion */}
          <div className={sectionCls}>
            <p className={sectionTitleCls}>Refracción</p>
            <div className="mb-2 flex flex-wrap gap-1">
              {REFRACCION_TABS.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setRefTab(i)}
                  className={`rounded px-2 py-1 text-xs ${refTab === i ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {refTab === 0 && (
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Lejos</label>
                {parOdOi('OD', 'Sin_correccion_lejos_od', 'OI', 'Sin_correccion_lejos_oi', 'AV')}
                <label className={labelCls}>Cerca</label>
                {parOdOi('OD', 'Sin_correccion_cerca_od', 'OI', 'Sin_correccion_cerca_oi', 'J')}
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={get('Sin_correccion_iol_od') === '1'} onChange={(e) => set('Sin_correccion_iol_od')(e.target.checked ? '1' : '')} />
                    IOL OD
                  </label>
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={get('Sin_correccion_iol_oi') === '1'} onChange={(e) => set('Sin_correccion_iol_oi')(e.target.checked ? '1' : '')} />
                    IOL OI
                  </label>
                </div>
              </div>
            )}

            {refTab === 1 && (
              <div className="flex flex-col gap-2">
                {parOdOi('OD', 'Anterior_lc_agudeza_od', 'OI', 'Anterior_lc_agudeza_oi', 'AV')}
                <div className="flex flex-col gap-1">
                  {[
                    ['LCAV_Desc1', 'Rigidos/Flexibles'],
                    ['LCAV_Desc2', 'Descartables'],
                    ['LCAV_Desc3', 'Blandos Anuales'],
                  ].map(([campo, label]) => (
                    <label key={campo} className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={get(campo) === label}
                        onChange={(e) => set(campo)(e.target.checked ? label : '')}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {refTab === 2 && <div className="flex flex-col gap-2">{parOdOi('OD', 'Estenopeico_agu_od', 'OI', 'Estenopeico_agu_oi', 'AV')}</div>}

            {refTab === 3 && (
              <div className="flex flex-col gap-2">
                <p className={labelCls}>Lejos (Esf / Cil / Eje / A.V.)</p>
                <div className="grid grid-cols-4 gap-2">
                  <CampoTexto value={get('Anterior_lejos_esf_od')} onChange={set('Anterior_lejos_esf_od')} placeholder="OD Esf" />
                  <CampoTexto value={get('Anterior_lejos_cil_od')} onChange={set('Anterior_lejos_cil_od')} placeholder="OD Cil" />
                  <CampoTexto value={get('Anterior_lejos_eje_od')} onChange={set('Anterior_lejos_eje_od')} placeholder="OD Eje" />
                  <SelectValor value={get('Anterior_agudeza_od')} onChange={set('Anterior_agudeza_od')} opciones={valoresAV} />
                  <CampoTexto value={get('Anterior_lejos_esf_oi')} onChange={set('Anterior_lejos_esf_oi')} placeholder="OI Esf" />
                  <CampoTexto value={get('Anterior_lejos_cil_oi')} onChange={set('Anterior_lejos_cil_oi')} placeholder="OI Cil" />
                  <CampoTexto value={get('Anterior_lejos_eje_oi')} onChange={set('Anterior_lejos_eje_oi')} placeholder="OI Eje" />
                  <SelectValor value={get('Anterior_agudeza_oi')} onChange={set('Anterior_agudeza_oi')} opciones={valoresAV} />
                </div>
                <p className={labelCls}>Cerca (Esf / Cil / Eje / J)</p>
                <div className="grid grid-cols-4 gap-2">
                  <CampoTexto value={get('Anterior_cerca_esf_od')} onChange={set('Anterior_cerca_esf_od')} placeholder="OD Esf" />
                  <CampoTexto value={get('Anterior_cerca_cil_od')} onChange={set('Anterior_cerca_cil_od')} placeholder="OD Cil" />
                  <CampoTexto value={get('Anterior_cerca_eje_od')} onChange={set('Anterior_cerca_eje_od')} placeholder="OD Eje" />
                  <SelectValor value={get('Anterior_j_od')} onChange={set('Anterior_j_od')} opciones={valoresJ} />
                  <CampoTexto value={get('Anterior_cerca_esf_oi')} onChange={set('Anterior_cerca_esf_oi')} placeholder="OI Esf" />
                  <CampoTexto value={get('Anterior_cerca_cil_oi')} onChange={set('Anterior_cerca_cil_oi')} placeholder="OI Cil" />
                  <CampoTexto value={get('Anterior_cerca_eje_oi')} onChange={set('Anterior_cerca_eje_oi')} placeholder="OI Eje" />
                  <SelectValor value={get('Anterior_j_oi')} onChange={set('Anterior_j_oi')} opciones={valoresJ} />
                </div>
              </div>
            )}

            {refTab === 4 && (
              <div className="flex flex-col gap-2">
                <p className={labelCls}>Dilatado (Esf / Cil / Eje / SE)</p>
                <div className="grid grid-cols-4 gap-2">
                  <CampoTexto value={get('Dilatado_lejos_esf_od')} onChange={set('Dilatado_lejos_esf_od')} placeholder="OD Esf" />
                  <CampoTexto value={get('Dilatado_lejos_cil_od')} onChange={set('Dilatado_lejos_cil_od')} placeholder="OD Cil" />
                  <CampoTexto value={get('Dilatado_lejos_eje_od')} onChange={set('Dilatado_lejos_eje_od')} placeholder="OD Eje" />
                  <CampoTexto value={get('Dilatado_se_od')} onChange={set('Dilatado_se_od')} placeholder="OD SE" />
                  <CampoTexto value={get('Dilatado_lejos_esf_oi')} onChange={set('Dilatado_lejos_esf_oi')} placeholder="OI Esf" />
                  <CampoTexto value={get('Dilatado_lejos_cil_oi')} onChange={set('Dilatado_lejos_cil_oi')} placeholder="OI Cil" />
                  <CampoTexto value={get('Dilatado_lejos_eje_oi')} onChange={set('Dilatado_lejos_eje_oi')} placeholder="OI Eje" />
                  <CampoTexto value={get('Dilatado_se_oi')} onChange={set('Dilatado_se_oi')} placeholder="OI SE" />
                </div>
                <p className={labelCls}>Sin Dilatar (Esf / Cil / Eje)</p>
                <div className="grid grid-cols-3 gap-2">
                  <CampoTexto value={get('Objetiva_esf_od')} onChange={set('Objetiva_esf_od')} placeholder="OD Esf" />
                  <CampoTexto value={get('Objetiva_cil_od')} onChange={set('Objetiva_cil_od')} placeholder="OD Cil" />
                  <CampoTexto value={get('Objetiva_eje_od')} onChange={set('Objetiva_eje_od')} placeholder="OD Eje" />
                  <CampoTexto value={get('Objetiva_esf_oi')} onChange={set('Objetiva_esf_oi')} placeholder="OI Esf" />
                  <CampoTexto value={get('Objetiva_cil_oi')} onChange={set('Objetiva_cil_oi')} placeholder="OI Cil" />
                  <CampoTexto value={get('Objetiva_eje_oi')} onChange={set('Objetiva_eje_oi')} placeholder="OI Eje" />
                </div>
              </div>
            )}

            {refTab === 5 && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={get('Dilatado') === '1'} onChange={(e) => set('Dilatado')(e.target.checked ? '1' : '')} />
                    Con Ciclopejía
                  </label>
                  <label className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={get('Prueba_de_test_rv') === '1'}
                      onChange={(e) => set('Prueba_de_test_rv')(e.target.checked ? '1' : '')}
                    />
                    Prueba de test RV
                  </label>
                </div>
                <p className={labelCls}>Lejos (Esf / Cil / Eje / A.V.)</p>
                <div className="grid grid-cols-4 gap-2">
                  <CampoTexto value={get('Subjetiva_lejos_esf_od')} onChange={set('Subjetiva_lejos_esf_od')} placeholder="OD Esf" />
                  <CampoTexto value={get('Subjetiva_lejos_cil_od')} onChange={set('Subjetiva_lejos_cil_od')} placeholder="OD Cil" />
                  <CampoTexto value={get('Subjetiva_lejos_eje_od')} onChange={set('Subjetiva_lejos_eje_od')} placeholder="OD Eje" />
                  <SelectValor value={get('Subjetiva_agudeza_od')} onChange={set('Subjetiva_agudeza_od')} opciones={valoresAV} />
                  <CampoTexto value={get('Subjetiva_lejos_esf_oi')} onChange={set('Subjetiva_lejos_esf_oi')} placeholder="OI Esf" />
                  <CampoTexto value={get('Subjetiva_lejos_cil_oi')} onChange={set('Subjetiva_lejos_cil_oi')} placeholder="OI Cil" />
                  <CampoTexto value={get('Subjetiva_lejos_eje_oi')} onChange={set('Subjetiva_lejos_eje_oi')} placeholder="OI Eje" />
                  <SelectValor value={get('Subjetiva_agudeza_oi')} onChange={set('Subjetiva_agudeza_oi')} opciones={valoresAV} />
                </div>
                <p className={labelCls}>Cerca (Esf / Cil / Eje / J)</p>
                <div className="grid grid-cols-4 gap-2">
                  <CampoTexto value={get('Subjetiva_cerca_esf_od')} onChange={set('Subjetiva_cerca_esf_od')} placeholder="OD Esf" />
                  <CampoTexto value={get('Subjetiva_cerca_cil_od')} onChange={set('Subjetiva_cerca_cil_od')} placeholder="OD Cil" />
                  <CampoTexto value={get('Subjetiva_cerca_eje_od')} onChange={set('Subjetiva_cerca_eje_od')} placeholder="OD Eje" />
                  <SelectValor value={get('Subjetiva_j_od')} onChange={set('Subjetiva_j_od')} opciones={valoresJ} />
                  <CampoTexto value={get('Subjetiva_cerca_esf_oi')} onChange={set('Subjetiva_cerca_esf_oi')} placeholder="OI Esf" />
                  <CampoTexto value={get('Subjetiva_cerca_cil_oi')} onChange={set('Subjetiva_cerca_cil_oi')} placeholder="OI Cil" />
                  <CampoTexto value={get('Subjetiva_cerca_eje_oi')} onChange={set('Subjetiva_cerca_eje_oi')} placeholder="OI Eje" />
                  <SelectValor value={get('Subjetiva_j_oi')} onChange={set('Subjetiva_j_oi')} opciones={valoresJ} />
                </div>
                <p className={labelCls}>Media (Esf / Cil / Eje)</p>
                <div className="grid grid-cols-3 gap-2">
                  <CampoTexto value={get('Subjetiva_media_esf_od')} onChange={set('Subjetiva_media_esf_od')} placeholder="OD Esf" />
                  <CampoTexto value={get('Subjetiva_media_cil_od')} onChange={set('Subjetiva_media_cil_od')} placeholder="OD Cil" />
                  <CampoTexto value={get('Subjetiva_media_eje_od')} onChange={set('Subjetiva_media_eje_od')} placeholder="OD Eje" />
                  <CampoTexto value={get('Subjetiva_media_esf_oi')} onChange={set('Subjetiva_media_esf_oi')} placeholder="OI Esf" />
                  <CampoTexto value={get('Subjetiva_media_cil_oi')} onChange={set('Subjetiva_media_cil_oi')} placeholder="OI Cil" />
                  <CampoTexto value={get('Subjetiva_media_eje_oi')} onChange={set('Subjetiva_media_eje_oi')} placeholder="OI Eje" />
                </div>
                <label className={labelCls}>Observación de Receta</label>
                <CampoTexto value={get('Rec_observ')} onChange={set('Rec_observ')} />
              </div>
            )}

            {refTab === 6 && (
              <div className="flex flex-col gap-2">
                <p className={labelCls}>OD (K1 / K2 / GR / PO / DI / Agudeza)</p>
                <div className="grid grid-cols-6 gap-2">
                  <CampoTexto value={get('Rec_lc_k1_od')} onChange={set('Rec_lc_k1_od')} placeholder="K1" />
                  <CampoTexto value={get('Rec_lc_k2_od')} onChange={set('Rec_lc_k2_od')} placeholder="K2" />
                  <CampoTexto value={get('Rec_lc_gr_od')} onChange={set('Rec_lc_gr_od')} placeholder="GR" />
                  <CampoTexto value={get('Rec_lc_po_od')} onChange={set('Rec_lc_po_od')} placeholder="PO" />
                  <CampoTexto value={get('Rec_lc_di_od')} onChange={set('Rec_lc_di_od')} placeholder="DI" />
                  <SelectValor value={get('Rec_lc_agudeza_od')} onChange={set('Rec_lc_agudeza_od')} opciones={valoresAV} />
                </div>
                <p className={labelCls}>OI (K1 / K2 / GR / PO / DI / Agudeza)</p>
                <div className="grid grid-cols-6 gap-2">
                  <CampoTexto value={get('Rec_lc_k1_oi')} onChange={set('Rec_lc_k1_oi')} placeholder="K1" />
                  <CampoTexto value={get('Rec_lc_k2_oi')} onChange={set('Rec_lc_k2_oi')} placeholder="K2" />
                  <CampoTexto value={get('Rec_lc_gr_oi')} onChange={set('Rec_lc_gr_oi')} placeholder="GR" />
                  <CampoTexto value={get('Rec_lc_po_oi')} onChange={set('Rec_lc_po_oi')} placeholder="PO" />
                  <CampoTexto value={get('Rec_lc_di_oi')} onChange={set('Rec_lc_di_oi')} placeholder="DI" />
                  <SelectValor value={get('Rec_lc_agudeza_oi')} onChange={set('Rec_lc_agudeza_oi')} opciones={valoresAV} />
                </div>
              </div>
            )}

            {refTab === 7 && (
              <div className="flex flex-col gap-2">
                <p className={labelCls}>Lejos (Esf / Cil / Eje / A.V.)</p>
                <div className="grid grid-cols-4 gap-2">
                  <CampoTexto value={get('MAVD_esf_od')} onChange={set('MAVD_esf_od')} placeholder="OD Esf" />
                  <CampoTexto value={get('MAVD_cil_od')} onChange={set('MAVD_cil_od')} placeholder="OD Cil" />
                  <CampoTexto value={get('MAVD_eje_od')} onChange={set('MAVD_eje_od')} placeholder="OD Eje" />
                  <SelectValor value={get('MAVD_agudeza_od')} onChange={set('MAVD_agudeza_od')} opciones={valoresAV} />
                  <CampoTexto value={get('MAVD_esf_oi')} onChange={set('MAVD_esf_oi')} placeholder="OI Esf" />
                  <CampoTexto value={get('MAVD_cil_oi')} onChange={set('MAVD_cil_oi')} placeholder="OI Cil" />
                  <CampoTexto value={get('MAVD_eje_oi')} onChange={set('MAVD_eje_oi')} placeholder="OI Eje" />
                  <SelectValor value={get('MAVD_agudeza_oi')} onChange={set('MAVD_agudeza_oi')} opciones={valoresAV} />
                </div>
              </div>
            )}

            {refTab === 8 && (
              <textarea
                className={inputCls + ' min-h-[80px]'}
                value={get('Observaciones')}
                onChange={(e) => set('Observaciones')(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button type="button" onClick={onClose} className="rounded border border-border px-4 py-1.5 text-sm text-foreground hover:bg-accent">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando}
            className="rounded bg-primary px-4 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  )
}
