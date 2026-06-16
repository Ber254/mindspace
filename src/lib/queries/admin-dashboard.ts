import sql from '@/lib/db'
import type { Professional, ProfessionalModule, ClosedDay, Event, AdminUser, SocialLink } from '@/lib/types'

// ─── Profesionales ─────────────────────────────────────────────────────────────

export async function getAllProfessionals(tenantId: string): Promise<Professional[]> {
  return sql<Professional[]>`
    SELECT p.*,
      COALESCE(
        json_agg(pm ORDER BY pm.dia_semana, pm.franja) FILTER (WHERE pm.id IS NOT NULL),
        '[]'
      ) AS modules
    FROM professionals p
    LEFT JOIN professional_modules pm ON pm.professional_id = p.id AND pm.tenant_id = p.tenant_id
    WHERE p.tenant_id = ${tenantId}
    GROUP BY p.id
    ORDER BY p.box, p.nombre
  `
}

export async function createProfessional(tenantId: string, data: {
  nombre: string; especialidad: string; subespecialidad?: string
  box: number; color: string; celular?: string
}) {
  const [prof] = await sql<Professional[]>`
    INSERT INTO professionals (tenant_id, nombre, especialidad, subespecialidad, box, color, celular)
    VALUES (${tenantId}, ${data.nombre}, ${data.especialidad}, ${data.subespecialidad ?? null},
            ${data.box}, ${data.color}, ${data.celular ?? null})
    RETURNING *
  `
  return prof
}

export async function updateProfessional(tenantId: string, profId: string, data: {
  nombre?: string; especialidad?: string; subespecialidad?: string
  box?: number; color?: string; celular?: string; active?: boolean; password_hash?: string | null
}) {
  const [prof] = await sql<Professional[]>`
    UPDATE professionals SET
      nombre          = COALESCE(${data.nombre ?? null}, nombre),
      especialidad    = COALESCE(${data.especialidad ?? null}, especialidad),
      subespecialidad = COALESCE(${data.subespecialidad ?? null}, subespecialidad),
      box             = COALESCE(${data.box ?? null}, box),
      color           = COALESCE(${data.color ?? null}, color),
      celular         = COALESCE(${data.celular ?? null}, celular),
      active          = COALESCE(${data.active ?? null}, active),
      password_hash   = CASE WHEN ${data.password_hash !== undefined} THEN ${data.password_hash ?? null} ELSE password_hash END
    WHERE id = ${profId} AND tenant_id = ${tenantId}
    RETURNING *
  `
  return prof
}

export async function deleteProfessional(tenantId: string, profId: string) {
  await sql`
    UPDATE professionals SET active = false WHERE id = ${profId} AND tenant_id = ${tenantId}
  `
}

// ─── Módulos ───────────────────────────────────────────────────────────────────

export async function getAllModules(tenantId: string): Promise<ProfessionalModule[]> {
  return sql<ProfessionalModule[]>`
    SELECT pm.*, p.nombre AS prof_nombre, p.color AS prof_color, p.box AS prof_box
    FROM professional_modules pm
    JOIN professionals p ON p.id = pm.professional_id
    WHERE pm.tenant_id = ${tenantId} AND p.active = true
    ORDER BY p.box, pm.dia_semana, pm.franja
  `
}

export async function upsertModule(tenantId: string, professionalId: string, diaSemana: string, franja: string, active: boolean) {
  await sql`
    INSERT INTO professional_modules (tenant_id, professional_id, dia_semana, franja, active)
    VALUES (${tenantId}, ${professionalId}, ${diaSemana}, ${franja}, ${active})
    ON CONFLICT (professional_id, dia_semana, franja) DO UPDATE SET active = ${active}
  `
}

// ─── Días cerrados ─────────────────────────────────────────────────────────────

export async function getClosedDays(tenantId: string): Promise<ClosedDay[]> {
  return sql<ClosedDay[]>`
    SELECT * FROM closed_days WHERE tenant_id = ${tenantId}
    ORDER BY fecha
  `
}

export async function addClosedDay(tenantId: string, fecha: string, motivo: string, boxes: number[]) {
  const [row] = await sql<ClosedDay[]>`
    INSERT INTO closed_days (tenant_id, fecha, motivo, boxes)
    VALUES (${tenantId}, ${fecha}::date, ${motivo}, ${boxes})
    ON CONFLICT (tenant_id, fecha) DO UPDATE SET motivo = ${motivo}, boxes = ${boxes}
    RETURNING *
  `
  return row
}

export async function removeClosedDay(tenantId: string, fecha: string) {
  await sql`DELETE FROM closed_days WHERE tenant_id = ${tenantId} AND fecha = ${fecha}::date`
}

// ─── Settings ──────────────────────────────────────────────────────────────────

export async function updateSettings(tenantId: string, data: {
  marca?: string; imagen_hero_url?: string | null; fds_config?: object
}) {
  await sql`
    INSERT INTO tenant_settings (tenant_id, marca, imagen_hero_url, fds_config, updated_at)
    VALUES (${tenantId}, ${data.marca ?? 'Mi Consultorio'}, ${data.imagen_hero_url ?? null},
            ${JSON.stringify(data.fds_config ?? {})}, now())
    ON CONFLICT (tenant_id) DO UPDATE SET
      marca           = COALESCE(${data.marca ?? null}, tenant_settings.marca),
      imagen_hero_url = CASE WHEN ${data.imagen_hero_url !== undefined} THEN ${data.imagen_hero_url ?? null} ELSE tenant_settings.imagen_hero_url END,
      fds_config      = COALESCE(${data.fds_config ? JSON.stringify(data.fds_config) : null}::jsonb, tenant_settings.fds_config),
      updated_at      = now()
  `
}

// ─── Redes sociales del tenant ─────────────────────────────────────────────────

export async function getTenantSocialLinksAdmin(tenantId: string): Promise<SocialLink[]> {
  return sql<SocialLink[]>`
    SELECT * FROM tenant_social_links WHERE tenant_id = ${tenantId} ORDER BY position, created_at
  `
}

export async function upsertTenantSocialLink(tenantId: string, red: string, url: string, label: string | null) {
  await sql`
    INSERT INTO tenant_social_links (tenant_id, red, url, label)
    VALUES (${tenantId}, ${red}, ${url}, ${label ?? null})
    ON CONFLICT DO NOTHING
  `
}

export async function deleteTenantSocialLink(tenantId: string, id: string) {
  await sql`DELETE FROM tenant_social_links WHERE id = ${id} AND tenant_id = ${tenantId}`
}

// ─── Eventos ───────────────────────────────────────────────────────────────────

export async function getAllEvents(tenantId: string): Promise<Event[]> {
  return sql<Event[]>`
    SELECT * FROM events WHERE tenant_id = ${tenantId} ORDER BY fecha DESC
  `
}

export async function createEvent(tenantId: string, data: {
  titulo: string; facilitadora?: string; descripcion?: string
  fecha: string; hora: string; lugar?: string
  cupo: number; precio: number; color: string; link?: string
}) {
  const [ev] = await sql<Event[]>`
    INSERT INTO events (tenant_id, titulo, facilitadora, descripcion, fecha, hora, lugar, cupo, precio, color, link)
    VALUES (${tenantId}, ${data.titulo}, ${data.facilitadora ?? null}, ${data.descripcion ?? null},
            ${data.fecha}::date, ${data.hora}::time, ${data.lugar ?? null},
            ${data.cupo}, ${data.precio}, ${data.color}, ${data.link ?? null})
    RETURNING *
  `
  return ev
}

export async function updateEvent(tenantId: string, eventId: string, data: Partial<{
  titulo: string; facilitadora: string; descripcion: string
  fecha: string; hora: string; lugar: string
  cupo: number; precio: number; color: string; link: string; active: boolean
}>) {
  const [ev] = await sql<Event[]>`
    UPDATE events SET
      titulo       = COALESCE(${data.titulo       ?? null}, titulo),
      facilitadora = COALESCE(${data.facilitadora ?? null}, facilitadora),
      descripcion  = COALESCE(${data.descripcion  ?? null}, descripcion),
      fecha        = COALESCE(${data.fecha         ?? null}::date, fecha),
      hora         = COALESCE(${data.hora          ?? null}::time, hora),
      lugar        = COALESCE(${data.lugar         ?? null}, lugar),
      cupo         = COALESCE(${data.cupo          ?? null}, cupo),
      precio       = COALESCE(${data.precio        ?? null}, precio),
      color        = COALESCE(${data.color         ?? null}, color),
      link         = COALESCE(${data.link          ?? null}, link),
      active       = COALESCE(${data.active        ?? null}, active)
    WHERE id = ${eventId} AND tenant_id = ${tenantId}
    RETURNING *
  `
  return ev
}

export async function deleteEvent(tenantId: string, eventId: string) {
  await sql`DELETE FROM events WHERE id = ${eventId} AND tenant_id = ${tenantId}`
}

// ─── Administradores ───────────────────────────────────────────────────────────

export async function getAdminUsers(tenantId: string): Promise<AdminUser[]> {
  return sql<AdminUser[]>`
    SELECT id, tenant_id, nombre, email, created_at FROM admin_users
    WHERE tenant_id = ${tenantId} ORDER BY created_at
  `
}

export async function createAdminUser(tenantId: string, nombre: string, email: string, passwordHash: string) {
  const [admin] = await sql<AdminUser[]>`
    INSERT INTO admin_users (tenant_id, nombre, email, password_hash)
    VALUES (${tenantId}, ${nombre}, ${email}, ${passwordHash})
    RETURNING id, tenant_id, nombre, email, created_at
  `
  return admin
}

export async function updateAdminPassword(tenantId: string, adminId: string, passwordHash: string) {
  await sql`
    UPDATE admin_users SET password_hash = ${passwordHash}
    WHERE id = ${adminId} AND tenant_id = ${tenantId}
  `
}

export async function deleteAdminUser(tenantId: string, adminId: string) {
  await sql`DELETE FROM admin_users WHERE id = ${adminId} AND tenant_id = ${tenantId}`
}

// ─── Log de actividad ──────────────────────────────────────────────────────────

export async function getActivityLog(tenantId: string, limit = 60) {
  return sql`
    SELECT * FROM activity_log WHERE tenant_id = ${tenantId}
    ORDER BY created_at DESC LIMIT ${limit}
  `
}

export async function logActivity(tenantId: string, usuario: string, accion: string, detalle?: object) {
  await sql`
    INSERT INTO activity_log (tenant_id, usuario, accion, detalle)
    VALUES (${tenantId}, ${usuario}, ${accion}, ${detalle ? JSON.stringify(detalle) : null})
  `
}
