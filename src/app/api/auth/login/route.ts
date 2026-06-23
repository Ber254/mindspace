import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { signProSession, COOKIE_PRO } from '@/lib/auth'

export async function POST(req: NextRequest) {
  let body: { professionalId: string; password: string; tenantSlug?: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const slug = req.headers.get('x-tenant-slug') ?? body.tenantSlug ?? req.nextUrl.searchParams.get('tenant')
  if (!slug) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const [tenant] = await sql<{ id: string }[]>`
    SELECT id FROM tenants WHERE slug = ${slug} AND active = true LIMIT 1
  `
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  const [prof] = await sql.begin(async (tx) => {
    await tx`SELECT set_config('app.current_tenant_id', ${tenant.id}, true)`
    return tx<{ id: string; nombre: string; password_hash: string | null }[]>`
      SELECT id, nombre, password_hash
      FROM professionals
      WHERE id = ${body.professionalId}
        AND tenant_id = ${tenant.id}
        AND active = true
      LIMIT 1
    `
  })
  if (!prof) return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 })

  // Si no tiene contraseña asignada, aceptar "1234" como default de demo
  const isValid = prof.password_hash
    ? await bcrypt.compare(body.password, prof.password_hash)
    : body.password === '1234'

  if (!isValid) return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 })

  const token = await signProSession({
    tenantId: tenant.id,
    tenantSlug: slug,
    professionalId: prof.id,
    nombre: prof.nombre,
    role: 'pro',
  })

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_PRO, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,  // 12 horas
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
