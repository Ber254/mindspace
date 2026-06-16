import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminSessionFromRequest } from '@/lib/auth'
import { getAllProfessionals, createProfessional, logActivity } from '@/lib/queries/admin-dashboard'

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const profs = await getAllProfessionals(session.tenantId)
  return NextResponse.json(profs)
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const { nombre, especialidad, subespecialidad, box, color, celular, password } = body
    if (!nombre || !especialidad || !box) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const prof = await createProfessional(session.tenantId, { nombre, especialidad, subespecialidad, box, color: color ?? 'sage', celular })

    if (password) {
      const hash = await bcrypt.hash(password, 10)
      const { updateProfessional } = await import('@/lib/queries/admin-dashboard')
      await updateProfessional(session.tenantId, prof.id, { password_hash: hash })
    }

    await logActivity(session.tenantId, session.nombre, 'crear_profesional', { nombre, box })
    return NextResponse.json(prof, { status: 201 })
  } catch (err) {
    console.error('create professional error', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
