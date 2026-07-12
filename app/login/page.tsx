import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/login-form'

export default async function LoginPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')
  if (token) redirect('/dashboard')

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-primary-foreground"
              aria-hidden="true"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Clínica Oftalmológica</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sistema de Turnos</p>
        </div>

        {/* Card con formulario */}
        <div className="rounded-lg border border-border bg-card px-8 py-7 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-foreground">Iniciar sesión</h2>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
