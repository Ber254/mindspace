export type Color = 'sage' | 'sky' | 'lav' | 'peach' | 'rose'
export type Franja = 'mañana' | 'tarde'
export type Asistencia = 'si' | 'tarde' | 'no'
export type RedSocial = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'website'

export interface Tenant {
  id: string
  slug: string
  name: string
  created_at: string
  active: boolean
}

export interface TenantSettings {
  tenant_id: string
  marca: string
  imagen_hero_url: string | null
  fds_config: FdsConfig
  updated_at: string
}

export interface FdsConfig {
  sab: { manana: boolean; tarde: boolean }
  dom: { manana: boolean; tarde: boolean }
}

export interface SocialLink {
  id: string
  red: RedSocial
  label: string | null
  url: string
  position: number
}

export interface Professional {
  id: string
  tenant_id: string
  nombre: string
  especialidad: string
  subespecialidad: string | null
  box: number
  color: Color
  alias_mp: string | null
  cbu: string | null
  celular: string | null
  link_cobro: string | null
  precio_consulta: number | null
  active: boolean
  created_at: string
  // Joined fields
  modules?: ProfessionalModule[]
  social_links?: SocialLink[]
}

export interface ProfessionalModule {
  id: string
  professional_id: string
  dia_semana: string
  franja: Franja
  active: boolean
}

export interface Appointment {
  id: string
  tenant_id: string
  professional_id: string
  fecha: string       // ISO date: YYYY-MM-DD
  hora: string        // HH:MM
  franja: Franja
  paciente: string
  obra_social: string
  celular: string | null
  email: string | null
  origen: 'web' | 'manual'
  pago: boolean | null
  asistencia: Asistencia | null
  notas: string | null
  created_at: string
}

export interface ClosedDay {
  id: string
  tenant_id: string
  fecha: string
  motivo: string
  boxes: number[]
  created_at: string
}

export interface Event {
  id: string
  tenant_id: string
  titulo: string
  facilitadora: string | null
  descripcion: string | null
  fecha: string
  hora: string
  lugar: string | null
  cupo: number
  precio: number
  color: Color
  link: string | null
  active: boolean
  created_at: string
}

export interface AdminUser {
  id: string
  tenant_id: string
  nombre: string
  email: string
  created_at: string
}

// ── Contexto de tenant resuelto por el middleware ──
export interface TenantContext {
  tenantId: string
  tenantSlug: string
}

export interface TenantWithStats {
  id: string
  slug: string
  name: string
  active: boolean
  created_at: string
  professionals_count: number
  admins_count: number
  appointments_count: number
}
