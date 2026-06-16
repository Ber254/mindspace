import { getTenantSlug } from '@/lib/tenant'
import { getProfessionalsPublic } from '@/lib/queries/professionals'
import { getTenantSettings, getTenantSocialLinks, getEvents } from '@/lib/queries/settings'
import sql from '@/lib/db'
import { TopBar } from '@/components/tenant/TopBar'
import { PatientPageClient } from '@/components/tenant/PatientPageClient'

interface Props {
  searchParams: Promise<{ tenant?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  // Leer slug: primero del proxy header, luego del query param ?tenant=
  const headerSlug = await getTenantSlug()
  const { tenant: paramSlug } = await searchParams
  const slug = headerSlug ?? paramSlug ?? null

  if (!slug) {
    return <LandingPage />
  }

  // Resolver tenant
  const [tenantRow] = await sql<{ id: string; name: string }[]>`
    SELECT id, name FROM tenants WHERE slug = ${slug} AND active = true LIMIT 1
  `
  if (!tenantRow) {
    return (
      <main style={{ padding: 40, fontFamily: 'inherit' }}>
        <div style={{ color: '#8A2020', background: '#FBE9E9', padding: '16px 20px', borderRadius: 12, maxWidth: 400 }}>
          Consultorio no encontrado. Verificá el link. (slug: {slug})
        </div>
      </main>
    )
  }

  // Fetch de datos en paralelo
  const [settings, professionals, socialLinks, events] = await Promise.all([
    getTenantSettings(tenantRow.id),
    getProfessionalsPublic(tenantRow.id),
    getTenantSocialLinks(tenantRow.id),
    getEvents(tenantRow.id),
  ])

  return (
    <>
      <TopBar settings={settings} tenantSlug={slug} />
      <PatientPageClient
        tenantSlug={slug}
        settings={settings}
        professionals={professionals}
        socialLinks={socialLinks}
        events={events as never}
      />
    </>
  )
}

function LandingPage() {
  return (
    <main style={{ padding: 40, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🧠</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--sage-dk)', marginBottom: 8 }}>MindSpace</h1>
        <p style={{ fontSize: 16, color: 'var(--gray-5)', marginBottom: 32 }}>
          Plataforma de gestión de consultorios psicológicos.
        </p>
        <div style={{
          background: 'var(--sky-lt)', border: '1px solid var(--sky)',
          borderRadius: 'var(--radius-md)', padding: '16px 20px', textAlign: 'left',
        }}>
          <strong style={{ color: 'var(--sky-dk)' }}>Para acceder a un consultorio</strong>
          <p style={{ fontSize: 13, color: 'var(--gray-5)', marginTop: 6 }}>
            Usá la URL con el parámetro tenant, por ejemplo:{' '}
            <code style={{ background: 'var(--gray-2)', padding: '2px 6px', borderRadius: 4 }}>
              ?tenant=demo
            </code>
          </p>
        </div>
      </div>
    </main>
  )
}
