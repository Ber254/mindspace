import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/auth'
import { upsertModule, logActivity } from '@/lib/queries/admin-dashboard'

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { professionalId, diaSemana, franja, active } = await req.json()
  if (!professionalId || !diaSemana || !franja) {
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
  }

  await upsertModule(session.tenantId, professionalId, diaSemana, franja, active ?? true)
  await logActivity(session.tenantId, session.nombre, 'toggle_modulo', { professionalId, diaSemana, franja, active })
  return NextResponse.json({ ok: true })
}
