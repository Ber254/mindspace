import type { Event } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import type { Color } from '@/lib/types'

function formatFecha(iso: string) {
  const [y, m, d] = iso.split('-')
  const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const dias  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const dt = new Date(`${iso}T12:00:00`)
  return `${dias[dt.getDay()]} ${parseInt(d)} ${meses[parseInt(m)]}`
}

interface EventsListProps {
  events: Event[]
}

export function EventsList({ events }: EventsListProps) {
  if (events.length === 0) return null

  return (
    <>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--gray-4)', marginBottom: 14 }}>
        Próximos eventos y talleres
      </div>
      <div style={{ marginBottom: 28 }}>
        {events.map(ev => (
          <div key={ev.id} style={{
            background: 'linear-gradient(135deg, var(--lav-lt), var(--sky-lt))',
            border: '1.5px solid var(--lav)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1 }}>
              {ev.facilitadora && (
                <Badge variant={ev.color as Color} style={{ marginBottom: 8 }}>
                  {ev.facilitadora}
                </Badge>
              )}
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{ev.titulo}</div>
              {ev.descripcion && (
                <div style={{ fontSize: 14, color: 'var(--gray-5)', marginBottom: 8 }}>{ev.descripcion}</div>
              )}
              <div style={{ fontSize: 13, color: 'var(--gray-4)' }}>
                📅 {formatFecha(String(ev.fecha))} a las {String(ev.hora).slice(0, 5)}
                {ev.lugar && <> &nbsp;·&nbsp; 📍 {ev.lugar}</>}
                {ev.cupo > 0 && <> &nbsp;·&nbsp; 👥 Cupo: {ev.cupo}</>}
              </div>
              {ev.link && (
                <a href={ev.link} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: 'var(--lav-dk)', fontWeight: 700, marginTop: 6, display: 'inline-block', textDecoration: 'none' }}>
                  🔗 Más info / redes
                </a>
              )}
            </div>
            <div style={{ textAlign: 'center', minWidth: 110, flexShrink: 0 }}>
              {ev.precio > 0 ? (
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--lav-dk)', marginBottom: 8 }}>
                  ${ev.precio.toLocaleString('es-AR')}
                </div>
              ) : (
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sage-dk)', marginBottom: 8 }}>¡Gratis!</div>
              )}
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '6px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--lav)', color: '#fff',
                border: 'none', fontSize: 13, fontWeight: 700,
                cursor: 'pointer',
              }}>
                Reservar
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
