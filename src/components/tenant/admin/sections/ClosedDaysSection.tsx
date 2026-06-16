'use client'
import { useState } from 'react'
import type { ClosedDay } from '@/lib/types'

const FERIADOS_2026 = [
  { fecha: '2026-01-01', label: 'Año Nuevo' },
  { fecha: '2026-02-16', label: 'Carnaval' },
  { fecha: '2026-02-17', label: 'Carnaval' },
  { fecha: '2026-03-24', label: 'Día de la Memoria' },
  { fecha: '2026-04-02', label: 'Día del Veterano de Malvinas' },
  { fecha: '2026-04-03', label: 'Viernes Santo' },
  { fecha: '2026-05-01', label: 'Día del Trabajador' },
  { fecha: '2026-05-25', label: 'Revolución de Mayo' },
  { fecha: '2026-06-20', label: 'Día de la Bandera (Belgrano)' },
  { fecha: '2026-07-09', label: 'Día de la Independencia' },
  { fecha: '2026-08-17', label: 'Paso a la Inmortalidad del Gral. San Martín' },
  { fecha: '2026-10-12', label: 'Día del Respeto a la Diversidad Cultural' },
  { fecha: '2026-11-20', label: 'Día de la Soberanía Nacional' },
  { fecha: '2026-12-08', label: 'Inmaculada Concepción' },
  { fecha: '2026-12-25', label: 'Navidad' },
]

const MESES = ['', 'Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

function formatDate(iso: string) {
  const [, m, d] = iso.split('-')
  const dt = new Date(iso + 'T12:00:00')
  return `${DIAS[dt.getDay()]} ${parseInt(d)} ${MESES[parseInt(m)]}`
}

interface Props {
  closedDays: ClosedDay[]
  tenantSlug: string
  onRefresh: () => void
}

export function ClosedDaysSection({ closedDays, tenantSlug, onRefresh }: Props) {
  const [fecha,  setFecha]  = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const headers = { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug }
  const closedSet = new Set(closedDays.map(c => c.fecha.toString().slice(0, 10)))

  async function handleAdd() {
    if (!fecha) { setError('Seleccioná una fecha'); return }
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/admin/closed-days', { method: 'POST', headers, body: JSON.stringify({ fecha, motivo: motivo || 'Día cerrado' }) })
      if (!r.ok) { const d = await r.json(); setError(d.error ?? 'Error'); return }
      setFecha(''); setMotivo(''); onRefresh()
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  async function handleRemove(f: string) {
    await fetch('/api/admin/closed-days', { method: 'DELETE', headers, body: JSON.stringify({ fecha: f }) })
    onRefresh()
  }

  async function addFeriado(f: { fecha: string; label: string }) {
    if (closedSet.has(f.fecha)) { await handleRemove(f.fecha); return }
    await fetch('/api/admin/closed-days', { method: 'POST', headers, body: JSON.stringify({ fecha: f.fecha, motivo: f.label }) })
    onRefresh()
  }

  return (
    <div>
      <h2 style={h2}>Días cerrados y feriados</h2>

      {/* Feriados nacionales 2026 */}
      <div style={{ background: 'var(--lav-lt, #f0edff)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24, border: '1.5px solid var(--lav)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', marginBottom: 12 }}>
          Feriados nacionales 2026 — click para agregar/quitar
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FERIADOS_2026.map(f => {
            const active = closedSet.has(f.fecha)
            return (
              <button key={f.fecha} onClick={() => addFeriado(f)}
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: `1.5px solid ${active ? 'var(--lav)' : 'var(--gray-3)'}`, background: active ? 'var(--lav)' : '#fff', color: active ? '#fff' : 'var(--gray-5)' }}>
                {formatDate(f.fecha)} — {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Agregar día personalizado */}
      <div style={{ background: 'var(--gray-1)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24, border: '1.5px solid var(--gray-2)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', marginBottom: 12 }}>Agregar día cerrado personalizado</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={lbl}>Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Motivo</label>
            <input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Vacaciones, mantenimiento…" style={inp} />
          </div>
          <button onClick={handleAdd} disabled={loading} style={btnPrimary}>Agregar</button>
        </div>
        {error && <div style={errBox}>{error}</div>}
      </div>

      {/* Lista de días cerrados */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-2)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', marginBottom: 14 }}>
          Días cerrados registrados ({closedDays.length})
        </div>
        {closedDays.length === 0 ? (
          <div style={{ fontSize: 14, color: 'var(--gray-4)', fontStyle: 'italic' }}>Sin días cerrados registrados.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {closedDays.map(c => {
              const f = c.fecha.toString().slice(0, 10)
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--gray-1)' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, minWidth: 140 }}>{formatDate(f)}</span>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--gray-5)' }}>{c.motivo}</span>
                  <button onClick={() => handleRemove(f)} style={{ ...btnSm, color: '#8A2020', borderColor: '#C47070' }}>Quitar</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: 'var(--gray-6)', margin: '0 0 20px' }
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--gray-5)', display: 'block', marginBottom: 5 }
const inp: React.CSSProperties = { fontFamily: 'inherit', fontSize: 14, padding: '9px 12px', border: '1.5px solid var(--gray-3)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--text)', outline: 'none', width: '100%' }
const btnPrimary: React.CSSProperties = { padding: '9px 18px', borderRadius: 'var(--radius-md)', background: 'var(--sage)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }
const btnSm: React.CSSProperties = { padding: '5px 12px', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--gray-5)', border: '1.5px solid var(--gray-3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const errBox: React.CSSProperties = { fontSize: 13, color: '#8A2020', background: '#FBE9E9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginTop: 12 }
