'use client'
import { useState, useEffect } from 'react'
import type { TenantSettings, SocialLink, FdsConfig } from '@/lib/types'

interface Props {
  settings: TenantSettings
  socials: SocialLink[]
  tenantSlug: string
  onRefresh: () => void
}

const REDES = ['instagram','facebook','twitter','linkedin','youtube','tiktok','website'] as const

export function SettingsSection({ settings: initialSettings, socials: initialSocials, tenantSlug, onRefresh }: Props) {
  const [marca, setMarca] = useState(initialSettings.marca)
  const [heroUrl, setHeroUrl] = useState(initialSettings.imagen_hero_url ?? '')
  const [fds, setFds] = useState<FdsConfig>(initialSettings.fds_config)
  const [socials, setSocials] = useState<SocialLink[]>(initialSocials)
  const [newRed, setNewRed] = useState('instagram')
  const [newUrl, setNewUrl] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const headers = { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug }

  async function saveSettings() {
    setSaving(true); setMsg('')
    await fetch('/api/admin/settings', {
      method: 'PUT', headers,
      body: JSON.stringify({ marca, imagen_hero_url: heroUrl || null, fds_config: fds }),
    })
    setMsg('Guardado ✓'); setSaving(false)
    setTimeout(() => setMsg(''), 3000)
    onRefresh()
  }

  async function addSocial() {
    if (!newUrl) return
    await fetch('/api/admin/social', { method: 'POST', headers, body: JSON.stringify({ red: newRed, url: newUrl, label: newLabel || null }) })
    setNewUrl(''); setNewLabel('')
    const r = await fetch('/api/admin/settings', { headers: { 'x-tenant-slug': tenantSlug } })
    const d = await r.json()
    setSocials(d.socials)
  }

  async function removeSocial(id: string) {
    await fetch('/api/admin/social', { method: 'DELETE', headers, body: JSON.stringify({ id }) })
    setSocials(s => s.filter(x => x.id !== id))
  }

  function toggleFds(day: 'sab' | 'dom', franja: 'manana' | 'tarde') {
    setFds(f => ({ ...f, [day]: { ...f[day], [franja]: !f[day][franja] } }))
  }

  return (
    <div>
      <h2 style={h2}>Marca y configuración</h2>

      {/* Marca */}
      <Card title="Nombre del consultorio">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Nombre de marca">
            <input value={marca} onChange={e => setMarca(e.target.value)} style={inp} placeholder="MindSpace" />
          </Field>
          <Field label="URL imagen de hero (banner)">
            <input value={heroUrl} onChange={e => setHeroUrl(e.target.value)} style={inp} placeholder="https://..." />
          </Field>
        </div>
        {heroUrl && (
          <div style={{ marginTop: 12, borderRadius: 'var(--radius-md)', overflow: 'hidden', height: 120 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroUrl} alt="hero preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </Card>

      {/* Fin de semana */}
      <Card title="Configuración fin de semana">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {(['sab', 'dom'] as const).map(day => (
            <div key={day}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', marginBottom: 10 }}>
                {day === 'sab' ? 'Sábado' : 'Domingo'}
              </div>
              {(['manana', 'tarde'] as const).map(fr => (
                <label key={fr} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={fds[day][fr]} onChange={() => toggleFds(day, fr)} style={{ width: 16, height: 16 }} />
                  {fr === 'manana' ? '☀️ Mañana (cerrado)' : '🌙 Tarde (cerrado)'}
                </label>
              ))}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--gray-4)', marginTop: 8 }}>
          Tildado = ese turno está cerrado ese día de la semana.
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button onClick={saveSettings} disabled={saving} style={btnPrimary}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
        {msg && <span style={{ fontSize: 13, color: 'var(--sage-dk)', fontWeight: 700, alignSelf: 'center' }}>{msg}</span>}
      </div>

      {/* Redes sociales */}
      <Card title="Redes sociales del consultorio">
        <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
          {socials.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--gray-1)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', minWidth: 80, textTransform: 'capitalize' }}>{s.red}</span>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--gray-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.url}</span>
              <button onClick={() => removeSocial(s.id)} style={{ ...btnSm, color: '#8A2020', borderColor: '#C47070' }}>Quitar</button>
            </div>
          ))}
          {socials.length === 0 && <div style={{ fontSize: 13, color: 'var(--gray-4)', fontStyle: 'italic' }}>Sin redes configuradas.</div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <Field label="Red">
            <select value={newRed} onChange={e => setNewRed(e.target.value)} style={inp}>
              {REDES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="URL">
            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://instagram.com/..." style={inp} />
          </Field>
          <Field label="Etiqueta (opcional)">
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="@consultorio" style={inp} />
          </Field>
          <button onClick={addSocial} style={btnPrimary}>+ Agregar</button>
        </div>
      </Card>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-2)', marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-6)', marginBottom: 16 }}>{title}</div>
      {children}
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
const btnSm: React.CSSProperties = { padding: '5px 12px', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--gray-5)', border: '1.5px solid var(--gray-3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
