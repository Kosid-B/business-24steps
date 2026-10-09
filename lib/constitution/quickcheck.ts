/**
 * เช็ก 6 ข้อก่อนลงทุนกับไอเดียธุรกิจ — ข้อเสนอเก็บ lead หน้าเว็บ
 *
 * ทำไมต้องมี: ตอนนี้เว็บมีสองสถานะเท่านั้น "อ่านเฉย ๆ" หรือ "สมัครเต็มรูปแบบ"
 * ไม่มีอะไรอยู่ตรงกลาง จึงเก็บ lead ได้ 0 คนจาก 85 session (ดู docs/marketing-diagnosis.md)
 *
 * ตัวนี้คือขั้นกลางนั้น — ตอบ 6 คำถาม 2 นาที ได้คะแนนความพร้อมกลับไป
 * โดย **ใช้ Validation Gate ตัวเดียวกับในระบบ** ไม่ได้สร้างตรรกะซ้ำ
 * คนที่ทำเช็กนี้จึงได้ชิมของจริงของผลิตภัณฑ์ ไม่ใช่แบบทดสอบการตลาดที่แยกส่วน
 *
 * ฟังก์ชันบริสุทธิ์ทั้งหมด — ไม่แตะ DB ไม่แตะ network
 */

import { GATES, STEP_EVIDENCE_KIND, type GateId } from './constitution'
import { readiness, type Readiness, type ReadinessInput } from './gate'

/** คำตอบของแต่ละข้อ — ตั้งใจให้มีแค่ 3 ระดับ เพื่อให้ตอบจบใน 2 นาที */
export type Answer = 'yes' | 'partial' | 'no'

export interface QuickCheckQuestion {
  gateId: GateId
  /** คำถามที่ใช้ถามคนทั่วไป — ไม่ใช้ศัพท์ธุรกิจ */
  th: string
  /** ตัวอย่างที่ช่วยให้ตอบตรง ไม่ต้องเดา */
  hint: string
}

/**
 * 6 คำถาม = 6 ประตูของ Validation Gate เรียงตามน้ำหนัก
 * ถ้อยคำถูกเขียนใหม่ให้คนที่ยังไม่รู้จักเราตอบได้ทันที
 */
export const QUICKCHECK: readonly QuickCheckQuestion[] = [
  {
    gateId: 'problem_validated',
    th: 'คุณเคยคุยกับคนที่มีปัญหานี้จริง ๆ กี่คน',
    hint: 'นับเฉพาะคนที่ไม่ใช่เพื่อนหรือญาติ — คนที่ไม่เกรงใจคุณ',
  },
  {
    gateId: 'customer_defined',
    th: 'คุณบอกได้ไหมว่าลูกค้าคนแรกของคุณคือใคร',
    hint: 'ชัดระดับที่พูดได้ว่า อายุเท่าไร ทำอาชีพอะไร อยู่ที่ไหน เจอเขาได้ที่ไหน',
  },
  {
    gateId: 'offer_validated',
    th: 'มีใครจ่ายเงินหรือวางมัดจำให้คุณแล้วหรือยัง',
    hint: 'คำว่า "น่าสนใจนะ" ไม่นับ — นับเฉพาะเงินที่ออกจากกระเป๋าเขาจริง',
  },
  {
    gateId: 'unit_economics',
    th: 'คุณรู้ไหมว่าขายหนึ่งชิ้นแล้วเหลือกำไรเท่าไร',
    hint: 'หักต้นทุนของ ค่าส่ง ค่าธรรมเนียม และเวลาของคุณเองแล้ว',
  },
  {
    gateId: 'tracking_ready',
    th: 'ถ้าวันนี้มีคนซื้อ คุณรู้ไหมว่าเขามาจากทางไหน',
    hint: 'จากโพสต์ไหน เพจไหน หรือใครแนะนำ',
  },
  {
    gateId: 'evidence_sufficient',
    th: 'คุณเคยจดบันทึกสิ่งที่ทดลองแล้วไม่ได้ผลไว้ไหม',
    hint: 'สิ่งที่ไม่ได้ผลมีค่าพอ ๆ กับสิ่งที่ได้ผล ถ้าจดไว้',
  },
]

export type QuickCheckAnswers = Partial<Record<GateId, Answer>>

/**
 * แปลงคำตอบ 6 ข้อให้เป็นรูปแบบเดียวกับความคืบหน้า 24 ขั้น
 * เพื่อส่งเข้า readiness() ตัวเดียวกับที่ระบบใช้ — ไม่มีสูตรที่สอง
 *
 *   yes     → ทุกขั้นของประตูนั้นถือว่าทำแล้วและมีหลักฐาน
 *   partial → ทำแล้วครึ่งหนึ่ง (ปัดขึ้น) ไม่มีหลักฐาน
 *   no      → ยังไม่เริ่ม
 */
export function answersToInput(answers: QuickCheckAnswers): ReadinessInput {
  const progress: Record<number, { done: boolean; data: Record<string, unknown> }> = {}

  for (const g of GATES) {
    const a = answers[g.id] ?? 'no'
    if (a === 'no') continue
    const steps = a === 'yes' ? g.steps : g.steps.slice(0, Math.ceil(g.steps.length / 2))
    for (const n of steps) {
      progress[n] = { done: true, data: a === 'yes' ? evidenceFor(n) : {} }
    }
  }
  return { progress }
}

/**
 * สร้างหลักฐานให้ตรง "ชนิด" ของขั้นนั้น
 *
 * สำคัญ: ต้องเคารพสัญญาของ hasEvidence() ไม่ใช่ผ่อนเกณฑ์ให้ตัวเองผ่าน
 * ถ้าขั้นนั้นเป็นรายการ ก็ต้องส่งรายการ ถ้าเป็นตัวเลข ก็ต้องส่งตัวเลข
 * (บั๊กรอบแรก: ส่งข้อความเดียวให้ทุกขั้น ทำให้ขั้นแบบรายการและแบบคำนวณไม่ผ่านทั้งหมด)
 */
function evidenceFor(stepNo: number): Record<string, unknown> {
  const kind = STEP_EVIDENCE_KIND[stepNo] ?? 'text'
  if (kind === 'list') {
    return { items: [CONFIRMED, 'ยืนยันแล้วจากผู้ตอบ', 'มีหลักฐานรองรับ'] }
  }
  if (kind === 'calc') {
    return { confirmed: 1 }
  }
  return { a: CONFIRMED, b: 'ผู้ตอบยืนยันว่ามีหลักฐานรองรับข้อนี้แล้ว' }
}

const CONFIRMED =
  'ยืนยันจากแบบเช็ก 6 ข้อ ผู้ตอบระบุว่าข้อนี้มีหลักฐานจากลูกค้าหรือตลาดจริงรองรับแล้ว'

export interface QuickCheckResult extends Readiness {
  /** ข้อความสรุปสั้น ๆ ที่แสดงบนหน้าผลลัพธ์ได้ทันที */
  headline: string
  /** ขั้นที่ควรลงมือ 3 อย่างแรก */
  topActions: string[]
}

/** ประเมินผลจากคำตอบ 6 ข้อ */
export function evaluateQuickCheck(answers: QuickCheckAnswers): QuickCheckResult {
  const r = readiness(answersToInput(answers))

  const headline =
    r.verdict === 'ready'
      ? `ความพร้อม ${r.score}/100 — คุณมีหลักฐานพอจะลงทุนเพิ่มแล้ว`
      : r.verdict === 'risky'
        ? `ความพร้อม ${r.score}/100 — เริ่มได้ แต่ยังมีจุดที่ต้องพิสูจน์ก่อนใช้เงินก้อนใหญ่`
        : `ความพร้อม ${r.score}/100 — ยังไม่ควรลงทุนก้อนใหญ่ตอนนี้`

  const topActions = r.gates
    .filter((g) => g.status !== 'pass')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((g) => `${g.th} — ${g.why}`)

  return { ...r, headline, topActions }
}

/**
 * ข้อความขอความยินยอมตาม PDPA — ต้องแสดงคู่กับช่องกรอกอีเมลเสมอ
 * และ checkbox ต้อง **ไม่ติ๊กมาให้ล่วงหน้า**
 */
export const PDPA_CONSENT = {
  label:
    'ยินยอมให้ CEO AI Thailand เก็บอีเมลเพื่อส่งผลการประเมินและเนื้อหาที่เกี่ยวข้อง',
  note: 'ถอนความยินยอมได้ทุกเมื่อที่ลิงก์ท้ายอีเมล',
  required: true,
  defaultChecked: false,
} as const
