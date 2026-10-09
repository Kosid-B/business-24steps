import { describe, it, expect } from 'vitest'
import { evidenceLevel, EVIDENCE_LEVELS } from './level'
import { GATES, STEP_EVIDENCE_KIND } from './constitution'

const listSteps = new Set([1, 9, 20, 21])
const calcSteps = new Set([4, 14, 17, 19])

/** ทำแล้วพร้อมหลักฐานจริง (รูปแบบข้อมูลตรงชนิดของขั้น) */
const withEvidence = (...steps: number[]) =>
  Object.fromEntries(
    steps.map((n) => [
      n,
      {
        done: true,
        data: listSteps.has(n)
          ? { items: ['หลักฐานหนึ่ง', 'หลักฐานสอง', 'หลักฐานสาม'] }
          : calcSteps.has(n)
            ? { users: 50000, price: 1200 }
            : {
                a: 'สัมภาษณ์ผู้ใช้ปลายทางจริง 12 ราย ปัญหาซ้ำกัน 9 ราย มีหลักฐานบันทึกไว้',
                b: 'ทุกรายเคยจ่ายเงินซื้อทางแก้อื่นมาก่อน',
              },
      },
    ]),
  )

/** กดว่าทำแล้วเฉย ๆ ไม่มีเนื้อหา — พฤติกรรมที่ธรรมนูญตั้งใจจับ */
const tick = (...steps: number[]) =>
  Object.fromEntries(steps.map((n) => [n, { done: true, data: {} }]))

const ALL_24 = Array.from({ length: 24 }, (_, i) => i + 1)

describe('Evidence Level', () => {
  it('ขั้นบันไดเรียงจากน้อยไปมาก และเริ่มที่ 0', () => {
    expect(EVIDENCE_LEVELS[0].minScore).toBe(0)
    expect(EVIDENCE_LEVELS[0].lvl).toBe(0)
    for (let i = 1; i < EVIDENCE_LEVELS.length; i++) {
      expect(EVIDENCE_LEVELS[i].minScore).toBeGreaterThan(EVIDENCE_LEVELS[i - 1].minScore)
      expect(EVIDENCE_LEVELS[i].lvl).toBe(EVIDENCE_LEVELS[i - 1].lvl + 1)
    }
  })

  it('ยังไม่เริ่มอะไร → ระดับ 0 และบอกขั้นถัดไป', () => {
    const e = evidenceLevel({})
    expect(e.lvl).toBe(0)
    expect(e.score).toBe(0)
    expect(e.gatesPassed).toBe(0)
    expect(e.gatesTotal).toBe(GATES.length)
    expect(e.nextStep).not.toBeNull()
  })

  it('ทำครบพร้อมหลักฐานจริง → ระดับสูงสุด และไม่มีขั้นถัดไป', () => {
    const e = evidenceLevel({ progress: withEvidence(...ALL_24) })
    expect(e.score).toBe(100)
    expect(e.lvl).toBe(5)
    expect(e.gatesPassed).toBe(GATES.length)
    expect(e.nextStep).toBeNull()
    expect(e.warning).toBeNull()
  })

  it('⭐ กดว่าทำครบ 24 ขั้นแต่ไม่กรอกอะไร → คะแนน 40 ระดับยังแค่ 2 ไม่ใช่ 5', () => {
    // นี่คือเคสที่พิสูจน์ว่าแกนใหม่วัดความจริง ไม่ใช่ความขยัน
    const e = evidenceLevel({ progress: tick(...ALL_24) })
    expect(e.score).toBe(40)
    expect(e.lvl).toBe(2)
    expect(e.gatesPassed).toBe(0) // ไม่มีประตูไหนผ่านเลย ทั้งที่กดครบทุกขั้น
  })

  it('⭐ XP สูงแต่หลักฐาน 0 → ต้องเตือน ไม่ใช่ซ่อนไว้', () => {
    const e = evidenceLevel({}, 5000) // ยศแชมป์ แต่ไม่มีหลักฐานสักชิ้น
    expect(e.lvl).toBe(0)
    expect(e.warning).not.toBeNull()
    expect(e.warning).toContain('หลักฐาน')
  })

  it('XP สูงและหลักฐานตามทัน → ไม่เตือน', () => {
    const e = evidenceLevel({ progress: withEvidence(...ALL_24) }, 5000)
    expect(e.lvl).toBe(5)
    expect(e.warning).toBeNull()
  })

  it('XP ยังน้อย ระดับหลักฐานน้อยตามกัน → ไม่เตือน (เพิ่งเริ่มเป็นเรื่องปกติ)', () => {
    const e = evidenceLevel({ progress: withEvidence(1, 2) }, 200)
    expect(e.warning).toBeNull()
  })

  it('ระดับขึ้นตามคะแนนที่เพิ่ม — ไม่ลดลงเมื่อทำมากขึ้น', () => {
    const steps = GATES.flatMap((g) => g.steps)
    let prev = -1
    for (let i = 0; i <= steps.length; i++) {
      const e = evidenceLevel({ progress: withEvidence(...steps.slice(0, i)) })
      expect(e.lvl).toBeGreaterThanOrEqual(prev)
      prev = e.lvl
    }
  })

  it('ทุกขั้นที่เทสต์ใช้ มีชนิดหลักฐานประกาศไว้ใน STEP_EVIDENCE_KIND', () => {
    for (const n of ALL_24) expect(STEP_EVIDENCE_KIND[n]).toBeDefined()
  })
})
