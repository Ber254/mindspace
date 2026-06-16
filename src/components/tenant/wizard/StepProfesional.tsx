'use client'
import { useEffect, useState } from 'react'
import type { Professional } from '@/lib/types'
import { Avatar, getInitials } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { Color } from '@/lib/types'
import type { SlotInfo } from './types'

interface StepProfesionalProps {
  tenantSlug: string
  professionals: Professional[]
  fecha: string
  onSelect: (prof: Professional) => void
}

export function StepProfesional({ tenantSlug, professionals, fecha, onSelect }: StepProfesionalProps) {
  const [slotMap, setSlotMap] = useState<Record<string, SlotInfo[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all(
      professionals.map(p =>
        fetch(`/api/slots?profId=${p.id}&fecha=${fecha}`, {
          headers: { 'x-tenant-slug': tenantSlug },
        })
          .then(r => r.json())
          .then((slots: SlotInfo[]) => [p.id, slots] as const)
      )
    ).then(entries => {
      setSlotMap(Object.fromEntries(entries))
      setLoading(false)
    })
  }, [tenantSlug, fecha]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div style={{ color: 'var(--gray-4)', textAlign: 'center', padding: '24px 0', fontSize: 14 }}>
      Cargando profesionales…
    </div>
  }

  const available = professionals.filter(p => (slotMap[p.id] ?? []).some(s => s.available))

  if (available.length === 0) {
    return <div style={{ color: 'var(--gray-4)', textAlign: 'center', padding: '24px 0', fontSize: 14 }}>
      No hay profesionales disponibles para ese día.
    </div>
  }

  return (
    <div>
      <div style={{ fontSize: 14, color: 'var(--gray-5)', marginBottom: 16 }}>
        ¿Con quién querés atenderte?
      </div>
      {available.map(p => {
        const freeSlots = (slotMap[p.id] ?? []).filter(s => s.available).length
        const initials  = getInitials(p.nombre)
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--gray-2)', background: 'var(--white)',
              cursor: 'pointer', marginBottom: 10,
              transition: 'all .15s', textAlign: 'left',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--sage)'; e.currentTarget.style.background = 'var(--sage-lt)' }}
            onMouseOut={e  => { e.currentTarget.style.borderColor = 'var(--gray-2)'; e.currentTarget.style.background = 'var(--white)' }}
          >
            <Avatar color={p.color as Color} initials={initials} size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-6)' }}>{p.nombre}</div>
              <Badge variant={p.color as Color} style={{ fontSize: 11, marginTop: 3 }}>
                {p.especialidad}
              </Badge>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--sage-dk)', flexShrink: 0 }}>
              {freeSlots} turno{freeSlots !== 1 ? 's' : ''} libre{freeSlots !== 1 ? 's' : ''}
            </div>
          </button>
        )
      })}
    </div>
  )
}
