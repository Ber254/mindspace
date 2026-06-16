import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? 'dev-secret-cambia-esto-en-produccion-min32chars'
)

export const COOKIE_PRO = 'ms_pro_session'

export interface ProSession {
  tenantId: string
  tenantSlug: string
  professionalId: string
  nombre: string
  role: 'pro'
}

export async function signProSession(payload: ProSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(SECRET)
}

export async function verifyProSession(token: string): Promise<ProSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as ProSession
  } catch {
    return null
  }
}

/** Lee la sesión del profesional desde la cookie — para Server Components */
export async function getProSession(): Promise<ProSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_PRO)?.value
  if (!token) return null
  return verifyProSession(token)
}

/** Lee la sesión desde el header Cookie — para API Route Handlers */
export function getProSessionFromRequest(req: NextRequest): Promise<ProSession | null> {
  const token = req.cookies.get(COOKIE_PRO)?.value
  if (!token) return Promise.resolve(null)
  return verifyProSession(token)
}

// ─── Admin session ────────────────────────────────────────────────────────────

export const COOKIE_ADMIN = 'ms_admin_session'

export interface AdminSession {
  tenantId: string
  tenantSlug: string
  adminId: string
  nombre: string
  email: string
  role: 'admin'
}

export async function signAdminSession(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(SECRET)
}

export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as AdminSession
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_ADMIN)?.value
  if (!token) return null
  return verifyAdminSession(token)
}

export function getAdminSessionFromRequest(req: NextRequest): Promise<AdminSession | null> {
  const token = req.cookies.get(COOKIE_ADMIN)?.value
  if (!token) return Promise.resolve(null)
  return verifyAdminSession(token)
}

// ─── Superadmin session ───────────────────────────────────────────────────────

export const COOKIE_SUPERADMIN = 'ms_superadmin_session'

export interface SuperadminSession {
  superadminId: string
  nombre: string
  email: string
  role: 'superadmin'
}

export async function signSuperadminSession(payload: SuperadminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(SECRET)
}

export async function verifySuperadminSession(token: string): Promise<SuperadminSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SuperadminSession
  } catch {
    return null
  }
}

export async function getSuperadminSession(): Promise<SuperadminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_SUPERADMIN)?.value
  if (!token) return null
  return verifySuperadminSession(token)
}

export function getSuperadminSessionFromRequest(req: NextRequest): Promise<SuperadminSession | null> {
  const token = req.cookies.get(COOKIE_SUPERADMIN)?.value
  if (!token) return Promise.resolve(null)
  return verifySuperadminSession(token)
}
