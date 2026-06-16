import sql from '@/lib/db'
import type { TenantSettings, SocialLink } from '@/lib/types'

export async function getTenantSettings(tenantId: string): Promise<TenantSettings> {
  const [row] = await sql<TenantSettings[]>`
    SELECT * FROM tenant_settings WHERE tenant_id = ${tenantId}
  `
  return row ?? {
    tenant_id: tenantId,
    marca: 'Mi Consultorio',
    imagen_hero_url: null,
    fds_config: { sab: { manana: false, tarde: false }, dom: { manana: true, tarde: true } },
    updated_at: new Date().toISOString(),
  }
}

export async function getTenantSocialLinks(tenantId: string): Promise<SocialLink[]> {
  return sql<SocialLink[]>`
    SELECT id, red, label, url, position
    FROM tenant_social_links
    WHERE tenant_id = ${tenantId}
    ORDER BY position, created_at
  `
}

export async function getEvents(tenantId: string) {
  return sql`
    SELECT * FROM events
    WHERE tenant_id = ${tenantId}
      AND active = true
      AND fecha >= CURRENT_DATE
    ORDER BY fecha, hora
  `
}
