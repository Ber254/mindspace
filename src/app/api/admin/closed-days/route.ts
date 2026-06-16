import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/auth'
import { getClosedDays, addClosedDay, removeClosedDay, logActivity } from '@/lib/queries/admin-dashboard'

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return NextResponse.json(await getClosedDays(session.tenantId))
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { fecha, motivo, boxes } = await req.json()
  if (!fecha) return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 })

  const row = await addClosedDay(session.tenantId, fecha, motivo ?? 'Día cerrado', boxes ?? [1,2,3,4])
  await logActivity(session.tenantId, session.nombre, 'agregar_dia_cerrado', { fecha, motivo })
  return NextResponse.json(row, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { fecha } = await req.json()
  if (!fecha) return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 })

  await removeClosedDay(session.tenantId, fecha)
  await logActivity(session.tenantId, session.nombre, 'quitar_dia_cerrado', { fecha })
  return NextResponse.json({ ok: true })
}
