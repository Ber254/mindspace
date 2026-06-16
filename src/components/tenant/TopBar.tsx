import type { TenantSettings } from '@/lib/types'

type ActiveTab = 'paciente' | 'pro' | 'admin'

interface TopBarProps {
  settings: TenantSettings
  activeTab?: ActiveTab
}

export function TopBar({ settings, activeTab = 'paciente' }: TopBarProps) {
  const tabs: { id: ActiveTab; label: string; href: string }[] = [
    { id: 'paciente', label: '🌿 Pacientes',      href: '/'     },
    { id: 'pro',      label: '🧠 Profesionales',  href: '/pro'  },
    { id: 'admin',    label: '🏠 Administración', href: '/admin' },
  ]

  return (
    <header style={{
      background: 'var(--white)',
      borderBottom: '1.5px solid var(--gray-2)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 60,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }}>
      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 700, color: 'var(--sage-dk)', textDecoration: 'none' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--lav)', display: 'inline-block' }} />
        {settings.marca}
      </a>

      {/* Nav tabs */}
      <nav style={{ display: 'flex', gap: 4, background: 'var(--gray-1)', padding: 4, borderRadius: 'var(--radius-lg)' }}>
        {tabs.map(tab => {
          const isActive = tab.id === activeTab
          return (
            <a
              key={tab.id}
              href={tab.href}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--white)' : 'transparent',
                color: isActive ? 'var(--sage-dk)' : 'var(--gray-5)',
                fontWeight: 600,
                fontSize: 14,
                boxShadow: isActive ? 'var(--shadow)' : 'none',
                textDecoration: 'none',
                transition: 'all .18s ease',
                display: 'inline-block',
              }}
            >
              {tab.label}
            </a>
          )
        })}
      </nav>
    </header>
  )
}
