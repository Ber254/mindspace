import type { Professional } from '@/lib/types'
import { Avatar, getInitials } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { SocialChip } from '@/components/ui/SocialChip'
import type { RedSocial } from '@/lib/types'
import type { Color } from '@/lib/types'

interface DirectoryProps {
  professionals: Professional[]
  onTakeTurno: (profId: string) => void
}

export function ProfessionalDirectory({ professionals, onTakeTurno }: DirectoryProps) {
  if (professionals.length === 0) {
    return (
      <div style={{ color: 'var(--gray-4)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
        No hay profesionales disponibles en este momento.
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: 18,
      marginBottom: 28,
    }}>
      {professionals.map(p => (
        <ProfCard key={p.id} prof={p} onTakeTurno={onTakeTurno} />
      ))}
    </div>
  )
}

function ProfCard({ prof, onTakeTurno }: { prof: Professional; onTakeTurno: (id: string) => void }) {
  const initials = getInitials(prof.nombre)
  const firstSocial = prof.social_links?.[0]

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--gray-2)',
      padding: '20px 24px',
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start',
    }}>
      <Avatar color={prof.color as Color} initials={initials} size={48} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
          {prof.nombre}
        </div>
        <Badge variant={prof.color as Color} style={{ marginBottom: 8 }}>
          {prof.especialidad}
        </Badge>
        {prof.subespecialidad && (
          <div style={{ fontSize: 13, color: 'var(--gray-5)', marginBottom: 4 }}>
            {prof.subespecialidad}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--gray-4)' }}>
            📍 Consultorio {prof.box}
          </span>
          {firstSocial && (
            <SocialChip
              red={firstSocial.red as RedSocial}
              label={firstSocial.label}
              url={firstSocial.url}
              size="sm"
            />
          )}
        </div>
        <button
          onClick={() => onTakeTurno(prof.id)}
          style={{
            marginTop: 12, width: '100%', padding: '10px',
            borderRadius: 'var(--radius-md)', border: 'none',
            background: 'var(--sage)', color: '#fff',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', transition: 'background .15s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--sage-dk)')}
          onMouseOut={e  => (e.currentTarget.style.background = 'var(--sage)')}
        >
          📅 Tomar turno
        </button>
      </div>
    </div>
  )
}
