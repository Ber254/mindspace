import { NextRequest, NextResponse } from 'next/server'
import { getSlots } from '@/lib/queries/appointments'
import sql from '@/lib/db'

async function resolveTenantId(slug: string): Promise<string | null> {
  const [row] = await sql<{ id: string }[]>`
    SELECT id FROM tenants WHERE slug = ${slug} AND active = true LIMIT 1
  `
  return row?.id ?? null
}

// GET /api/slots/availability?profId=xxx&profId=yyy&days=21
// Devuelve { "YYYY-MM-DD": slotCount, ... } para los días con disponibilidad
export async function GET(req: NextRequest) {
  const slug = req.headers.get('x-tenant-slug')
  if (!slug) return NextResponse.json({}, { status: 404 })

  const tenantId = await resolveTenantId(slug)
  if (!tenantId) return NextResponse.json({}, { status: 404 })

  const { searchParams } = req.nextUrl
  const profIds = searchParams.getAll('profId')
  const days    = Math.min(parseInt(searchParams.get('days') ?? '21', 10), 60)

  if (profIds.length === 0) return NextResponse.json({})

  const result: Record<string, number> = {}
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    let count = 0
    for (const profId of profIds) {
      const slots = await getSlots(tenantId, profId, iso)
      count += slots.filter(s => s.available).length
    }
    if (count > 0) result[iso] = count
  }

  return NextResponse.json(result)
}
