import { NextRequest, NextResponse } from 'next/server'
import { getProSessionFromRequest } from '@/lib/auth'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getProSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: { red: string; label?: string; url: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.red || !body.url) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  // Upsert: una red por profesional
  const [row] = await sql`
    INSERT INTO professional_social_links (professional_id, tenant_id, red, label, url)
    VALUES (${session.professionalId}, ${session.tenantId}, ${body.red}, ${body.label ?? null}, ${body.url})
    ON CONFLICT (professional_id, red)
    DO UPDATE SET label = EXCLUDED.label, url = EXCLUDED.url
    RETURNING *
  `
  return NextResponse.json(row, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getProSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const linkId = req.nextUrl.searchParams.get('id')
  if (!linkId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await sql`
    DELETE FROM professional_social_links
    WHERE id = ${linkId} AND professional_id = ${session.professionalId}
  `
  return NextResponse.json({ ok: true })
}
