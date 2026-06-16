import sql from '@/lib/db'
import type { Appointment } from '@/lib/types'

export interface AppointmentRow extends Appointment {
  professional_nombre?: string
}

/** Turnos de hoy para un profesional */
export async function getTodayAppointments(
  tenantId: string,
  professionalId: string
): Promise<Appointment[]> {
  return sql<Appointment[]>`
    SELECT * FROM appointments
    WHERE tenant_id = ${tenantId}
      AND professional_id = ${professionalId}
      AND fecha = CURRENT_DATE
    ORDER BY hora
  `
}

/** Próximos turnos (mañana en adelante, máx 60 días) */
export async function getUpcomingAppointments(
  tenantId: string,
  professionalId: string,
  limit = 50
): Promise<Appointment[]> {
  return sql<Appointment[]>`
    SELECT * FROM appointments
    WHERE tenant_id = ${tenantId}
      AND professional_id = ${professionalId}
      AND fecha > CURRENT_DATE
    ORDER BY fecha, hora
    LIMIT ${limit}
  `
}

/** Historial (pasados con asistencia registrada) */
export async function getPastAppointments(
  tenantId: string,
  professionalId: string,
  limit = 30
): Promise<Appointment[]> {
  return sql<Appointment[]>`
    SELECT * FROM appointments
    WHERE tenant_id = ${tenantId}
      AND professional_id = ${professionalId}
      AND fecha < CURRENT_DATE
    ORDER BY fecha DESC, hora DESC
    LIMIT ${limit}
  `
}

/** KPIs para el dashboard */
export async function getDashboardKPIs(
  tenantId: string,
  professionalId: string
) {
  const [row] = await sql<{ total_proximos: number; pagados: number; pendientes_pago: number; total_historico: number }[]>`
    SELECT
      COUNT(*) FILTER (WHERE fecha >= CURRENT_DATE AND asistencia IS NULL)::int AS total_proximos,
      COUNT(*) FILTER (WHERE fecha >= CURRENT_DATE AND pago = true)::int         AS pagados,
      COUNT(*) FILTER (WHERE fecha >= CURRENT_DATE AND (pago IS NULL OR pago = false) AND asistencia IS NULL)::int AS pendientes_pago,
      COUNT(*) FILTER (WHERE fecha < CURRENT_DATE)::int                           AS total_historico
    FROM appointments
    WHERE tenant_id = ${tenantId}
      AND professional_id = ${professionalId}
  `
  return row ?? { total_proximos: 0, pagados: 0, pendientes_pago: 0, total_historico: 0 }
}

/** Busca pacientes por nombre (para autocomplete en Dar Turno) */
export async function searchPatients(
  tenantId: string,
  professionalId: string,
  query: string
): Promise<{ nombre: string; obra_social: string }[]> {
  return sql<{ nombre: string; obra_social: string }[]>`
    SELECT DISTINCT ON (lower(paciente)) paciente AS nombre, obra_social
    FROM appointments
    WHERE tenant_id = ${tenantId}
      AND professional_id = ${professionalId}
      AND lower(paciente) LIKE ${`%${query.toLowerCase()}%`}
    ORDER BY lower(paciente), created_at DESC
    LIMIT 8
  `
}

/** Registrar asistencia y pago de un turno */
export async function registerAttendance(
  tenantId: string,
  professionalId: string,
  appointmentId: string,
  data: { asistencia: string; pago: boolean; notas?: string }
): Promise<Appointment> {
  const [row] = await sql<Appointment[]>`
    UPDATE appointments
    SET asistencia = ${data.asistencia},
        pago       = ${data.pago},
        notas      = ${data.notas ?? null}
    WHERE id = ${appointmentId}
      AND tenant_id = ${tenantId}
      AND professional_id = ${professionalId}
    RETURNING *
  `
  if (!row) throw new Error('Turno no encontrado')
  return row
}

/** Toggle de pago sin registrar asistencia */
export async function togglePago(
  tenantId: string,
  professionalId: string,
  appointmentId: string
): Promise<boolean> {
  const [row] = await sql<{ pago: boolean | null }[]>`
    UPDATE appointments
    SET pago = NOT COALESCE(pago, false)
    WHERE id = ${appointmentId}
      AND tenant_id = ${tenantId}
      AND professional_id = ${professionalId}
    RETURNING pago
  `
  return row?.pago ?? false
}

/** Cancelar turno */
export async function deleteAppointment(
  tenantId: string,
  professionalId: string,
  appointmentId: string
): Promise<void> {
  await sql`
    DELETE FROM appointments
    WHERE id = ${appointmentId}
      AND tenant_id = ${tenantId}
      AND professional_id = ${professionalId}
  `
}
