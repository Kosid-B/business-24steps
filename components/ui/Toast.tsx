'use client'

import { useApp } from '@/lib/context/AppContext'

export default function Toast() {
  const { toastMsg } = useApp()
  if (!toastMsg) return null
  return (
    <div className="anim-rise" style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#1C1A15', color: '#fff', padding: '10px 20px',
      borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 9999,
      boxShadow: '0 8px 24px rgba(0,0,0,.3)', whiteSpace: 'nowrap',
    }}>
      {toastMsg}
    </div>
  )
}
