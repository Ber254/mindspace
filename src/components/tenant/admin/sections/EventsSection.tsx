'use client'
import { useState } from 'react'
import type { Event } from '@/lib/types'
import type { Color } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'

const COLORS: Color[] = ['sage','sky','lav','peach','rose']
const MESES = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function formatDate(iso: string) {
  const [, m, d] = iso.split('-')
  return `${parseInt(d)} ${MESES[parseInt(m)]}`
}

function blankForm() {
  return { titulo: '', facilitadora: '', descripcion: '', fecha: '', hora: '18:00', lugar: '', cupo: 0, precio: 0, color: 'lav', link: '' }
}

interface Props {
  events: Event[]
  tenantSlug: string
  onRefresh: () => void
}

export function EventsSection({ events, tenantSlug, onRefresh }: Props) {
  const [editing, setEditing] = useState<Event | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(blankForm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const headers = { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug }

  function startCreate() { setForm(blankForm()); setEditing(null); setCreating(true); setError('') }
  function startEdit(ev: Event) {
    setForm({
      titulo: ev.titulo, facilitadora: ev.facilitadora ?? '', descripcion: ev.descripcion ?? '',
      fecha: String(ev.fecha).slice(0, 10), hora: String(ev.hora).slice(0, 5),
      lugar: ev.lugar ?? '', cupo: ev.cupo, precio: ev.precio, color: ev.color, link: ev.link ?? '',
    })
    setEditing(ev); setCreating(false); setError('')
  }

  async function handleSave() {
    if (!form.titulo || !form.fecha || !form.hora) { setError('Título, fecha y hora son requeridos'); return }
    setLoading(true); setError('')
    try {
      const body = { ...form, cupo: Number(form.cupo), precio: Number(form.precio) }
      let r: Response
      if (editing) {
        r = await fetch(`/api/admin/events/${editing.id}`, { method: 'PUT', headers, body: JSON.stringify(body) })
      } else {
        r = await fetch('/api/admin/events', { method: 'POST', headers, body: JSON.stringify(body) })
      }
      if (!r.ok) { const d = await r.json(); setError(d.error ?? 'Error'); return }
      setCreating(false); setEditing(null); onRefresh()
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  async function handleDelete(ev: Event) {
    if (!confirm(`¿Eliminar el evento "${ev.titulo}"?`)) return
    await fetch(`/api/admin/events/${ev.id}`, { method: 'DELETE', headers })
    onRefresh()
  }

  async function toggleActive(ev: Event) {
    await fetch(`/api/admin/events/${ev.id}`, { method: 'PUT', headers, body: JSON.stringify({ active: !ev.active }) })
    onRefresh()
  }

  const showForm = creating || !!editing

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={h2}>Eventos y talleres</h2>
        <button onClick={startCreate} style={btnPrimary}>+ Nuevo evento</button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--gray-1)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24, border: '1.5px solid var(--lav)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gray-6)' }}>{editing ? 'Editar evento' : 'Nuevo evento'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Título *"><input value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} style={inp} placeholder="Taller de mindfulness" /></Field>
            <Field label="Facilitadora"><input value={form.facilitadora} onChange={e => setForm(f => ({...f, facilitadora: e.target.value}))} style={inp} placeholder="Lic. García" /></Field>
            <Field label="Descripción">
              <textarea value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion: e.target.value}))} style={{ ...inp, resize: 'vertical', minHeight: 60 }} placeholder="Descripción del evento…" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Fecha *"><input type="date" value={form.fecha} onChange={e => setForm(f => ({...f, fecha: e.target.value}))} style={inp} /></Field>
              <Field label="Hora *"><input type="time" value={form.hora} onChange={e => setForm(f => ({...f, hora: e.target.value}))} style={inp} /></Field>
            </div>
            <Field label="Lugar"><input value={form.lugar} onChange={e => setForm(f => ({...f, lugar: e.target.value}))} style={inp} placeholder="Consultorio / Online" /></Field>
            <Field label="Link de inscripción"><input value={form.link} onChange={e => setForm(f => ({...f, link: e.target.value}))} style={inp} placeholder="https://..." /></Field>
            <Field label="Cupo"><input type="number" value={form.cupo} onChange={e => setForm(f => ({...f, cupo: Number(e.target.value)}))} style={inp} min={0} /></Field>
            <Field label="Precio ($)"><input type="number" value={form.precio} onChange={e => setForm(f => ({...f, precio: Number(e.target.value)}))} style={inp} min={0} /></Field>
            <Field label="Color">
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({...f, color: c}))}
                    style={{ width: 28, height: 28, borderRadius: '50%', border: form.color === c ? '3px solid var(--gray-6)' : '2px solid var(--gray-3)', background: `var(--${c})`, cursor: 'pointer' }} />
                ))}
              </div>
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
        {events.length === 0 && <div style={{ fontSize: 14, color: 'var(--gray-4)', fontStyle: 'italic' }}>Sin eventos registrados.</div>}
        {events.map(ev => (
          <div key={ev.id} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '16px 20px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-2)', display: 'flex', alignItems: 'center', gap: 14, opacity: ev.active ? 1 : 0.55 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Badge variant={ev.color as Color}>{formatDate(String(ev.fecha).slice(0,10))}</Badge>
                <span style={{ fontWeight: 700, color: 'var(--gray-6)' }}>{ev.titulo}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-4)' }}>
                {ev.facilitadora && `${ev.facilitadora} · `}
                {String(ev.hora).slice(0,5)}h
                {ev.lugar && ` · ${ev.lugar}`}
                {ev.precio > 0 && ` · $${ev.precio}`}
                {ev.cupo > 0 && ` · Cupo: ${ev.cupo}`}
              </div>
            </div>
            <button onClick={() => toggleActive(ev)} style={{ ...btnSm, color: ev.active ? '#8A5230' : 'var(--sage-dk)', borderColor: ev.active ? 'var(--peach)' : 'var(--sage)' }}>
              {ev.active ? 'Ocultar' : 'Mostrar'}
            </button>
            <button onClick={() => startEdit(ev)} style={btnSm}>Editar</button>
            <button onClick={() => handleDelete(ev)} style={{ ...btnSm, color: '#8A2020', borderColor: '#C47070' }}>Eliminar</button>
          </div>
        ))}
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

const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: 'var(--gray-6)', margin: 0 }
const inp: React.CSSProperties = { fontFamily: 'inherit', fontSize: 14, padding: '9px 12px', border: '1.5px solid var(--gray-3)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--text)', outline: 'none', width: '100%' }
const btnPrimary: React.CSSProperties = { padding: '9px 18px', borderRadius: 'var(--radius-md)', background: 'var(--sage)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const btnGhost: React.CSSProperties = { padding: '9px 18px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--gray-5)', border: '1.5px solid var(--gray-3)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const btnSm: React.CSSProperties = { padding: '5px 12px', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--gray-5)', border: '1.5px solid var(--gray-3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const errBox: React.CSSProperties = { fontSize: 13, color: '#8A2020', background: '#FBE9E9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginTop: 12 }
