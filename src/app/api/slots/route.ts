import { NextRequest, NextResponse } from 'next/server'
import { getSlots } from '@/lib/queries/appointments'
import sql from '@/lib/db'

async function resolveTenantId(slug: string): Promise<string | null> {
  const [row] = await sql<{ id: string }[]>`
    SELECT id FROM tenants WHERE slug = ${slug} AND active = true LIMIT 1
  `
  return row?.id ?? null
}

// GET /api/slots?profId=xxx&fecha=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const slug = req.headers.get('x-tenant-slug')
  if (!slug) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const tenantId = await resolveTenantId(slug)
  if (!tenantId) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const { searchParams } = req.nextUrl
  const profId = searchParams.get('profId')
  const fecha  = searchParams.get('fecha')

  if (!profId || !fecha) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const slots = await getSlots(tenantId, profId, fecha)
  return NextResponse.json(slots)
}
