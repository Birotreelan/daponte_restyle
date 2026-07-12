'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHeaderInfo, useAlertaPolling } from '@/hooks/use-header'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function fechaLegible(d: Date) {
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

interface AlertaBadgeProps {
  label: string
  cantidadInicial: number | null
  tipo: 'bot_ap' | 'bot_to' | 'bot_a'
}

// Nota: en el legacy cada badge es un link (pacientes_alertas.php,
// pacientes_turnos_online.php, treelan_autogestion_pacientes.php).
// Esas pantallas todavia no existen en el frontend nuevo, asi que por
// ahora el badge solo muestra el contador (sin navegar a ningun lado)
// hasta que se migren.
function AlertaBadge({ label, cantidadInicial, tipo }: AlertaBadgeProps) {
  const habilitado = cantidadInicial !== null
  const polled = useAlertaPolling(tipo, habilitado)
  if (!habilitado) return null

  const cantidad = polled?.cantidad ?? cantidadInicial
  const activa = polled?.alerta ?? cantidad > 0

  return (
    <div className="flex items-center gap-1.5" title={label}>
      <span className="text-[12px]" style={{ color: '#d8deea', textShadow: '1px 1px 1px #000' }}>
        {label}
      </span>
      <span
        className="flex h-[13px] min-w-[18px] items-center justify-center rounded-[2px] px-1 text-[12px] font-medium"
        style={{
          color: '#d8deea',
          textShadow: '1px 1px 1px #000',
          backgroundColor: activa ? '#FA3E3E' : 'rgba(255,255,255,0.08)',
          boxShadow: '0.5px 0.5px 0.5px 0.5px rgba(0,0,0,0.75)',
        }}
      >
        {cantidad}
      </span>
    </div>
  )
}

export default function DashboardHeader() {
  const router = useRouter()
  const { headerInfo, loading } = useHeaderInfo()
  const [fecha, setFecha] = useState('')
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    setFecha(fechaLegible(new Date()))
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const usuario = headerInfo?.usuario
  const iniciales = usuario
    ? `${usuario.apellido?.[0] ?? ''}${usuario.nombres?.[0] ?? ''}`.toUpperCase()
    : ''

  return (
    <header
      className="flex h-[75px] items-center px-4"
      style={{ background: 'linear-gradient(90deg, #0b2a4a 0%, #163f66 100%)' }}
    >
      {/* Fecha + alertas */}
      <div className="flex flex-1 flex-col gap-1.5">
        <span className="text-[12px]" style={{ color: '#6c8eb4' }}>
          {fecha}
        </span>
        {!loading && headerInfo && (
          <div className="flex items-center gap-4">
            <AlertaBadge label="Visitas" tipo="bot_ap" cantidadInicial={headerInfo.alertas.visitas} />
            <AlertaBadge label="Online" tipo="bot_to" cantidadInicial={headerInfo.alertas.online} />
            <AlertaBadge label="Autogestión" tipo="bot_a" cantidadInicial={headerInfo.alertas.autogestion} />
          </div>
        )}
      </div>

      {/* Logo de la sede */}
      <div className="flex flex-1 items-center justify-center">
        {headerInfo?.sede_logo && (
          // Logo servido desde el backend PHP (misma ruta relativa que el original)
          <img src={headerInfo.sede_logo} alt={usuario?.sede_nombre ?? 'Sede'} className="max-h-10" />
        )}
      </div>

      {/* Usuario + sesión */}
      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative">
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            onBlur={() => setTimeout(() => setMenuAbierto(false), 150)}
            className="flex h-4 w-3.5 items-center justify-center text-white/70 hover:text-white"
            aria-label="Menú de sesión"
          >
            ▾
          </button>
          {menuAbierto && (
            <ul
              className="absolute right-0 top-6 z-50 w-40 overflow-hidden rounded-sm text-[12px] shadow-lg"
              style={{ background: 'linear-gradient(180deg, #013E7D, #005AA2)' }}
            >
              <li>
                <button
                  className="block w-full px-3 py-2 text-left text-white hover:bg-black/20"
                  onClick={() => {
                    /* TODO: modal de edicion de perfil (fase visual siguiente) */
                  }}
                >
                  Editar Perfil
                </button>
              </li>
              <li>
                <button onClick={handleLogout} className="block w-full px-3 py-2 text-left text-white hover:bg-black/20">
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          )}
        </div>

        <div className="h-9 w-px bg-white/10" aria-hidden="true" />

        <span className="text-[12px]" style={{ color: '#d8deea' }}>
          {usuario ? `${usuario.apellido}, ${usuario.nombres} de ${usuario.sede_nombre}` : ''}
        </span>

        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold text-white">
          {usuario?.foto ? (
            <img src={usuario.foto} alt={iniciales} className="h-full w-full object-cover" />
          ) : (
            iniciales
          )}
        </div>
      </div>
    </header>
  )
}
