'use client'

export const runtime = 'edge'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/context/AppContext'
import { STEPS, THEMES } from '@/lib/data/steps'
import { getXp, getPowerLevels, getRankTier } from '@/lib/game'

export default function PlanPage() {
  const { state, updateVenture } = useApp()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: state.venture?.name || '', tagline: state.venture?.tagline || '', category: state.venture?.category || '' })

  const xp = getXp(state)
  const rank = getRankTier(xp)
  const powers = getPowerLevels(state)
  const doneSteps = STEPS.filter(s => state.progress[s.n]?.done)

  async function saveVenture() {
    await updateVenture({ name: form.name, tagline: form.tagline, category: form.category })
    setEditing(false)
  }

  const POWER_COLORS = ['#16704A', '#E8623D', '#2F4B7C', '#A87A1E', '#6B3F69', '#2C6E6A']
  const POWER_LABELS = ['WHO', 'VALUE', 'ACQUIRE', 'MONEY', 'BUILD', 'SCALE']

  function RadarChart({ powers }: { powers: { id: string; th: string; short: string; color: string; lvl: number; icon: string; soft: string }[] }) {
    const cx = 80, cy = 80, r = 60
    const n = powers.length
    const points = powers.map((p, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2
      const frac = p.lvl / 10
      return { x: cx + r * frac * Math.cos(angle), y: cy + r * frac * Math.sin(angle), gx: cx + r * Math.cos(angle), gy: cy + r * Math.sin(angle) }
    })
    const poly = points.map(p => `${p.x},${p.y}`).join(' ')
    const grid = points.map(p => `${p.gx},${p.gy}`).join(' ')
    return (
      <svg viewBox="0 0 160 160" width="160" height="160">
        {[.25, .5, .75, 1].map(f => (
          <polygon key={f} points={powers.map((_, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2
            return `${cx + r * f * Math.cos(angle)},${cy + r * f * Math.sin(angle)}`
          }).join(' ')} fill="none" stroke="#E5DECC" strokeWidth=".8" />
        ))}
        {points.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p.gx} y2={p.gy} stroke="#E5DECC" strokeWidth=".8" />)}
        <polygon points={poly} fill="rgba(22,112,74,.15)" stroke="#16704A" strokeWidth="1.5" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={POWER_COLORS[i]} />
        ))}
        {points.map((p, i) => {
          const lx = cx + (r + 14) * Math.cos((i / n) * 2 * Math.PI - Math.PI / 2)
          const ly = cy + (r + 14) * Math.sin((i / n) * 2 * Math.PI - Math.PI / 2)
          return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={POWER_COLORS[i]} fontWeight="700">{POWER_LABELS[i]}</text>
        })}
      </svg>
    )
  }

  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>แผนธุรกิจ</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>แผนธุรกิจของฉัน</h1>
      <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A' }}>รวบรวมจากเวิร์กชีต 24 ก้าว — อัปเดตอัตโนมัติเมื่อทำก้าวสำเร็จ</p>

      {/* Venture card */}
      <div style={{ marginTop: 20, background: 'linear-gradient(125deg,#1C1A2E,#2A2640)', borderRadius: 20, padding: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, bottom: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ชื่อธุรกิจ/Venture" className="tt-input" style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' }} />
            <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="ประเภทธุรกิจ/อุตสาหกรรม" className="tt-input" style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' }} />
            <textarea value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="คำอธิบายธุรกิจโดยย่อ" className="tt-input tt-textarea" style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveVenture} className="btn btn-primary">บันทึก</button>
              <button onClick={() => setEditing(false)} className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>ยกเลิก</button>
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setForm({ name: state.venture?.name || '', tagline: state.venture?.tagline || '', category: state.venture?.category || '' }); setEditing(true) }} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: 8, padding: '5px 12px', color: '#fff', fontSize: 12.5, cursor: 'pointer', fontFamily: 'Kanit, sans-serif' }}>แก้ไข</button>
            <div style={{ fontSize: 12, opacity: .7, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>VENTURE</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{state.venture?.name || 'ยังไม่ได้ตั้งชื่อธุรกิจ'}</div>
            {state.venture?.category && <div style={{ fontSize: 13, opacity: .8, marginBottom: 4 }}>{state.venture.category}</div>}
            {state.venture?.tagline && <div style={{ fontSize: 14, opacity: .85, lineHeight: 1.5 }}>{state.venture.tagline}</div>}
            {!state.venture?.name && <div style={{ fontSize: 13.5, opacity: .7 }}>กดแก้ไขเพื่อตั้งชื่อธุรกิจของคุณ</div>}
          </div>
        )}
      </div>

      {/* Power levels + radar */}
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start', background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 18, padding: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', marginBottom: 14 }}>สมรรถนะธุรกิจ 6 ด้าน</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {powers.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, width: 52, color: POWER_COLORS[i], flexShrink: 0 }}>{POWER_LABELS[i]}</span>
                <div style={{ flex: 1, height: 7, borderRadius: 99, background: '#F1ECDF', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.lvl * 10}%`, background: POWER_COLORS[i], borderRadius: 99, transition: 'width .6s' }} />
                </div>
                <span className="mono" style={{ fontSize: 11.5, color: POWER_COLORS[i], fontWeight: 700, width: 30, textAlign: 'right' }}>{p.lvl * 10}%</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#8E8676' }}>Combat Power:</span>
            <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: '#A87A1E' }}>{Math.round(powers.reduce((s, p) => s + p.lvl, 0) / powers.length * 10)}</span>
            <span className="chip" style={{ background: '#F6EECF', color: '#A87A1E' }}>{rank.tier}</span>
          </div>
        </div>
        <RadarChart powers={powers} />
      </div>

      {/* Steps summary by phase */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1A15', marginBottom: 12 }}>สรุปเวิร์กชีตแต่ละช่วง</div>
        {THEMES.map(theme => {
          const themeSteps = STEPS.filter(s => s.theme === theme.id)
          const doneInPhase = themeSteps.filter(s => state.progress[s.n]?.done)
          return (
            <div key={theme.id} style={{ marginBottom: 14, background: '#FFFDF7', border: `1px solid ${doneInPhase.length > 0 ? theme.color + '44' : '#E5DECC'}`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: doneInPhase.length > 0 ? `1px solid ${theme.color}22` : 'none' }}>
                <span className="mono" style={{ width: 32, height: 32, borderRadius: 9, background: theme.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{theme.no}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: '#1C1A15' }}>{theme.th}</div>
                  <div style={{ fontSize: 12, color: '#8E8676' }}>{doneInPhase.length}/{themeSteps.length} ก้าวสำเร็จ</div>
                </div>
                <div style={{ width: 70, height: 5, borderRadius: 99, background: '#F1ECDF', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round(doneInPhase.length / themeSteps.length * 100)}%`, background: theme.color, borderRadius: 99 }} />
                </div>
              </div>
              {doneInPhase.length > 0 && (
                <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {doneInPhase.map(s => {
                    const rec = state.progress[s.n]
                    const hasData = rec?.data && Object.keys(rec.data).length > 0
                    return (
                      <Link key={s.n} href={`/step/${s.n}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, textDecoration: 'none' }}>
                        <span style={{ width: 24, height: 24, borderRadius: 7, background: theme.color + '18', color: theme.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{String(s.n).padStart(2, '0')}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1A15' }}>{s.th}</div>
                          {hasData && (
                            <div style={{ fontSize: 12, color: '#8E8676', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {Object.values(rec.data as Record<string, string | string[]>).flat().slice(0, 2).join(' · ')}
                            </div>
                          )}
                        </div>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9BFA8" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    )
                  })}
                </div>
              )}
              {doneInPhase.length === 0 && (
                <div style={{ padding: '12px 18px' }}>
                  <Link href={`/step/${themeSteps[0].n}`} style={{ fontSize: 13.5, color: theme.color, fontWeight: 600, textDecoration: 'none' }}>เริ่มก้าวที่ {String(themeSteps[0].n).padStart(2, '0')} →</Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
