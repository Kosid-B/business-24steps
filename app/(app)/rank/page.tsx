'use client'

import { useApp } from '@/lib/context/AppContext'
import { getXp, getRankTier, getProgress, getPowerLevels, RANK_TIERS } from '@/lib/game'

const BADGES = [
  { id: 'first_step', icon: '🚶', label: 'ก้าวแรก', desc: 'ทำก้าวที่ 01 สำเร็จ', check: (s: any) => !!s.progress?.[1]?.done },
  { id: 'phase1', icon: '🌱', label: 'ผ่านช่วง WHO', desc: 'ทำ ก้าวที่ 1-6 ครบ', check: (s: any) => [1,2,3,4,5,6].every(n => s.progress?.[n]?.done) },
  { id: 'learner', icon: '📚', label: 'ผู้รักการเรียนรู้', desc: 'อ่านบทเรียน 3 บท', check: (s: any) => Object.keys(s.lessonDone || {}).length >= 3 },
  { id: 'networker', icon: '🤝', label: 'นักเชื่อมสัมพันธ์', desc: 'ส่งคำขอจับคู่ 1 ครั้ง', check: (s: any) => (s.matches?.length || 0) >= 1 },
  { id: 'halfway', icon: '⚡', label: 'ครึ่งทาง', desc: 'ทำครบ 12 ก้าว', check: (s: any) => Object.values(s.progress || {}).filter((r: any) => r.done).length >= 12 },
  { id: 'champion', icon: '🏆', label: 'แชมป์', desc: 'ทำครบ 24 ก้าว', check: (s: any) => Object.values(s.progress || {}).filter((r: any) => r.done).length >= 24 },
]

const POWER_LABELS = ['WHO', 'VALUE', 'ACQUIRE', 'MONEY', 'BUILD', 'SCALE']
const POWER_COLORS = ['#16704A', '#E8623D', '#2F4B7C', '#A87A1E', '#6B3F69', '#2C6E6A']

export default function RankPage() {
  const { state } = useApp()
  const xp = getXp(state)
  const rank = getRankTier(xp)
  const progress = getProgress(state)
  const powers = getPowerLevels(state)

  const nextTier = RANK_TIERS.find(t => t.minXp > xp)
  const xpToNext = nextTier ? nextTier.minXp - xp : 0
  const currentTierMinXp = rank.minXp
  const nextTierMinXp = nextTier?.minXp ?? xp
  const tierPct = nextTier ? (xp - currentTierMinXp) / (nextTierMinXp - currentTierMinXp) : 1

  const earnedBadges = BADGES.filter(b => b.check(state))
  const totalPower = Math.round(powers.reduce((s, p) => s + p.lvl, 0) / powers.length * 10)

  const MANA = xp + (progress.done * 50)

  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>อันดับ</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>อันดับ & ความสำเร็จ</h1>
      <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A' }}>ก้าวที่สำเร็จทุกก้าวสร้าง XP และอำนาจธุรกิจ (Mana) ของคุณ</p>

      {/* Rank hero */}
      <div style={{ marginTop: 20, background: `linear-gradient(135deg, ${rank.color}ee, ${rank.color}aa)`, borderRadius: 22, padding: '26px 24px', color: '#fff', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', boxShadow: `0 16px 40px ${rank.color}44`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
        <div style={{ width: 90, height: 90, borderRadius: 22, background: 'rgba(255,255,255,.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 20px rgba(0,0,0,.2)' }}>
          <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
            {Array.from({ length: rank.stars }, (_, i) => <span key={i} style={{ fontSize: 14 }}>⭐</span>)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, textAlign: 'center' }}>{rank.tier}</div>
          <div style={{ fontSize: 10, opacity: .8 }}>{rank.en}</div>
        </div>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-.01em', marginBottom: 2 }}>{xp.toLocaleString()} XP</div>
          <div style={{ fontSize: 14, opacity: .9, marginBottom: 12 }}>Mana · {MANA.toLocaleString()} · Combat Power {totalPower}</div>
          {nextTier ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, opacity: .85, marginBottom: 5 }}>
                <span>{rank.tier}</span>
                <span>อีก {xpToNext} XP → {nextTier.tier}</span>
              </div>
              <div style={{ height: 7, borderRadius: 99, background: 'rgba(255,255,255,.25)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(tierPct * 100)}%`, background: '#EADB9C', borderRadius: 99, transition: 'width .8s' }} />
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, background: 'rgba(255,255,255,.18)', padding: '6px 14px', borderRadius: 999, display: 'inline-block' }}>🏆 ยศสูงสุดแล้ว!</div>
          )}
        </div>
      </div>

      {/* XP breakdown */}
      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', marginBottom: 14 }}>ที่มาของ XP</div>
        {[
          { label: 'ก้าวสำเร็จ', val: progress.done, xpEach: 100, color: '#16704A', icon: '✅' },
          { label: 'บทเรียนอ่านจบ', val: Object.keys(state.lessonDone || {}).length, xpEach: 40, color: '#2F4B7C', icon: '📚' },
          { label: 'การจับคู่ธุรกิจ', val: state.matches?.length || 0, xpEach: 120, color: '#A87A1E', icon: '🤝' },
          { label: 'นัด Consult', val: state.bookings?.length || 0, xpEach: 60, color: '#6B3F69', icon: '🎯' },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #F1ECDF' }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: row.color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{row.icon}</span>
            <span style={{ flex: 1, fontSize: 14, color: '#1C1A15' }}>{row.label}</span>
            <span className="mono" style={{ fontSize: 13, color: '#8E8676' }}>{row.val} × {row.xpEach}</span>
            <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: row.color, minWidth: 60, textAlign: 'right' }}>+{(row.val * row.xpEach).toLocaleString()}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, paddingTop: 10 }}>
          <span style={{ fontSize: 14, color: '#5C564A' }}>รวมทั้งหมด</span>
          <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: '#A87A1E' }}>{xp.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Power levels */}
      <div className="card card-pad" style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', marginBottom: 14 }}>สมรรถนะธุรกิจ 6 ด้าน</div>
        {powers.map((p, i) => (
          <div key={p.id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
              <span style={{ fontWeight: 600, color: POWER_COLORS[i] }}>{POWER_LABELS[i]} · {p.th}</span>
              <span className="mono" style={{ fontWeight: 700, color: POWER_COLORS[i] }}>{p.lvl * 10}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: '#F1ECDF', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${p.lvl * 10}%`, background: `linear-gradient(90deg, ${POWER_COLORS[i]}, ${POWER_COLORS[i]}cc)`, borderRadius: 99, transition: 'width .8s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* All tiers */}
      <div className="card card-pad" style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', marginBottom: 14 }}>ระดับยศทั้งหมด</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {RANK_TIERS.map(t => {
            const isCurrent = t.tier === rank.tier
            return (
              <div key={t.tier} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 13, background: isCurrent ? t.color + '14' : '#F6F2E8', border: `1.5px solid ${isCurrent ? t.color + '66' : 'transparent'}` }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: isCurrent ? t.color : t.color + '1a', color: isCurrent ? '#fff' : t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {'⭐'.repeat(t.stars)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: isCurrent ? t.color : '#1C1A15' }}>{t.tier}</div>
                  <div style={{ fontSize: 12, color: '#8E8676' }}>{t.en}</div>
                </div>
                <span className="mono" style={{ fontSize: 12.5, color: '#8E8676' }}>{t.minXp.toLocaleString()} XP</span>
                {isCurrent && <span className="chip" style={{ background: t.color, color: '#fff' }}>ตอนนี้</span>}
                {xp >= t.minXp && !isCurrent && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16704A" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12.5 10 17l9-10" /></svg>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="card card-pad" style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', marginBottom: 14 }}>
          ตรา & ความสำเร็จ <span className="mono" style={{ fontSize: 13, color: '#8E8676', fontWeight: 400 }}>{earnedBadges.length}/{BADGES.length}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {BADGES.map(b => {
            const earned = b.check(state)
            return (
              <div key={b.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', borderRadius: 13, background: earned ? '#F6F2E8' : '#F8F6F2', border: `1px solid ${earned ? '#E5DECC' : '#EBE4D2'}`, opacity: earned ? 1 : 0.55 }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{b.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1C1A15' }}>{b.label}</div>
                  <div style={{ fontSize: 12, color: '#8E8676' }}>{b.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
