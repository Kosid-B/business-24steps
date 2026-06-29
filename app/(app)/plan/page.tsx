'use client'

export const runtime = 'edge'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/context/AppContext'
import { STEPS, THEMES } from '@/lib/data/steps'
import { getXp, getPowerLevels, getRankTier } from '@/lib/game'
import { createClient } from '@/lib/supabase/client'

const EDGE_FN = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/step-coach'

export default function PlanPage() {
  const { state, updateVenture } = useApp()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: state.venture?.name || '', tagline: state.venture?.tagline || '', category: state.venture?.category || '' })
  const [aiPlan, setAiPlan] = useState('')
  const [aiPlanLoading, setAiPlanLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const supabase = createClient()

  const xp = getXp(state)
  const rank = getRankTier(xp)
  const powers = getPowerLevels(state)
  const doneSteps = STEPS.filter(s => state.progress[s.n]?.done)

  async function generatePlan() {
    if (aiPlanLoading) return
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setAiPlanLoading(true)
    setAiPlan('')

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token ?? ''
      const lastN = doneSteps.length > 0 ? doneSteps[doneSteps.length - 1].n : 1

      const res = await fetch(EDGE_FN, {
        method: 'POST',
        signal: abortRef.current.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question: `สังเคราะห์ข้อมูลทั้งหมดจากเวิร์กชีตของฉัน แล้วเขียน "แผนธุรกิจ 1 หน้า" ที่ประกอบด้วย:
1. ภาพรวมธุรกิจ — ชื่อ + สรุปสิ่งที่ทำใน 2-3 ประโยค
2. กลุ่มลูกค้าเป้าหมาย — Persona + ตลาดหัวหาดที่เลือก
3. คุณค่าที่ส่งมอบ — ปัญหาที่แก้ + ประโยชน์ที่วัดได้
4. โมเดลรายได้ — วิธีเก็บเงิน + ราคาที่ตั้ง
5. สิ่งที่ต้องทำต่อไป 3 อย่างสำคัญที่สุด
เขียนภาษาไทย กระชับ ปฏิบัติได้จริง ไม่ต้องอ้างเลขก้าว`,
          context: {
            name: state.account?.name,
            venture: state.venture?.name,
            plan: state.plan,
            doneCount: doneSteps.length,
            currentStepN: lastN,
            progress: state.progress,
          },
        }),
      })

      if (!res.body) throw new Error('no body')
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') continue
          try {
            const ev = JSON.parse(raw)
            if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
              setAiPlan(t => t + ev.delta.text)
            }
          } catch { /* skip */ }
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') setAiPlan(`เกิดข้อผิดพลาด: ${e}`)
    } finally {
      setAiPlanLoading(false)
    }
  }

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

      {/* AI Business Plan */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1A15' }}>แผนธุรกิจสังเคราะห์โดย AI</div>
          <button
            onClick={generatePlan}
            disabled={aiPlanLoading || doneSteps.length === 0}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 34, padding: '0 16px', borderRadius: 10, border: 'none',
              background: doneSteps.length === 0 ? '#E5DECC' : aiPlanLoading ? '#c8dfd3' : '#16704A',
              color: doneSteps.length === 0 ? '#8E8676' : '#fff',
              fontWeight: 700, fontSize: 13, fontFamily: 'Kanit, sans-serif',
              cursor: aiPlanLoading || doneSteps.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'background .2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={aiPlanLoading ? { animation: 'ttSpin 1s linear infinite' } : undefined}>
              {aiPlanLoading
                ? <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                : <path d="M12 2a9 9 0 0 1 9 9c0 4-2.5 7.5-6 8.8V22l-3-2-3 2v-2.2C5.5 18.5 3 15 3 11a9 9 0 0 1 9-9Z" />}
            </svg>
            {aiPlanLoading ? 'กำลังสร้าง…' : aiPlan ? 'สร้างใหม่' : 'สร้างแผนธุรกิจ'}
          </button>
        </div>

        {doneSteps.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: 'center', color: '#8E8676', fontSize: 14 }}>
            ทำก้าวแรกให้สำเร็จก่อน แล้ว AI จะสังเคราะห์แผนธุรกิจจากข้อมูลที่กรอกทั้งหมดให้
          </div>
        ) : (aiPlan || aiPlanLoading) && (
          <div className="card card-pad" style={{ background: '#F9F7F0', borderColor: '#16704A33', marginBottom: 4 }}>
            {aiPlan
              ? <div style={{ fontSize: 14, lineHeight: 1.85, color: '#1C1A15', whiteSpace: 'pre-wrap' }}>{aiPlan}</div>
              : <div style={{ fontSize: 14, color: '#8E8676', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    style={{ animation: 'ttSpin 1s linear infinite', flexShrink: 0 }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  AI กำลังวิเคราะห์ข้อมูลจากเวิร์กชีตทั้งหมด…
                </div>
            }
          </div>
        )}
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
