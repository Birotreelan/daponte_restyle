'use client'

import Link from 'next/link'
import { useMenu } from '@/hooks/use-menu'
import { legacyUrl, extraerArchivoDePopup } from '@/lib/legacy-url'

// Los links que trae la base son paginas .php del sistema legacy
// (turnos.php, pacientes.php, javascript:popMe(...), etc.). Lo que ya
// esta migrado a Next.js navega internamente (misma pestaña); todo lo
// demas abre la pantalla real en el sistema legacy en produccion
// (pestaña nueva), para no dejar nada sin acceso mientras se migra
// pantalla por pantalla.
const LEGACY_LINK_MAP: Record<string, string> = {
  'turnos.php': '/dashboard',
  'tvd_home.php': '/dashboard/turnos/vista-detallada',
  'pacientes.php': '/dashboard/pacientes',
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

export default function NavMenu() {
  const { menu, ayuda, loading } = useMenu()

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
    </div>
  )
}
