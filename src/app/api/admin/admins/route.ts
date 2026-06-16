import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminSessionFromRequest } from '@/lib/auth'
import { getAdminUsers, createAdminUser, updateAdminPassword, deleteAdminUser, logActivity } from '@/lib/queries/admin-dashboard'

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return NextResponse.json(await getAdminUsers(session.tenantId))
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { nombre, email, password, adminId } = await req.json()

  // Cambio de contraseña
  if (adminId && password) {
    const hash = await bcrypt.hash(password, 10)
    await updateAdminPassword(session.tenantId, adminId, hash)
    await logActivity(session.tenantId, session.nombre, 'cambiar_password_admin', { adminId })
    return NextResponse.json({ ok: true })
  }

  if (!nombre || !email || !password) {
    return NextResponse.json({ error: 'Nombre, email y contraseña son requeridos' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 10)
  const admin = await createAdminUser(session.tenantId, nombre, email, hash)
  await logActivity(session.tenantId, session.nombre, 'crear_admin', { nombre, email })
  return NextResponse.json(admin, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  if (id === session.adminId) {
    return NextResponse.json({ error: 'No podés eliminarte a vos mismo' }, { status: 400 })
  }

  await deleteAdminUser(session.tenantId, id)
  await logActivity(session.tenantId, session.nombre, 'eliminar_admin', { id })
  return NextResponse.json({ ok: true })
}
