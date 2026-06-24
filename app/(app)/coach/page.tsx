'use client'

export const runtime = 'edge'

import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/lib/context/AppContext'
import { getProgress } from '@/lib/game'
import { STEPS } from '@/lib/data/steps'

type Message = { role: 'user' | 'assistant'; content: string }

const QUICK_ACTIONS = [
  { label: 'วิเคราะห์ความคืบหน้า', q: 'วิเคราะห์ความคืบหน้าธุรกิจของฉันตอนนี้ บอกจุดแข็งและช่องโหว่' },
  { label: 'ก้าวต่อไปควรทำอะไร?', q: 'ก้าวต่อไปที่ฉันควรโฟกัสคืออะไร และต้องเตรียมอะไรบ้าง?' },
  { label: 'จุดอ่อนของแผนฉัน?', q: 'มองจากข้อมูลที่ฉันกรอกไว้ จุดอ่อนหรือความเสี่ยงในแผนธุรกิจของฉันคืออะไร?' },
  { label: 'อธิบายก้าวที่ฉันทำอยู่', q: 'ช่วยอธิบายก้าวที่ฉันทำอยู่ตอนนี้ให้ชัดขึ้น และบอกว่าต้องทำอะไรเพื่อให้สำเร็จ' },
]

export default function CoachPage() {
  const { state } = useApp()
  const progress = getProgress(state)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function buildContext() {
    const doneSteps = STEPS.filter(s => state.progress[s.n]?.done)
    const progressPayload: Record<string, { data?: Record<string, unknown> }> = {}
    for (const s of doneSteps) {
      const rec = state.progress[s.n]
      if (rec?.data && Object.keys(rec.data).length > 0) {
        progressPayload[String(s.n)] = { data: rec.data as Record<string, unknown> }
      } else {
        progressPayload[String(s.n)] = {}
      }
    }
    return {
      name: state.account?.name || '',
      venture: state.venture?.name || '',
      plan: state.plan,
      doneCount: doneSteps.length,
      currentStepN: progress.next.n,
      progress: progressPayload,
    }
  }

  async function send(question: string) {
    if (!question.trim() || loading) return
    const q = question.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const ANON_KEY    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/step-coach`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ANON_KEY}`,
          apikey: ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: q, context: buildContext() }),
      })

      if (!res.ok || !res.body) {
        const err = await res.text()
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ เกิดข้อผิดพลาด: ${err}` }])
        setLoading(false)
        return
      }

      // อ่าน SSE stream จาก Anthropic
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          try {
            const event = JSON.parse(raw)
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              const delta: string = event.delta.text
              setMessages(prev => {
                const msgs = [...prev]
                msgs[msgs.length - 1] = {
                  ...msgs[msgs.length - 1],
                  content: msgs[msgs.length - 1].content + delta,
                }
                return msgs
              })
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ไม่สามารถเชื่อมต่อได้: ${String(e)}` }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxHeight: 800 }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>AI Assistant</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#16704A,#0F5536)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a9 9 0 0 1 9 9c0 4-2.5 7.5-6 8.8V22l-3-2-3 2v-2.2C5.5 18.5 3 15 3 11a9 9 0 0 1 9-9Z" />
              <path d="M9 11h.01M12 11h.01M15 11h.01" />
            </svg>
          </span>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1C1A15' }}>โค้ชธุรกิจ AI</h1>
            <p style={{ margin: 0, fontSize: 13.5, color: '#5C564A' }}>วิเคราะห์ข้อมูลธุรกิจของคุณด้วยกรอบ Disciplined Entrepreneurship</p>
          </div>
        </div>

        {/* Status bar */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16704A', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#5C564A' }}>
            ธุรกิจ <strong style={{ color: '#1C1A15' }}>{state.venture?.name || '(ยังไม่ตั้งชื่อ)'}</strong>
            {' · '}{progress.done}/24 ก้าว · ก้าวปัจจุบัน <strong style={{ color: '#16704A' }}>ก้าวที่ {String(progress.next.n).padStart(2,'0')} {progress.next.th}</strong>
          </span>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 4, paddingBottom: 8 }}>

        {/* Welcome state */}
        {!hasMessages && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
            <div style={{ background: 'linear-gradient(135deg,#16704A0d,#A87A1E0d)', border: '1px solid #E5DECC', borderRadius: 16, padding: '20px 22px' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1A15', marginBottom: 8 }}>สวัสดี {state.account?.name || 'นักสร้างธุรกิจ'} 👋</div>
              <div style={{ fontSize: 14, color: '#5C564A', lineHeight: 1.65 }}>
                ฉันเป็นโค้ชที่อ่านข้อมูลธุรกิจที่คุณกรอกไว้ทั้งหมดแล้ว พร้อมช่วยวิเคราะห์ ชี้จุดแข็ง จุดอ่อน และแนะนำสิ่งที่ควรทำต่อ
                ตามกรอบ Disciplined Entrepreneurship 24 ขั้นตอน
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#8E8676', marginBottom: 10, letterSpacing: '.04em' }}>คำถามที่พบบ่อย</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {QUICK_ACTIONS.map(a => (
                  <button
                    key={a.label}
                    onClick={() => send(a.q)}
                    style={{
                      textAlign: 'left', padding: '12px 14px', borderRadius: 12,
                      background: '#FFFDF7', border: '1.5px solid #E5DECC',
                      cursor: 'pointer', fontSize: 13.5, color: '#1C1A15', fontWeight: 500,
                      lineHeight: 1.4, transition: 'border-color .15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#16704A66')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5DECC')}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            {/* Avatar */}
            <span style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: m.role === 'user' ? '#E5DECC' : 'linear-gradient(135deg,#16704A,#0F5536)',
              color: m.role === 'user' ? '#5C564A' : '#fff',
              fontSize: 12, fontWeight: 700, marginTop: 2,
            }}>
              {m.role === 'user'
                ? (state.account?.name?.charAt(0)?.toUpperCase() || 'U')
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a9 9 0 0 1 9 9c0 4-2.5 7.5-6 8.8V22l-3-2-3 2v-2.2C5.5 18.5 3 15 3 11a9 9 0 0 1 9-9Z" /><path d="M9 11h.01M12 11h.01M15 11h.01" /></svg>
              }
            </span>

            {/* Bubble */}
            <div style={{
              maxWidth: '75%', padding: '12px 16px', borderRadius: 14,
              background: m.role === 'user' ? '#1C1A15' : '#FFFDF7',
              border: m.role === 'user' ? 'none' : '1px solid #E5DECC',
              color: m.role === 'user' ? '#fff' : '#1C1A15',
              fontSize: 14, lineHeight: 1.65,
              borderBottomRightRadius: m.role === 'user' ? 4 : 14,
              borderBottomLeftRadius: m.role === 'assistant' ? 4 : 14,
            }}>
              {m.content === '' && m.role === 'assistant'
                ? <span style={{ display: 'flex', gap: 4, alignItems: 'center', color: '#8E8676' }}>
                    <span className="pulse-dot" style={{ background: '#16704A' }} />
                    <span style={{ fontSize: 13 }}>กำลังคิด…</span>
                  </span>
                : <span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span>
              }
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ paddingTop: 14, borderTop: '1px solid #E5DECC', marginTop: 8 }}>
        {/* Quick actions (after first message) */}
        {hasMessages && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {QUICK_ACTIONS.slice(0, 3).map(a => (
              <button
                key={a.label}
                onClick={() => send(a.q)}
                disabled={loading}
                style={{
                  fontSize: 12, padding: '5px 12px', borderRadius: 999,
                  background: '#F1ECDF', border: '1px solid #E5DECC',
                  color: '#5C564A', cursor: 'pointer', fontWeight: 500,
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ถามโค้ช… (Enter ส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
            rows={2}
            disabled={loading}
            className="tt-input tt-textarea"
            style={{ flex: 1, resize: 'none', minHeight: 48, maxHeight: 120, fontSize: 14 }}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 48, height: 48, borderRadius: 13, border: 'none', cursor: 'pointer',
              background: loading || !input.trim() ? '#E5DECC' : '#16704A',
              color: loading || !input.trim() ? '#8E8676' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background .15s',
            }}
          >
            {loading
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            }
          </button>
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: '#B5ADA0', textAlign: 'center' }}>
          โค้ชอ่านข้อมูลเวิร์กชีตที่คุณกรอกไว้เพื่อให้คำแนะนำเฉพาะเจาะจง
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
