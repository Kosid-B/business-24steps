import { describe, it, expect } from 'vitest'
import { QUICKCHECK, evaluateQuickCheck, answersToInput, PDPA_CONSENT } from './quickcheck'
import { GATES } from './constitution'
import type { GateId } from './constitution'

const all = (a: 'yes' | 'partial' | 'no') =>
  Object.fromEntries(GATES.map((g) => [g.id, a])) as Record<GateId, 'yes' | 'partial' | 'no'>

describe('แบบเช็ก 6 ข้อ', () => {
  it('มี 6 คำถาม ตรงกับ 6 ประตูพอดี ไม่ขาดไม่เกิน', () => {
    expect(QUICKCHECK.length).toBe(6)
    expect(QUICKCHECK.map((q) => q.gateId).sort()).toEqual(GATES.map((g) => g.id).sort())
  })

  it('ทุกคำถามมีตัวอย่างช่วยตอบ ไม่ปล่อยให้เดา', () => {
    for (const q of QUICKCHECK) {
      expect(q.th.length).toBeGreaterThan(10)
      expect(q.hint.length).toBeGreaterThan(10)
    }
  })

  it('ตอบ "ยังไม่มี" ทุกข้อ → 0 คะแนน และบอกว่ายังไม่ควรลงทุนก้อนใหญ่', () => {
    const r = evaluateQuickCheck(all('no'))
    expect(r.score).toBe(0)
    expect(r.verdict).toBe('not_ready')
    expect(r.headline).toContain('ยังไม่ควรลงทุน')
    expect(r.topActions.length).toBe(3)
  })

  it('ตอบ "มีแล้ว" ทุกข้อ → เต็ม 100 และพร้อม', () => {
    const r = evaluateQuickCheck(all('yes'))
    expect(r.score).toBe(100)
    expect(r.verdict).toBe('ready')
    expect(r.topActions).toEqual([])
  })

  it('ตอบ "บางส่วน" ทุกข้อ → ได้คะแนนจากความคืบหน้าเท่านั้น ไม่ได้คะแนนหลักฐาน', () => {
    // partial = ทำครึ่งหนึ่งของขั้น ไม่มีหลักฐาน → ได้เฉพาะส่วน completion (น้ำหนัก 0.4)
    const r = evaluateQuickCheck(all('partial'))
    expect(r.score).toBeGreaterThan(0)
    expect(r.score).toBeLessThan(40) // ต่ำกว่ากรณีทำครบทุกขั้นแบบไม่มีหลักฐาน (40)
    expect(r.verdict).toBe('not_ready')
  })

  it('⭐ บอกว่ามีลูกค้าจ่ายเงินแล้ว แต่ไม่รู้ว่าเขามาจากไหน → ยังไม่พร้อม', () => {
    // เคสจริงที่พบบ่อย: ขายได้แล้วแต่ไม่มี tracking จึงขยายผลไม่ได้
    const r = evaluateQuickCheck({
      problem_validated: 'yes',
      customer_defined: 'yes',
      offer_validated: 'yes',
      unit_economics: 'yes',
      tracking_ready: 'no',
      evidence_sufficient: 'no',
    })
    expect(r.verdict).not.toBe('ready')
    const tracking = r.gates.find((g) => g.id === 'tracking_ready')!
    expect(tracking.status).toBe('missing')
    expect(r.topActions.some((a) => a.includes('วัดผล'))).toBe(true)
  })

  it('คำถามที่ไม่ได้ตอบ ถือว่ายังไม่มี ไม่ใช่ข้ามไป', () => {
    expect(evaluateQuickCheck({}).score).toBe(0)
    expect(evaluateQuickCheck({ problem_validated: 'yes' }).score).toBeGreaterThan(0)
  })

  it('ใช้ readiness() ตัวเดียวกับระบบ ไม่มีสูตรที่สอง', () => {
    const input = answersToInput(all('yes'))
    // ทุกขั้นที่ประตูอ้างถึงต้องถูกทำเครื่องหมายไว้
    const covered = new Set(Object.keys(input.progress ?? {}).map(Number))
    for (const g of GATES) for (const n of g.steps) expect(covered.has(n)).toBe(true)
  })
})

describe('PDPA', () => {
  it('checkbox ยินยอมต้องไม่ติ๊กมาให้ล่วงหน้า', () => {
    expect(PDPA_CONSENT.defaultChecked).toBe(false)
    expect(PDPA_CONSENT.required).toBe(true)
  })

  it('ต้องบอกวิธีถอนความยินยอม', () => {
    expect(PDPA_CONSENT.note).toContain('ถอนความยินยอม')
  })
})
