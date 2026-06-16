import sql from '@/lib/db'
import { getTenantSlug } from '@/lib/tenant'
import { getProSession } from '@/lib/auth'
import { getProfessionalsPublic } from '@/lib/queries/professionals'
import {
  getTodayAppointments,
  getUpcomingAppointments,
  getPastAppointments,
  getDashboardKPIs,
} from '@/lib/queries/professional-dashboard'
import { getTenantSettings } from '@/lib/queries/settings'
import { TopBar } from '@/components/tenant/TopBar'
import { ProfLoginPage } from '@/components/tenant/professional/ProfLoginPage'
import { ProfDashboard } from '@/components/tenant/professional/ProfDashboard'
import { notFound } from 'next/navigation'

export default async function ProPage() {
  const slug = await getTenantSlug()
  if (!slug) notFound()

  // Resolver tenant
  const [tenant] = await sql<{ id: string; name: string }[]>`
    SELECT id, name FROM tenants WHERE slug = ${slug} AND active = true LIMIT 1
  `
  if (!tenant) notFound()

  const settings = await getTenantSettings(tenant.id)
  const session  = await getProSession()

  // Sin sesión → mostrar login
  if (!session || session.tenantId !== tenant.id) {
    const professionals = await getProfessionalsPublic(tenant.id)
    return (
      <>
        <TopBar settings={settings} activeTab="pro" tenantSlug={slug} />
        <ProfLoginPage
          tenantSlug={slug}
          professionals={professionals.map(p => ({
            id: p.id, nombre: p.nombre, especialidad: p.especialidad, color: p.color,
          }))}
        />
      </>
    )
  }

  // Con sesión → cargar dashboard
  const [prof] = await sql<{
    id: string; nombre: string; especialidad: string; subespecialidad: string | null
    box: number; color: string; alias_mp: string | null; cbu: string | null
    celular: string | null; link_cobro: string | null; precio_consulta: number | null
    active: boolean; created_at: string; tenant_id: string
  }[]>`
    SELECT * FROM professionals
    WHERE id = ${session.professionalId}
      AND tenant_id = ${tenant.id}
      AND active = true
    LIMIT 1
  `
  if (!prof) notFound()

  const [today, upcoming, past, kpis] = await Promise.all([
    getTodayAppointments(tenant.id, prof.id),
    getUpcomingAppointments(tenant.id, prof.id),
    getPastAppointments(tenant.id, prof.id),
    getDashboardKPIs(tenant.id, prof.id),
  ])

  return (
    <>
      <TopBar settings={settings} activeTab="pro" tenantSlug={slug} />
      <ProfDashboard
        prof={prof as never}
        tenantSlug={slug}
        todayAppts={today}
        upcomingAppts={upcoming}
        pastAppts={past}
        kpis={kpis}
      />
    </>
  )
}
