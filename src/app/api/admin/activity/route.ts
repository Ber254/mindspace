import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/auth'
import { getActivityLog } from '@/lib/queries/admin-dashboard'

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return NextResponse.json(await getActivityLog(session.tenantId))
}
