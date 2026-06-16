'use client'

interface LogEntry {
  id: string
  usuario: string
  accion: string
  detalle: Record<string, unknown> | null
  created_at: string
}

interface Props {
  log: LogEntry[]
}

const ACCION_LABELS: Record<string, string> = {
  crear_profesional:     'Creó profesional',
  editar_profesional:    'Editó profesional',
  desactivar_profesional:'Desactivó profesional',
  toggle_modulo:         'Cambió módulo',
  agregar_dia_cerrado:   'Agregó día cerrado',
  quitar_dia_cerrado:    'Quitó día cerrado',
  actualizar_settings:   'Actualizó configuración',
  upsert_red_social:     'Actualizó red social',
  crear_evento:          'Creó evento',
  editar_evento:         'Editó evento',
  eliminar_evento:       'Eliminó evento',
  crear_admin:           'Creó administrador',
  eliminar_admin:        'Eliminó administrador',
  cambiar_password_admin:'Cambió contraseña de admin',
}

function formatTs(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

export function ActivitySection({ log }: Props) {
  return (
    <div>
      <h2 style={h2}>Log de actividad</h2>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow)', border: '1px solid var(--gray-2)' }}>
        {log.length === 0 ? (
          <div style={{ fontSize: 14, color: 'var(--gray-4)', fontStyle: 'italic' }}>Sin actividad registrada.</div>
        ) : (
          <div style={{ display: 'grid', gap: 1 }}>
            {log.map(entry => (
              <div key={entry.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--gray-1)', alignItems: 'start' }}>
                <div style={{ fontSize: 12, color: 'var(--gray-4)', whiteSpace: 'nowrap' }}>{formatTs(entry.created_at)}</div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-6)' }}>
                    {ACCION_LABELS[entry.accion] ?? entry.accion}
                  </span>
                  {entry.detalle && Object.keys(entry.detalle).length > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--gray-4)', marginLeft: 8 }}>
                      {Object.entries(entry.detalle)
                        .filter(([k]) => k !== 'active' && k !== 'password_hash')
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--sage-dk)', fontWeight: 600, whiteSpace: 'nowrap' }}>{entry.usuario}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: 'var(--gray-6)', margin: '0 0 20px' }
