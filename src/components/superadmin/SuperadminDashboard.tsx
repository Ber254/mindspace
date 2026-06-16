'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { TenantWithStats } from '@/lib/types'
import type { SuperadminSession } from '@/lib/auth'

type Tab = 'clinicas' | 'usuarios'

interface UserRow {
  id: string
  nombre: string
  email: string | null
  role: string
  tenant_name: string
  tenant_slug: string
  tenant_active: boolean
  created_at: string
}

interface Props {
  session: SuperadminSession
  clinics: TenantWithStats[]
}

export function SuperadminDashboard({ session, clinics: initialClinics }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [tab, setTab] = useState<Tab>('clinicas')
  const [clinics, setClinics] = useState<TenantWithStats[]>(initialClinics)
  const [users, setUsers] = useState<{ admins: UserRow[]; professionals: UserRow[] } | null>(null)
  const [usersLoading, setUsersLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [newClinic, setNewClinic] = useState({ name: '', slug: '' })
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  function refresh() { startTransition(() => router.refresh()) }

  async function loadUsers() {
    if (users) return
    setUsersLoading(true)
    try {
      const r = await fetch('/api/superadmin/users')
      if (r.ok) setUsers(await r.json())
    } finally {
      setUsersLoading(false)
    }
  }

  async function handleTabChange(t: Tab) {
    setTab(t)
    if (t === 'usuarios') loadUsers()
  }

  async function toggleClinic(clinic: TenantWithStats) {
    const label = clinic.active ? 'deshabilitar' : 'habilitar'
    if (!confirm(`¿Querés ${label} la clínica "${clinic.name}"?`)) return
    const r = await fetch(`/api/superadmin/clinics/${clinic.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !clinic.active }),
    })
    if (r.ok) {
      setClinics(cs => cs.map(c => c.id === clinic.id ? { ...c, active: !c.active } : c))
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newClinic.name || !newClinic.slug) { setCreateError('Nombre y slug son requeridos'); return }
    setCreateLoading(true); setCreateError('')
    try {
      const r = await fetch('/api/superadmin/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClinic),
      })
      if (!r.ok) { const d = await r.json(); setCreateError(d.error ?? 'Error'); return }
      setNewClinic({ name: '', slug: '' })
      setShowCreateForm(false)
      refresh()
    } catch { setCreateError('Error de conexión') } finally { setCreateLoading(false) }
  }

  async function handleLogout() {
    setLogoutLoading(true)
    await fetch('/api/superadmin/logout', { method: 'POST' })
    router.replace('/superadmin')
  }

  const filteredClinics = clinics.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase())
  )

  const allUsers = users
    ? [...users.admins.map(u => ({ ...u, role: 'admin' })), ...users.professionals.map(u => ({ ...u, role: 'profesional' }))]
    : []
  const filteredUsers = allUsers.filter(u =>
    !search ||
    u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.tenant_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', height: 60, gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>MindSpace</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Superadmin</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{session.nombre} · {session.email}</div>
        <button onClick={handleLogout} disabled={logoutLoading} style={btnGhostDark}>
          {logoutLoading ? '…' : 'Salir'}
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '24px 32px 0' }}>
        {[
          { label: 'Clínicas totales', value: clinics.length, icon: '🏥' },
          { label: 'Clínicas activas', value: clinics.filter(c => c.active).length, icon: '✅' },
          { label: 'Suspendidas', value: clinics.filter(c => !c.active).length, icon: '🔒' },
        ].map(s => (
          <div key={s.label} style={statCard}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar + search */}
      <div style={{ padding: '20px 32px 0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', padding: 4, borderRadius: 12 }}>
          {(['clinicas', 'usuarios'] as Tab[]).map(t => (
            <button key={t} onClick={() => handleTabChange(t)} style={{
              padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 700,
              background: tab === t ? 'rgba(123,174,138,0.85)' : 'transparent',
              color: tab === t ? '#fff' : 'rgba(255,255,255,0.5)',
            }}>
              {t === 'clinicas' ? '🏥 Clínicas' : '👤 Usuarios'}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={tab === 'clinicas' ? 'Buscar clínica…' : 'Buscar usuario…'}
          style={{ ...inpDark, flex: 1, maxWidth: 300 }}
        />
        {tab === 'clinicas' && (
          <button onClick={() => setShowCreateForm(v => !v)} style={btnPrimaryDark}>
            + Nueva clínica
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && tab === 'clinicas' && (
        <div style={{ margin: '16px 32px 0', background: 'rgba(123,174,138,0.1)', border: '1.5px solid rgba(123,174,138,0.3)', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#7BAE8A', marginBottom: 16 }}>Nueva clínica / consultorio</div>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={lblDark}>Nombre de la clínica *</label>
                <input value={newClinic.name} onChange={e => setNewClinic(n => ({ ...n, name: e.target.value }))} placeholder="Clínica Norte" style={inpDark} />
              </div>
              <div>
                <label style={lblDark}>Slug (subdominio) *</label>
                <input
                  value={newClinic.slug}
                  onChange={e => setNewClinic(n => ({ ...n, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                  placeholder="clinica-norte"
                  style={inpDark}
                />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                  Acceso: {newClinic.slug || 'slug'}.tudominio.com
                </div>
              </div>
            </div>
            {createError && (
              <div style={{ fontSize: 13, color: '#f87171', background: 'rgba(239,68,68,0.12)', padding: '8px 12px', borderRadius: 8, marginBottom: 12 }}>
                {createError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={createLoading} style={btnPrimaryDark}>
                {createLoading ? 'Creando…' : 'Crear clínica'}
              </button>
              <button type="button" onClick={() => setShowCreateForm(false)} style={btnGhostDark}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '20px 32px 40px' }}>
        {tab === 'clinicas' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {filteredClinics.length === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center', padding: 40 }}>
                No hay clínicas registradas.
              </div>
            )}
            {filteredClinics.map(c => (
              <ClinicCard key={c.id} clinic={c} onToggle={toggleClinic} />
            ))}
          </div>
        )}

        {tab === 'usuarios' && (
          usersLoading ? (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', padding: 60 }}>
              Cargando usuarios…
            </div>
          ) : (
            <UsersTable users={filteredUsers} />
          )
        )}
      </div>
    </div>
  )
}

// ─── Clinic Card ─────────────────────────────────────────────────────────────

function ClinicCard({ clinic, onToggle }: { clinic: TenantWithStats; onToggle: (c: TenantWithStats) => void }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1.5px solid ${clinic.active ? 'rgba(123,174,138,0.25)' : 'rgba(239,68,68,0.2)'}`,
      borderRadius: 14,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      opacity: clinic.active ? 1 : 0.65,
    }}>
      {/* Status dot */}
      <div style={{
        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
        background: clinic.active ? '#7BAE8A' : '#ef4444',
        boxShadow: clinic.active ? '0 0 8px #7BAE8A' : '0 0 8px #ef4444',
      }} />

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{clinic.name}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>slug: {clinic.slug}</span>
          {!clinic.active && (
            <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(239,68,68,0.3)' }}>
              SUSPENDIDA
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>👩‍⚕️ {clinic.professionals_count} profesionales</span>
          <span>🔑 {clinic.admins_count} admins</span>
          <span>📅 {clinic.appointments_count} turnos totales</span>
          <span>📆 Alta: {new Date(clinic.created_at).toLocaleDateString('es-AR')}</span>
        </div>
      </div>

      {/* Toggle switch */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => onToggle(clinic)}
          title={clinic.active ? 'Deshabilitar clínica' : 'Habilitar clínica'}
          style={{
            width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer',
            background: clinic.active ? '#7BAE8A' : 'rgba(255,255,255,0.1)',
            position: 'relative', transition: 'background .2s',
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3,
            left: clinic.active ? 24 : 4,
            transition: 'left .2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </button>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
          {clinic.active ? 'ACTIVA' : 'INACTIVA'}
        </span>
      </div>
    </div>
  )
}

// ─── Users Table ─────────────────────────────────────────────────────────────

function UsersTable({ users }: { users: UserRow[] }) {
  if (users.length === 0) {
    return (
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center', padding: 40 }}>
        No hay usuarios que coincidan con la búsqueda.
      </div>
    )
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['Nombre', 'Email / Celular', 'Rol', 'Clínica', 'Estado', 'Alta'].map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '.05em',
                color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id + u.role} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '10px 14px', color: '#fff', fontWeight: 600 }}>{u.nombre}</td>
              <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', fontSize: 12 }}>
                {u.email ?? '—'}
              </td>
              <td style={{ padding: '10px 14px' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                  background: u.role === 'admin' ? 'rgba(168,155,196,0.2)' : 'rgba(137,180,204,0.2)',
                  color: u.role === 'admin' ? '#A89BC4' : '#89B4CC',
                }}>
                  {u.role}
                </span>
              </td>
              <td style={{ padding: '10px 14px' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{u.tenant_name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{u.tenant_slug}</div>
              </td>
              <td style={{ padding: '10px 14px' }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                  background: u.tenant_active ? 'rgba(123,174,138,0.15)' : 'rgba(239,68,68,0.15)',
                  color: u.tenant_active ? '#7BAE8A' : '#f87171',
                }}>
                  {u.tenant_active ? 'Activa' : 'Suspendida'}
                </span>
              </td>
              <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                {new Date(u.created_at).toLocaleDateString('es-AR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const statCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14, padding: '20px 24px',
  display: 'flex', alignItems: 'center', gap: 16,
}
const inpDark: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.05)', color: '#fff',
  fontSize: 13, fontFamily: 'inherit', outline: 'none',
}
const lblDark: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700,
  color: 'rgba(255,255,255,0.5)', marginBottom: 5,
}
const btnPrimaryDark: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 10,
  background: 'linear-gradient(135deg, #7BAE8A, #A89BC4)',
  color: '#fff', border: 'none', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
}
const btnGhostDark: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 10,
  background: 'transparent', color: 'rgba(255,255,255,0.5)',
  border: '1.5px solid rgba(255,255,255,0.15)',
  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
}
