'use client'
import { useState } from 'react'
import type { Professional, TenantSettings, SocialLink, Event } from '@/lib/types'
import type { RedSocial } from '@/lib/types'
import { HeroBanner } from './HeroBanner'
import { ProfessionalDirectory } from './ProfessionalDirectory'
import { EventsList } from './EventsList'
import { SocialChip } from '@/components/ui/SocialChip'
import { WizardTurnoModal } from './wizard/WizardTurnoModal'
import { ToastProvider } from '@/components/ui/Toast'

interface PatientPageClientProps {
  tenantSlug: string
  settings: TenantSettings
  professionals: Professional[]
  socialLinks: SocialLink[]
  events: Event[]
}

export function PatientPageClient({
  tenantSlug,
  settings,
  professionals,
  socialLinks,
  events,
}: PatientPageClientProps) {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [preselectedProfId, setPreselectedProfId] = useState<string | null>(null)

  function openWizard(profId?: string) {
    setPreselectedProfId(profId ?? null)
    setWizardOpen(true)
  }

  return (
    <>
      <ToastProvider />

      <main style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <HeroBanner settings={settings} onTakeTurno={() => openWizard()} />

        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--gray-4)', marginBottom: 14 }}>
          Nuestros profesionales
        </div>
        <ProfessionalDirectory
          professionals={professionals}
          onTakeTurno={profId => openWizard(profId)}
        />

        {socialLinks.length > 0 && (
          <div style={{
            background: 'var(--lav-lt)', border: '1px solid var(--lav)',
            borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 28,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--lav-dk)', marginBottom: 12 }}>
              📱 Seguinos en redes
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {socialLinks.map(link => (
                <SocialChip key={link.id} red={link.red as RedSocial} label={link.label} url={link.url} />
              ))}
            </div>
          </div>
        )}

        <EventsList events={events as Event[]} />
      </main>

      <WizardTurnoModal
        tenantSlug={tenantSlug}
        professionals={professionals}
        preselectedProfId={preselectedProfId}
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </>
  )
}
