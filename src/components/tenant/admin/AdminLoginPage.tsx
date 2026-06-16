'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  tenantSlug: string
  marca: string
}

export function AdminLoginPage({ tenantSlug, marca }: Props) {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const r = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug },
        body: JSON.stringify({ email, password }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d.error ?? 'Error al iniciar sesión'); return }
      router.refresh()
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--beige)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '40px 36px', maxWidth: 380, width: '100%', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 6 }}>
            {marca}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-6)' }}>Panel de administración</div>
        </div>

        <form onSubmit={handleLogin}>
          <label style={lbl}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="admin@consultorio.com" style={{ ...inp, marginBottom: 14 }}
            required autoFocus
          />
          <label style={lbl}>Contraseña</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" style={{ ...inp, marginBottom: 20 }}
            required
          />
          {error && (
            <div style={{ fontSize: 13, color: '#8A2020', background: '#FBE9E9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '11px', borderRadius: 'var(--radius-md)', background: 'var(--sage)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', display: 'block', marginBottom: 5 }
const inp: React.CSSProperties = { fontFamily: 'inherit', fontSize: 14, padding: '10px 14px', border: '1.5px solid var(--gray-3)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--text)', outline: 'none', width: '100%' }
