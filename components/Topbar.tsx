'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/context/AppContext'
import { getXp, getRankTier, getProgress } from '@/lib/game'

export default function Topbar() {
  const { state, readAllNotifs } = useApp()
  const [notifOpen, setNotifOpen] = useState(false)
  const xp = getXp(state)
  const rank = getRankTier(xp)
  const progress = getProgress(state)
  const unread = state.notifs.filter(n => !n.read).length

  return (
    <header style={{
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '15px 26px',
      background: 'rgba(246,242,232,.9)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #E5DECC',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      {/* Progress summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#E6F0EA', color: '#16704A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
          {state.account?.name?.charAt(0)?.toUpperCase() || 'U'}
        </span>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, color: '#1C1A15' }}>
            {state.venture?.name || state.account?.name || 'ธุรกิจของคุณ'}
          </div>
          <div className="mono" style={{ fontSize: 11.5, color: '#8E8676' }}>
            {progress.done}/24 ก้าวสำเร็จ
          </div>
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 9 }}>
        {/* XP badge */}
        <Link href="/rank" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minHeight: 38, padding: '4px 10px', borderRadius: 11, border: '1px solid #cfe0f0', background: '#FFFDF7', textDecoration: 'none' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#2f6fb0" stroke="none"><path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" /></svg>
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: '#2f6fb0', lineHeight: 1 }}>{xp}</span>
          <span style={{ width: 28, height: 3, borderRadius: 99, background: '#E5EEF6', overflow: 'hidden', display: 'inline-block' }}>
            <i style={{ display: 'block', height: '100%', width: `${Math.round(((xp % 500) / 500) * 100)}%`, background: '#2f6fb0', borderRadius: 99 }} />
          </span>
        </Link>

        {/* Rank chip */}
        <Link href="/rank" style={{ display: 'flex', alignItems: 'center', gap: 5, height: 28, padding: '0 10px', borderRadius: 999, background: rank.color + '20', color: rank.color, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          ⭐ {rank.tier}
        </Link>

        {/* Hours (paid plan) */}
        {state.plan !== 'free' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, height: 28, padding: '0 10px', borderRadius: 999, border: '1px solid #f0c4b4', background: '#FBEAE3', color: '#E8623D', fontSize: 12, fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
            <span className="mono">{state.hours.toFixed(1)}</span> ชม.
          </span>
        )}

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid #E5DECC', background: '#FFFDF7', color: '#5C564A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            {unread > 0 && (
              <span className="mono" style={{ position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17, padding: '0 4px', borderRadius: 999, background: '#E8623D', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="anim-pop" style={{ position: 'absolute', top: 46, right: 0, width: 320, background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 16, boxShadow: '0 18px 44px rgba(28,26,21,.18)', zIndex: 40, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid #E5DECC' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>การแจ้งเตือน</span>
                <button onClick={() => { readAllNotifs(); setNotifOpen(false) }} style={{ border: 'none', background: 'none', color: '#16704A', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>อ่านทั้งหมด</button>
              </div>
              <div className="tt-scroll" style={{ maxHeight: 320, overflowY: 'auto' }}>
                {state.notifs.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#8E8676', fontSize: 13.5 }}>ยังไม่มีการแจ้งเตือน</div>
                ) : state.notifs.map(n => (
                  <div key={n.id} style={{ display: 'flex', gap: 11, padding: '13px 16px', borderBottom: '1px solid #F1ECDF', background: n.read ? '#FFFDF7' : '#FCF7EE' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1C1A15' }}>{n.title}</div>
                      <div style={{ fontSize: 12.5, color: '#5C564A', lineHeight: 1.45 }}>{n.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Membership link (free plan) */}
        {state.plan === 'free' && (
          <Link href="/membership" style={{ display: 'flex', alignItems: 'center', gap: 5, height: 30, padding: '0 12px', borderRadius: 999, background: '#E6F0EA', color: '#16704A', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
            อัปเกรด
          </Link>
        )}
      </div>
    </header>
  )
}
