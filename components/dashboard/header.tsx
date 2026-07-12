'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface HeaderProps {
  usuario: string
}

export default function DashboardHeader({ usuario }: HeaderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  // Iniciales para el avatar
  const initials = usuario
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-5">
      {/* Título de la sección activa */}
      <h1 className="text-sm font-semibold text-foreground">Agenda</h1>

      {/* Info de usuario */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
            aria-hidden="true"
          >
            {initials}
          </div>
          <span className="text-sm text-foreground">{usuario}</span>
        </div>

        <div className="h-4 w-px bg-border" aria-hidden="true" />

        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          {loading ? 'Saliendo...' : 'Cerrar sesión'}
        </button>
      </div>
    </header>
  )
}
