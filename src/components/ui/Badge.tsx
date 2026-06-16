import type { Color } from '@/lib/types'

const BADGE_MAP: Record<Color | 'gray' | 'ok' | 'warn' | 'err', { bg: string; color: string }> = {
  sage:  { bg: 'var(--sage-lt)',  color: 'var(--sage-dk)' },
  sky:   { bg: 'var(--sky-lt)',   color: 'var(--sky-dk)'  },
  lav:   { bg: 'var(--lav-lt)',   color: 'var(--lav-dk)'  },
  peach: { bg: 'var(--peach-lt)', color: '#8A5230'         },
  rose:  { bg: 'var(--rose-lt)',  color: '#7A3A48'         },
  gray:  { bg: 'var(--gray-2)',   color: 'var(--gray-5)'  },
  ok:    { bg: '#EBF4EE',         color: '#3A7A50'         },
  warn:  { bg: '#FEF3E2',         color: '#8A5A10'         },
  err:   { bg: '#FBE9E9',         color: '#8A2020'         },
}

interface BadgeProps {
  variant?: Color | 'gray' | 'ok' | 'warn' | 'err'
  children: React.ReactNode
  style?: React.CSSProperties
}

export function Badge({ variant = 'gray', children, style }: BadgeProps) {
  const { bg, color } = BADGE_MAP[variant] ?? BADGE_MAP.gray
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '99px',
      fontSize: 12,
      fontWeight: 700,
      background: bg,
      color,
      ...style,
    }}>
      {children}
    </span>
  )
}
