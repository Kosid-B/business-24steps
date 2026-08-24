'use client'

/**
 * เช็ก 6 ข้อก่อนลงทุนกับไอเดียธุรกิจ — หน้าเก็บ lead
 *
 * แก้ปัญหาที่พบใน docs/marketing-diagnosis.md:
 *   เว็บมีแค่ "อ่านเฉย ๆ" กับ "สมัครเต็มรูปแบบ" ไม่มีขั้นกลาง จึงเก็บ lead ได้ 0 คนจาก 85 session
 *
 * หลักการออกแบบ
 * - ให้คุณค่าก่อนขออีเมล — ผู้ใช้เห็นคะแนนและสิ่งที่ควรทำทันที ไม่ต้องกรอกอีเมลก่อน
 * - ใช้ Validation Gate ตัวเดียวกับในระบบ (evaluateQuickCheck) ไม่มีสูตรที่สอง
 * - เก็บ UTM ทุกครั้ง — แก้ปัญหา 83/85 session ที่ไม่รู้ที่มา
 * - PDPA: checkbox ยินยอมไม่ติ๊กมาให้ล่วงหน้า และบันทึกข้อความที่ยินยอมไว้ด้วย
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  QUICKCHECK,
  evaluateQuickCheck,
  PDPA_CONSENT,
  type Answer,
  type QuickCheckAnswers,
} from '@/lib/constitution/quickcheck'

const CHOICES: { v: Answer; th: string; sub: string }[] = [
  { v: 'yes', th: 'มีแล้ว', sub: 'มีหลักฐานยืนยันได้' },
  { v: 'partial', th: 'บางส่วน', sub: 'เริ่มแล้วแต่ยังไม่ครบ' },
  { v: 'no', th: 'ยังไม่มี', sub: 'ยังไม่ได้เริ่ม' },
]

type Utm = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  seg?: string
  referrer?: string
}

/**
 * อ่านที่มาของผู้เข้าชมตอนกดส่ง — แก้ปัญหา 83/85 session ที่ไม่รู้ที่มา
 * อ่านสด ๆ จาก URL ไม่เก็บใน state เพราะไม่ต้องใช้ตอน render
 * (เลี่ยง setState ใน useEffect ที่ทำให้ render ซ้ำโดยไม่จำเป็น)
 */
function readUtm(): Utm {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  const g = (k: string) => p.get(k) ?? undefined
  return {
    utm_source: g('utm_source'),
    utm_medium: g('utm_medium'),
    utm_campaign: g('utm_campaign'),
    utm_content: g('utm_content'),
    seg: g('seg'),
    referrer: document.referrer || undefined,
  }
}

export default function QuickCheckPage() {
  const [answers, setAnswers] = useState<QuickCheckAnswers>({})
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  // ระบุ <boolean> ชัดเจน — PDPA_CONSENT.defaultChecked เป็น literal false จาก `as const`
  // ถ้าไม่ระบุ useState จะแคบเป็น false แล้วติ๊ก checkbox ไม่ได้
  const [consent, setConsent] = useState<boolean>(PDPA_CONSENT.defaultChecked)
  const [sending, setSending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const answered = Object.keys(answers).length
  const done = answered === QUICKCHECK.length
  const result = useMemo(() => (done ? evaluateQuickCheck(answers) : null), [answers, done])

  function choose(v: Answer) {
    const q = QUICKCHECK[step]
    setAnswers((a) => ({ ...a, [q.gateId]: v }))
    if (step < QUICKCHECK.length - 1) setStep(step + 1)
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!consent || !result) return
    setSending(true)
    setErr(null)
    try {
      const res = await fetch('/api/quickcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          answers,
          score: result.score,
          verdict: result.verdict,
          consent,
          consent_text: PDPA_CONSENT.label,
          ...readUtm(),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'ส่งไม่สำเร็จ')
      setSaved(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'ส่งไม่สำเร็จ ลองใหม่อีกครั้ง')
    } finally {
      setSending(false)
    }
  }

  // ───────────────────────── หน้าผลลัพธ์ ─────────────────────────
  if (done && result) {
    const tone =
      result.verdict === 'ready' ? '#16704A' : result.verdict === 'risky' ? '#A87A1E' : '#C0573B'
    return (
      <main style={S.wrap}>
        <div style={S.card}>
          <div style={{ ...S.badge, background: tone }}>{result.score}/100</div>
          <h1 style={S.h1}>{result.headline}</h1>

          <div style={S.gates}>
            {result.gates.map((g) => (
              <div key={g.id} style={S.gateRow}>
                <span style={{ ...S.dot, background: g.status === 'pass' ? '#16704A' : '#D6D1C7' }} />
                <span style={{ flex: 1 }}>{g.th}</span>
                <b style={{ color: g.status === 'pass' ? '#16704A' : '#8E8676' }}>
                  {g.status === 'pass' ? 'ผ่าน' : `${g.score}/${g.weight}`}
                </b>
              </div>
            ))}
          </div>

          {result.topActions.length > 0 && (
            <>
              <h2 style={S.h2}>ควรทำอะไรก่อน</h2>
              <ol style={S.actions}>
                {result.topActions.map((a, i) => (
                  <li key={i} style={S.action}>{a}</li>
                ))}
              </ol>
            </>
          )}

          {/* ขออีเมล *หลัง* ให้คุณค่าไปแล้ว ไม่ใช่ก่อน */}
          {!saved ? (
            <form onSubmit={submitEmail} style={S.form}>
              <h2 style={S.h2}>ส่งผลนี้เก็บไว้ พร้อมขั้นตอนถัดไป</h2>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมลของคุณ"
                style={S.input}
              />
              <label style={S.consent}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span>
                  {PDPA_CONSENT.label}
                  <br />
                  <small style={{ color: '#8E8676' }}>{PDPA_CONSENT.note}</small>
                </span>
              </label>
              {err && <div style={S.err}>{err}</div>}
              <button type="submit" disabled={!consent || sending} style={S.btn}>
                {sending ? 'กำลังส่ง…' : 'ส่งผลให้ทางอีเมล'}
              </button>
            </form>
          ) : (
            <div style={S.ok}>ส่งแล้ว — ตรวจอีเมลของคุณได้เลย</div>
          )}

          <div style={S.footer}>
            <button onClick={() => { setAnswers({}); setStep(0); setSaved(false) }} style={S.link}>
              ทำใหม่อีกครั้ง
            </button>
            <Link href="/" style={S.link}>ดูระบบเต็ม 24 ขั้น →</Link>
          </div>
        </div>
      </main>
    )
  }

  // ───────────────────────── หน้าคำถาม ─────────────────────────
  const q = QUICKCHECK[step]
  return (
    <main style={S.wrap}>
      <div style={S.card}>
        <div style={S.progress}>
          <div style={{ ...S.bar, width: `${(step / QUICKCHECK.length) * 100}%` }} />
        </div>
        <div style={S.meta}>ข้อ {step + 1} จาก {QUICKCHECK.length} · ใช้เวลาราว 2 นาที</div>

        <h1 style={S.h1}>{q.th}</h1>
        <p style={S.hint}>{q.hint}</p>

        <div style={S.choices}>
          {CHOICES.map((c) => (
            <button
              key={c.v}
              onClick={() => choose(c.v)}
              style={{
                ...S.choice,
                borderColor: answers[q.gateId] === c.v ? '#1B5E3F' : '#E5E1D8',
              }}
            >
              <b>{c.th}</b>
              <small style={{ color: '#8E8676' }}>{c.sub}</small>
            </button>
          ))}
        </div>

        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={S.link}>← ย้อนกลับ</button>
        )}
      </div>
    </main>
  )
}

const S: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', background: '#FAF9F6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 560, background: '#fff', border: '1px solid #E5E1D8', borderRadius: 16, padding: 28 },
  progress: { height: 4, background: '#EFEBE2', borderRadius: 99, overflow: 'hidden', marginBottom: 14 },
  bar: { height: '100%', background: '#1B5E3F', transition: 'width .25s' },
  meta: { fontSize: 13, color: '#8E8676', marginBottom: 18 },
  h1: { fontSize: 23, lineHeight: 1.45, margin: '0 0 8px', color: '#1A1A18' },
  h2: { fontSize: 15, margin: '24px 0 10px', color: '#1A1A18' },
  hint: { fontSize: 14.5, color: '#6B6659', margin: '0 0 22px', lineHeight: 1.65 },
  choices: { display: 'grid', gap: 10 },
  choice: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, padding: '14px 16px', border: '1.5px solid #E5E1D8', borderRadius: 11, background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: 15.5 },
  badge: { display: 'inline-block', color: '#fff', fontWeight: 700, fontSize: 15, padding: '5px 13px', borderRadius: 99, marginBottom: 14 },
  gates: { display: 'grid', gap: 9, margin: '18px 0 4px', fontSize: 14.5 },
  gateRow: { display: 'flex', alignItems: 'center', gap: 10 },
  dot: { width: 9, height: 9, borderRadius: 99, flexShrink: 0 },
  actions: { margin: 0, paddingLeft: 20, display: 'grid', gap: 9 },
  action: { fontSize: 14.5, lineHeight: 1.6, color: '#3A3730' },
  form: { display: 'grid', gap: 12, marginTop: 8, paddingTop: 20, borderTop: '1px solid #EFEBE2' },
  input: { padding: '12px 14px', border: '1.5px solid #E5E1D8', borderRadius: 10, fontSize: 15.5 },
  consent: { display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.6, color: '#3A3730' },
  btn: { padding: '13px 16px', background: '#1B5E3F', color: '#fff', border: 0, borderRadius: 10, fontSize: 15.5, fontWeight: 600, cursor: 'pointer' },
  ok: { marginTop: 20, padding: 14, background: '#EDF5F0', border: '1px solid #C9E0D4', borderRadius: 10, fontSize: 15, color: '#16704A' },
  err: { fontSize: 13.5, color: '#C0573B' },
  footer: { display: 'flex', justifyContent: 'space-between', marginTop: 22, paddingTop: 16, borderTop: '1px solid #EFEBE2' },
  link: { background: 'none', border: 0, color: '#2F4B7C', fontSize: 14, cursor: 'pointer', textDecoration: 'none', padding: 0 },
}
