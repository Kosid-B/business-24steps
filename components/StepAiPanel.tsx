'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const EDGE_FN = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/step-coach'

type Msg = { role: 'user' | 'ai'; text: string }

interface Props {
  stepN: number
  stepTh: string
  themeColor: string
  context: {
    name?: string
    venture?: string
    plan?: string
    doneCount: number
    progress: Record<string, unknown>
  }
  worksheetData: Record<string, unknown>
}

const QUICK: (stepN: number) => string[] = (n) => [
  `แนะนำวิธีทำก้าวที่ ${String(n).padStart(2,'0')} ให้ฉัน`,
  'วิเคราะห์ข้อมูลที่ฉันกรอกและแนะนำปรับปรุง',
  'ให้ตัวอย่างจากธุรกิจจริงสำหรับก้าวนี้',
]

export default function StepAiPanel({ stepN, stepTh, themeColor, context, worksheetData }: Props) {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, open])

  async function ask(question: string) {
    if (!question.trim() || streaming) return
    setInput('')
    setMsgs(m => [...m, { role: 'user', text: question }, { role: 'ai', text: '' }])
    setStreaming(true)

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token ?? ''
      const res = await fetch(EDGE_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question,
          context: {
            ...context,
            currentStepN: stepN,
            progress: { ...context.progress, [stepN]: { data: worksheetData } },
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
              setMsgs(m => {
                const copy = [...m]
                copy[copy.length - 1] = { role: 'ai', text: copy[copy.length - 1].text + ev.delta.text }
                return copy
              })
            }
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      setMsgs(m => { const c = [...m]; c[c.length - 1] = { role: 'ai', text: `เกิดข้อผิดพลาด: ${e}` }; return c })
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', borderRadius: 14,
          background: open ? themeColor : themeColor + '12',
          color: open ? '#fff' : themeColor,
          border: `1.5px solid ${themeColor}40`,
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
          transition: 'all .2s',
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 2a9 9 0 0 1 9 9c0 4-2.5 7.5-6 8.8V22l-3-2-3 2v-2.2C5.5 18.5 3 15 3 11a9 9 0 0 1 9-9ZM9 11h.01M12 11h.01M15 11h.01" />
        </svg>
        AI ช่วยคิด
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 'auto', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div style={{ marginTop: 10, background: '#FFFDF7', border: `1.5px solid ${themeColor}30`, borderRadius: 18, overflow: 'hidden' }}>

          {/* Quick actions */}
          {msgs.length === 0 && (
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #F1ECDF' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#8E8676', marginBottom: 10, letterSpacing: '.06em', textTransform: 'uppercase' }}>ถามเลย</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {QUICK(stepN).map(q => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    style={{
                      textAlign: 'left', padding: '9px 14px', borderRadius: 11,
                      background: '#F6F2E9', border: 'none', cursor: 'pointer',
                      fontSize: 13.5, color: '#1C1A15', lineHeight: 1.4,
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {msgs.length > 0 && (
            <div style={{ maxHeight: 360, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  {m.role === 'ai' && (
                    <span style={{ width: 30, height: 30, borderRadius: '50%', background: themeColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>🤖</span>
                  )}
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: m.role === 'user' ? themeColor : '#F6F2E9',
                    color: m.role === 'user' ? '#fff' : '#1C1A15',
                    fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  }}>
                    {m.text || (streaming && i === msgs.length - 1 ? <span style={{ opacity: .5 }}>กำลังคิด…</span> : '')}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid #F1ECDF', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && ask(input)}
              placeholder={`ถามเกี่ยวกับก้าวที่ ${String(stepN).padStart(2,'0')} — ${stepTh}…`}
              disabled={streaming}
              style={{
                flex: 1, padding: '9px 14px', borderRadius: 11, border: '1.5px solid #E5DECC',
                fontSize: 13.5, background: '#FFFDF7', color: '#1C1A15', outline: 'none',
              }}
            />
            <button
              onClick={() => ask(input)}
              disabled={!input.trim() || streaming}
              style={{
                padding: '9px 16px', borderRadius: 11, border: 'none',
                background: themeColor, color: '#fff', fontWeight: 700, fontSize: 13.5,
                cursor: 'pointer', opacity: (!input.trim() || streaming) ? .5 : 1,
              }}
            >
              ส่ง
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
