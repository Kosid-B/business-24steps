'use client'

export const runtime = 'edge'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApp } from '@/lib/context/AppContext'
import { STEPS, themeOf } from '@/lib/data/steps'
import { fmtBaht } from '@/lib/game'
import StepAiPanel from '@/components/StepAiPanel'

export default function StepPage({ params }: { params: Promise<{ n: string }> }) {
  const { n: nStr } = use(params)
  const n = parseInt(nStr, 10)
  const router = useRouter()
  const { state, markStep, toast } = useApp()
  const step = STEPS.find(s => s.n === n)
  const theme = step ? themeOf(step.theme) : null

  const [formData, setFormData] = useState<Record<string, string>>({})
  const [listItems, setListItems] = useState<string[]>([''])
  const [calcVals, setCalcVals] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  const rec = state.progress[n]

  useEffect(() => {
    if (!rec?.data) return
    const data = rec.data as Record<string, string | string[]>
    if (step?.ws.type === 'list') {
      const items = data.items as string[] | undefined
      if (items?.length) setListItems(items)
    } else if (step?.ws.type === 'calc') {
      const saved = data as unknown as Record<string, number>
      if (Object.keys(saved).length) setCalcVals(saved)
    } else {
      setFormData(data as Record<string, string>)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!step || !theme) {
    return <div style={{ padding: 40, color: '#8E8676' }}>ไม่พบก้าวนี้</div>
  }

  const ws = step.ws
  const prevStep = STEPS.find(s => s.n === n - 1)
  const nextStep = STEPS.find(s => s.n === n + 1)

  async function handleSave(done: boolean) {
    setSaving(true)
    let data: Record<string, string | string[]> = {}
    if (ws.type === 'list') data = { items: listItems.filter(Boolean) }
    else if (ws.type === 'calc') data = calcVals as unknown as Record<string, string>
    else data = formData
    await markStep(n, done, data)
    setSaving(false)
    toast(done ? `✅ ก้าวที่ ${String(n).padStart(2, '0')} สำเร็จ!` : 'บันทึกแล้ว')
    if (done && nextStep) setTimeout(() => router.push(`/step/${nextStep.n}`), 800)
  }

  const calcResult = ws.type === 'calc' ? ws.compute(calcVals) : 0

  return (
    <div className="anim-fade">
      {/* Back */}
      <Link href="/roadmap" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#8E8676', textDecoration: 'none', marginBottom: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        กลับไปเส้นทาง
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
        <span className="mono" style={{ width: 56, height: 56, borderRadius: 15, background: theme.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
          {String(n).padStart(2, '0')}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: theme.color, marginBottom: 4 }}>
            ช่วงที่ {theme.no} · {theme.en}
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>{step.th}</h1>
          <div style={{ fontSize: 13.5, color: '#8E8676', marginTop: 2 }}>{step.en}</div>
        </div>
        {rec?.done && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 28, padding: '0 12px', borderRadius: 999, background: '#E6F0EA', color: '#16704A', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12.5 10 17l9-10" /></svg>
            สำเร็จแล้ว
          </span>
        )}
      </div>

      {/* Guide */}
      <div style={{ background: theme.color + '0e', border: `1px solid ${theme.color}30`, borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.color, marginBottom: 4 }}>แนวทาง</div>
        <div style={{ fontSize: 14.5, color: '#1C1A15', lineHeight: 1.6 }}>{step.guide}</div>
      </div>

      {/* Objectives */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', marginBottom: 12 }}>เป้าหมายของก้าวนี้</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {step.obj.map((o, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, background: theme.color + '18', color: theme.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
              <span style={{ fontSize: 14.5, color: '#1C1A15', lineHeight: 1.5 }}>{o}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Worksheet */}
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', marginBottom: 16 }}>📝 เวิร์กชีต</div>

        {ws.type === 'list' && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#5C564A', marginBottom: 10 }}>{ws.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {listItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="mono" style={{ width: 24, height: 24, borderRadius: 7, background: '#F1ECDF', color: '#8E8676', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  <input
                    className="tt-input"
                    value={item}
                    onChange={e => { const a = [...listItems]; a[i] = e.target.value; setListItems(a) }}
                    placeholder={i === 0 ? ws.placeholder : ''}
                    style={{ flex: 1 }}
                  />
                  {listItems.length > 1 && (
                    <button onClick={() => setListItems(listItems.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#C9BFA8', cursor: 'pointer', padding: 4 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setListItems([...listItems, ''])} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                + เพิ่มรายการ
              </button>
            </div>
          </div>
        )}

        {ws.type === 'notes' && ws.prompts.map(p => (
          <div key={p.k} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#5C564A', display: 'block', marginBottom: 8 }}>{p.label}</label>
            <textarea
              className="tt-input tt-textarea"
              value={formData[p.k] || ''}
              onChange={e => setFormData({ ...formData, [p.k]: e.target.value })}
              placeholder={p.ph || 'เขียนคำตอบที่นี่…'}
            />
          </div>
        ))}

        {ws.type === 'fields' && ws.fields.map(f => (
          <div key={f.k} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#5C564A', display: 'block', marginBottom: 8 }}>{f.label}</label>
            {f.area
              ? <textarea className="tt-input tt-textarea" value={formData[f.k] || ''} onChange={e => setFormData({ ...formData, [f.k]: e.target.value })} placeholder="เขียนที่นี่…" />
              : <input className="tt-input" value={formData[f.k] || ''} onChange={e => setFormData({ ...formData, [f.k]: e.target.value })} placeholder="กรอกข้อมูล…" />
            }
          </div>
        ))}

        {ws.type === 'calc' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              {ws.inputs.map(inp => (
                <div key={inp.k}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#5C564A', display: 'block', marginBottom: 8 }}>
                    {inp.label} <span style={{ color: '#A87A1E', fontSize: 11 }}>({inp.unit})</span>
                  </label>
                  <input
                    className="tt-input mono"
                    type="number"
                    value={calcVals[inp.k] ?? inp.def}
                    onChange={e => setCalcVals({ ...calcVals, [inp.k]: parseFloat(e.target.value) || 0 })}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                </div>
              ))}
            </div>
            <div style={{ background: theme.color + '10', border: `1px solid ${theme.color}30`, borderRadius: 12, padding: '18px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: theme.color, fontWeight: 600, marginBottom: 4 }}>{ws.resultLabel}</div>
              <div className="mono" style={{ fontSize: 32, fontWeight: 700, color: theme.color }}>
                {ws.unit === '฿' ? fmtBaht(calcResult) : calcResult.toLocaleString() + ' ' + ws.unit}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Panel */}
      <StepAiPanel
        stepN={n}
        stepTh={step.th}
        themeColor={theme.color}
        context={{
          name: state.account?.name,
          venture: state.venture?.name,
          plan: state.plan,
          doneCount: Object.values(state.progress).filter((r: unknown) => (r as { done?: boolean })?.done).length,
          progress: state.progress,
        }}
        worksheetData={
          ws.type === 'list' ? { items: listItems } :
          ws.type === 'calc' ? calcVals :
          formData
        }
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving} style={{ gap: 8 }}>
          {saving ? 'กำลังบันทึก…' : rec?.done ? '✅ บันทึกการแก้ไข' : '✅ ทำสำเร็จ + ต่อไป'}
        </button>
        <button className="btn btn-ghost" onClick={() => handleSave(false)} disabled={saving}>
          บันทึกชั่วคราว
        </button>
        {prevStep && <Link href={`/step/${prevStep.n}`} className="btn btn-ghost btn-sm">← ก้าวที่ {String(prevStep.n).padStart(2, '0')}</Link>}
        {nextStep && <Link href={`/step/${nextStep.n}`} className="btn btn-ghost btn-sm">ก้าวที่ {String(nextStep.n).padStart(2, '0')} →</Link>}
      </div>
    </div>
  )
}
