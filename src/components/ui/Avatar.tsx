import type { Color } from '@/lib/types'

const AV_COLORS: Record<Color, { bg: string; color: string }> = {
  sage:  { bg: 'var(--sage-lt)',  color: 'var(--sage-dk)' },
  sky:   { bg: 'var(--sky-lt)',   color: 'var(--sky-dk)'  },
  lav:   { bg: 'var(--lav-lt)',   color: 'var(--lav-dk)'  },
  peach: { bg: 'var(--peach-lt)', color: '#8A5230'         },
  rose:  { bg: 'var(--rose-lt)',  color: '#7A3A48'         },
}

export function getInitials(nombre: string): string {
  const parts = nombre.replace(/^(Lic\.|Dr\.|Dra\.|Mg\.)\s*/i, '').split(' ')
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

interface AvatarProps {
  color: Color
  initials: string
  size?: number
}

export function Avatar({ color, initials, size = 38 }: AvatarProps) {
  const { bg, color: textColor } = AV_COLORS[color] ?? AV_COLORS.sage
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: textColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.37, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}
