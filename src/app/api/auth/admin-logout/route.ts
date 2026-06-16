import { NextResponse } from 'next/server'
import { COOKIE_ADMIN } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_ADMIN, '', { maxAge: 0, path: '/' })
  return res
}
