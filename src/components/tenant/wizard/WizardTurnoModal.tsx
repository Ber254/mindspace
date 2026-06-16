'use client'
import { useState, useEffect } from 'react'
import type { Professional } from '@/lib/types'
import { Avatar, getInitials } from '@/components/ui/Avatar'
import type { Color } from '@/lib/types'
import { StepFecha } from './StepFecha'
import { StepProfesional } from './StepProfesional'
import { StepHorario } from './StepHorario'
import { StepDatos } from './StepDatos'
import { StepPago } from './StepPago'
import type { WizardState, WizardStep } from './types'
import { WIZARD_INITIAL } from './types'

const STEP_LABELS: Record<WizardStep, string> = {
  fecha:        'Fecha',
  profesional:  'Profesional',
  horario:      'Horario',
  datos:        'Tus datos',
  pago:         'Pago',
  confirmacion: 'Confirmado',
}

// Pasos visibles en la barra de progreso (excluye confirmacion)
const PROGRESS_STEPS: WizardStep[] = ['fecha', 'profesional', 'horario', 'datos', 'pago']

interface WizardTurnoModalProps {
  tenantSlug: string
  professionals: Professional[]
  preselectedProfId?: string | null
  open: boolean
  onClose: () => void
}

export function WizardTurnoModal({
  tenantSlug,
  professionals,
  preselectedProfId,
  open,
  onClose,
}: WizardTurnoModalProps) {
  const [state, setState] = useState<WizardState>({ ...WIZARD_INITIAL, preselectedProfId: preselectedProfId ?? null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setState({
        ...WIZARD_INITIAL,
        preselectedProfId: preselectedProfId ?? null,
        // Si viene de una card, saltear el paso de profesional
        step: preselectedProfId ? 'fecha' : 'fecha',
      })
      setError('')
    }
  }, [open, preselectedProfId])

  if (!open) return null

  // IDs de profesionales para el step de disponibilidad
  const profIds = preselectedProfId ? [preselectedProfId] : professionals.map(p => p.id)

  // ─── Handlers de navegación ───────────────────────────────────

  function handleFechaSelect(fecha: string) {
    if (preselectedProfId) {
      const prof = professionals.find(p => p.id === preselectedProfId) ?? null
      setState(s => ({ ...s, selectedDate: fecha, selectedProf: prof, step: 'horario' }))
    } else {
      setState(s => ({ ...s, selectedDate: fecha, step: 'profesional' }))
    }
  }

  function handleProfSelect(prof: Professional) {
    setState(s => ({ ...s, selectedProf: prof, step: 'horario' }))
  }

  function handleHorarioSelect(hora: string, franja: typeof state.selectedFranja) {
    setState(s => ({ ...s, selectedHora: hora, selectedFranja: franja, step: 'datos' }))
  }

  function handleDatosNext() {
    setState(s => ({ ...s, step: 'pago' }))
  }

  async function handleConfirmar() {
    if (!state.selectedProf || !state.selectedDate || !state.selectedHora || !state.selectedFranja) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug },
        body: JSON.stringify({
          professionalId: state.selectedProf.id,
          fecha:          state.selectedDate,
          hora:           state.selectedHora,
          franja:         state.selectedFranja,
          paciente:       state.patientNombre,
          obraSocial:     state.patientOS || 'Particular',
          celular:        state.patientCelular,
          email:          state.patientEmail || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al guardar el turno.')
        return
      }
      setState(s => ({ ...s, step: 'confirmacion' }))
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Cálculo del step actual para la barra de progreso ────────
  const progressIdx = PROGRESS_STEPS.indexOf(state.step)

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(60,55,50,0.45)',
        zIndex: 200, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-xl)',
        padding: 32, maxWidth: 520, width: '92%',
        boxShadow: 'var(--shadow-md)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: state.step === 'confirmacion' ? 0 : 24 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-6)' }}>
            {state.step === 'confirmacion' ? '' : 'Reservar turno'}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--gray-4)', cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Barra de pasos */}
        {state.step !== 'confirmacion' && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 26 }}>
            {PROGRESS_STEPS
              .filter(s => !(s === 'profesional' && preselectedProfId))
              .map((s, i, arr) => {
                const realIdx = PROGRESS_STEPS.indexOf(s)
                const isDone   = realIdx < progressIdx
                const isActive = s === state.step
                return (
                  <>
                    <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', margin: '0 auto 5px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700,
                        background: isDone ? 'var(--sage-dk)' : isActive ? 'var(--sage)' : 'var(--gray-2)',
                        color: isDone || isActive ? '#fff' : 'var(--gray-4)',
                        transition: 'all .2s',
                      }}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                        color: isActive ? 'var(--sage-dk)' : isDone ? 'var(--sage-dk)' : 'var(--gray-4)',
                      }}>
                        {STEP_LABELS[s]}
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div key={`line-${s}`} style={{
                        flex: '0 0 40px', height: 2,
                        background: realIdx < progressIdx ? 'var(--sage-dk)' : 'var(--gray-2)',
                        marginBottom: 16, transition: 'background .2s',
                      }} />
                    )}
                  </>
                )
              })}
          </div>
        )}

        {/* Error global */}
        {error && (
          <div style={{ fontSize: 13, color: '#8A2020', background: '#FBE9E9', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 14 }}>
            {error}
          </div>
        )}

        {/* Contenido del paso */}
        {state.step === 'fecha' && (
          <StepFecha
            tenantSlug={tenantSlug}
            profIds={profIds}
            onSelect={handleFechaSelect}
          />
        )}

        {state.step === 'profesional' && state.selectedDate && (
          <StepProfesional
            tenantSlug={tenantSlug}
            professionals={professionals}
            fecha={state.selectedDate}
            onSelect={handleProfSelect}
          />
        )}

        {state.step === 'horario' && state.selectedProf && state.selectedDate && (
          <>
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar color={state.selectedProf.color as Color} initials={getInitials(state.selectedProf.nombre)} size={34} />
              <div style={{ fontSize: 14, fontWeight: 700 }}>{state.selectedProf.nombre}</div>
            </div>
            <StepHorario
              tenantSlug={tenantSlug}
              profId={state.selectedProf.id}
              fecha={state.selectedDate}
              onSelect={handleHorarioSelect}
            />
          </>
        )}

        {state.step === 'datos' && state.selectedProf && state.selectedDate && state.selectedHora && (
          <StepDatos
            prof={state.selectedProf}
            fecha={state.selectedDate}
            hora={state.selectedHora}
            nombre={state.patientNombre}
            celular={state.patientCelular}
            obraSocial={state.patientOS}
            email={state.patientEmail}
            onChange={(field, val) => {
              const map: Record<string, keyof WizardState> = {
                nombre: 'patientNombre', celular: 'patientCelular',
                obraSocial: 'patientOS', email: 'patientEmail',
              }
              const key = map[field]
              if (key) setState(s => ({ ...s, [key]: val }))
            }}
            onNext={handleDatosNext}
            onBack={() => setState(s => ({ ...s, step: preselectedProfId ? 'horario' : 'horario' }))}
          />
        )}

        {state.step === 'pago' && state.selectedProf && state.selectedDate && state.selectedHora && (
          <StepPago
            prof={state.selectedProf}
            fecha={state.selectedDate}
            hora={state.selectedHora}
            onConfirmar={handleConfirmar}
            onBack={() => setState(s => ({ ...s, step: 'datos' }))}
            loading={loading}
          />
        )}

        {state.step === 'confirmacion' && state.selectedProf && state.selectedDate && state.selectedHora && (
          <ConfirmacionScreen
            prof={state.selectedProf}
            fecha={state.selectedDate}
            hora={state.selectedHora}
            paciente={state.patientNombre}
            celular={state.patientCelular}
            email={state.patientEmail}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}

// ─── Pantalla de confirmación ─────────────────────────────────────────────────
function formatFechaCorta(iso: string) {
  const [, m, d] = iso.split('-')
  const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const dias  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const dt = new Date(`${iso}T12:00:00`)
  return `${dias[dt.getDay()]} ${parseInt(d)} ${meses[parseInt(m)]}`
}

function ConfirmacionScreen({ prof, fecha, hora, paciente, celular, email, onClose }: {
  prof: Professional; fecha: string; hora: string
  paciente: string; celular: string; email: string
  onClose: () => void
}) {
  const initials = getInitials(prof.nombre)
  const waNum    = (prof.celular ?? '').replace(/\D/g, '')
  const waMsg    = encodeURIComponent(
    `Hola ${prof.nombre.split(' ')[0]}, acabo de reservar un turno para el ${formatFechaCorta(fecha)} a las ${hora}. Mi nombre es ${paciente}.`
  )
  const waLink = waNum ? `https://wa.me/${waNum}?text=${waMsg}` : ''

  return (
    <div style={{ textAlign: 'center', padding: '16px 8px' }}>
      <div style={{
        width: 68, height: 68, borderRadius: '50%',
        background: 'var(--sage-lt)', border: '3px solid var(--sage)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30, margin: '0 auto 14px',
      }}>✅</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--sage-dk)', marginBottom: 6 }}>¡Turno confirmado!</div>
      <div style={{ fontSize: 14, color: 'var(--gray-5)', marginBottom: 20 }}>Tu reserva quedó registrada.</div>

      <div style={{
        background: 'var(--gray-1)', borderRadius: 'var(--radius-md)',
        padding: '14px 18px', textAlign: 'left', maxWidth: 300,
        margin: '0 auto 16px', fontSize: 13,
        display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Avatar color={prof.color as Color} initials={initials} size={30} />
          <strong>{prof.nombre}</strong>
        </div>
        <div>📅 {formatFechaCorta(fecha)} · {hora}</div>
        <div>👤 {paciente}</div>
        <div>📱 {celular}</div>
        {email && <div>✉️ {email}</div>}
      </div>

      {waLink && (
        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', maxWidth: 300, padding: '12px 16px',
          borderRadius: 'var(--radius-lg)', background: '#25D366', color: '#fff',
          fontWeight: 700, fontSize: 14, textDecoration: 'none',
          margin: '0 auto 12px', boxSizing: 'border-box',
        }}>
          💬 Avisarle por WhatsApp a {prof.nombre.split(' ')[0]}
        </a>
      )}

      <button onClick={onClose} style={{
        display: 'block', width: '100%', maxWidth: 300,
        padding: '10px', margin: '0 auto',
        borderRadius: 'var(--radius-md)', border: '1.5px solid var(--gray-3)',
        background: '#fff', fontSize: 14, fontWeight: 700,
        color: 'var(--gray-5)', cursor: 'pointer', fontFamily: 'inherit',
      }}>
        Cerrar
      </button>
    </div>
  )
}
