import sql from '@/lib/db'
import type { Appointment, Franja } from '@/lib/types'
import { HORAS } from '@/lib/schedule'

export { HORAS }

export interface SlotInfo {
  hora: string
  franja: Franja
  available: boolean
}

/**
 * Devuelve todos los slots (ocupados y libres) de un profesional para una fecha.
 * Verifica módulos fijos, días cerrados y config de fin de semana.
 */
export async function getSlots(
  tenantId: string,
  professionalId: string,
  fecha: string       // YYYY-MM-DD
): Promise<SlotInfo[]> {
  // Nombre del día en español (igual que el MVP)
  const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const dt = new Date(fecha + 'T12:00:00')
  const diaNombre = DIAS[dt.getDay()]

  // 1. Módulos del profesional para ese día
  const modules = await sql<{ franja: Franja }[]>`
    SELECT franja FROM professional_modules
    WHERE professional_id = ${professionalId}
      AND tenant_id = ${tenantId}
      AND dia_semana = ${diaNombre}
      AND active = true
  `
  if (modules.length === 0) return []

  // 2. ¿Es día cerrado?
  const [closed] = await sql`
    SELECT 1 FROM closed_days
    WHERE tenant_id = ${tenantId}
      AND fecha = ${fecha}::date
      AND ${professionalId}::text = ANY(
        SELECT p.id::text FROM professionals p
        WHERE p.tenant_id = ${tenantId} AND p.id = ${professionalId}
          AND p.box = ANY(boxes)
      )
    LIMIT 1
  `
  if (closed) return []

  // 3. Config de fin de semana
  const dow = dt.getDay() // 0=Dom, 6=Sáb
  if (dow === 0 || dow === 6) {
    const [cfg] = await sql<{ fds_config: Record<string, Record<string, boolean>> }[]>`
      SELECT fds_config FROM tenant_settings WHERE tenant_id = ${tenantId}
    `
    if (cfg) {
      const key = dow === 6 ? 'sab' : 'dom'
      const fds = cfg.fds_config[key] ?? {}
      // Filtrar módulos según config de fin de semana
      const allowedFranjas = modules.filter(m => !fds[m.franja === 'mañana' ? 'manana' : 'tarde'])
      if (allowedFranjas.length === 0) return []
    }
  }

  // 4. Turnos ya reservados
  const booked = await sql<{ hora: string }[]>`
    SELECT hora::text FROM appointments
    WHERE professional_id = ${professionalId}
      AND tenant_id = ${tenantId}
      AND fecha = ${fecha}::date
  `
  const bookedHoras = new Set(booked.map(b => b.hora.slice(0, 5)))

  // 5. Construir slots
  const slots: SlotInfo[] = []
  for (const mod of modules) {
    for (const hora of HORAS[mod.franja]) {
      slots.push({
        hora,
        franja: mod.franja,
        available: !bookedHoras.has(hora),
      })
    }
  }

  return slots.sort((a, b) => a.hora.localeCompare(b.hora))
}

/**
 * Para el wizard de fecha: devuelve cuántos slots libres hay para un conjunto de profesionales
 * en los próximos N días.
 */
export async function getAvailableDates(
  tenantId: string,
  professionalIds: string[],
  days = 21
): Promise<Map<string, number>> {
  const result = new Map<string, number>()
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    let count = 0
    for (const profId of professionalIds) {
      const slots = await getSlots(tenantId, profId, iso)
      count += slots.filter(s => s.available).length
    }
    if (count > 0) result.set(iso, count)
  }
  return result
}

export interface CreateAppointmentInput {
  tenantId: string
  professionalId: string
  fecha: string
  hora: string
  franja: Franja
  paciente: string
  obraSocial: string
  celular: string
  email?: string
}

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<Appointment> {
  // Verificar que el slot sigue disponible (race condition protection)
  const [existing] = await sql`
    SELECT id FROM appointments
    WHERE professional_id = ${input.professionalId}
      AND tenant_id = ${input.tenantId}
      AND fecha = ${input.fecha}::date
      AND hora = ${input.hora}::time
    LIMIT 1
  `
  if (existing) {
    throw new Error('El horario ya fue reservado. Por favor elegí otro.')
  }

  const [appt] = await sql<Appointment[]>`
    INSERT INTO appointments
      (tenant_id, professional_id, fecha, hora, franja,
       paciente, obra_social, celular, email, origen)
    VALUES
      (${input.tenantId}, ${input.professionalId},
       ${input.fecha}::date, ${input.hora}::time, ${input.franja},
       ${input.paciente}, ${input.obraSocial || 'Particular'},
       ${input.celular || null}, ${input.email || null}, 'web')
    RETURNING *
  `
  return appt
}
