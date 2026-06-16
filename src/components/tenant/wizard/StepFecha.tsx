'use client'
import { useEffect, useState } from 'react'

interface StepFechaProps {
  tenantSlug: string
  profIds: string[]           // todos si es wizard general; uno si viene desde una card
  onSelect: (fecha: string) => void
}

const DIAS_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES_CORTO = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function getNextDays(n: number) {
  const days: Date[] = []
  const today = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

export function StepFecha({ tenantSlug, profIds, onSelect }: StepFechaProps) {
  const [availability, setAvailability] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profIds.length === 0) { setLoading(false); return }

    const params = new URLSearchParams()
    profIds.forEach(id => params.append('profId', id))
    params.set('days', '21')

    fetch(`/api/slots/availability?${params}`, {
      headers: { 'x-tenant-slug': tenantSlug },
    })
      .then(r => r.json())
      .then(data => setAvailability(data))
      .finally(() => setLoading(false))
  }, [tenantSlug, profIds.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  const days = getNextDays(21)
  const today = new Date().toISOString().split('T')[0]

  if (loading) {
    return <div style={{ color: 'var(--gray-4)', textAlign: 'center', padding: '24px 0', fontSize: 14 }}>
      Cargando disponibilidad…
    </div>
  }

  return (
    <div>
      <div style={{ fontSize: 14, color: 'var(--gray-5)', marginBottom: 20 }}>
        Elegí el día para tu turno:
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--gray-4)', padding: '4px 0 6px' }}>
            {d}
          </div>
        ))}
        {/* Espaciadores para alinear el primer día */}
        {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
          <div key={`sp-${i}`} />
        ))}
        {days.map(d => {
          const iso = d.toISOString().split('T')[0]
          const slots = availability[iso] ?? 0
          const hasSlots = slots > 0
          const isToday = iso === today

          return (
            <button
              key={iso}
              disabled={!hasSlots}
              onClick={() => onSelect(iso)}
              style={{
                borderRadius: 'var(--radius-sm)',
                padding: '7px 4px',
                textAlign: 'center',
                cursor: hasSlots ? 'pointer' : 'default',
                border: `1.5px solid ${isToday ? 'var(--lav)' : 'var(--gray-2)'}`,
                background: hasSlots ? 'var(--white)' : 'var(--gray-1)',
                opacity: hasSlots ? 1 : 0.45,
                minHeight: 52,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                transition: 'all .14s',
              }}
              onMouseOver={e => hasSlots && ((e.currentTarget.style.borderColor = 'var(--sage)'), (e.currentTarget.style.background = 'var(--sage-lt)'))}
              onMouseOut={e  => hasSlots && ((e.currentTarget.style.borderColor = isToday ? 'var(--lav)' : 'var(--gray-2)'), (e.currentTarget.style.background = 'var(--white)'))}
            >
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-4)', lineHeight: 1 }}>
                {DIAS_CORTO[d.getDay()]}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: hasSlots ? 'var(--gray-6)' : 'var(--gray-3)', lineHeight: 1 }}>
                {d.getDate()}
              </div>
              {hasSlots && (
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--sage-dk)' }}>
                  {slots} libre{slots !== 1 ? 's' : ''}
                </div>
              )}
            </button>
          )
        })}
      </div>
      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--gray-4)' }}>
        Solo se muestran los días con turnos disponibles.
      </div>
    </div>
  )
}
