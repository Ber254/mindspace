import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/auth'
import { getAllEvents, createEvent, logActivity } from '@/lib/queries/admin-dashboard'

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return NextResponse.json(await getAllEvents(session.tenantId))
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  if (!body.titulo || !body.fecha || !body.hora) {
    return NextResponse.json({ error: 'Título, fecha y hora son requeridos' }, { status: 400 })
  }

  const ev = await createEvent(session.tenantId, body)
  await logActivity(session.tenantId, session.nombre, 'crear_evento', { titulo: body.titulo })
  return NextResponse.json(ev, { status: 201 })
}
