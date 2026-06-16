import { NextRequest, NextResponse } from 'next/server'
import { getProSessionFromRequest } from '@/lib/auth'
import { createAppointment } from '@/lib/queries/appointments'
import { searchPatients } from '@/lib/queries/professional-dashboard'
import type { Franja } from '@/lib/types'

// POST — turno manual
export async function POST(req: NextRequest) {
  const session = await getProSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: {
    fecha: string; hora: string; franja: Franja
    paciente: string; obraSocial?: string; celular?: string; email?: string
  }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.fecha || !body.hora || !body.franja || !body.paciente) {
    return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 })
  }

  try {
    const appt = await createAppointment({
      tenantId:       session.tenantId,
      professionalId: session.professionalId,
      fecha:          body.fecha,
      hora:           body.hora,
      franja:         body.franja,
      paciente:       body.paciente,
      obraSocial:     body.obraSocial || 'Particular',
      celular:        body.celular || '',
      email:          body.email,
    })
    return NextResponse.json(appt, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al guardar el turno.'
    return NextResponse.json({ error: msg }, { status: 409 })
  }
}

// GET — buscar pacientes (autocomplete)
export async function GET(req: NextRequest) {
  const session = await getProSessionFromRequest(req)
  if (!session) return NextResponse.json([], { status: 401 })

  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.length < 2) return NextResponse.json([])

  const patients = await searchPatients(session.tenantId, session.professionalId, q)
  return NextResponse.json(patients)
}
