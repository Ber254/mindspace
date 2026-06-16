'use client'
import { useState } from 'react'
import type { Professional } from '@/lib/types'

interface Props {
  prof: Professional
  tenantSlug: string
  onSave: () => void
  onClose: () => void
}

export function CobroModal({ prof, tenantSlug, onSave, onClose }: Props) {
  const [linkCobro,   setLinkCobro]   = useState(prof.link_cobro   ?? '')
  const [precio,      setPrecio]      = useState(String(prof.precio_consulta ?? ''))
  const [alias,       setAlias]       = useState(prof.alias_mp ?? '')
  const [cbu,         setCbu]         = useState(prof.cbu     ?? '')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  async function handleSave() {
    setLoading(true)
    try {
      const r = await fetch('/api/pro/cobro', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug },
        body: JSON.stringify({
          link_cobro:      linkCobro || null,
          precio_consulta: precio ? parseInt(precio, 10) : null,
          alias_mp:        alias || null,
          cbu:             cbu   || null,
        }),
      })
      if (!r.ok) { const d = await r.json(); setError(d.error ?? 'Error'); return }
      onSave()
      onClose()
    } catch { setError('Error de conexión.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(60,55,50,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 32, maxWidth: 480, width: '92%', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-6)' }}>🔵 Cobro — datos de pago</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--gray-4)' }}>✕</button>
        </div>

        {/* Instrucciones MP */}
        <div style={{ background: 'var(--sky-lt)', border: '1px solid var(--sky)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20, fontSize: 12, color: 'var(--sky-dk)' }}>
          <strong>¿Cómo generar tu link en MercadoPago?</strong>
          <ol style={{ paddingLeft: 18, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <li>Ingresá a <strong>mercadopago.com.ar</strong></li>
            <li>Andá a <strong>Cobrar → Crear link de pago</strong></li>
            <li>Configurá el monto y copiá el link generado</li>
          </ol>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Link de pago MercadoPago</label>
          <input value={linkCobro} onChange={e => setLinkCobro(e.target.value)} placeholder="https://mpago.la/…" style={inp} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Precio de consulta ($)</label>
          <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Ej: 9000" min="0" style={inp} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Alias MercadoPago</label>
            <input value={alias} onChange={e => setAlias(e.target.value)} placeholder="nombre.apellido.psi" style={inp} />
          </div>
          <div>
            <label style={lbl}>CBU</label>
            <input value={cbu} onChange={e => setCbu(e.target.value.replace(/\D/g, ''))} placeholder="22 dígitos" maxLength={22} style={inp} />
          </div>
        </div>

        {error && <div style={{ fontSize: 13, color: '#8A2020', background: '#FBE9E9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} disabled={loading} style={{ ...btnPrimary, flex: 1 }}>
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
          <button onClick={onClose} style={btnGhost}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', display: 'block', marginBottom: 5 }
const inp: React.CSSProperties = { fontFamily: 'inherit', fontSize: 14, padding: '9px 14px', border: '1.5px solid var(--gray-3)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--text)', outline: 'none', width: '100%' }
const btnPrimary: React.CSSProperties = { padding: '9px 20px', borderRadius: 'var(--radius-md)', background: 'var(--sage)', color: '#fff', border: '2px solid transparent', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const btnGhost: React.CSSProperties   = { padding: '9px 20px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--gray-5)', border: '2px solid var(--gray-3)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
