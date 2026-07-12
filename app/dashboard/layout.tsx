import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/sidebar'
import DashboardHeader from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')
  if (!token) redirect('/login')

  // El nombre de usuario se guarda durante el login en una cookie separada
  // Por ahora lo leemos de la cookie `session_user` si existe, o fallback genérico
  const usuarioCookie = cookieStore.get('session_user')
  const usuario = usuarioCookie?.value ?? 'Usuario'

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader usuario={usuario} />
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
