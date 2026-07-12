import { NextRequest, NextResponse } from 'next/server'
import { phpFetch } from '@/lib/php-fetch'

export interface Turno {
  Id: string
  Hora: string
  Fecha: string
  Paciente_Apellido: string
  Paciente_Nombres: string
  Paciente_Nro_Doc: string
  Deudor_Nombre: string
  turno: '0' | '1' | '2'
  admision: '0' | '1'
  block: '0' | '1'
  block_txt: string
  Confirmado: '0' | '1'
  sobreturno: '0' | '1'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const profesional_id = searchParams.get('profesional_id') ?? ''
  const sede_id = searchParams.get('sede_id') ?? ''
  const fecha = searchParams.get('fecha') ?? ''

  const path = `/turnos_listar.php?profesional_id=${encodeURIComponent(profesional_id)}&sede_id=${encodeURIComponent(sede_id)}&fecha=${encodeURIComponent(fecha)}`

  const { status, body } = await phpFetch<Turno[]>(path)

  return NextResponse.json(body, { status })
}
