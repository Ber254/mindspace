'use client'
import { useState } from 'react'
import type { Professional } from '@/lib/types'
import { Avatar, getInitials } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { Color } from '@/lib/types'

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
const COLORS: Color[] = ['sage','sky','lav','peach','rose']

interface Props {
  professionals: Professional[]
  tenantSlug: string
  onRefresh: () => void
}

function blankForm() {
  return { nombre: '', especialidad: '', subespecialidad: '', box: 1, color: 'sage', celular: '', password: '' }
}

export function ProfessionalsSection({ professionals, tenantSlug, onRefresh }: Props) {
  const [editing, setEditing] = useState<Professional | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(blankForm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showModules, setShowModules] = useState<string | null>(null)

  const headers = { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug }

  function startCreate() {
    setForm(blankForm())
    setEditing(null)
    setCreating(true)
    setError('')
  }

  function startEdit(p: Professional) {
    setForm({ nombre: p.nombre, especialidad: p.especialidad, subespecialidad: p.subespecialidad ?? '', box: p.box, color: p.color, celular: p.celular ?? '', password: '' })
    setEditing(p)
    setCreating(false)
    setError('')
  }

  async function handleSave() {
    if (!form.nombre || !form.especialidad) { setError('Nombre y especialidad son requeridos'); return }
    setLoading(true); setError('')
    try {
      const body = { ...form, subespecialidad: form.subespecialidad || undefined, celular: form.celular || undefined }
      let r: Response
      if (editing) {
        r = await fetch(`/api/admin/professionals/${editing.id}`, { method: 'PUT', headers, body: JSON.stringify(body) })
      } else {
        r = await fetch('/api/admin/professionals', { method: 'POST', headers, body: JSON.stringify(body) })
      }
      if (!r.ok) { const d = await r.json(); setError(d.error ?? 'Error'); return }
      setCreating(false); setEditing(null); onRefresh()
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  async function handleToggleActive(p: Professional) {
    if (!confirm(`¿${p.active ? 'Desactivar' : 'Activar'} a ${p.nombre}?`)) return
    await fetch(`/api/admin/professionals/${p.id}`, { method: 'PUT', headers, body: JSON.stringify({ active: !p.active }) })
    onRefresh()
  }

  const showForm = creating || !!editing

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={h2}>Profesionales</h2>
        <button onClick={startCreate} style={btnPrimary}>+ Nuevo profesional</button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--gray-1)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24, border: '1.5px solid var(--sage)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gray-6)' }}>
            {editing ? `Editar — ${editing.nombre}` : 'Nuevo profesional'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Nombre *"><input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} style={inp} placeholder="Lic. Ana García" /></Field>
            <Field label="Especialidad *"><input value={form.especialidad} onChange={e => setForm(f => ({...f, especialidad: e.target.value}))} style={inp} placeholder="Psicología Clínica" /></Field>
            <Field label="Subespecialidad"><input value={form.subespecialidad} onChange={e => setForm(f => ({...f, subespecialidad: e.target.value}))} style={inp} placeholder="Infanto juvenil" /></Field>
            <Field label="Celular"><input value={form.celular} onChange={e => setForm(f => ({...f, celular: e.target.value}))} style={inp} placeholder="5491112345678" /></Field>
            <Field label="Box">
              <select value={form.box} onChange={e => setForm(f => ({...f, box: Number(e.target.value)}))} style={inp}>
                {[1,2,3,4].map(b => <option key={b} value={b}>Box {b}</option>)}
              </select>
            </Field>
            <Field label="Color">
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({...f, color: c}))}
                    style={{ width: 28, height: 28, borderRadius: '50%', border: form.color === c ? '3px solid var(--gray-6)' : '2px solid var(--gray-3)', background: `var(--${c})`, cursor: 'pointer' }} />
                ))}
              </div>
            </Field>
            <Field label={editing ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña (vacío = usar "1234")'}>
              <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} style={inp} placeholder="••••••••" />
            </Field>
          </div>
          {error && <div style={errBox}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleSave} disabled={loading} style={btnPrimary}>{loading ? 'Guardando…' : 'Guardar'}</button>
            <button onClick={() => { setCreating(false); setEditing(null) }} style={btnGhost}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {professionals.map(p => (
          <div key={p.id} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '16px 20px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-2)', display: 'flex', alignItems: 'center', gap: 14, opacity: p.active ? 1 : 0.55 }}>
            <Avatar color={p.color as Color} initials={getInitials(p.nombre)} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--gray-6)' }}>{p.nombre}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-4)' }}>{p.especialidad} · Box {p.box}</div>
            </div>
            <Badge variant={p.color as Color}>{p.color}</Badge>
            <button onClick={() => setShowModules(showModules === p.id ? null : p.id)} style={btnSm}>Módulos</button>
            <button onClick={() => startEdit(p)} style={btnSm}>Editar</button>
            <button onClick={() => handleToggleActive(p)} style={{ ...btnSm, color: p.active ? '#8A2020' : 'var(--sage-dk)', borderColor: p.active ? '#C47070' : 'var(--sage)' }}>
              {p.active ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))}
      </div>

      {/* Módulos inline */}
      {showModules && (() => {
        const prof = professionals.find(p => p.id === showModules)
        if (!prof) return null
        return (
          <ModulesInline prof={prof} tenantSlug={tenantSlug} onRefresh={onRefresh} />
        )
      })()}
    </div>
  )
}

function ModulesInline({ prof, tenantSlug, onRefresh }: { prof: Professional; tenantSlug: string; onRefresh: () => void }) {
  const modules: { dia: string; franja: 'mañana' | 'tarde' }[] = []
  const mods = (prof.modules ?? []) as { dia_semana: string; franja: string; active: boolean }[]

  async function toggle(dia: string, franja: string) {
    const current = mods.find(m => m.dia_semana === dia && m.franja === franja)
    const active = !(current?.active ?? false)
    await fetch('/api/admin/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug },
      body: JSON.stringify({ professionalId: prof.id, diaSemana: dia, franja, active }),
    })
    onRefresh()
  }

  return (
    <div style={{ background: 'var(--gray-1)', borderRadius: 'var(--radius-lg)', padding: 20, marginTop: 12, border: '1.5px dashed var(--sage)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', marginBottom: 12 }}>Módulos de {prof.nombre}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 12px', textAlign: 'left', fontSize: 11, color: 'var(--gray-4)', fontWeight: 700 }}>Día</th>
              <th style={{ padding: '6px 12px', fontSize: 11, color: 'var(--gray-4)', fontWeight: 700 }}>Mañana</th>
              <th style={{ padding: '6px 12px', fontSize: 11, color: 'var(--gray-4)', fontWeight: 700 }}>Tarde</th>
            </tr>
          </thead>
          <tbody>
            {DIAS.map(dia => {
              const man = mods.find(m => m.dia_semana === dia && m.franja === 'mañana')
              const tar = mods.find(m => m.dia_semana === dia && m.franja === 'tarde')
              return (
                <tr key={dia}>
                  <td style={{ padding: '6px 12px', fontWeight: 600 }}>{dia}</td>
                  <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                    <ModuleChip active={man?.active ?? false} onClick={() => toggle(dia, 'mañana')} />
                  </td>
                  <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                    <ModuleChip active={tar?.active ?? false} onClick={() => toggle(dia, 'tarde')} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11, color: 'var(--gray-4)', marginTop: 8 }}>Click en cada celda para activar/desactivar</div>
    </div>
  )
}

function ModuleChip({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: `2px solid ${active ? 'var(--sage)' : 'var(--gray-2)'}`,
      background: active ? 'var(--sage)' : '#fff', color: active ? '#fff' : 'var(--gray-3)',
      fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {active ? '✓' : ''}
    </button>
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

const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: 'var(--gray-6)', margin: 0 }
const inp: React.CSSProperties = { fontFamily: 'inherit', fontSize: 14, padding: '9px 12px', border: '1.5px solid var(--gray-3)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--text)', outline: 'none', width: '100%' }
const btnPrimary: React.CSSProperties = { padding: '9px 18px', borderRadius: 'var(--radius-md)', background: 'var(--sage)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const btnGhost: React.CSSProperties = { padding: '9px 18px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--gray-5)', border: '1.5px solid var(--gray-3)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const btnSm: React.CSSProperties = { padding: '5px 12px', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--gray-5)', border: '1.5px solid var(--gray-3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const errBox: React.CSSProperties = { fontSize: 13, color: '#8A2020', background: '#FBE9E9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginTop: 12 }
