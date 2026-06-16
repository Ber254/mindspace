'use client'
import { useState } from 'react'
import type { Appointment } from '@/lib/types'

function formatFecha(iso: string) {
  const [, m, d] = iso.split('-')
  const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const dias  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const dt = new Date(`${iso}T12:00:00`)
  return `${dias[dt.getDay()]} ${parseInt(d)} ${meses[parseInt(m)]}`
}

interface Props {
  appointment: Appointment
  onSave: (data: { asistencia: string; pago: boolean; notas: string }) => Promise<void>
  onClose: () => void
}

export function RegisterAttendanceModal({ appointment, onSave, onClose }: Props) {
  const [asistencia, setAsistencia] = useState(appointment.asistencia ?? '')
  const [pago,       setPago]       = useState(appointment.pago ?? false)
  const [notas,      setNotas]      = useState(appointment.notas ?? '')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  async function handleSave() {
    if (!asistencia) { setError('Seleccioná si el paciente asistió.'); return }
    setLoading(true)
    try {
      await onSave({ asistencia, pago, notas })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar.')
    } finally { setLoading(false) }
  }

  const btnSel = (active: boolean, variant: 'ok' | 'warn' | 'err' | 'pago' | 'nopago') => {
    const colors = {
      ok:    { bg: 'var(--sage-lt)',  border: 'var(--sage-dk)',  color: 'var(--sage-dk)' },
      warn:  { bg: 'var(--peach-lt)', border: 'var(--peach)',    color: '#8A5230'        },
      err:   { bg: '#FBE9E9',          border: '#C47070',         color: '#8A2020'        },
      pago:  { bg: 'var(--sage-lt)',  border: 'var(--sage-dk)',  color: 'var(--sage-dk)' },
      nopago:{ bg: '#FBE9E9',          border: '#C47070',         color: '#8A2020'        },
    }
    const c = colors[variant]
    return {
      flex: 1, padding: '8px 0', borderRadius: 'var(--radius-md)',
      border: `2px solid ${active ? c.border : 'var(--gray-3)'}`,
      background: active ? c.bg : '#fff',
      color: active ? c.color : 'var(--gray-5)',
      fontWeight: active ? 700 : 600, fontSize: 13,
      cursor: 'pointer', fontFamily: 'inherit', transition: 'all .13s',
    } as React.CSSProperties
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(60,55,50,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 32, maxWidth: 440, width: '92%', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-6)' }}>Registrar atención</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--gray-4)' }}>✕</button>
        </div>

        {/* Info del turno */}
        <div style={{ background: 'var(--gray-1)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 20, fontSize: 13 }}>
          <strong>{appointment.paciente}</strong>
          <div style={{ color: 'var(--gray-5)', marginTop: 3 }}>
            📅 {formatFecha(String(appointment.fecha))} · 🕐 {String(appointment.hora).slice(0, 5)}
            &nbsp;·&nbsp; {appointment.obra_social}
          </div>
        </div>

        {/* Asistencia */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', marginBottom: 8 }}>¿Asistió?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([['si', '✓ Asistió', 'ok'], ['tarde', '⏱ Tarde', 'warn'], ['no', '✗ No asistió', 'err']] as const).map(
              ([val, label, variant]) => (
                <button key={val} onClick={() => setAsistencia(val)} style={btnSel(asistencia === val, variant)}>
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Pago */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', marginBottom: 8 }}>¿Pagó?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPago(true)}  style={btnSel(pago === true,  'pago')}>✓ Sí pagó</button>
            <button onClick={() => setPago(false)} style={btnSel(pago === false, 'nopago')}>✗ No pagó</button>
          </div>
        </div>

        {/* Notas */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', display: 'block', marginBottom: 5 }}>
            Notas (opcional)
          </label>
          <input
            type="text" value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="Observaciones del encuentro…"
            style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '9px 14px', border: '1.5px solid var(--gray-3)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--text)', outline: 'none' }}
          />
        </div>

        {error && <div style={{ fontSize: 13, color: '#8A2020', background: '#FBE9E9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} disabled={loading} style={{ flex: 1, padding: '9px 20px', borderRadius: 'var(--radius-md)', background: 'var(--sage)', color: '#fff', border: '2px solid transparent', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--gray-5)', border: '2px solid var(--gray-3)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
