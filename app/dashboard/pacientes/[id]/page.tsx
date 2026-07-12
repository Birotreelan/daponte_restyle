import FichaPacienteView from '@/components/pacientes/ficha-paciente-view'

export default async function FichaPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <FichaPacienteView pId={id} />
}
