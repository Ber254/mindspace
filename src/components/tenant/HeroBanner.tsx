'use client'
import type { TenantSettings } from '@/lib/types'

interface HeroBannerProps {
  settings: TenantSettings
  onTakeTurno: () => void
}

export function HeroBanner({ settings, onTakeTurno }: HeroBannerProps) {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--gray-2)',
      padding: '28px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 24,
      marginBottom: 28,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {settings.imagen_hero_url && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${settings.imagen_hero_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(245,240,232,0.82)',
          }} />
        </>
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-6)', marginBottom: 6 }}>
          Bienvenido a {settings.marca}
        </div>
        <div style={{ fontSize: 15, color: 'var(--gray-4)', maxWidth: 420 }}>
          Encontrá el profesional ideal y reservá tu turno en minutos, sin llamadas ni mensajes.
        </div>
      </div>
      <button
        onClick={onTakeTurno}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '13px 32px', borderRadius: 'var(--radius-lg)',
          background: 'var(--sage)', color: '#fff',
          border: 'none', fontSize: 16, fontWeight: 700,
          cursor: 'pointer', position: 'relative', zIndex: 1,
          transition: 'background .15s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--sage-dk)')}
        onMouseOut={e  => (e.currentTarget.style.background = 'var(--sage)')}
      >
        📅 Tomar turno
      </button>
    </div>
  )
}
