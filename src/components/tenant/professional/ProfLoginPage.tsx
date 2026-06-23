'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Professional } from '@/lib/types'
import { Avatar, getInitials } from '@/components/ui/Avatar'
import type { Color } from '@/lib/types'

interface Props {
  tenantSlug: string
  professionals: Pick<Professional, 'id' | 'nombre' | 'especialidad' | 'color'>[]
}

export function ProfLoginPage({ tenantSlug, professionals }: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)

  const selectedProf = professionals.find(p => p.id === selectedId)

  async function handleLogin() {
    if (!selectedId) { setError('Seleccioná un profesional.'); return }
    if (!password)   { setError('Ingresá tu contraseña.'); return }
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug },
        body: JSON.stringify({ professionalId: selectedId, password, tenantSlug }),
      })
      if (!r.ok) { const d = await r.json(); setError(d.error ?? 'Error'); return }
      router.refresh()   // Server Component re-corre y lee la cookie nueva
    } catch { setError('Error de conexión.') }
    finally { setLoading(false) }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 32, maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--lav-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>🧠</div>
          <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--gray-6)', marginBottom: 4 }}>Acceso profesionales</div>
          <div style={{ fontSize: 13, color: 'var(--gray-4)' }}>Ingresá con tus credenciales</div>
        </div>

        {/* Selector visual de profesionales */}
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Profesional</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {professionals.map(p => {
              const sel = p.id === selectedId
              return (
                <button key={p.id} onClick={() => setSelectedId(p.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                  border: `1.5px solid ${sel ? 'var(--sage-dk)' : 'var(--gray-2)'}`,
                  background: sel ? 'var(--sage-lt)' : '#fff',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all .15s',
                }}>
                  <Avatar color={p.color as Color} initials={getInitials(p.nombre)} size={34} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-6)' }}>{p.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-4)' }}>{p.especialidad}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Contraseña"
              style={{ ...inp, paddingRight: 70 }}
            />
            <span
              onClick={() => setShowPass(s => !s)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--gray-4)', cursor: 'pointer' }}
            >
              {showPass ? 'ocultar' : 'mostrar'}
            </span>
          </div>
          {selectedProf && (
            <div style={{ fontSize: 11, color: 'var(--gray-4)', marginTop: 4 }}>
              Demo: contraseña <strong>1234</strong>
            </div>
          )}
        </div>

        {error && <div style={{ fontSize: 13, color: '#8A2020', background: '#FBE9E9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}>{error}</div>}

        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', ...btnPrimary }}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--gray-4)' }}>
          Contraseña por defecto: <strong>1234</strong>
        </div>
      </div>
    </main>
  )
}

const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', display: 'block', marginBottom: 8 }
const inp: React.CSSProperties = { fontFamily: 'inherit', fontSize: 14, padding: '9px 14px', border: '1.5px solid var(--gray-3)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--text)', outline: 'none', width: '100%' }
const btnPrimary: React.CSSProperties = { padding: '11px 20px', borderRadius: 'var(--radius-md)', background: 'var(--sage)', color: '#fff', border: '2px solid transparent', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }
