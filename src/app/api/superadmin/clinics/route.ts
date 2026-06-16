import { NextRequest, NextResponse } from 'next/server'
import { getSuperadminSessionFromRequest } from '@/lib/auth'
import { getAllClinics, createClinic } from '@/lib/queries/superadmin'

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

export async function GET(req: NextRequest) {
  const session = await getSuperadminSessionFromRequest(req)
  if (!session) return unauthorized()
  try {
    const clinics = await getAllClinics()
    return NextResponse.json(clinics)
  } catch (err) {
    console.error('superadmin/clinics GET error', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSuperadminSessionFromRequest(req)
  if (!session) return unauthorized()
  try {
    const { slug, name } = await req.json()
    if (!slug || !name) {
      return NextResponse.json({ error: 'slug y name son requeridos' }, { status: 400 })
    }
    const tenant = await createClinic(slug.toLowerCase().trim(), name.trim())
    return NextResponse.json(tenant, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'El slug ya existe' }, { status: 409 })
    }
    console.error('superadmin/clinics POST error', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
