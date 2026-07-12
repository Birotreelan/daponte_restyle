'use client'

import Link from 'next/link'
import { useMenu, useAccesosRapidos } from '@/hooks/use-menu'

interface NavMenuProps {
  /**
   * Id de tls_proceso de la seccion activa (equivalente a $Proceso_Padre
   * en el legacy) -- decide que fila de iconos de acceso rapido se
   * muestra debajo del menu. Ej.: '7433-001' = Turnos.
   */
  activeProcesoId?: string | null
}

// Los links que trae la base son paginas .php del sistema legacy
// (turnos.php, pacientes.php, javascript:popMe(...), etc.), no rutas
// de este frontend. Solo lo que ya esta migrado a Next.js entra aca;
// todo lo demas se muestra pero queda deshabilitado (en vez de romper
// con un 404) hasta que se vaya migrando pantalla por pantalla.
const LEGACY_LINK_MAP: Record<string, string> = {
  'turnos.php': '/dashboard',
}

function resolveLink(legacyLink: string): string | null {
  if (!legacyLink || legacyLink.startsWith('javascript:')) return null
  return LEGACY_LINK_MAP[legacyLink] ?? null
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
  if (!resolved) {
    return (
      <span className={disabledClassName} title="Todavía no migrado a la nueva plataforma">
        {children}
      </span>
    )
  }
  return (
    <Link href={resolved} className={className}>
      {children}
    </Link>
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
              className="flex h-[46px] w-12 items-center justify-center border-r border-[#d0d0d0] text-[11px] font-semibold text-[#5b6b7a] hover:bg-[#dcdcdc]"
              disabledClassName="flex h-[46px] w-12 cursor-not-allowed items-center justify-center border-r border-[#d0d0d0] text-[11px] font-semibold text-[#c2c2c2]"
            >
              {acceso.nombre
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase() ?? '')
                .join('')}
            </MenuLink>
          ))}
        </div>
      )}
    </div>
  )
}
