/**
 * กันไม่ให้ lead หายเมื่อฐานข้อมูลเก็บไม่ได้
 *
 * ปัญหาที่แก้: เดิม insert พัง → route ตอบ 500 → อีเมลที่คนตัดสินใจให้มาแล้วหายไปเฉย ๆ
 * ซึ่งเป็นความเสียหายที่แพงที่สุดในกระบวนการทั้งหมด เพราะเกิด *หลัง* เขายอมให้ข้อมูลแล้ว
 * และสถานะปัจจุบันของฐาน (INACTIVE) ทำให้มันเกิดทุกครั้ง ไม่ใช่กรณียกเว้น
 *
 * ทางที่เลือก: เขียนลง log ด้วยรูปแบบที่แน่นอน แล้วตอบ 200 ให้คนได้ผลลัพธ์ของเขา
 * log ของ runtime อ่านย้อนได้ จึงกู้ lead ออกมากรอกเข้าฐานทีหลังได้จริง ไม่ใช่แค่ทิ้งไว้
 *
 * ข้อจำกัดที่ยอมรับ: log มีอายุสั้นกว่าฐานข้อมูล นี่คือทางสำรอง ไม่ใช่ที่เก็บถาวร
 * PDPA: เขียนลง log เฉพาะเมื่อยินยอมแล้ว และเพื่อวัตถุประสงค์เดียวกับที่ยินยอม
 *       (ติดต่อกลับ) เท่านั้น — ไม่ยินยอมไม่บันทึกและไม่ log ไม่มีข้อยกเว้น
 *
 * ฟังก์ชันบริสุทธิ์ — ไม่เรียก console เอง ให้ผู้เรียกเป็นคนเขียน เพื่อเทสต์ได้ตรง ๆ
 */

/** คำนำหน้าคงที่ ใช้ grep หา lead ที่ตกหล่นจาก runtime log */
export const LEAD_FALLBACK_TAG = '[quickcheck][LEAD_FALLBACK]'

export interface LeadRow {
  email: string
  answers: unknown
  score: number
  verdict: string
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  seg: string | null
  referrer: string | null
  consent: true
  consent_text: string
  consent_at: string
}

/**
 * บรรทัดเดียวที่ parse เป็น JSON ได้ — เพื่อให้ดึงออกจาก log ด้วยเครื่องได้
 * ตัด newline ทุกตัวออก เพราะหนึ่ง lead ต้องอยู่ในหนึ่งบรรทัดเสมอ
 * ไม่งั้นเวลา log ถูกตัดท่อน จะได้ครึ่ง ๆ กลาง ๆ ที่กู้ไม่ได้
 */
export function fallbackLine(row: LeadRow, reason: string): string {
  return `${LEAD_FALLBACK_TAG} ${JSON.stringify({ reason, ...row }).replace(/\n/g, ' ')}`
}

/** อ่าน lead กลับจากบรรทัด log — ใช้ตอนกู้ข้อมูล และใช้ในเทสต์ว่าบรรทัดนั้นกู้ได้จริง */
export function parseFallbackLine(line: string): (LeadRow & { reason: string }) | null {
  const i = line.indexOf(LEAD_FALLBACK_TAG)
  if (i < 0) return null
  try {
    return JSON.parse(line.slice(i + LEAD_FALLBACK_TAG.length))
  } catch {
    return null
  }
}
