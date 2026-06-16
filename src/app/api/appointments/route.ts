import { NextRequest, NextResponse } from 'next/server'
import { createAppointment } from '@/lib/queries/appointments'
import sql from '@/lib/db'
import type { Franja } from '@/lib/types'

async function resolveTenantId(slug: string): Promise<string | null> {
  const [row] = await sql<{ id: string }[]>`
    SELECT id FROM tenants WHERE slug = ${slug} AND active = true LIMIT 1
  `
  return row?.id ?? null
}

// POST /api/appointments
export async function POST(req: NextRequest) {
  const slug = req.headers.get('x-tenant-slug')
  if (!slug) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const tenantId = await resolveTenantId(slug)
  if (!tenantId) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  let body: {
    professionalId: string
    fecha: string
    hora: string
    franja: Franja
    paciente: string
    obraSocial?: string
    celular: string
    email?: string | null
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { professionalId, fecha, hora, franja, paciente, obraSocial, celular, email } = body

  if (!professionalId || !fecha || !hora || !franja || !paciente || !celular) {
    return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 })
  }

  try {
    const appt = await createAppointment({
      tenantId,
      professionalId,
      fecha,
      hora,
      franja,
      paciente,
      obraSocial: obraSocial || 'Particular',
      celular,
      email: email ?? undefined,
    })
    return NextResponse.json(appt, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al guardar el turno.'
    return NextResponse.json({ error: msg }, { status: 409 })
  }
}
