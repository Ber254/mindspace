import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/auth'
import { upsertTenantSocialLink, deleteTenantSocialLink, logActivity } from '@/lib/queries/admin-dashboard'

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { red, url, label } = await req.json()
  if (!red || !url) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  await upsertTenantSocialLink(session.tenantId, red, url, label ?? null)
  await logActivity(session.tenantId, session.nombre, 'upsert_red_social', { red, url })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  await deleteTenantSocialLink(session.tenantId, id)
  return NextResponse.json({ ok: true })
}
