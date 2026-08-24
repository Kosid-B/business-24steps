import { describe, it, expect } from 'vitest'
import { readiness, hasEvidence, describeSkip, warnBeforeScale } from './gate'
import { GATES, EVIDENCE_THRESHOLDS, VERDICT_THRESHOLDS } from './constitution'

// ── ตัวช่วยสร้าง state ──────────────────────────────────────────────────────

/** กดว่า "ทำแล้ว" เฉย ๆ ไม่มีเนื้อหา — คือพฤติกรรมที่ธรรมนูญตั้งใจจับ */
const tick = (...steps: number[]) =>
  Object.fromEntries(steps.map((n) => [n, { done: true, data: {} }]))

/** ทำแล้วพร้อมหลักฐานจริง (เลือกรูปแบบข้อมูลให้ตรงชนิดของขั้นนั้น) */
const withEvidence = (...steps: number[]) =>
  Object.fromEntries(
    steps.map((n) => [
      n,
      {
        done: true,
        data: listSteps.has(n)
          ? { items: ['รายการที่หนึ่ง', 'รายการที่สอง', 'รายการที่สาม', 'รายการที่สี่'] }
          : calcSteps.has(n)
            ? { users: 50000, price: 1200 }
            : {
                a: 'สัมภาษณ์ผู้ใช้ปลายทางจริง 12 ราย พบว่าปัญหาซ้ำกัน 9 ราย',
                b: 'ทุกรายเคยจ่ายเงินซื้อทางแก้อื่นมาก่อนแล้วไม่ได้ผล',
              },
      },
    ]),
  )

const listSteps = new Set([1, 9, 20, 21])
const calcSteps = new Set([4, 14, 17, 19])

const ALL_24 = Array.from({ length: 24 }, (_, i) => i + 1)

// ── ธรรมนูญต้องประกอบถูกต้อง ────────────────────────────────────────────────

describe('ธรรมนูญ', () => {
  it('น้ำหนักของ 6 ประตูรวมกันได้ 100 พอดี', () => {
    expect(GATES.reduce((s, g) => s + g.weight, 0)).toBe(100)
  })

  it('ทุกประตูอ้างขั้นที่อยู่ในช่วง 1–24', () => {
    for (const g of GATES) {
      for (const n of g.steps) expect(n).toBeGreaterThanOrEqual(1)
      for (const n of g.steps) expect(n).toBeLessThanOrEqual(24)
    }
  })
})

// ── เคสหลัก ────────────────────────────────────────────────────────────────

describe('readiness', () => {
  it('state ว่างเปล่า → ไม่พร้อม คะแนน 0 และทุกประตูยังไม่เริ่ม', () => {
    const r = readiness({})
    expect(r.score).toBe(0)
    expect(r.verdict).toBe('not_ready')
    expect(r.gates.every((g) => g.status === 'missing')).toBe(true)
    expect(r.blockers.length).toBe(6)
  })

  it('ทำครบธีม "ลูกค้าคือใคร" พร้อมหลักฐาน → ประตูลูกค้าผ่าน ได้ 20 คะแนนเต็ม', () => {
    // ประตู customer_defined = ขั้น 1, 2, 4, 5 · น้ำหนัก 20
    // completion 1.0 · evidence 1.0 → 20 × (0.4 + 0.6) = 20
    const r = readiness({ progress: withEvidence(1, 2, 4, 5) })
    const gate = r.gates.find((g) => g.id === 'customer_defined')!
    expect(gate.status).toBe('pass')
    expect(gate.score).toBe(20)
    expect(r.score).toBe(20)
    expect(r.verdict).toBe('not_ready') // ประตูอื่นยังว่าง
  })

  it('⭐ กดว่าทำครบ 24 ขั้นแต่ไม่กรอกอะไรเลย → ได้ 40 คะแนน และยังไม่พร้อม', () => {
    // นี่คือเคสที่พิสูจน์ว่าธรรมนูญมีผลจริง ไม่ใช่คำโฆษณา
    // ทุกประตู completion = 1.0 · evidence = 0 → score = weight × 0.4
    // รวม = 100 × 0.4 = 40 ซึ่งต่ำกว่าเกณฑ์ ready (75)
    const r = readiness({ progress: tick(...ALL_24) })
    expect(r.score).toBe(40)
    expect(r.verdict).toBe('not_ready')
    expect(r.gates.every((g) => g.status === 'partial')).toBe(true)
    // ทุกประตูต้องรายงานว่าขั้นไหน "บาง"
    expect(r.gates.every((g) => g.thinSteps.length === g.missingSteps.length + g.thinSteps.length))
      .toBe(true)
  })

  it('ทำครบ 24 ขั้นพร้อมหลักฐานจริง → พร้อมขยายผล 100 คะแนน', () => {
    const r = readiness({ progress: withEvidence(...ALL_24) })
    expect(r.score).toBe(100)
    expect(r.verdict).toBe('ready')
    expect(r.gates.every((g) => g.status === 'pass')).toBe(true)
    expect(r.blockers).toEqual([])
    expect(r.nextBestAction).toBeNull()
  })

  it('มีหลักฐานแต่ยังไม่กดว่าทำแล้ว → ได้คะแนนส่วนหลักฐาน แต่ประตูยังไม่ผ่าน', () => {
    // ขั้น 1,2,4,5 มีข้อมูลแต่ done = false → completion 0 · evidence 1.0
    // 20 × 0.6 = 12
    const progress = Object.fromEntries(
      Object.entries(withEvidence(1, 2, 4, 5)).map(([k, v]) => [k, { ...v, done: false }]),
    )
    const r = readiness({ progress })
    const gate = r.gates.find((g) => g.id === 'customer_defined')!
    expect(gate.score).toBe(12)
    expect(gate.status).toBe('partial')
  })
})

// ── เคสที่ผู้ใช้ยกมา: "อยากยิง Ads 100,000 บาท" ─────────────────────────────

describe('เคส "อยากยิง Ads 100,000 บาท"', () => {
  // ผู้ใช้ทั่วไป: ตื่นเต้นกับไอเดีย ทำขั้นต้น ๆ ไปบ้าง แล้วอยากกระโดดไป scale
  const eagerFounder = { progress: { ...withEvidence(1, 2), ...tick(3, 7) } }

  it('ยังไม่ผ่าน Gate → ต้องได้ not_ready พร้อมเหตุผล', () => {
    const r = readiness(eagerFounder)
    expect(r.verdict).toBe('not_ready')
    expect(r.blockers.length).toBeGreaterThan(0)
  })

  it('Next Best Action ต้องเป็น validation ไม่ใช่ campaign', () => {
    const r = readiness(eagerFounder)
    expect(r.nextBestAction).not.toBeNull()
    // ประตูน้ำหนักสูงสุดที่ยังไม่ผ่านคือ problem_validated (25)
    expect(r.nextBestAction!.gateId).toBe('problem_validated')
    expect(r.nextBestAction!.stepNo).toBe(6) // ขั้น 3 เริ่มแล้ว → ขั้น 6 คือขั้นถัดไปที่ยังไม่เริ่ม
    expect(r.nextBestAction!.why).toContain('ปัญหาไม่จริง')
  })

  it('คำเตือนก่อนขยายผลต้องบอกคะแนนและอุปสรรค', () => {
    const r = readiness(eagerFounder)
    const w = warnBeforeScale('ยิงโฆษณาแบบเสียเงิน', r)
    expect(w).not.toBeNull()
    expect(w!.title).toContain('ยังไม่ควร')
    expect(w!.body.length).toBeGreaterThan(0)
  })

  it('พร้อมแล้วต้องไม่เตือน — ไม่ขวางคนที่ทำการบ้านมาแล้ว', () => {
    const r = readiness({ progress: withEvidence(...ALL_24) })
    expect(warnBeforeScale('ยิงโฆษณาแบบเสียเงิน', r)).toBeNull()
  })

  it('ข้าม Gate ได้ และการข้ามถูกบันทึกเป็นข้อมูล', () => {
    const r = readiness(eagerFounder)
    const skip = describeSkip('paid_ads', r)
    expect(skip.action).toBe('paid_ads')
    expect(skip.verdictAtSkip).toBe('not_ready')
    expect(skip.unmetGates).toContain('problem_validated')
    expect(skip.scoreAtSkip).toBe(r.score)
    expect(skip.constitutionVersion).toBe(r.constitutionVersion)
  })
})

// ── การตรวจหลักฐาน ─────────────────────────────────────────────────────────

describe('hasEvidence', () => {
  it('ไม่มี data เลย → ไม่ใช่หลักฐาน', () => {
    expect(hasEvidence(1, undefined)).toBe(false)
    expect(hasEvidence(1, { done: true })).toBe(false)
    expect(hasEvidence(1, { done: true, data: {} })).toBe(false)
  })

  it('ขั้นแบบ list: ต้องมีรายการไม่ว่างครบตามเกณฑ์', () => {
    const under = Array(EVIDENCE_THRESHOLDS.minListItems - 1).fill('ก')
    const exact = Array(EVIDENCE_THRESHOLDS.minListItems).fill('ก')
    expect(hasEvidence(1, { data: { items: under } })).toBe(false)
    expect(hasEvidence(1, { data: { items: exact } })).toBe(true)
  })

  it('ขั้นแบบ list: ช่องว่างเปล่าไม่นับ', () => {
    expect(hasEvidence(1, { data: { items: ['ก', '', '   ', ''] } })).toBe(false)
  })

  it('ขั้นแบบ calc: กรอก 0 ไว้เฉย ๆ ไม่ใช่การคำนวณ', () => {
    expect(hasEvidence(4, { data: { users: 0, price: 0 } })).toBe(false)
    expect(hasEvidence(4, { data: { users: 50000, price: 1200 } })).toBe(true)
  })

  it('ขั้นแบบข้อความ: สั้นเกินไปไม่นับเป็นหลักฐาน', () => {
    expect(hasEvidence(3, { data: { a: 'ดีมาก' } })).toBe(false)
  })

  it('ขั้นแบบข้อความ: ตอบยาวพอและตอบหลายช่อง → นับ', () => {
    const long = 'ก'.repeat(EVIDENCE_THRESHOLDS.minTextChars)
    expect(hasEvidence(3, { data: { a: long, b: 'มีเหตุผลรองรับ' } })).toBe(true)
  })

  it('ขั้นแบบข้อความ: ยาวพอแต่ตอบช่องเดียวจากสี่ช่อง → ยังไม่นับ', () => {
    const long = 'ก'.repeat(EVIDENCE_THRESHOLDS.minTextChars)
    expect(hasEvidence(3, { data: { a: long, b: '', c: '', d: '' } })).toBe(false)
  })
})

// ── เกณฑ์ตัดสิน ────────────────────────────────────────────────────────────

describe('เกณฑ์ verdict', () => {
  it('คะแนนถึงเกณฑ์ ready แต่ยังมีประตูที่ไม่เริ่มเลย → ยังไม่ ready', () => {
    // ทำ 5 ประตูแรกครบพร้อมหลักฐาน (25+20+20+15+10 = 90) เว้นประตูสุดท้ายไว้
    const steps = GATES.filter((g) => g.id !== 'evidence_sufficient').flatMap((g) => g.steps)
    const r = readiness({ progress: withEvidence(...steps) })
    expect(r.score).toBeGreaterThanOrEqual(VERDICT_THRESHOLDS.ready)
    // ขั้น 20 กับ 23 ถูกใช้ร่วมกับประตูอื่น จึงอาจไม่ 'missing' สนิท — ตรวจว่ายังไม่ ready ก็พอ
    const last = r.gates.find((g) => g.id === 'evidence_sufficient')!
    expect(last.status).not.toBe('pass')
    expect(r.verdict).not.toBe('ready')
  })
})
