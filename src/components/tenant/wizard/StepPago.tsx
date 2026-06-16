'use client'
import { useState } from 'react'
import type { Professional } from '@/lib/types'

function formatFechaCorta(iso: string) {
  const [, m, d] = iso.split('-')
  const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const dias  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const dt = new Date(`${iso}T12:00:00`)
  return `${dias[dt.getDay()]} ${parseInt(d)} ${meses[parseInt(m)]}`
}

interface StepPagoProps {
  prof: Professional
  fecha: string
  hora: string
  onConfirmar: () => void
  onBack: () => void
  loading: boolean
}

export function StepPago({ prof, fecha, hora, onConfirmar, onBack, loading }: StepPagoProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const precio = prof.precio_consulta ?? 0
  const alias  = prof.alias_mp    || '—'
  const cbu    = prof.cbu         || '—'
  const linkMP = prof.link_cobro  || ''

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const transferBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { label: 'Alias', value: alias, key: 'alias' },
        { label: 'CBU',   value: cbu,   key: 'cbu'   },
      ].map(row => (
        <div key={row.key} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fff', border: '1px solid var(--gray-2)',
          borderRadius: 'var(--radius-md)', padding: '10px 14px',
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-4)' }}>{row.label}</div>
            <div style={{ fontSize: row.key === 'cbu' ? 12 : 15, fontWeight: 700 }}>{row.value}</div>
          </div>
          <button
            onClick={() => copy(row.value, row.key)}
            style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--gray-3)', background: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: copied === row.key ? 'var(--sage-dk)' : 'var(--gray-5)', flexShrink: 0 }}
          >
            {copied === row.key ? '✓ Copiado' : '📋 Copiar'}
          </button>
        </div>
      ))}
      {precio > 0 && (
        <div style={{ background: '#fff', border: '1px solid var(--gray-2)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-4)' }}>Monto</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--lav-dk)' }}>${precio.toLocaleString('es-AR')}</div>
        </div>
      )}
    </div>
  )

  return (
    <div>
      {/* Resumen */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--sage-lt)', border: '1px solid var(--sage)', marginBottom: 20 }}>
        <div style={{ flex: 1, fontSize: 13 }}>
          <strong>{prof.nombre}</strong> &nbsp;·&nbsp; {formatFechaCorta(fecha)} {hora}
        </div>
        {precio > 0 && <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--sage-dk)' }}>${precio.toLocaleString('es-AR')}</div>}
      </div>

      {linkMP ? (
        <>
          {/* Camino A: tiene link MP */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--gray-5)', marginBottom: 14 }}>
              Abonás el monto de la consulta a través del link de pago de <strong>{prof.nombre.split(' ')[0]}</strong>.
            </div>
            <a
              href={linkMP} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: '16px 20px', borderRadius: 'var(--radius-lg)',
                background: '#009ee3', color: '#fff', fontWeight: 700, fontSize: 17,
                textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,158,227,.35)',
              }}
            >
              🔵 Pagar {precio > 0 ? `$${precio.toLocaleString('es-AR')}` : ''} con MercadoPago
            </a>
            <div style={{ fontSize: 11, color: 'var(--gray-4)', marginTop: 8 }}>
              Se abre en una nueva pestaña · Podés pagar con tarjeta, saldo o QR
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-2)' }} />
            <span style={{ fontSize: 12, color: 'var(--gray-4)', whiteSpace: 'nowrap' }}>o si preferís transferir</span>
            <div style={{ flex: 1, height: 1, background: 'var(--gray-2)' }} />
          </div>

          <details style={{ marginBottom: 14 }}>
            <summary style={{
              cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--lav-dk)',
              padding: '10px 14px', background: 'var(--lav-lt)',
              borderRadius: 'var(--radius-md)', listStyle: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              🏦 Ver datos para transferencia <span style={{ fontSize: 11, opacity: .7 }}>▼</span>
            </summary>
            <div style={{ paddingTop: 12 }}>{transferBlock}</div>
          </details>
        </>
      ) : (
        <>
          {/* Camino B: solo transferencia */}
          <div style={{ background: 'var(--lav-lt)', border: '1.5px solid var(--lav)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--lav-dk)', marginBottom: 12 }}>🏦 Transferencia bancaria</div>
            {transferBlock}
          </div>
        </>
      )}

      <div style={{ fontSize: 12, color: 'var(--gray-4)', padding: '8px 12px', background: 'var(--gray-1)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
        💡 Una vez pagado por cualquier medio, tocá <strong>&quot;Ya pagué — confirmar reserva&quot;</strong>.
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} disabled={loading} style={btnGhostStyle}>← Volver</button>
        <button onClick={onConfirmar} disabled={loading} style={{ ...btnPrimaryStyle, flex: 1 }}>
          {loading ? 'Guardando…' : '✅ Ya pagué — confirmar reserva'}
        </button>
      </div>
    </div>
  )
}

const btnPrimaryStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  padding: '9px 20px', borderRadius: 'var(--radius-md)',
  background: 'var(--sage)', color: '#fff',
  border: '2px solid transparent', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}

const btnGhostStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '9px 20px', borderRadius: 'var(--radius-md)',
  background: 'transparent', color: 'var(--gray-5)',
  border: '2px solid var(--gray-3)', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
}
