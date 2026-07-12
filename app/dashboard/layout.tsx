import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/header'
import NavMenu from '@/components/dashboard/nav-menu'

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
      <NavMenu />
      <main className="flex-1 overflow-y-auto p-5">{children}</main>
    </div>
  )
}
