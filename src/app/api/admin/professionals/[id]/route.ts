import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminSessionFromRequest } from '@/lib/auth'
import { updateProfessional, deleteProfessional, logActivity } from '@/lib/queries/admin-dashboard'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { password, ...rest } = body

  let updateData = { ...rest }
  if (password) {
    updateData.password_hash = await bcrypt.hash(password, 10)
  } else if (password === '') {
    updateData.password_hash = null
  }

  await updateProfessional(session.tenantId, id, updateData)
  await logActivity(session.tenantId, session.nombre, 'editar_profesional', { id, ...rest })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  await deleteProfessional(session.tenantId, id)
  await logActivity(session.tenantId, session.nombre, 'desactivar_profesional', { id })
  return NextResponse.json({ ok: true })
}
