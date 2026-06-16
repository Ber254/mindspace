'use client'
import { useEffect, useState } from 'react'
import type { Franja } from '@/lib/types'
import type { SlotInfo } from './types'

interface StepHorarioProps {
  tenantSlug: string
  profId: string
  fecha: string
  onSelect: (hora: string, franja: Franja) => void
}

export function StepHorario({ tenantSlug, profId, fecha, onSelect }: StepHorarioProps) {
  const [slots, setSlots] = useState<SlotInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/slots?profId=${profId}&fecha=${fecha}`, {
      headers: { 'x-tenant-slug': tenantSlug },
    })
      .then(r => r.json())
      .then(data => { setSlots(data); setLoading(false) })
  }, [tenantSlug, profId, fecha])

  if (loading) {
    return <div style={{ color: 'var(--gray-4)', textAlign: 'center', padding: '24px 0', fontSize: 14 }}>
      Cargando horarios…
    </div>
  }

  const mañana = slots.filter(s => s.franja === 'mañana')
  const tarde   = slots.filter(s => s.franja === 'tarde')

  const FranjaSection = ({ label, items }: { label: string; items: SlotInfo[] }) => (
    items.length > 0 ? (
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
          {label}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {items.map(s => (
            <button
              key={s.hora}
              disabled={!s.available}
              onClick={() => onSelect(s.hora, s.franja)}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${s.available ? 'var(--gray-2)' : 'var(--gray-2)'}`,
                background: s.available ? 'var(--white)' : 'var(--gray-1)',
                color: s.available ? 'var(--gray-6)' : 'var(--gray-3)',
                textDecoration: s.available ? 'none' : 'line-through',
                fontSize: 14, fontWeight: 700,
                cursor: s.available ? 'pointer' : 'default',
                transition: 'all .15s',
              }}
              onMouseOver={e => s.available && ((e.currentTarget.style.borderColor = 'var(--sage)'), (e.currentTarget.style.background = 'var(--sage-lt)'))}
              onMouseOut={e  => s.available && ((e.currentTarget.style.borderColor = 'var(--gray-2)'), (e.currentTarget.style.background = 'var(--white)'))}
            >
              {s.hora}
            </button>
          ))}
        </div>
      </div>
    ) : null
  )

  if (slots.filter(s => s.available).length === 0) {
    return (
      <div style={{ color: 'var(--gray-4)', textAlign: 'center', padding: '24px 0', fontSize: 14 }}>
        No quedan turnos disponibles para este día. Volvé al paso anterior para elegir otra fecha.
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 14, color: 'var(--gray-5)', marginBottom: 16 }}>
        Elegí el horario:
      </div>
      <FranjaSection label="☀️ Mañana" items={mañana} />
      <FranjaSection label="🌙 Tarde" items={tarde} />
    </div>
  )
}
