import { NextRequest, NextResponse } from 'next/server'
import { getProSessionFromRequest } from '@/lib/auth'
import sql from '@/lib/db'

// PUT — actualizar link cobro + precio + alias + CBU
export async function PUT(req: NextRequest) {
  const session = await getProSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: { link_cobro?: string; precio_consulta?: number; alias_mp?: string; cbu?: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  await sql`
    UPDATE professionals
    SET
      link_cobro      = COALESCE(${body.link_cobro      ?? null}, link_cobro),
      precio_consulta = COALESCE(${body.precio_consulta ?? null}, precio_consulta),
      alias_mp        = COALESCE(${body.alias_mp        ?? null}, alias_mp),
      cbu             = COALESCE(${body.cbu             ?? null}, cbu)
    WHERE id = ${session.professionalId}
      AND tenant_id = ${session.tenantId}
  `
  return NextResponse.json({ ok: true })
}
