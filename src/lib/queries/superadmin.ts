import sql from '@/lib/db'
import type { TenantWithStats } from '@/lib/types'

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function getSuperadminByEmail(email: string) {
  const [row] = await sql`
    SELECT * FROM superadmins WHERE email = ${email} LIMIT 1
  `
  return row ?? null
}

// ─── Clinics ─────────────────────────────────────────────────────────────────

export async function getAllClinics(): Promise<TenantWithStats[]> {
  return sql<TenantWithStats[]>`
    SELECT
      t.id, t.slug, t.name, t.active, t.created_at,
      COUNT(DISTINCT p.id)::int   AS professionals_count,
      COUNT(DISTINCT au.id)::int  AS admins_count,
      COUNT(DISTINCT a.id)::int   AS appointments_count
    FROM tenants t
    LEFT JOIN professionals p  ON p.tenant_id = t.id
    LEFT JOIN admin_users au   ON au.tenant_id = t.id
    LEFT JOIN appointments a   ON a.tenant_id = t.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `
}

export async function createClinic(slug: string, name: string) {
  const [tenant] = await sql`
    INSERT INTO tenants (slug, name) VALUES (${slug}, ${name}) RETURNING *
  `
  await sql`
    INSERT INTO tenant_settings (tenant_id, marca) VALUES (${tenant.id}, ${name})
  `
  return tenant
}

export async function setClinicActive(tenantId: string, active: boolean) {
  const [t] = await sql`
    UPDATE tenants SET active = ${active} WHERE id = ${tenantId} RETURNING *
  `
  return t
}

export async function updateClinic(tenantId: string, data: { name?: string; slug?: string }) {
  const [t] = await sql`
    UPDATE tenants SET
      name = COALESCE(${data.name ?? null}, name),
      slug = COALESCE(${data.slug ?? null}, slug)
    WHERE id = ${tenantId} RETURNING *
  `
  return t
}

// ─── Users audit ─────────────────────────────────────────────────────────────

export async function getAllUsers() {
  const admins = await sql`
    SELECT
      au.id, au.nombre, au.email, au.created_at,
      'admin' AS role,
      t.name AS tenant_name, t.slug AS tenant_slug, t.active AS tenant_active
    FROM admin_users au
    JOIN tenants t ON t.id = au.tenant_id
    ORDER BY au.created_at DESC
  `
  const professionals = await sql`
    SELECT
      p.id, p.nombre, p.email, p.celular AS email, p.created_at,
      'profesional' AS role,
      t.name AS tenant_name, t.slug AS tenant_slug, t.active AS tenant_active
    FROM professionals p
    JOIN tenants t ON t.id = p.tenant_id
    ORDER BY p.created_at DESC
  `
  return { admins, professionals }
}
