import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import sql from './db'
import type { Tenant, TenantSettings } from './types'

/**
 * Lee el slug del tenant desde el header seteado por el middleware.
 * Solo disponible en Server Components y Route Handlers.
 */
export async function getTenantSlug(): Promise<string | null> {
  const headersList = await headers()
  return headersList.get('x-tenant-slug')
}

/**
 * Resuelve el tenant completo a partir del slug.
 * Llama a notFound() si el tenant no existe o está inactivo.
 */
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

/**
 * Devuelve tenant + settings en una sola llamada.
 * Útil para layouts que necesitan marca, imagen hero, etc.
 */
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
