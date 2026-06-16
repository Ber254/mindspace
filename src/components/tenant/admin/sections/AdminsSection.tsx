'use client'
import { useState } from 'react'
import type { AdminUser } from '@/lib/types'

interface Props {
  admins: AdminUser[]
  currentAdminId: string
  tenantSlug: string
  onRefresh: () => void
}

export function AdminsSection({ admins, currentAdminId, tenantSlug, onRefresh }: Props) {
  const [nombre,   setNombre]   = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [changingPw, setChangingPw] = useState<string | null>(null)
  const [newPw, setNewPw] = useState('')

  const headers = { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug }

  async function handleCreate() {
    if (!nombre || !email || !password) { setError('Todos los campos son requeridos'); return }
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/admin/admins', { method: 'POST', headers, body: JSON.stringify({ nombre, email, password }) })
      if (!r.ok) { const d = await r.json(); setError(d.error ?? 'Error'); return }
      setNombre(''); setEmail(''); setPassword(''); onRefresh()
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  async function handleDelete(id: string, nombre: string) {
    if (!confirm(`¿Eliminar a ${nombre}?`)) return
    const r = await fetch('/api/admin/admins', { method: 'DELETE', headers, body: JSON.stringify({ id }) })
    if (!r.ok) { const d = await r.json(); alert(d.error); return }
    onRefresh()
  }

  async function handleChangePw(adminId: string) {
    if (!newPw) return
    await fetch('/api/admin/admins', { method: 'POST', headers, body: JSON.stringify({ adminId, password: newPw }) })
    setChangingPw(null); setNewPw('')
  }

  return (
    <div>
      <h2 style={h2}>Administradores</h2>

      {/* Lista */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-2)', marginBottom: 24 }}>
        {admins.length === 0 ? (
          <div style={{ fontSize: 14, color: 'var(--gray-4)', fontStyle: 'italic' }}>Sin administradores registrados.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {admins.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: a.id === currentAdminId ? 'var(--sage-lt)' : 'var(--gray-1)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-6)' }}>{a.nombre}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-4)' }}>{a.email}</div>
                </div>
                {a.id === currentAdminId && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sage-dk)', background: 'var(--sage-lt)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--sage)' }}>Vos</span>}
                {changingPw === a.id ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Nueva contraseña" style={{ ...inp, width: 180 }} />
                    <button onClick={() => handleChangePw(a.id)} style={btnSm}>Guardar</button>
                    <button onClick={() => { setChangingPw(null); setNewPw('') }} style={btnGhost}>✕</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setChangingPw(a.id)} style={btnSm}>Cambiar contraseña</button>
                    {a.id !== currentAdminId && (
                      <button onClick={() => handleDelete(a.id, a.nombre)} style={{ ...btnSm, color: '#8A2020', borderColor: '#C47070' }}>Eliminar</button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agregar */}
      <div style={{ background: 'var(--gray-1)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1.5px solid var(--gray-2)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-6)', marginBottom: 14 }}>Agregar administrador</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Field label="Nombre">
            <input value={nombre} onChange={e => setNombre(e.target.value)} style={inp} placeholder="Ana García" />
          </Field>
          <Field label="Email">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} placeholder="ana@consultorio.com" />
          </Field>
          <Field label="Contraseña">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inp} placeholder="••••••••" />
          </Field>
        </div>
        {error && <div style={errBox}>{error}</div>}
        <button onClick={handleCreate} disabled={loading} style={btnPrimary}>{loading ? 'Creando…' : '+ Agregar'}</button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-5)', display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: 'var(--gray-6)', margin: '0 0 20px' }
const inp: React.CSSProperties = { fontFamily: 'inherit', fontSize: 14, padding: '9px 12px', border: '1.5px solid var(--gray-3)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--text)', outline: 'none', width: '100%' }
const btnPrimary: React.CSSProperties = { padding: '9px 18px', borderRadius: 'var(--radius-md)', background: 'var(--sage)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const btnGhost: React.CSSProperties = { padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--gray-5)', border: '1.5px solid var(--gray-3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const btnSm: React.CSSProperties = { padding: '5px 12px', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--gray-5)', border: '1.5px solid var(--gray-3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const errBox: React.CSSProperties = { fontSize: 13, color: '#8A2020', background: '#FBE9E9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12 }
