import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import sql from './db'
import type { Tenant, TenantSettings } from './types'

/**
 * Lee el slug del tenant desde el header seteado por el proxy,
 * o desde el query param ?tenant= como fallback (Vercel free tier).
 */
export async function getTenantSlug(): Promise<string | null> {
  const headersList = await headers()

  // El proxy setea este header cuando detecta subdominio o ?tenant=
  const fromHeader = headersList.get('x-tenant-slug')
  if (fromHeader) return fromHeader

  // Fallback: leer desde la URL actual via next-url header
  const nextUrl = headersList.get('x-url') ?? headersList.get('x-invoke-url') ?? ''
  if (nextUrl) {
    try {
      const url = new URL(nextUrl)
      const param = url.searchParams.get('tenant')
      if (param) return param
    } catch { /* ignorar */ }
  }

  return null
}

export async function resolveTenant(): Promise<Tenant> {
  const slug = await getTenantSlug()
  if (!slug) notFound()

  const [tenant] = await sql<Tenant[]>`
    SELECT * FROM tenants
    WHERE slug = ${slug} AND active = true
    LIMIT 1
  `

  if (!tenant) notFound()
  return tenant
}

export async function resolveTenantWithSettings(): Promise<{
  tenant: Tenant
  settings: TenantSettings
}> {
  const tenant = await resolveTenant()

  const [settings] = await sql<TenantSettings[]>`
    SELECT * FROM tenant_settings WHERE tenant_id = ${tenant.id}
  `

  return {
    tenant,
    settings: settings ?? {
      tenant_id: tenant.id,
      marca: tenant.name,
      imagen_hero_url: null,
      fds_config: { sab: { manana: false, tarde: false }, dom: { manana: true, tarde: true } },
      updated_at: new Date().toISOString(),
    },
  }
}
