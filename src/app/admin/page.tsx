import { resolveTenantWithSettings } from '@/lib/tenant'
import { getAdminSession } from '@/lib/auth'
import { AdminLoginPage } from '@/components/tenant/admin/AdminLoginPage'
import { AdminDashboard } from '@/components/tenant/admin/AdminDashboard'
import sql from '@/lib/db'
import {
  getAllProfessionals,
  getClosedDays,
  getAllEvents,
  getAdminUsers,
  getTenantSocialLinksAdmin,
  getActivityLog,
} from '@/lib/queries/admin-dashboard'

export default async function AdminPage() {
  const { tenant, settings } = await resolveTenantWithSettings()
  const session = await getAdminSession()

  if (!session || session.tenantId !== tenant.id) {
    return <AdminLoginPage tenantSlug={tenant.slug} marca={settings.marca} />
  }

  // Set RLS context for all queries
  await sql`SELECT set_config('app.current_tenant_id', ${tenant.id}, true)`

  const [professionals, closedDays, events, admins, socials, activityLog] = await Promise.all([
    getAllProfessionals(tenant.id),
    getClosedDays(tenant.id),
    getAllEvents(tenant.id),
    getAdminUsers(tenant.id),
    getTenantSocialLinksAdmin(tenant.id),
    getActivityLog(tenant.id),
  ])

  return (
    <AdminDashboard
      session={session}
      professionals={professionals}
      closedDays={closedDays}
      events={events}
      admins={admins}
      settings={settings}
      socials={socials}
      activityLog={activityLog as unknown as Parameters<typeof AdminDashboard>[0]['activityLog']}
    />
  )
}
