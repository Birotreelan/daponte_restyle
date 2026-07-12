import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/header'
import NavMenu from '@/components/dashboard/nav-menu'

// Id de tls_proceso para "Turnos" -- por ahora es la unica seccion
// migrada al frontend nuevo, asi que la fila de accesos rapidos queda
// fija en esta seccion. Cuando se agreguen mas secciones (Pacientes,
// Cirugias, etc.) esto pasa a derivarse de la ruta activa.
const PROCESO_TURNOS = '7433-001'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')
  if (!token) redirect('/login')

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans">
      <DashboardHeader />
      <NavMenu activeProcesoId={PROCESO_TURNOS} />
      <main className="flex-1 overflow-y-auto p-5">{children}</main>
    </div>
  )
}
