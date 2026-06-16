import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/auth'
import { updateEvent, deleteEvent, logActivity } from '@/lib/queries/admin-dashboard'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  await updateEvent(session.tenantId, id, body)
  await logActivity(session.tenantId, session.nombre, 'editar_evento', { id })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  await deleteEvent(session.tenantId, id)
  await logActivity(session.tenantId, session.nombre, 'eliminar_evento', { id })
  return NextResponse.json({ ok: true })
}
