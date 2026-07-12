'use client'

import { useMemo, useState } from 'react'
import { usePacienteArchivos } from '@/hooks/use-pacientes'
import { legacyUrl } from '@/lib/legacy-url'

type TipoArchivo = 'estudios' | 'imagenes' | 'ordenes' | 'ordenes_turnos' | 'consentimientos'

const TABS: { key: TipoArchivo; label: string }[] = [
  { key: 'estudios', label: 'Estudios' },
  { key: 'imagenes', label: 'Imágenes' },
  { key: 'ordenes', label: 'Órdenes' },
  { key: 'ordenes_turnos', label: 'Órd. Turnos' },
  { key: 'consentimientos', label: 'Consentimientos' },
]

function formatFecha(fecha: string | null) {
  if (!fecha) return ''
  const [y, m, d] = fecha.split('-').map(Number)
  if (!y || !m || !d) return fecha
  return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`
}

function nombreCorto(ruta: string) {
  const partes = ruta.split('/')
  return partes[partes.length - 1] || ruta
}

/**
 * Panel de archivos (Estudios/Imágenes/Órdenes/Órdenes de Turnos/
 * Consentimientos) -- equivalente al panel lateral derecho de
 * paciente.php ("Visor de Estudios"). Solo lectura: el link abre el
 * archivo en el sistema legacy (donde vive físicamente el PDF/imagen);
 * el toggle "Publicar en Web" del original se muestra como estado, no
 * como acción editable (esta pasada es de solo lectura).
 */
export default function PanelArchivos({ pId, hc }: { pId: string; hc: string }) {
  const [tipo, setTipo] = useState<TipoArchivo>('estudios')
  const [busqueda, setBusqueda] = useState('')
  const { archivos, loading, error } = usePacienteArchivos(pId, hc, tipo)

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return archivos
    const q = busqueda.toLowerCase()
    return archivos.filter((a) => nombreCorto(a.Nombre_Archivo).toLowerCase().includes(q))
  }, [archivos, busqueda])

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTipo(t.key)}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              tipo === t.key ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'
            }`}
          >
            {t.label} {tipo === t.key ? `(${archivos.length})` : ''}
          </button>
        ))}
      </div>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar..."
        className="h-8 rounded border border-border bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
      />

      {loading && <p className="py-4 text-center text-xs text-muted-foreground">Cargando...</p>}
      {error && <p className="py-4 text-center text-xs text-destructive">Error al cargar.</p>}
      {!loading && !error && filtrados.length === 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground">Sin resultados.</p>
      )}

      {!loading && filtrados.length > 0 && (
        <ul className="flex max-h-96 flex-col gap-1 overflow-y-auto">
          {filtrados.map((a) => (
            <li key={a.Id ?? a.Imagen_Id} className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent">
              <a
                href={legacyUrl(a.Nombre_Archivo)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate text-primary hover:underline"
                title={a.Nombre_Original || nombreCorto(a.Nombre_Archivo)}
              >
                {a.Nombre_Original || nombreCorto(a.Nombre_Archivo)}
              </a>
              <span className="shrink-0 text-muted-foreground">{formatFecha(a.Fecha)}</span>
              {a.Publica_Web === '1' && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                  title="Publicado en la web"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
