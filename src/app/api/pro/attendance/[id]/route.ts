import { NextRequest, NextResponse } from 'next/server'
import { getProSessionFromRequest } from '@/lib/auth'
import { registerAttendance, togglePago } from '@/lib/queries/professional-dashboard'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getProSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  let body: { action: 'attendance' | 'toggle_pago'; asistencia?: string; pago?: boolean; notas?: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  try {
    if (body.action === 'attendance') {
      if (!body.asistencia || body.pago === undefined) {
        return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
      }
      const appt = await registerAttendance(
        session.tenantId, session.professionalId, id,
        { asistencia: body.asistencia, pago: body.pago, notas: body.notas }
      )
      return NextResponse.json(appt)
    }

    if (body.action === 'toggle_pago') {
      const pago = await togglePago(session.tenantId, session.professionalId, id)
      return NextResponse.json({ pago })
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
