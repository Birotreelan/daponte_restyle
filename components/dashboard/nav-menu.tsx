'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMenu, useAccesosRapidos } from '@/hooks/use-menu'
import { legacyUrl, extraerArchivoDePopup } from '@/lib/legacy-url'

interface NavMenuProps {
  /**
   * Id de tls_proceso de la seccion activa (equivalente a $Proceso_Padre
   * en el legacy) -- decide que fila de iconos de acceso rapido se
   * muestra debajo del menu. Ej.: '7433-001' = Turnos.
   */
  activeProcesoId?: string | null
}

// Los links que trae la base son paginas .php del sistema legacy
// (turnos.php, pacientes.php, javascript:popMe(...), etc.). Lo que ya
// esta migrado a Next.js navega internamente (misma pestaña); todo lo
// demas abre la pantalla real en el sistema legacy en produccion
// (pestaña nueva), para no dejar nada sin acceso mientras se migra
// pantalla por pantalla.
const LEGACY_LINK_MAP: Record<string, string> = {
  'turnos.php': '/dashboard',
}

type ResolvedLink =
  | { kind: 'interno'; href: string }
  | { kind: 'legacy'; href: string }
  | { kind: 'sin_destino' }

function resolveLink(legacyLink: string): ResolvedLink {
  const migrado = LEGACY_LINK_MAP[legacyLink]
  if (migrado) return { kind: 'interno', href: migrado }

  if (legacyLink.startsWith('javascript:')) {
    const archivo = extraerArchivoDePopup(legacyLink)
    if (!archivo) return { kind: 'sin_destino' }
    return { kind: 'legacy', href: legacyUrl(archivo) }
  }

  if (!legacyLink) return { kind: 'sin_destino' }
  return { kind: 'legacy', href: legacyUrl(legacyLink) }
}

function MenuLink({
  href,
  className,
  disabledClassName,
  children,
}: {
  href: string
  className: string
  disabledClassName: string
  children: React.ReactNode
}) {
  const resolved = resolveLink(href)

  if (resolved.kind === 'sin_destino') {
    return (
      <span className={disabledClassName} title="Sin destino configurado">
        {children}
      </span>
    )
  }

  if (resolved.kind === 'interno') {
    return (
      <Link href={resolved.href} className={className}>
        {children}
      </Link>
    )
  }

  // kind === 'legacy': pantalla todavia no migrada, se abre en el
  // sistema legacy en una pestaña nueva.
  return (
    <a href={resolved.href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/** Icono del legacy con fallback a iniciales si la imagen no carga. */
function AccesoIcono({ nombre, imagen }: { nombre: string; imagen: string }) {
  const [error, setError] = useState(false)
  if (!imagen || error) {
    return <span className="text-[11px] font-semibold text-[#5b6b7a]">{iniciales(nombre)}</span>
  }
  return (
    <img
      src={legacyUrl(imagen)}
      alt={nombre}
      title={nombre}
      width={32}
      height={32}
      onError={() => setError(true)}
    />
  )
}

export default function NavMenu({ activeProcesoId = null }: NavMenuProps) {
  const { menu, ayuda, loading } = useMenu()
  const { accesosRapidos } = useAccesosRapidos(activeProcesoId)

  const items = ayuda ? [...menu, ayuda] : menu

  return (
    <div className="w-full">
      {/* Barra de menu horizontal con desplegables */}
      <nav className="w-full" style={{ backgroundColor: '#d9d9d9' }} aria-label="Menú principal">
        <ul className="flex h-7 list-none items-stretch">
          {!loading &&
            items.map((proceso) => (
              <li key={proceso.id ?? proceso.nombre} className="group relative">
                <MenuLink
                  href={proceso.link}
                  className="block h-full px-3 py-1.5 text-[12px] text-[#151515] hover:bg-[#04417f] hover:text-white"
                  disabledClassName="block h-full cursor-not-allowed px-3 py-1.5 text-[12px] text-[#151515]"
                >
                  {proceso.nombre}
                </MenuLink>
                {proceso.subprocesos.length > 0 && (
                  <ul
                    className="absolute left-0 top-full z-50 hidden min-w-[12em] flex-col border-t border-[#b9b9b9] bg-[#d9d9d9] shadow-md group-hover:flex"
                  >
                    {proceso.subprocesos.map((sub) => (
                      <li key={sub.id ?? sub.nombre}>
                        <MenuLink
                          href={sub.link}
                          className="block px-3 py-1.5 text-[12px] text-[#151515] hover:bg-[#999999]"
                          disabledClassName="block cursor-not-allowed px-3 py-1.5 text-[12px] text-[#9a9a9a]"
                        >
                          {sub.nombre}
                        </MenuLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
        </ul>
      </nav>

      {/* Fila de accesos rapidos (iconos) de la seccion activa */}
      {accesosRapidos.length > 0 && (
        <div className="flex h-[46px] w-full items-center bg-[#eaeaea]" aria-label="Accesos rápidos">
          {accesosRapidos.map((acceso) => (
            <MenuLink
              key={acceso.id}
              href={acceso.link}
              className="flex h-[46px] w-12 items-center justify-center border-r border-[#d0d0d0] hover:bg-[#dcdcdc]"
              disabledClassName="flex h-[46px] w-12 cursor-not-allowed items-center justify-center border-r border-[#d0d0d0] opacity-40"
            >
              <AccesoIcono nombre={acceso.nombre} imagen={acceso.imagen} />
            </MenuLink>
          ))}
        </div>
      )}
    </div>
  )
}
