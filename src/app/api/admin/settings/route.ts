import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/auth'
import { updateSettings, logActivity } from '@/lib/queries/admin-dashboard'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const [settings] = await sql`SELECT * FROM tenant_settings WHERE tenant_id = ${session.tenantId}`
  const [tenant] = await sql`SELECT name, slug FROM tenants WHERE id = ${session.tenantId}`
  const socials = await sql`SELECT * FROM tenant_social_links WHERE tenant_id = ${session.tenantId} ORDER BY position, created_at`

  return NextResponse.json({ settings, tenant, socials })
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  await updateSettings(session.tenantId, body)
  await logActivity(session.tenantId, session.nombre, 'actualizar_settings', body)
  return NextResponse.json({ ok: true })
}
