import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(req: NextRequest) {
  const h = await headers()
  const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? 'localhost'
  return NextResponse.json({
    tenantSlugHeader: h.get('x-tenant-slug'),
    hostname: req.nextUrl.hostname,
    tenant_param: req.nextUrl.searchParams.get('tenant'),
    ROOT_DOMAIN,
    url: req.url,
  })
}
