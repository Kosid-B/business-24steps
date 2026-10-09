import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseFallbackLine, LEAD_FALLBACK_TAG } from '@/lib/lead/fallback'

// คุม insert ทีละเคส — ไม่ยิงเน็ตจริง เทสต์ต้องรันได้ตอนฐานหลับด้วย
const insert = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: () => ({ insert: (row: unknown) => insert(row) }) }),
}))

const { POST } = await import('./route')

const post = (body: unknown) =>
  POST(new Request('http://localhost/api/quickcheck', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }))

const goodBody = {
  email: 'Someone@Example.COM',
  consent: true,
  answers: {
    problem_validated: 'yes', customer_defined: 'yes', offer_validated: 'yes',
    unit_economics: 'yes', tracking_ready: 'yes', evidence_sufficient: 'yes',
  },
  utm_source: 'facebook',
  utm_medium: 'social',
}

let errs: string[]

beforeEach(() => {
  insert.mockReset()
  insert.mockResolvedValue({ error: null })
  errs = []
  vi.spyOn(console, 'error').mockImplementation((...a: unknown[]) => { errs.push(a.join(' ')) })
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

afterEach(() => vi.restoreAllMocks())

describe('POST /api/quickcheck — ทางปกติ', () => {
  it('บันทึกได้ → 200 · stored true · คะแนนคำนวณฝั่ง server', async () => {
    const res = await post(goodBody)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toMatchObject({ ok: true, stored: true, score: 100, verdict: 'ready' })
    expect(errs).toEqual([])
  })

  it('อีเมลถูกตัดช่องว่างและทำเป็นตัวพิมพ์เล็กก่อนเก็บ', async () => {
    await post({ ...goodBody, email: '  Someone@Example.COM  ' })
    expect(insert.mock.calls[0][0]).toMatchObject({ email: 'someone@example.com' })
  })

  it('ไม่เชื่อคะแนนที่ client ส่งมา — คำนวณใหม่เสมอ', async () => {
    const res = await post({ ...goodBody, score: 999, verdict: 'ready', answers: {} })
    expect((await res.json()).score).toBe(0) // ไม่ตอบอะไรเลย = 0 ไม่ใช่ 999
  })
})

describe('⭐ ฐานเก็บไม่ได้ ก็ต้องไม่หาย', () => {
  it('insert ถูกปฏิเสธ → ยังได้ 200 · stored false · lead ลง log กู้ได้', async () => {
    insert.mockResolvedValue({ error: { message: 'relation does not exist' } })

    const res = await post(goodBody)
    const json = await res.json()

    // คนตอบแบบเช็กต้องได้ผลลัพธ์ของเขา ไม่ใช่ได้ error
    expect(res.status).toBe(200)
    expect(json).toMatchObject({ ok: true, stored: false, score: 100 })

    // และ lead ต้องกู้คืนได้จริงจาก log ไม่ใช่แค่มีบรรทัดอะไรก็ได้
    expect(errs.length).toBe(1)
    const lead = parseFallbackLine(errs[0])
    expect(lead).not.toBeNull()
    expect(lead!.email).toBe('someone@example.com')
    expect(lead!.score).toBe(100)
    expect(lead!.utm_source).toBe('facebook')
    expect(lead!.consent).toBe(true)
    expect(lead!.reason).toContain('relation does not exist')
  })

  it('ฐานถูกพัก (client โยน exception) → ยังได้ 200 และ lead ไม่หาย', async () => {
    insert.mockRejectedValue(new Error('fetch failed'))
    const res = await post(goodBody)
    expect(res.status).toBe(200)
    expect((await res.json()).stored).toBe(false)
    expect(parseFallbackLine(errs[0])!.email).toBe('someone@example.com')
  })

  it('env ไม่ได้ตั้ง → ไม่ล้ม และ lead ไม่หาย', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    const res = await post(goodBody)
    expect(res.status).toBe(200)
    expect((await res.json()).stored).toBe(false)
    expect(insert).not.toHaveBeenCalled()
    expect(parseFallbackLine(errs[0])!.email).toBe('someone@example.com')
  })

  it('หนึ่ง lead ต้องอยู่ในหนึ่งบรรทัดเสมอ — log ถูกตัดท่อนแล้วยังกู้ได้', async () => {
    insert.mockResolvedValue({ error: { message: 'บรรทัด\nแรก\nมีขึ้นบรรทัดใหม่' } })
    await post({ ...goodBody, referrer: 'https://a.test/?x=1\n\ninjected' })
    expect(errs[0].split('\n').length).toBe(1)
    expect(parseFallbackLine(errs[0])).not.toBeNull()
  })
})

describe('PDPA — ไม่ยินยอมคือไม่แตะข้อมูลเลย', () => {
  it('ไม่ยินยอม → 400 · ไม่ insert · **ไม่ log** แม้แต่บรรทัดเดียว', async () => {
    const res = await post({ ...goodBody, consent: false })
    expect(res.status).toBe(400)
    expect(insert).not.toHaveBeenCalled()
    expect(errs.join('')).not.toContain(LEAD_FALLBACK_TAG)
    expect(errs.join('')).not.toContain('example.com')
  })

  it('ไม่ส่ง consent มาเลย ก็ถือว่าไม่ยินยอม', async () => {
    const noConsent: Record<string, unknown> = { ...goodBody }
    delete noConsent.consent
    const res = await post(noConsent)
    expect(res.status).toBe(400)
    expect(insert).not.toHaveBeenCalled()
    expect(errs).toEqual([])
  })

  it('เก็บข้อความและเวลาที่ยินยอมไว้ด้วย ไม่ใช่แค่ธงจริง/เท็จ', async () => {
    await post(goodBody)
    const row = insert.mock.calls[0][0]
    expect(row.consent).toBe(true)
    expect(row.consent_text.length).toBeGreaterThan(10)
    expect(Date.parse(row.consent_at)).not.toBeNaN()
  })
})

describe('ข้อมูลเข้าที่ใช้ไม่ได้', () => {
  it('อีเมลผิดรูปแบบ → 400 ไม่ insert ไม่ log', async () => {
    for (const email of ['', 'ไม่ใช่อีเมล', 'a@b', 'a@b.c', `${'a'.repeat(250)}@b.com`]) {
      insert.mockClear()
      const res = await post({ ...goodBody, email })
      expect(res.status, email).toBe(400)
      expect(insert).not.toHaveBeenCalled()
    }
    expect(errs).toEqual([])
  })

  it('body ไม่ใช่ JSON → 400', async () => {
    const res = await POST(new Request('http://localhost/api/quickcheck', { method: 'POST', body: 'ไม่ใช่ json' }))
    expect(res.status).toBe(400)
  })
})
