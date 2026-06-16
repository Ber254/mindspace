'use client'
import { useState, useEffect } from 'react'
import type { Professional, Franja } from '@/lib/types'
import type { SlotInfo } from '../wizard/types'

// Fechas de los próximos 14 días
function getNextDays(n = 14): { iso: string; label: string }[] {
  const DIAS  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const MESES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const today = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    const [, m, day] = iso.split('-')
    return { iso, label: `${DIAS[d.getDay()]} ${parseInt(day)} ${MESES[parseInt(m)]}` }
  })
}

interface Props {
  prof: Professional
  tenantSlug: string
  onSave: () => void
  onClose: () => void
}

export function DarTurnoModal({ prof, tenantSlug, onSave, onClose }: Props) {
  const [paciente,    setPaciente]    = useState('')
  const [obraSocial,  setObraSocial]  = useState('')
  const [fecha,       setFecha]       = useState('')
  const [slots,       setSlots]       = useState<SlotInfo[]>([])
  const [selectedSlot,setSelectedSlot]= useState<SlotInfo | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [slotsLoading,setSlotsLoading]= useState(false)
  const [error,       setError]       = useState('')
  const [suggestions, setSuggestions] = useState<{ nombre: string; obra_social: string }[]>([])

  const days = getNextDays(14)

  useEffect(() => {
    if (!fecha) { setSlots([]); setSelectedSlot(null); return }
    setSlotsLoading(true)
    fetch(`/api/slots?profId=${prof.id}&fecha=${fecha}`, { headers: { 'x-tenant-slug': tenantSlug } })
      .then(r => r.json())
      .then(data => { setSlots(data); setSelectedSlot(null) })
      .finally(() => setSlotsLoading(false))
  }, [fecha, prof.id, tenantSlug])

  async function searchPatient(q: string) {
    setPaciente(q)
    if (q.length < 2) { setSuggestions([]); return }
    const r = await fetch(`/api/pro/appointments?q=${encodeURIComponent(q)}`, { headers: { 'x-tenant-slug': tenantSlug } })
    if (r.ok) setSuggestions(await r.json())
  }

  async function handleSave() {
    if (!paciente.trim()) { setError('Ingresá el nombre del paciente.'); return }
    if (!fecha)           { setError('Elegí una fecha.'); return }
    if (!selectedSlot)    { setError('Elegí un horario.'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/pro/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug },
        body: JSON.stringify({
          fecha, hora: selectedSlot.hora, franja: selectedSlot.franja,
          paciente: paciente.trim(), obraSocial: obraSocial || 'Particular',
        }),
      })
      if (!r.ok) { const d = await r.json(); setError(d.error ?? 'Error'); return }
      onSave()
      onClose()
    } catch { setError('Error de conexión.') }
    finally { setLoading(false) }
  }

  const mañanaSlots = slots.filter(s => s.franja === 'mañana')
  const tardeSlots  = slots.filter(s => s.franja === 'tarde')

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(60,55,50,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 32, maxWidth: 480, width: '92%', boxShadow: 'var(--shadow-md)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-6)' }}>Dar turno</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--gray-4)' }}>✕</button>
        </div>

        {/* Paciente */}
        <div style={{ marginBottom: 14, position: 'relative' }}>
          <label style={lbl}>Paciente *</label>
          <input value={paciente} onChange={e => searchPatient(e.target.value)}
            onBlur={() => setTimeout(() => setSuggestions([]), 200)}
            placeholder="Escribí el nombre…"
            style={inp}
          />
          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid var(--sage)', borderTop: 'none', borderRadius: '0 0 var(--radius-sm) var(--radius-sm)', zIndex: 50 }}>
              {suggestions.map(s => (
                <div key={s.nombre} onMouseDown={() => { setPaciente(s.nombre); setObraSocial(s.obra_social); setSuggestions([]) }}
                  style={{ padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--sage-lt)')}
                  onMouseOut={e  => (e.currentTarget.style.background = '')}>
                  {s.nombre} <span style={{ color: 'var(--gray-4)', fontSize: 11 }}>{s.obra_social}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Obra social</label>
            <input value={obraSocial} onChange={e => setObraSocial(e.target.value)} placeholder="OSDE / Particular" style={inp} />
          </div>
          <div>
            <label style={lbl}>Fecha *</label>
            <select value={fecha} onChange={e => setFecha(e.target.value)} style={inp}>
              <option value="">— Elegir fecha —</option>
              {days.map(d => <option key={d.iso} value={d.iso}>{d.label}</option>)}
            </select>
          </div>
        </div>

        {/* Slots */}
        {fecha && (
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Horario disponible *</label>
            {slotsLoading ? (
              <div style={{ fontSize: 13, color: 'var(--gray-4)', marginTop: 6 }}>Cargando horarios…</div>
            ) : (
              <>
                {[['☀️ Mañana', mañanaSlots], ['🌙 Tarde', tardeSlots]].map(([label, items]) => (
                  (items as SlotInfo[]).length > 0 ? (
                    <div key={String(label)} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{String(label)}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
                        {(items as SlotInfo[]).map(s => (
                          <button key={s.hora} disabled={!s.available}
                            onClick={() => setSelectedSlot(s)}
                            style={{
                              padding: '8px 4px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 700, cursor: s.available ? 'pointer' : 'default', fontFamily: 'inherit',
                              border: `1.5px solid ${selectedSlot?.hora === s.hora ? 'var(--sage-dk)' : 'var(--gray-2)'}`,
                              background: !s.available ? 'var(--gray-1)' : selectedSlot?.hora === s.hora ? 'var(--sage-lt)' : '#fff',
                              color: !s.available ? 'var(--gray-3)' : selectedSlot?.hora === s.hora ? 'var(--sage-dk)' : 'var(--gray-6)',
                              textDecoration: s.available ? 'none' : 'line-through',
                            }}>
                            {s.hora}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null
                ))}
                {slots.filter(s => s.available).length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--gray-4)', marginTop: 6 }}>No hay horarios disponibles para esa fecha.</div>
                )}
              </>
            )}
          </div>
        )}

        {selectedSlot && (
          <div style={{ background: 'var(--sage-lt)', border: '1px solid var(--sage)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 13, fontWeight: 700, color: 'var(--sage-dk)', marginBottom: 10 }}>
            Turno seleccionado: {selectedSlot.hora} ({selectedSlot.franja})
          </div>
        )}

        {error && <div style={{ fontSize: 13, color: '#8A2020', background: '#FBE9E9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 10 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={handleSave} disabled={loading} style={{ ...btnPrimary, flex: 1 }}>
            {loading ? 'Guardando…' : 'Guardar turno'}
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
const btnGhost:   React.CSSProperties = { padding: '9px 20px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--gray-5)', border: '2px solid var(--gray-3)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }

