'use client'
import { useEffect, useState } from 'react'

let _showToast: ((msg: string) => void) | null = null

export function toast(msg: string) {
  _showToast?.(msg)
}

export function ToastProvider() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    _showToast = (m: string) => {
      setMsg(m)
      setVisible(true)
      setTimeout(() => setVisible(false), 3000)
    }
    return () => { _showToast = null }
  }, [])

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28,
      background: 'var(--gray-6)', color: '#fff',
      padding: '12px 22px', borderRadius: 'var(--radius-md)',
      fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-md)',
      zIndex: 300, pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s',
    }}>
      {msg}
    </div>
  )
}
