'use client'

export const runtime = 'edge'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/context/AppContext'
import { getProgress } from '@/lib/game'
import { THEMES, STEPS, themeOf } from '@/lib/data/steps'

export default function RoadmapPage() {
  const { state } = useApp()
  const progress = getProgress(state)
  const [openPhases, setOpenPhases] = useState<string[]>(THEMES.map(t => t.id))
  const ringCirc = 2 * Math.PI * 52

  function toggle(id: string) {
    setOpenPhases(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>เส้นทาง</div>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-.02em', color: '#1C1A15' }}>24 ก้าวสร้างธุรกิจ</h1>
      <p style={{ margin: '7px 0 0', fontSize: 15, color: '#5C564A', maxWidth: 560 }}>แบ่งเป็น 6 ช่วงตามกรอบ Disciplined Entrepreneurship — เดินทีละก้าวจนมีลูกค้าจ่ายเงินจริง</p>

      {/* Live stats */}
      <div className="card" style={{ marginTop: 20, padding: '14px 20px', display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { icon: 'M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5', val: '12,480', label: 'สมาชิกทั้งหมด', color: '#16704A', live: false },
          { icon: 'M13 3 5 13h6l-1 8 8-10h-6l1-8Z', val: '327', label: 'กำลังออนไลน์ตอนนี้', color: '#E8623D', live: true },
          { icon: 'M8 11l2.5-2.5a2 2 0 0 1 3 0L18 13M11 13l2 2M9 15l2 2', val: '58', label: 'ดีลจับคู่สัปดาห์นี้', color: '#2F4B7C', live: false },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 150 }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="mono" style={{ fontWeight: 700, fontSize: 18, color: '#1C1A15' }}>{s.val}</span>
                {s.live && <span className="pulse-dot" />}
              </div>
              <div style={{ fontSize: 12, color: '#8E8676' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress hero */}
      <div style={{ marginTop: 22, borderRadius: 24, padding: 28, background: 'linear-gradient(125deg,#16704A 0%,#0F5536 60%,#0c4831 100%)', color: '#fff', display: 'flex', gap: 26, alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 16px 40px rgba(15,85,54,.28)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
        <span style={{ position: 'relative', width: 118, height: 118, flexShrink: 0 }}>
          <svg width="118" height="118" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="59" cy="59" r="52" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="10" />
            <circle cx="59" cy="59" r="52" fill="none" stroke="#EADB9C" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={ringCirc} strokeDashoffset={ringCirc * (1 - progress.pct)}
              style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.22,.61,.36,1)' }} />
          </svg>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <b className="mono" style={{ fontSize: 28, lineHeight: 1 }}>{Math.round(progress.pct * 100)}%</b>
            <span style={{ fontSize: 11, opacity: .8 }}>สำเร็จ</span>
          </span>
        </span>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <div style={{ fontSize: 13.5, opacity: .85, fontWeight: 600, letterSpacing: '.03em' }}>
            กำลังอยู่ในช่วง · {themeOf(progress.next.theme).th}
          </div>
          <div style={{ fontSize: 25, fontWeight: 700, margin: '5px 0 4px', letterSpacing: '-.01em' }}>
            เดินมาแล้ว {progress.done} จาก 24 ก้าว
          </div>
          <div style={{ fontSize: 14.5, opacity: .9, marginBottom: 16 }}>
            ก้าวต่อไป — ก้าวที่ {String(progress.next.n).padStart(2, '0')} · {progress.next.th}
          </div>
          <Link href={`/step/${progress.next.n}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, minHeight: 50, padding: '0 24px', borderRadius: 13, background: '#fff', color: '#0F5536', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 6px 18px rgba(0,0,0,.18)', transition: 'transform .2s' }}>
            ทำก้าวที่ {String(progress.next.n).padStart(2, '0')} ต่อ
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </div>

      {/* Phase strips */}
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {THEMES.map(theme => {
          const themeSteps = STEPS.filter(s => s.theme === theme.id)
          const done = themeSteps.filter(s => state.progress[s.n]?.done).length
          const isOpen = openPhases.includes(theme.id)

          return (
            <div key={theme.id} style={{ background: '#FFFDF7', border: `1.5px solid ${isOpen ? theme.color + '66' : '#E5DECC'}`, borderRadius: 18, overflow: 'hidden', transition: 'border-color .2s' }}>
              {/* Phase header */}
              <button onClick={() => toggle(theme.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span className="mono" style={{ width: 36, height: 36, borderRadius: 10, background: theme.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{theme.no}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15' }}>{theme.th}</div>
                  <div style={{ fontSize: 12, color: '#8E8676' }}>{theme.en}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 80, height: 6, borderRadius: 99, background: '#F1ECDF', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(done / themeSteps.length * 100)}%`, background: theme.color, borderRadius: 99 }} />
                  </div>
                  <span className="mono" style={{ fontSize: 12, color: theme.color, fontWeight: 600, minWidth: 36 }}>{done}/{themeSteps.length}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8676" strokeWidth="2" strokeLinecap="round" style={{ transition: 'transform .25s', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>

              {/* Steps grid */}
              {isOpen && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px 16px' }}>
                  {themeSteps.map(s => {
                    const isDone = state.progress[s.n]?.done
                    const isCurrent = !isDone && progress.next.n === s.n
                    return (
                      <Link key={s.n} href={`/step/${s.n}`} style={{
                        display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px', borderRadius: 13, textDecoration: 'none',
                        background: isCurrent ? '#FFF8F4' : '#FCFAF2',
                        border: `1.5px solid ${isCurrent ? '#f0c4b4' : isDone ? '#E5DECC' : '#EBE4D2'}`,
                        transition: 'transform .2s, box-shadow .2s',
                      }}>
                        <span style={{
                          width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
                          background: isDone ? theme.color : (isCurrent ? theme.color + '1c' : '#F1ECDF'),
                          color: isDone ? '#fff' : (isCurrent ? theme.color : '#8E8676'),
                          border: `2px solid ${isCurrent && !isDone ? theme.color : 'transparent'}`,
                        }}>
                          {isDone
                            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12.5 10 17l9-10" /></svg>
                            : <span className="mono">{String(s.n).padStart(2, '0')}</span>
                          }
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1A15', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.th}</div>
                          <div style={{ fontSize: 11.5, color: '#8E8676' }}>{s.en}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
