'use client'

export const runtime = 'edge'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/context/AppContext'
import { createClient } from '@/lib/supabase/client'
import type { StrategyRun } from '@/types'

const EDGE_FN = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/step-coach'

type Pillar = {
  id: string
  no: number
  title: string
  sub: string
  color: string
  statements: string[]
  weakAdvice: string
  actionHref: string
  actionLabel: string
}

const PILLARS: Pillar[] = [
  {
    id: 'core', no: 1, title: 'แก่นธุรกิจ & ความยืดหยุ่น', sub: 'Core Identity & Resilience', color: '#16704A',
    statements: [
      'เรารู้ชัดว่าอะไรคือจุดที่คู่แข่งลอกเลียนได้ยาก',
      'เรามีพันธกิจ/ค่านิยมที่ใช้ตัดสินใจจริง ไม่ใช่แค่ติดผนัง',
      'เรามีแผนรับวิกฤตและกระแสเงินสดสำรอง',
    ],
    weakAdvice: 'แก่นยังไม่คม — เริ่มที่ก้าวหาแก่นธุรกิจ (VRIO) ก่อนเร่งโต',
    actionHref: '/roadmap', actionLabel: 'ทำก้าวหาแก่นธุรกิจ →',
  },
  {
    id: 'growth', no: 2, title: 'การเติบโตแบบทวีคูณ', sub: 'Viral Exponential Growth', color: '#A87A1E',
    statements: [
      'ลูกค้าปัจจุบันแนะนำลูกค้าใหม่ให้เราสม่ำเสมอ',
      'เรารู้ตัวเลข K-factor หรือ LTV:CAC ของเรา',
      'เราผ่าน Product-Market Fit แล้ว (ลูกค้าจะเสียดายถ้าไม่มีเรา)',
    ],
    weakAdvice: 'ยังไม่มี viral loop — ออกแบบกลไกให้ลูกค้าชวนลูกค้า',
    actionHref: '/plg', actionLabel: 'ดูกลยุทธ์เติบโต →',
  },
  {
    id: 'moat', no: 3, title: 'เชี่ยวชาญ & ป้องกันความเสี่ยง', sub: 'Defense & Specialization', color: '#2F4B7C',
    statements: [
      'เรามีจุดขาย (UVP) ที่ต่างจากคู่แข่งชัดเจน',
      'เรามีความเชี่ยวชาญ/กระบวนการหลักที่เลียนแบบยาก',
      'เรามีมาตรฐาน/ใบรับรองที่สร้างความน่าเชื่อถือ',
    ],
    weakAdvice: 'moat ยังบาง — คมจุดขายและยกกระบวนการหลักเป็นความเชี่ยวชาญ',
    actionHref: '/market', actionLabel: 'วางตำแหน่ง & จับคู่ธุรกิจ →',
  },
  {
    id: 'lifecycle', no: 4, title: 'ปรับตามวงจรชีวิต', sub: 'Lifecycle Adaptation', color: '#6B3F69',
    statements: [
      'เรารู้ว่าสินค้าหลักอยู่ช่วงไหนของวงจรชีวิต',
      'เราปรับกลยุทธ์/ออกสินค้าใหม่ทันเมื่อตลาดเปลี่ยน',
      'เรามีระบบอัตโนมัติ/QMS ที่ลดงานซ้ำซาก',
    ],
    weakAdvice: 'เสี่ยงตกยุค — map ช่วง PLC ปัจจุบันและวางระบบอัตโนมัติ',
    actionHref: '/coach', actionLabel: 'ปรึกษาโค้ชธุรกิจ AI →',
  },
]

const P_LABEL: Record<string, string> = Object.fromEntries(PILLARS.map(p => [p.id, p.title]))

export default function StrategyPage() {
  const { state, saveStrategy, toast } = useApp()
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [show, setShow] = useState(false)
  const [saved, setSaved] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const supabase = createClient()

  const history = state.strategyHistory || []

  const scores = useMemo(() =>
    PILLARS.map(p => {
      const n = p.statements.filter((_, i) => checks[`${p.id}-${i}`]).length
      return { pillar: p, n, pct: n / p.statements.length }
    }), [checks])

  const overall = Math.round(scores.reduce((s, x) => s + x.pct, 0) / PILLARS.length * 100)
  const weakest = [...scores].sort((a, b) => a.pct - b.pct)[0]
  const prevRun = history[0]
  const delta = prevRun ? overall - prevRun.overall : null

  // radar geometry — 4 axes: top / right / bottom / left
  const cx = 120, cy = 120, R = 92
  const axis = (i: number, v: number) => {
    const ang = (-90 + i * 90) * Math.PI / 180
    return [cx + Math.cos(ang) * R * v, cy + Math.sin(ang) * R * v]
  }
  const poly = scores.map((s, i) => axis(i, Math.max(s.pct, 0.02)).join(',')).join(' ')
  const grid = (v: number) => [0, 1, 2, 3].map(i => axis(i, v).join(',')).join(' ')

  function handleShow() {
    setShow(true)
    setSaved(false)
    setAiText('')
  }

  async function handleSave() {
    const run: StrategyRun = {
      at: new Date().toISOString(),
      overall,
      pillars: scores.map(s => ({ id: s.pillar.id, n: s.n, pct: s.pct })),
    }
    await saveStrategy(run)
    setSaved(true)
    toast('บันทึกผลกลยุทธ์แล้ว 📌')
  }

  async function analyze() {
    if (aiLoading) return
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setAiLoading(true)
    setAiText('')
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token ?? ''
      const lines = scores.map(s => `- เสา ${s.pillar.no} ${s.pillar.title}: ${Math.round(s.pct * 100)}%`).join('\n')
      const trend = prevRun ? `\nรอบก่อนคะแนนรวม ${prevRun.overall}% (${(delta ?? 0) >= 0 ? '+' : ''}${delta}%)` : ''
      const question =
`ฉันประเมินธุรกิจตามกรอบ 4 เสาหลักกลยุทธ์ (ถอดรหัสจากแมลงสังคม) ได้ผลนี้:
${lines}
คะแนนรวม ${overall}% · เสาที่อ่อนที่สุดคือ "${weakest.pillar.title}"${trend}

ช่วยวิเคราะห์เชิงลึกให้หน่อย:
1. ควรลงมือเสาไหนก่อน และเพราะอะไร (อ้างหลักของกรอบ เช่น อย่าเร่งโตถ้าแก่นยังไม่ชัด)
2. 3 action ที่ทำได้จริงใน 30 วัน สำหรับเสาที่อ่อนที่สุด
3. ความเสี่ยงถ้าปล่อยเสาที่อ่อนไว้
เขียนภาษาไทย กระชับ ปฏิบัติได้จริง`

      const res = await fetch(EDGE_FN, {
        method: 'POST', signal: abortRef.current.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question,
          context: {
            name: state.account?.name,
            venture: state.venture?.name,
            plan: state.plan,
            doneCount: Object.values(state.progress).filter((r: unknown) => (r as { done?: boolean })?.done).length,
            currentStepN: 0,
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
        const parts = buf.split('\n')
        buf = parts.pop() ?? ''
        for (const line of parts) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') continue
          try {
            const ev = JSON.parse(raw)
            if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
              setAiText(t => t + ev.delta.text)
            }
          } catch { /* skip */ }
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') setAiText(`เกิดข้อผิดพลาด: ${e}`)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>กลยุทธ์</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>Biomimicry Strategy Lens</h1>
      <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A', maxWidth: 620 }}>
        ประเมินธุรกิจตาม 4 เสาหลักที่ถอดรหัสจากแมลงสังคม — ติ๊กข้อที่จริงกับธุรกิจคุณ แล้วดูว่าเสาไหนแข็ง เสาไหนต้องเสริม
        <Link href="/blog/insect-biomimicry-business-strategy" style={{ color: '#16704A', fontWeight: 600, marginLeft: 6, textDecoration: 'none' }}>อ่านกรอบเต็ม →</Link>
      </p>

      {/* Pillars */}
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PILLARS.map(p => {
          const sc = scores.find(s => s.pillar.id === p.id)!
          return (
            <div key={p.id} className="card card-pad">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span className="mono" style={{ width: 34, height: 34, borderRadius: 10, background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{p.no}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15.5, color: '#1C1A15' }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: '#8E8676' }}>{p.sub}</div>
                </div>
                <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{sc.n}/{p.statements.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.statements.map((st, i) => {
                  const key = `${p.id}-${i}`
                  const on = !!checks[key]
                  return (
                    <button key={i} onClick={() => { setChecks(c => ({ ...c, [key]: !c[key] })); setShow(false) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left', background: on ? p.color + '10' : '#FCFAF2', border: `1.5px solid ${on ? p.color + '60' : '#EBE4D2'}`, borderRadius: 11, padding: '11px 13px', cursor: 'pointer', fontFamily: 'Kanit, sans-serif' }}>
                      <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${on ? p.color : '#C9BFA8'}`, background: on ? p.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {on && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 12.5 10 17l9-10" /></svg>}
                      </span>
                      <span style={{ fontSize: 14, color: '#1C1A15' }}>{st}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={handleShow} className="btn btn-primary" style={{ marginTop: 18, width: '100%' }}>
        ดูผลวินิจฉัย 4 เสา
      </button>

      {/* Results */}
      {show && (
        <div className="card card-pad anim-rise" style={{ marginTop: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'center' }}>
            {/* Radar */}
            <svg width="240" height="240" viewBox="0 0 240 240" style={{ maxWidth: '100%' }}>
              {[0.25, 0.5, 0.75, 1].map(v => (
                <polygon key={v} points={grid(v)} fill="none" stroke="#E5DECC" strokeWidth="1" />
              ))}
              {[0, 1, 2, 3].map(i => {
                const [x, y] = axis(i, 1)
                return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E5DECC" strokeWidth="1" />
              })}
              <polygon points={poly} fill="rgba(22,112,74,.18)" stroke="#16704A" strokeWidth="2" />
              {scores.map((s, i) => {
                const [x, y] = axis(i, Math.max(s.pct, 0.02))
                return <circle key={i} cx={x} cy={y} r="4" fill={s.pillar.color} />
              })}
              {PILLARS.map((p, i) => {
                const [x, y] = axis(i, 1.22)
                return <text key={p.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill={p.color}>{p.no}</text>
              })}
            </svg>

            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#8E8676', fontWeight: 600 }}>คะแนนกลยุทธ์รวม</div>
                  <div className="mono" style={{ fontSize: 40, fontWeight: 700, color: '#16704A', lineHeight: 1.1 }}>{overall}%</div>
                </div>
                {delta !== null && (
                  <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: delta >= 0 ? '#16704A' : '#C0573B' }}>
                    {delta >= 0 ? '▲ +' : '▼ '}{delta}% จากรอบก่อน
                  </span>
                )}
              </div>
              <div style={{ marginTop: 10, background: '#FBEAE3', border: '1px solid #f0c4b4', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#C0573B', marginBottom: 3 }}>เสาที่อ่อนที่สุด · เสา {weakest.pillar.no} {weakest.pillar.title}</div>
                <div style={{ fontSize: 13.5, color: '#5C564A', lineHeight: 1.5 }}>{weakest.pillar.weakAdvice}</div>
              </div>
            </div>
          </div>

          {/* Per-pillar advice */}
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scores.map(s => (
              <div key={s.pillar.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderTop: '1px solid #F1ECDF' }}>
                <span className="mono" style={{ width: 26, height: 26, borderRadius: 8, background: s.pillar.color + '18', color: s.pillar.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{s.pillar.no}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1A15' }}>{s.pillar.title}</div>
                  <div style={{ height: 6, borderRadius: 99, background: '#F1ECDF', overflow: 'hidden', marginTop: 4 }}>
                    <div style={{ height: '100%', width: `${Math.round(s.pct * 100)}%`, background: s.pillar.color, borderRadius: 99 }} />
                  </div>
                </div>
                <Link href={s.pillar.actionHref} className="btn btn-ghost btn-sm" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>{s.pillar.actionLabel}</Link>
              </div>
            ))}
          </div>

          {/* Actions: save + AI */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
            <button onClick={handleSave} disabled={saved} className="btn btn-ghost" style={{ opacity: saved ? .6 : 1 }}>
              {saved ? '✓ บันทึกแล้ว' : '📌 บันทึกผลรอบนี้'}
            </button>
            <button onClick={analyze} disabled={aiLoading} className="btn btn-primary" style={{ gap: 8 }}>
              {aiLoading ? 'AI กำลังวิเคราะห์…' : '🤖 ให้ AI วิเคราะห์เชิงลึก'}
            </button>
          </div>

          {/* AI analysis */}
          {(aiText || aiLoading) && (
            <div style={{ marginTop: 14, background: '#F6F2E9', border: '1px solid #E5DECC', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#16704A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🤖</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1C1A15' }}>วิเคราะห์โดยโค้ช AI</span>
              </div>
              <div style={{ fontSize: 14, color: '#1C1A15', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {aiText || <span style={{ opacity: .5 }}>กำลังอ่านผล 4 เสา…</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="card card-pad" style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', marginBottom: 14 }}>ประวัติการประเมิน & พัฒนาการ</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((run, i) => {
              const prev = history[i + 1]
              const d = prev ? run.overall - prev.overall : null
              return (
                <div key={run.at} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderTop: i === 0 ? 'none' : '1px solid #F1ECDF' }}>
                  <div style={{ width: 90, flexShrink: 0 }}>
                    <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: '#16704A' }}>{run.overall}%</div>
                    <div style={{ fontSize: 11, color: '#8E8676' }}>{new Date(run.at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                    {run.pillars.map(pl => (
                      <div key={pl.id} title={`${P_LABEL[pl.id]} · ${Math.round(pl.pct * 100)}%`} style={{ flex: 1, height: 26, borderRadius: 6, background: '#F1ECDF', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{ width: '100%', height: `${Math.round(pl.pct * 100)}%`, background: PILLARS.find(p => p.id === pl.id)?.color || '#16704A' }} />
                      </div>
                    ))}
                  </div>
                  <span className="mono" style={{ width: 52, textAlign: 'right', flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: d == null ? '#C9BFA8' : d >= 0 ? '#16704A' : '#C0573B' }}>
                    {d == null ? '—' : `${d >= 0 ? '+' : ''}${d}%`}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: 11.5, color: '#8E8676', marginTop: 12 }}>แท่งสี = 4 เสา (เขียว/ทอง/น้ำเงิน/ม่วง) · เก็บ 12 รอบล่าสุด</div>
        </div>
      )}
    </div>
  )
}
