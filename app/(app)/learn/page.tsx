'use client'

export const runtime = 'edge'

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/lib/context/AppContext'
import { LESSONS, ARTICLES } from '@/lib/data/content'
import { themeOf } from '@/lib/data/steps'
import { createClient } from '@/lib/supabase/client'

const EDGE_FN = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/step-coach'

// ─── Personalization logic ────────────────────────────────────────
function currentStepN(progress: Record<string, { done?: boolean }>): number {
  const done = new Set(Object.entries(progress).filter(([, r]) => r?.done).map(([n]) => parseInt(n)))
  for (let i = 1; i <= 24; i++) if (!done.has(i)) return i
  return 24
}

function phaseOf(n: number): number {
  if (n <= 5) return 1
  if (n <= 11) return 2
  if (n <= 13) return 3
  if (n <= 17) return 4
  if (n <= 23) return 5
  return 6
}

function scoredLessons(progress: Record<string, { done?: boolean }>) {
  const cur = currentStepN(progress)
  return [...LESSONS]
    .map(l => ({ ...l, dist: Math.abs(l.step - cur), isDone: false }))
    .sort((a, b) => a.dist - b.dist)
}

const ARTICLE_PHASE: Record<string, number[]> = {
  a1: [1], a2: [1, 2], a3: [4, 5, 6], a4: [5, 6],
}

function scoredArticles(phase: number) {
  return [...ARTICLES].sort((a, b) => {
    const aHit = (ARTICLE_PHASE[a.id] ?? []).includes(phase) ? 0 : 1
    const bHit = (ARTICLE_PHASE[b.id] ?? []).includes(phase) ? 0 : 1
    return aHit - bHit
  })
}

const PHASE_LABEL: Record<number, string> = {
  1: 'Who is your customer?',
  2: 'What can you do for them?',
  3: 'How do they acquire it?',
  4: 'How do you make money?',
  5: 'How do you build it?',
  6: 'How do you scale?',
}

// ─── Component ───────────────────────────────────────────────────
export default function LearnPage() {
  const { state, markLesson } = useApp()
  const [tab, setTab] = useState<'recommended' | 'lessons' | 'articles'>('recommended')
  const [reading, setReading] = useState<typeof LESSONS[0] | typeof ARTICLES[0] | null>(null)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const aiGeneratedForCount = useRef(-1)
  const supabase = createClient()

  const readCount = Object.values(state.lessonDone || {}).filter(Boolean).length
  const totalXp = readCount * 40
  const doneCount = Object.values(state.progress || {}).filter((r: unknown) => (r as { done?: boolean })?.done).length
  const curStep = currentStepN(state.progress || {})
  const phase = phaseOf(curStep)
  const topLessons = scoredLessons(state.progress || {}).slice(0, 3)
  const topArticles = scoredArticles(phase).slice(0, 2)

  // Re-generate AI insight whenever doneCount changes (new step completed)
  useEffect(() => {
    if (doneCount === 0 || aiGeneratedForCount.current === doneCount) return
    aiGeneratedForCount.current = doneCount
    generateAiInsight()
  }, [doneCount]) // eslint-disable-line react-hooks/exhaustive-deps

  async function generateAiInsight() {
    setAiLoading(true)
    setAiText('')
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token ?? ''
      const res = await fetch(EDGE_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question: `วิเคราะห์ความคืบหน้าของฉันแล้วแนะนำสั้นๆ (ไม่เกิน 3 ประโยค) ว่าควรเรียนรู้เรื่องอะไรและโฟกัสทักษะใดต่อไป เพื่อให้ก้าวที่ ${curStep} สำเร็จได้เร็วขึ้น`,
          context: {
            name: state.account?.name,
            venture: state.venture?.name,
            plan: state.plan,
            doneCount,
            currentStepN: curStep,
            progress: state.progress || {},
          },
        }),
      })
      if (!res.body) return
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
              setAiText(t => t + ev.delta.text)
            }
          } catch { /* skip */ }
        }
      }
    } catch { /* silent */ }
    finally { setAiLoading(false) }
  }

  async function openLesson(lesson: typeof LESSONS[0]) {
    setReading(lesson)
    await markLesson(lesson.id)
  }

  // ─── Reading view ───────────────────────────────────────────────
  if (reading && 'step' in reading) {
    const lesson = reading as typeof LESSONS[0]
    const theme = themeOf(lesson.theme)
    return (
      <div className="anim-fade">
        <button onClick={() => setReading(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#8E8676', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          กลับ
        </button>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <span className="chip" style={{ background: theme.color + '18', color: theme.color }}>{lesson.level}</span>
          <span style={{ fontSize: 13, color: '#8E8676' }}>⏱ {lesson.dur} นาที</span>
          {state.lessonDone[lesson.id] && <span className="chip" style={{ background: '#E6F0EA', color: '#16704A' }}>✓ อ่านแล้ว +40 XP</span>}
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700, color: '#1C1A15' }}>{lesson.title}</h1>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: '#5C564A', lineHeight: 1.6 }}>{lesson.excerpt}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {lesson.body.map((para, i) => (
            <div key={i} style={{ fontSize: 15.5, color: '#1C1A15', lineHeight: 1.75, background: '#FCFAF2', borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${theme.color}` }}>
              {para}
            </div>
          ))}
        </div>
        <button onClick={() => setReading(null)} className="btn btn-primary" style={{ marginTop: 28 }}>
          อ่านจบ — กลับไปคลังความรู้
        </button>
      </div>
    )
  }

  if (reading && 'cat' in reading) {
    const article = reading as typeof ARTICLES[0]
    return (
      <div className="anim-fade">
        <button onClick={() => setReading(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#8E8676', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          กลับ
        </button>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <span className="chip" style={{ background: '#F1ECDF', color: '#5C564A' }}>{article.cat}</span>
          <span style={{ fontSize: 13, color: '#8E8676' }}>{article.date} · {article.read} นาที</span>
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700, color: '#1C1A15' }}>{article.title}</h1>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: '#5C564A', lineHeight: 1.6 }}>โดย {article.author}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {article.body.map((para, i) => (
            <p key={i} style={{ fontSize: 15.5, color: '#1C1A15', lineHeight: 1.75, margin: 0 }}>{para}</p>
          ))}
        </div>
        <button onClick={() => setReading(null)} className="btn btn-primary" style={{ marginTop: 28 }}>กลับ</button>
      </div>
    )
  }

  // ─── Main view ──────────────────────────────────────────────────
  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>คลังความรู้</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>บทเรียน & บทความ</h1>
      <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A' }}>เรียนรู้ทีละก้าวไปพร้อมลงมือทำจริง — อัปเดตเนื้อหาใหม่ทุกสัปดาห์</p>

      {/* XP banner */}
      <div style={{ marginTop: 20, background: 'linear-gradient(120deg,#2A2640,#1C1A2E)', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,.12)', color: '#EADB9C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.2 1-5.5-4-3.9 5.5-.8Z" /></svg>
        </span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14.5 }}>อ่านจบแล้ว {readCount} บท · ได้ {totalXp} XP</div>
          <div style={{ color: 'rgba(255,255,255,.72)', fontSize: 12.5 }}>
            คุณอยู่ก้าวที่ <b style={{ color: '#EADB9C' }}>{String(curStep).padStart(2,'0')}</b> · ช่วงที่ {phase} — {PHASE_LABEL[phase]}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'inline-flex', gap: 6, background: '#F1ECDF', padding: 5, borderRadius: 12, margin: '20px 0' }}>
        {([
          { k: 'recommended', label: '⭐ แนะนำสำหรับคุณ' },
          { k: 'lessons', label: `บทเรียน ${LESSONS.length}` },
          { k: 'articles', label: `บทความ ${ARTICLES.length}` },
        ] as const).map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            padding: '7px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontFamily: 'Kanit, sans-serif', fontSize: 14, fontWeight: 600,
            background: tab === t.k ? '#FFFDF7' : 'transparent',
            color: tab === t.k ? '#1C1A15' : '#8E8676',
            boxShadow: tab === t.k ? '0 1px 4px rgba(28,26,21,.1)' : 'none',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── แนะนำสำหรับคุณ ─────────────────────────────────────── */}
      {tab === 'recommended' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* AI Insight */}
          <div style={{ background: '#F6F2E9', border: '1.5px solid #E5DECC', borderRadius: 18, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#16704A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🤖</span>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: '#1C1A15' }}>
                AI วิเคราะห์แผนการเรียนของ{state.account?.name ? `คุณ${state.account.name}` : 'คุณ'}
              </div>
            </div>
            {doneCount === 0 ? (
              <div style={{ fontSize: 14, color: '#5C564A', lineHeight: 1.6 }}>
                เริ่มทำก้าวแรกก่อนนะ แล้ว AI จะวิเคราะห์แผนการเรียนที่เหมาะกับคุณโดยเฉพาะ
              </div>
            ) : aiLoading && !aiText ? (
              <div style={{ fontSize: 14, color: '#8E8676' }}>กำลังวิเคราะห์…</div>
            ) : aiText ? (
              <div style={{ fontSize: 14.5, color: '#1C1A15', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiText}</div>
            ) : (
              <button onClick={generateAiInsight} style={{ fontSize: 13.5, color: '#16704A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                กด วิเคราะห์แผนการเรียน →
              </button>
            )}
          </div>

          {/* บทเรียนแนะนำ */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: '#1C1A15', marginBottom: 12 }}>
              📚 บทเรียนที่เหมาะกับก้าวที่ {String(curStep).padStart(2,'0')} ของคุณ
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {topLessons.map(l => {
                const theme = themeOf(l.theme)
                const done = state.lessonDone[l.id]
                const isClosest = l.dist === 0
                return (
                  <button key={l.id} onClick={() => openLesson(l)} style={{
                    textAlign: 'left', background: isClosest ? theme.color + '08' : '#FFFDF7',
                    border: `1.5px solid ${isClosest ? theme.color + '50' : (done ? '#cfe3d6' : '#E5DECC')}`,
                    borderRadius: 16, padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative',
                  }}>
                    {isClosest && (
                      <div style={{ position: 'absolute', top: -10, left: 14, background: theme.color, color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '2px 10px', borderRadius: 999 }}>
                        เหมาะที่สุดตอนนี้
                      </div>
                    )}
                    {done && <span style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: 6, background: '#16704A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 12.5 10 17l9-10" /></svg>
                    </span>}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="chip" style={{ background: theme.color + '18', color: theme.color }}>{l.level}</span>
                      <span style={{ fontSize: 11.5, color: '#8E8676' }}>⏱ {l.dur} นาที</span>
                      {l.dist > 0 && <span style={{ fontSize: 11, color: '#8E8676' }}>ก้าวที่ {l.step}</span>}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', lineHeight: 1.4 }}>{l.title}</div>
                    <div style={{ fontSize: 13, color: '#5C564A', lineHeight: 1.5 }}>{l.excerpt}</div>
                    <div style={{ fontSize: 12, color: '#A87A1E', fontWeight: 600 }}>+40 XP เมื่ออ่านจบ</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* บทความแนะนำ */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: '#1C1A15', marginBottom: 12 }}>
              📰 บทความสำหรับช่วงที่ {phase} ของคุณ
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topArticles.map(a => {
                const isMatch = (ARTICLE_PHASE[a.id] ?? []).includes(phase)
                return (
                  <button key={a.id} onClick={() => setReading(a)} style={{
                    textAlign: 'left', background: '#FFFDF7',
                    border: `1.5px solid ${isMatch ? '#A87A1E50' : '#E5DECC'}`,
                    borderRadius: 16, padding: 18, cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'flex-start',
                  }}>
                    {isMatch && <span style={{ position: 'absolute' }} />}
                    <span className="chip" style={{ background: isMatch ? '#FEF9EC' : '#F1ECDF', color: isMatch ? '#A87A1E' : '#5C564A', flexShrink: 0 }}>{a.cat}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', marginBottom: 4 }}>{a.title}</div>
                      <div style={{ fontSize: 13, color: '#5C564A', lineHeight: 1.5 }}>{a.excerpt}</div>
                      <div style={{ fontSize: 12, color: '#8E8676', marginTop: 6 }}>{a.author} · {a.date} · {a.read} นาที</div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9BFA8" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M9 5l7 7-7 7" /></svg>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── บทเรียนทั้งหมด ──────────────────────────────────────── */}
      {tab === 'lessons' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {LESSONS.map(l => {
            const theme = themeOf(l.theme)
            const done = state.lessonDone[l.id]
            return (
              <button key={l.id} onClick={() => openLesson(l)} style={{ textAlign: 'left', background: '#FFFDF7', border: `1px solid ${done ? '#cfe3d6' : '#E5DECC'}`, borderRadius: 16, padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', overflow: 'hidden' }}>
                {done && <span style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: 6, background: '#16704A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 12.5 10 17l9-10" /></svg>
                </span>}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="chip" style={{ background: theme.color + '18', color: theme.color }}>{l.level}</span>
                  <span style={{ fontSize: 11.5, color: '#8E8676' }}>⏱ {l.dur} นาที</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', lineHeight: 1.4 }}>{l.title}</div>
                <div style={{ fontSize: 13, color: '#5C564A', lineHeight: 1.5 }}>{l.excerpt}</div>
                <div style={{ fontSize: 12, color: '#A87A1E', fontWeight: 600 }}>+40 XP เมื่ออ่านจบ</div>
              </button>
            )
          })}
        </div>
      )}

      {/* ── บทความทั้งหมด ───────────────────────────────────────── */}
      {tab === 'articles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ARTICLES.map(a => (
            <button key={a.id} onClick={() => setReading(a)} style={{ textAlign: 'left', background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 16, padding: 18, cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span className="chip" style={{ background: '#F1ECDF', color: '#5C564A', flexShrink: 0 }}>{a.cat}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5, color: '#1C1A15', marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: '#5C564A', lineHeight: 1.5 }}>{a.excerpt}</div>
                <div style={{ fontSize: 12, color: '#8E8676', marginTop: 6 }}>{a.author} · {a.date} · {a.read} นาที</div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9BFA8" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
