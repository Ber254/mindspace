'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Professional, ClosedDay, Event, AdminUser, TenantSettings, SocialLink } from '@/lib/types'
import type { AdminSession } from '@/lib/auth'
import { ProfessionalsSection } from './sections/ProfessionalsSection'
import { ClosedDaysSection } from './sections/ClosedDaysSection'
import { SettingsSection } from './sections/SettingsSection'
import { EventsSection } from './sections/EventsSection'
import { AdminsSection } from './sections/AdminsSection'
import { ActivitySection } from './sections/ActivitySection'

type Tab = 'profesionales' | 'dias-cerrados' | 'marca' | 'eventos' | 'admins' | 'actividad'

interface LogEntry {
  id: string; usuario: string; accion: string; detalle: Record<string, unknown> | null; created_at: string
}

interface Props {
  session: AdminSession
  professionals: Professional[]
  closedDays: ClosedDay[]
  events: Event[]
  admins: AdminUser[]
  settings: TenantSettings
  socials: SocialLink[]
  activityLog: LogEntry[]
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'profesionales', label: '👩‍⚕️ Profesionales' },
  { id: 'dias-cerrados', label: '📅 Días cerrados' },
  { id: 'marca',         label: '🏥 Marca y redes' },
  { id: 'eventos',       label: '🎭 Eventos' },
  { id: 'admins',        label: '🔑 Administradores' },
  { id: 'actividad',     label: '📋 Actividad' },
]

export function AdminDashboard({ session, professionals, closedDays, events, admins, settings, socials, activityLog }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [tab, setTab] = useState<Tab>('profesionales')
  const [logoutLoading, setLogoutLoading] = useState(false)

  function refresh() { startTransition(() => router.refresh()) }

  async function handleLogout() {
    setLogoutLoading(true)
    await fetch('/api/auth/admin-logout', { method: 'POST', headers: { 'x-tenant-slug': session.tenantSlug } })
    router.replace('/admin')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--beige)' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1.5px solid var(--gray-2)', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 2 }}>
            Panel de administración
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--gray-6)' }}>{settings.marca}</div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray-5)' }}>{session.nombre} · {session.email}</div>
        <button onClick={handleLogout} disabled={logoutLoading} style={btnGhost}>
          {logoutLoading ? '…' : 'Cerrar sesión'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1.5px solid var(--gray-2)', padding: '0 32px', display: 'flex', gap: 2, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? 'var(--sage-dk)' : 'var(--gray-5)', fontFamily: 'inherit',
            borderBottom: tab === t.id ? '2.5px solid var(--sage)' : '2.5px solid transparent',
            whiteSpace: 'nowrap',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
        {tab === 'profesionales' && (
          <ProfessionalsSection professionals={professionals} tenantSlug={session.tenantSlug} onRefresh={refresh} />
        )}
        {tab === 'dias-cerrados' && (
          <ClosedDaysSection closedDays={closedDays} tenantSlug={session.tenantSlug} onRefresh={refresh} />
        )}
        {tab === 'marca' && (
          <SettingsSection settings={settings} socials={socials} tenantSlug={session.tenantSlug} onRefresh={refresh} />
        )}
        {tab === 'eventos' && (
          <EventsSection events={events} tenantSlug={session.tenantSlug} onRefresh={refresh} />
        )}
        {tab === 'admins' && (
          <AdminsSection admins={admins} currentAdminId={session.adminId} tenantSlug={session.tenantSlug} onRefresh={refresh} />
        )}
        {tab === 'actividad' && (
          <ActivitySection log={activityLog} />
        )}
      </div>
    </div>
  )
}

const btnGhost: React.CSSProperties = { padding: '7px 16px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--gray-5)', border: '1.5px solid var(--gray-3)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
