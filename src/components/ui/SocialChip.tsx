import type { RedSocial } from '@/lib/types'

export const RED_ICONS: Record<RedSocial, string> = {
  instagram: '📸',
  facebook:  '👥',
  twitter:   '🐦',
  linkedin:  '💼',
  youtube:   '▶️',
  tiktok:    '🎵',
  website:   '🌐',
}

export const RED_LABELS: Record<RedSocial, string> = {
  instagram: 'Instagram',
  facebook:  'Facebook',
  twitter:   'Twitter',
  linkedin:  'LinkedIn',
  youtube:   'YouTube',
  tiktok:    'TikTok',
  website:   'Sitio web',
}

const RED_STYLES: Record<RedSocial, { bg: string; color: string }> = {
  instagram: { bg: '#fce4ec', color: '#c2185b' },
  facebook:  { bg: '#e3f2fd', color: '#1565c0' },
  twitter:   { bg: '#e8f5e9', color: '#1b5e20' },
  linkedin:  { bg: '#e1f5fe', color: '#01579b' },
  youtube:   { bg: '#ffebee', color: '#b71c1c' },
  tiktok:    { bg: '#f3e5f5', color: '#4a148c' },
  website:   { bg: 'var(--gray-1)', color: 'var(--gray-6)' },
}

interface SocialChipProps {
  red: RedSocial
  label?: string | null
  url: string
  size?: 'sm' | 'md'
}

export function SocialChip({ red, label, url, size = 'md' }: SocialChipProps) {
  const { bg, color } = RED_STYLES[red] ?? RED_STYLES.website
  const displayLabel = label || RED_LABELS[red] || red
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: size === 'sm' ? '3px 10px' : '7px 14px',
        borderRadius: '99px', textDecoration: 'none',
        fontSize: size === 'sm' ? 11 : 13,
        fontWeight: 700, background: bg, color,
        transition: 'opacity .15s',
      }}
    >
      {RED_ICONS[red] || '🔗'} {displayLabel}
    </a>
  )
}
