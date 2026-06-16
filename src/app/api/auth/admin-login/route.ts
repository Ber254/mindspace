import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { signAdminSession, COOKIE_ADMIN } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const slug = req.headers.get('x-tenant-slug')
    if (!slug) return NextResponse.json({ error: 'Tenant requerido' }, { status: 400 })

    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })

    const [tenant] = await sql`SELECT id FROM tenants WHERE slug = ${slug} AND active = true LIMIT 1`
    if (!tenant) return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 })

    await sql`SELECT set_config('app.current_tenant_id', ${tenant.id}, true)`

    const [admin] = await sql`
      SELECT * FROM admin_users WHERE tenant_id = ${tenant.id} AND email = ${email} LIMIT 1
    `
    if (!admin) return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })

    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid) return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })

    const token = await signAdminSession({
      tenantId: tenant.id,
      tenantSlug: slug,
      adminId: admin.id,
      nombre: admin.nombre,
      email: admin.email,
      role: 'admin',
    })

    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE_ADMIN, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12,
    })
    return res
  } catch (err) {
    console.error('admin-login error', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
