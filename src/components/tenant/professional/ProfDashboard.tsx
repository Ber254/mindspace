'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Professional, Appointment } from '@/lib/types'
import { Avatar, getInitials } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { Color } from '@/lib/types'
import { RegisterAttendanceModal } from './RegisterAttendanceModal'
import { DarTurnoModal } from './DarTurnoModal'
import { CobroModal } from './CobroModal'

function formatFecha(iso: string) {
  const [, m, d] = iso.split('-')
  const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const dias  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const dt = new Date(`${iso}T12:00:00`)
  return `${dias[dt.getDay()]} ${parseInt(d)} ${meses[parseInt(m)]}`
}

interface KPIs {
  total_proximos: number
  pagados: number
  pendientes_pago: number
  total_historico: number
}

interface Props {
  prof: Professional
  tenantSlug: string
  todayAppts: Appointment[]
  upcomingAppts: Appointment[]
  pastAppts: Appointment[]
  kpis: KPIs
}

export function ProfDashboard({ prof, tenantSlug, todayAppts, upcomingAppts, pastAppts, kpis }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [attendanceTarget, setAttendanceTarget] = useState<Appointment | null>(null)
  const [showDarTurno, setShowDarTurno] = useState(false)
  const [showCobro,    setShowCobro]    = useState(false)
  const [showHistorial, setShowHistorial] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const initials = getInitials(prof.nombre)

  function refresh() {
    startTransition(() => router.refresh())
  }

  async function handleLogout() {
    setLogoutLoading(true)
    await fetch('/api/auth/logout', { method: 'POST', headers: { 'x-tenant-slug': tenantSlug } })
    router.replace('/pro')
  }

  async function handleTogglePago(appt: Appointment) {
    await fetch(`/api/pro/attendance/${appt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug },
      body: JSON.stringify({ action: 'toggle_pago' }),
    })
    refresh()
  }

  return (
    <main style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Barra de sesión */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-lg)', padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        marginBottom: 24, boxShadow: 'var(--shadow)', border: '1px solid var(--gray-2)',
        flexWrap: 'wrap',
      }}>
        <Avatar color={prof.color as Color} initials={initials} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-6)' }}>{prof.nombre}</div>
          <Badge variant={prof.color as Color} style={{ fontSize: 11, marginTop: 3 }}>{prof.especialidad}</Badge>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setShowDarTurno(true)} style={btnLav}>+ Dar turno</button>
          <button onClick={() => setShowCobro(true)}    style={btnSec}>💳 Cobro / link MP</button>
          <button onClick={handleLogout} disabled={logoutLoading} style={btnGhost}>
            {logoutLoading ? '…' : 'Cerrar sesión'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { num: kpis.total_proximos,  lbl: 'Turnos próximos',    color: 'var(--sage-dk)' },
          { num: kpis.pagados,         lbl: 'Con pago confirmado', color: 'var(--sky-dk)'  },
          { num: kpis.pendientes_pago, lbl: 'Pago pendiente',      color: '#8A5230'         },
          { num: kpis.total_historico, lbl: 'Histórico total',     color: 'var(--gray-5)'  },
        ].map(k => (
          <div key={k.lbl} style={{ background: 'var(--gray-1)', borderRadius: 'var(--radius-md)', padding: '14px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: k.color, lineHeight: 1.1 }}>{k.num}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-4)', fontWeight: 600, marginTop: 3 }}>{k.lbl}</div>
          </div>
        ))}
      </div>

      {/* Turnos de hoy */}
      <SectionLabel>Hoy</SectionLabel>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-2)', padding: '20px 24px', marginBottom: 24 }}>
        {todayAppts.length === 0 ? (
          <div style={{ fontSize: 14, color: 'var(--gray-4)', fontStyle: 'italic' }}>Sin turnos para hoy.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <ApptsTable
              appts={todayAppts}
              tenantSlug={tenantSlug}
              showDate={false}
              onRegister={setAttendanceTarget}
              onTogglePago={handleTogglePago}
            />
          </div>
        )}
      </div>

      {/* Próximos turnos */}
      <SectionLabel>Próximos turnos</SectionLabel>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-2)', padding: '20px 24px', marginBottom: 24 }}>
        {upcomingAppts.length === 0 ? (
          <div style={{ fontSize: 14, color: 'var(--gray-4)', fontStyle: 'italic' }}>No hay turnos próximos.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <ApptsTable
              appts={upcomingAppts}
              tenantSlug={tenantSlug}
              showDate={true}
              onRegister={setAttendanceTarget}
              onTogglePago={handleTogglePago}
            />
          </div>
        )}
      </div>

      {/* Historial */}
      {pastAppts.length > 0 && (
        <>
          <button
            onClick={() => setShowHistorial(h => !h)}
            style={{ ...btnGhost, marginBottom: 16, width: '100%', justifyContent: 'center' }}
          >
            {showHistorial ? '▲ Ocultar historial' : `▼ Ver historial (${pastAppts.length} turnos)`}
          </button>
          {showHistorial && (
            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-2)', padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ overflowX: 'auto' }}>
                <ApptsTable
                  appts={pastAppts}
                  tenantSlug={tenantSlug}
                  showDate={true}
                  onRegister={setAttendanceTarget}
                  onTogglePago={handleTogglePago}
                  isHistory
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      {attendanceTarget && (
        <RegisterAttendanceModal
          appointment={attendanceTarget}
          onSave={async (data) => {
            await fetch(`/api/pro/attendance/${attendanceTarget.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'x-tenant-slug': tenantSlug },
              body: JSON.stringify({ action: 'attendance', ...data }),
            })
            refresh()
          }}
          onClose={() => setAttendanceTarget(null)}
        />
      )}

      {showDarTurno && (
        <DarTurnoModal prof={prof} tenantSlug={tenantSlug} onSave={refresh} onClose={() => setShowDarTurno(false)} />
      )}

      {showCobro && (
        <CobroModal prof={prof} tenantSlug={tenantSlug} onSave={refresh} onClose={() => setShowCobro(false)} />
      )}
    </main>
  )
}

// ─── Sub-componentes ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--gray-4)', marginBottom: 14 }}>
      {children}
    </div>
  )
}

function ApptsTable({ appts, showDate, onRegister, onTogglePago, isHistory = false }: {
  appts: Appointment[]
  tenantSlug: string
  showDate: boolean
  onRegister: (a: Appointment) => void
  onTogglePago: (a: Appointment) => void
  isHistory?: boolean
}) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr>
          {showDate && <Th>Fecha</Th>}
          <Th>Hora</Th>
          <Th>Paciente</Th>
          <Th>Obra social</Th>
          <Th>Pago</Th>
          <Th>Asistencia</Th>
          <Th></Th>
        </tr>
      </thead>
      <tbody>
        {appts.map(a => (
          <tr key={a.id} style={{ borderBottom: '1px solid var(--gray-1)' }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--gray-1)')}
            onMouseOut={e  => (e.currentTarget.style.background = '')}>
            {showDate && <Td>{formatFecha(String(a.fecha))}</Td>}
            <Td><strong>{String(a.hora).slice(0, 5)}</strong></Td>
            <Td>{a.paciente}</Td>
            <Td><span style={{ fontSize: 12, color: 'var(--gray-5)' }}>{a.obra_social}</span></Td>
            <Td>
              <button onClick={() => onTogglePago(a)} style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, cursor: 'pointer', border: '1.5px solid',
                background: a.pago ? 'var(--sage-lt)' : '#FBE9E9',
                borderColor: a.pago ? 'var(--sage)' : '#E8B0B0',
                color: a.pago ? 'var(--sage-dk)' : '#8A2020',
              }}>
                {a.pago ? '✅ Confirmado' : '⏳ Pendiente'}
              </button>
            </Td>
            <Td>
              <AsistenciaBadge value={a.asistencia} />
            </Td>
            <Td>
              {!isHistory && a.asistencia === null && (
                <button onClick={() => onRegister(a)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--lav)', background: 'var(--lav-lt)', color: 'var(--lav-dk)', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Registrar
                </button>
              )}
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Th({ children = null }: { children?: React.ReactNode }) {
  return (
    <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--gray-4)', borderBottom: '1.5px solid var(--gray-2)' }}>
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: '10px 14px', verticalAlign: 'middle' }}>{children}</td>
}

function AsistenciaBadge({ value }: { value: string | null }) {
  if (!value) return <span style={{ fontSize: 12, color: 'var(--gray-4)' }}>—</span>
  const map = {
    si:    { label: '✓ Asistió', bg: 'var(--sage-lt)', color: 'var(--sage-dk)', border: 'var(--sage)' },
    tarde: { label: '⏱ Tarde',   bg: 'var(--peach-lt)', color: '#8A5230',        border: 'var(--peach)' },
    no:    { label: '✗ No asistió', bg: '#FBE9E9',      color: '#8A2020',         border: '#C47070' },
  } as Record<string, { label: string; bg: string; color: string; border: string }>
  const s = map[value]
  if (!s) return null
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: s.bg, color: s.color, border: `1.5px solid ${s.border}` }}>
      {s.label}
    </span>
  )
}

const btnLav:  React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 'var(--radius-md)', background: 'var(--lav)', color: '#fff', border: '2px solid transparent', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const btnSec:  React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--sage-dk)', border: '2px solid var(--sage)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const btnGhost:React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--gray-5)', border: '2px solid var(--gray-3)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
