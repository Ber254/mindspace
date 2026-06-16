import { NextRequest, NextResponse } from 'next/server'
import { getSuperadminSessionFromRequest } from '@/lib/auth'
import { getAllUsers } from '@/lib/queries/superadmin'

export async function GET(req: NextRequest) {
  const session = await getSuperadminSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (err) {
    console.error('superadmin/users GET error', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
