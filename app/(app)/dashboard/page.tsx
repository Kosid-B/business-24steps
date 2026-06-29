'use client'

export const runtime = 'edge'

import Link from 'next/link'
import { useApp } from '@/lib/context/AppContext'
import { getProgress, getPhaseProgress, getXp, getRankTier } from '@/lib/game'
import { STEPS } from '@/lib/data/steps'

const CHECKLIST = [
  { id: 'profile', label: 'ตั้งชื่อธุรกิจ/Venture', xp: 50, href: '/plan', check: (s: ReturnType<typeof useApp>['state']) => !!s.venture?.name },
  { id: 'step1', label: 'ทำก้าวแรก (ก้าวที่ 01)', xp: 100, href: '/roadmap', check: (s: ReturnType<typeof useApp>['state']) => !!s.progress[1]?.done },
  { id: 'lesson', label: 'อ่านบทเรียน 1 บท', xp: 40, href: '/learn', check: (s: ReturnType<typeof useApp>['state']) => Object.keys(s.lessonDone || {}).length > 0 },
  { id: 'market', label: 'สำรวจจับคู่ธุรกิจ', xp: 30, href: '/market', check: (s: ReturnType<typeof useApp>['state']) => (s.matches?.length || 0) > 0 },
  { id: 'plan', label: 'ดูแผนธุรกิจรวม', xp: 20, href: '/plan', check: (s: ReturnType<typeof useApp>['state']) => Object.keys(s.progress || {}).length > 2 },
]

export default function HomePage() {
  const { state } = useApp()
  const progress = getProgress(state)
  const phases = getPhaseProgress(state)
  const xp = getXp(state)
  const rank = getRankTier(xp)
  const ringR = 30, ringCirc = 2 * Math.PI * ringR
  const ringOffset = ringCirc * (1 - progress.pct)

  const chkDone = CHECKLIST.filter(c => c.check(state)).length

  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>ยินดีต้อนรับกลับ</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>
        สวัสดี {state.account?.name || 'นักสร้างธุรกิจ'} 👋
      </h1>
      <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A' }}>เดินต่ออีกนิด ธุรกิจของคุณกำลังเป็นรูปเป็นร่าง</p>

      {/* Hero row */}
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Progress ring */}
        <div style={{ background: 'linear-gradient(135deg,#16704A,#0F5536)', borderRadius: 20, padding: 22, color: '#fff', display: 'flex', gap: 18, alignItems: 'center', boxShadow: '0 12px 30px rgba(15,85,54,.25)' }}>
          <span style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
            <svg width="76" height="76" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="38" cy="38" r={ringR} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="8" />
              <circle cx="38" cy="38" r={ringR} fill="none" stroke="#EADB9C" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={ringCirc} strokeDashoffset={ringOffset} style={{ transition: 'stroke-dashoffset .8s' }} />
            </svg>
            <span style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <b className="mono" style={{ fontSize: 19 }}>{Math.round(progress.pct * 100)}%</b>
            </span>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, opacity: .85, fontWeight: 600 }}>ความคืบหน้า 24 ก้าว</div>
            <div style={{ fontSize: 22, fontWeight: 700, margin: '2px 0' }}>{progress.done} ก้าวสำเร็จ</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, background: 'rgba(255,255,255,.16)', padding: '3px 10px', borderRadius: 999, marginTop: 2 }}>
              ⭐ ยศ {rank.tier} · {xp} XP
            </div>
          </div>
        </div>

        {/* Next step */}
        <Link href={`/step/${progress.next.n}`} style={{ background: '#FFF8F4', border: '1.5px solid #f0c4b4', borderRadius: 20, padding: 22, cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', textDecoration: 'none' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#E8623D', marginBottom: 6 }}>ทำต่อเลย</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="mono" style={{ width: 48, height: 48, borderRadius: 13, background: '#E8623D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
              {String(progress.next.n).padStart(2, '0')}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1A15' }}>{progress.next.th}</div>
              <div style={{ fontSize: 12.5, color: '#8E8676' }}>ก้าวถัดไปของคุณ</div>
            </div>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8623D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </div>
        </Link>
      </div>

      {/* Activation checklist */}
      <div className="card card-pad" style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1A15' }}>เริ่มต้นใช้งานให้ครบ</div>
          <span className="mono" style={{ fontSize: 13, color: '#16704A', fontWeight: 600 }}>{chkDone}/{CHECKLIST.length}</span>
        </div>
        <div className="pbar" style={{ marginBottom: 16 }}>
          <i style={{ width: `${Math.round(chkDone / CHECKLIST.length * 100)}%` }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CHECKLIST.map(c => {
            const done = c.check(state)
            return (
              <Link key={c.id} href={c.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 11, cursor: 'pointer', textDecoration: 'none' }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${done ? '#16704A' : '#E5DECC'}`, background: done ? '#16704A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 12.5 10 17l9-10" /></svg>}
                </span>
                <span style={{ flex: 1, fontSize: 14, color: done ? '#8E8676' : '#1C1A15', textDecoration: done ? 'line-through' : 'none' }}>{c.label}</span>
                <span className="mono" style={{ fontSize: 12, color: '#A87A1E', fontWeight: 600 }}>+{c.xp} XP</span>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C9BFA8" strokeWidth="2" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg>
              </Link>
            )
          })}
        </div>
        {chkDone === CHECKLIST.length && (
          <div style={{ marginTop: 12, background: '#E6F0EA', borderRadius: 11, padding: '12px 14px', fontSize: 13.5, color: '#0F5536', fontWeight: 600 }}>
            🎉 เริ่มต้นใช้งานครบแล้ว! คุณพร้อมลุยเต็มที่
          </div>
        )}
      </div>

      {/* Phase milestones */}
      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15' }}>เป้าหมายธุรกิจ 6 ช่วง</span>
            <Link href="/rank" style={{ fontSize: 12.5, color: '#16704A', fontWeight: 600, textDecoration: 'none' }}>ดูอันดับ →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {phases.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span className="mono" style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: p.color + '1a', color: p.color }}>
                  {p.no}
                </span>
                <span style={{ flex: 1, fontSize: 13.5, color: '#1C1A15', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.th.split('?')[0].replace('คุณ', '').trim()}
                </span>
                <span style={{ width: 70, flexShrink: 0, height: 6, borderRadius: 99, background: '#F1ECDF', overflow: 'hidden' }}>
                  <i style={{ display: 'block', height: '100%', width: `${Math.round(p.pct * 100)}%`, background: p.color }} />
                </span>
                <span className="mono" style={{ fontSize: 11.5, color: '#8E8676', width: 30, textAlign: 'right' }}>
                  {p.done}/{p.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent steps */}
        <div className="card card-pad">
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', marginBottom: 14 }}>ก้าวล่าสุดที่ทำสำเร็จ</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STEPS.filter(s => state.progress[s.n]?.done).slice(-5).reverse().map(s => (
              <Link key={s.n} href={`/step/${s.n}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: '#F6F2E8', textDecoration: 'none' }}>
                <span className="mono" style={{ width: 28, height: 28, borderRadius: 8, background: '#16704A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {String(s.n).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 13.5, color: '#1C1A15', flex: 1 }}>{s.th}</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16704A" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12.5 10 17l9-10" /></svg>
              </Link>
            ))}
            {STEPS.filter(s => state.progress[s.n]?.done).length === 0 && (
              <div style={{ fontSize: 13.5, color: '#8E8676', padding: '8px 0' }}>ยังไม่มีก้าวที่สำเร็จ — <Link href="/roadmap" style={{ color: '#16704A', textDecoration: 'none', fontWeight: 600 }}>เริ่มเลย →</Link></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
