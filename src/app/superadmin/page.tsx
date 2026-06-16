import { getSuperadminSession } from '@/lib/auth'
import { getAllClinics } from '@/lib/queries/superadmin'
import { SuperadminLoginPage } from '@/components/superadmin/SuperadminLoginPage'
import { SuperadminDashboard } from '@/components/superadmin/SuperadminDashboard'

export const dynamic = 'force-dynamic'

export default async function SuperadminPage() {
  const session = await getSuperadminSession()

  if (!session) {
    return <SuperadminLoginPage />
  }

  const clinics = await getAllClinics()

  return <SuperadminDashboard session={session} clinics={clinics} />
}
