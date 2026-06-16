import { NextRequest, NextResponse } from 'next/server'
import { getSuperadminSessionFromRequest } from '@/lib/auth'
import { setClinicActive, updateClinic } from '@/lib/queries/superadmin'

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSuperadminSessionFromRequest(req)
  if (!session) return unauthorized()

  const { id } = await params
  try {
    const body = await req.json()

    if (typeof body.active === 'boolean') {
      const tenant = await setClinicActive(id, body.active)
      return NextResponse.json(tenant)
    }

    if (body.name || body.slug) {
      const tenant = await updateClinic(id, { name: body.name, slug: body.slug })
      return NextResponse.json(tenant)
    }

    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  } catch (err) {
    console.error('superadmin/clinics/[id] PUT error', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
