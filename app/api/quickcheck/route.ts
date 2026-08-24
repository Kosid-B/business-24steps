export const runtime = 'edge'

/**
 * รับ lead จากแบบเช็ก 6 ข้อ
 *
 * กติกาที่ห้ามแหก
 * - ไม่มี consent = ไม่บันทึก (PDPA) · ตรวจซ้ำที่ฝั่ง server ไม่เชื่อ client
 * - คะแนนคำนวณใหม่ที่ฝั่ง server จากคำตอบ ไม่รับคะแนนที่ client ส่งมา
 *   เพราะคะแนนคือข้อมูลที่เราจะเอาไปใช้ตัดสินใจ ต้องเชื่อถือได้
 * - ตาราง quickcheck_submissions เปิดเฉพาะ INSERT อ่านย้อนกลับไม่ได้ (ดู migration)
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { evaluateQuickCheck, PDPA_CONSENT } from '@/lib/constitution/quickcheck'
import type { QuickCheckAnswers } from '@/lib/constitution/quickcheck'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const clip = (v: unknown, n = 200) => (typeof v === 'string' ? v.slice(0, n) : null)

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'อีเมลไม่ถูกต้อง' }, { status: 400 })
  }

  // PDPA — ไม่ยินยอมก็ไม่เก็บ ไม่มีข้อยกเว้น
  if (body.consent !== true) {
    return NextResponse.json({ error: 'ต้องยินยอมก่อนจึงจะบันทึกได้' }, { status: 400 })
  }

  const answers = (body.answers ?? {}) as QuickCheckAnswers
  const result = evaluateQuickCheck(answers) // คำนวณใหม่ ไม่เชื่อคะแนนจาก client

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { error } = await supabase.from('quickcheck_submissions').insert({
    email,
    answers,
    score: result.score,
    verdict: result.verdict,
    utm_source: clip(body.utm_source),
    utm_medium: clip(body.utm_medium),
    utm_campaign: clip(body.utm_campaign),
    utm_content: clip(body.utm_content),
    seg: clip(body.seg, 60),
    referrer: clip(body.referrer, 500),
    consent: true,
    consent_text: PDPA_CONSENT.label,
    consent_at: new Date().toISOString(),
  })

  if (error) {
    console.error('[quickcheck] insert failed:', error.message)
    return NextResponse.json({ error: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, score: result.score, verdict: result.verdict })
}
