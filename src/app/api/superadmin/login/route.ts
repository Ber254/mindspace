import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signSuperadminSession, COOKIE_SUPERADMIN } from '@/lib/auth'
import { getSuperadminByEmail } from '@/lib/queries/superadmin'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })
    }

    const superadmin = await getSuperadminByEmail(email)
    if (!superadmin) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, superadmin.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    const token = await signSuperadminSession({
      superadminId: superadmin.id,
      nombre: superadmin.nombre,
      email: superadmin.email,
      role: 'superadmin',
    })

    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE_SUPERADMIN, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    return res
  } catch (err) {
    console.error('superadmin-login error', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
