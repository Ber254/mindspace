'use client'
import { useState } from 'react'
import type { Professional } from '@/lib/types'
import { Avatar, getInitials } from '@/components/ui/Avatar'
import type { Color } from '@/lib/types'

const DOMINIOS = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'live.com']

function formatFechaCorta(iso: string) {
  const [, m, d] = iso.split('-')
  const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const dt = new Date(`${iso}T12:00:00`)
  return `${dias[dt.getDay()]} ${parseInt(d)} ${meses[parseInt(m)]}`
}

interface StepDatosProps {
  prof: Professional
  fecha: string
  hora: string
  nombre: string
  celular: string
  obraSocial: string
  email: string
  onChange: (field: 'nombre' | 'celular' | 'obraSocial' | 'email', val: string) => void
  onNext: () => void
  onBack: () => void
}

export function StepDatos({ prof, fecha, hora, nombre, celular, obraSocial, email, onChange, onNext, onBack }: StepDatosProps) {
  const [error, setError] = useState('')
  const [emailSugs, setEmailSugs] = useState<string[]>([])

  const initials = getInitials(prof.nombre)
  const precio   = prof.precio_consulta ?? 0

  function handleEmailInput(val: string) {
    onChange('email', val)
    const at = val.indexOf('@')
    if (at < 1) { setEmailSugs([]); return }
    const user    = val.slice(0, at)
    const partial = val.slice(at + 1).toLowerCase()
    setEmailSugs(DOMINIOS.filter(d => d.startsWith(partial) && d !== partial).map(d => `${user}@${d}`))
  }

  function validate() {
    if (!nombre.trim()) { setError('Ingresá tu nombre y apellido.'); return false }
    if (!celular.trim()) { setError('El número de celular es obligatorio.'); return false }
    setError('')
    return true
  }

  return (
    <div>
      {/* Resumen del turno */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 'var(--radius-md)',
        background: 'var(--sage-lt)', border: '1px solid var(--sage)', marginBottom: 20,
      }}>
        <Avatar color={prof.color as Color} initials={initials} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{prof.nombre}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-5)' }}>{prof.especialidad}</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>📅 {formatFechaCorta(fecha)} &nbsp;·&nbsp; 🕐 {hora}</div>
        </div>
        {precio > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--sage-dk)' }}>${precio.toLocaleString('es-AR')}</div>
            <div style={{ fontSize: 10, color: 'var(--gray-4)' }}>consulta</div>
          </div>
        )}
      </div>

      {/* Formulario */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', display: 'block', marginBottom: 5 }}>
          Nombre y apellido *
        </label>
        <input
          type="text" value={nombre}
          onChange={e => onChange('nombre', e.target.value)}
          placeholder="Ej: María González"
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Celular *</label>
          <input
            type="tel" value={celular}
            onChange={e => onChange('celular', e.target.value.replace(/[^0-9\s\-+]/g, ''))}
            placeholder="Ej: 11 1234-5678"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Obra social</label>
          <input
            type="text" value={obraSocial}
            onChange={e => onChange('obraSocial', e.target.value)}
            placeholder="OSDE / Particular"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16, position: 'relative' }}>
        <label style={labelStyle}>Email <span style={{ fontWeight: 400, color: 'var(--gray-4)' }}>(opcional)</span></label>
        <input
          type="text" value={email}
          onChange={e => handleEmailInput(e.target.value)}
          onBlur={() => setTimeout(() => setEmailSugs([]), 200)}
          placeholder="Ej: maria@gmail.com"
          style={inputStyle}
          autoComplete="off"
        />
        {emailSugs.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#fff', border: '1.5px solid var(--sage)',
            borderTop: 'none', borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
            zIndex: 50,
          }}>
            {emailSugs.map(s => (
              <div key={s} onMouseDown={() => { onChange('email', s); setEmailSugs([]) }}
                style={{ padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--sage-lt)')}
                onMouseOut={e  => (e.currentTarget.style.background = '')}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div style={{ fontSize: 13, color: '#8A2020', background: '#FBE9E9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button onClick={onBack} style={btnGhostStyle}>← Volver</button>
        <button onClick={() => validate() && onNext()} style={btnPrimaryStyle}>
          💳 Continuar al pago
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 14,
  padding: '9px 14px', border: '1.5px solid var(--gray-3)',
  borderRadius: 'var(--radius-sm)', background: '#fff',
  color: 'var(--text)', outline: 'none', width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: 'var(--gray-5)', display: 'block', marginBottom: 5,
}

const btnPrimaryStyle: React.CSSProperties = {
  flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  padding: '9px 20px', borderRadius: 'var(--radius-md)',
  background: 'var(--sage)', color: '#fff',
  border: '2px solid transparent', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}

const btnGhostStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '9px 20px', borderRadius: 'var(--radius-md)',
  background: 'transparent', color: 'var(--gray-5)',
  border: '2px solid var(--gray-3)', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
