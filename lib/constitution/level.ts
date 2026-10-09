/**
 * Evidence Level — แกนวัดที่สองคู่ขนานกับ XP
 *
 * ปัญหาที่แก้: `getXp()` ใน lib/game.ts ให้รางวัลกับ *กิจกรรม* ล้วน ๆ
 *   ก้าวสำเร็จ × 100 + บทเรียน × 40 + จับคู่ × 120 + นัด Consult × 60
 * ผู้ก่อตั้งจึงไต่ถึงยศสูงสุดได้โดยไม่มีลูกค้า ไม่มีหลักฐาน ไม่มีรายได้
 * ซึ่งขัดข้อห้ามข้อ 4 ของธรรมนูญ (docs/founder-constitution.md §8)
 *
 * ทางที่เลือก: **ไม่แก้ `getXp()` แม้แต่บรรทัดเดียว** — ไม่มีใครเสียยศที่ได้มาแล้ว
 * แต่เพิ่มแกนที่สองที่วัด *ความจริง* ไม่ใช่ความขยัน แล้วแสดงคู่กัน
 *
 *   XP             = ทำอะไรไปเท่าไร    (ความขยัน)
 *   Evidence Level = พิสูจน์อะไรได้แล้ว (ความจริง)
 *
 * สองแกนนี้ต่างกันได้มาก และ "ช่องว่าง" ระหว่างมันคือข้อมูลที่มีประโยชน์ที่สุด:
 * XP สูงแต่ Evidence Level ต่ำ = ขยันแต่ยังไม่พิสูจน์อะไร ซึ่งคือสัญญาณเตือนล่วงหน้า
 * ที่ธรรมนูญต้องการให้ผู้ก่อตั้งเห็น ก่อนจะเอาเงินไปลงกับสิ่งที่ยังไม่จริง
 *
 * ฟังก์ชันบริสุทธิ์ — ไม่แตะ DB ไม่แตะ React · ใช้ readiness() ที่มีอยู่ ไม่มีสูตรที่สอง
 */

import { readiness, type ReadinessInput } from './gate'

/** ระดับหลักฐาน 0–5 — ขั้นบันไดจากคะแนนความพร้อม 0–100 */
export interface EvidenceBand {
  lvl: number
  th: string
  minScore: number
  color: string
}

export const EVIDENCE_LEVELS: readonly EvidenceBand[] = [
  { lvl: 0, th: 'ยังไม่มีหลักฐาน', minScore: 0, color: '#8E8676' },
  { lvl: 1, th: 'เริ่มหาหลักฐาน', minScore: 10, color: '#8E8676' },
  { lvl: 2, th: 'มีหลักฐานบางส่วน', minScore: 30, color: '#A87A1E' },
  { lvl: 3, th: 'หลักฐานพอให้ทดลอง', minScore: 50, color: '#A87A1E' },
  { lvl: 4, th: 'หลักฐานแน่นพอจะลงทุน', minScore: 70, color: '#2F4B7C' },
  { lvl: 5, th: 'พิสูจน์ครบทุกด้าน', minScore: 90, color: '#16704A' },
]

export interface EvidenceLevel {
  /** 0–5 */
  lvl: number
  th: string
  color: string
  /** คะแนนความพร้อมดิบ 0–100 จาก readiness() */
  score: number
  /** ประตูที่ผ่านแล้ว / ทั้งหมด */
  gatesPassed: number
  gatesTotal: number
  /** สิ่งที่ขาดเพื่อขึ้นระดับถัดไป — null เมื่ออยู่ระดับสูงสุดแล้ว */
  nextStep: string | null
  /** ช่องว่างระหว่างความขยันกับความจริง ใช้เตือนเมื่อ XP วิ่งนำหลักฐานไปไกล */
  warning: string | null
}

/**
 * คำนวณระดับหลักฐานจากความคืบหน้า 24 ขั้น
 *
 * @param input  state จาก AppContext ใช้ได้ตรง ๆ (structural typing)
 * @param xp     XP ปัจจุบันจาก getXp() — ใช้เทียบหาช่องว่างเท่านั้น ไม่เอามาคิดคะแนน
 */
export function evidenceLevel(input: ReadinessInput, xp = 0): EvidenceLevel {
  const r = readiness(input)
  const gatesPassed = r.gates.filter((g) => g.status === 'pass').length

  // ระดับสูงสุดที่คะแนนถึง
  let band = EVIDENCE_LEVELS[0]
  for (const b of EVIDENCE_LEVELS) if (r.score >= b.minScore) band = b

  const next = EVIDENCE_LEVELS.find((b) => b.minScore > r.score)

  return {
    lvl: band.lvl,
    th: band.th,
    color: band.color,
    score: r.score,
    gatesPassed,
    gatesTotal: r.gates.length,
    nextStep: next
      ? r.nextBestAction
        ? `ถึงระดับ ${next.lvl} (${next.th}) โดย${r.nextBestAction.th}`
        : `ถึงระดับ ${next.lvl} ต้องได้คะแนนความพร้อม ${next.minScore}`
      : null,
    warning: gapWarning(xp, band.lvl),
  }
}

/**
 * เตือนเมื่อความขยันวิ่งนำความจริงไปไกล
 *
 * เกณฑ์: XP ระดับ "นักสร้าง" ขึ้นไป (1,200) แต่ระดับหลักฐานยังไม่ถึง 2
 * แปลว่าทำไปมากแต่ยังพิสูจน์อะไรไม่ได้ — ตรงกับสิ่งที่ธรรมนูญห้าม
 */
function gapWarning(xp: number, lvl: number): string | null {
  if (xp >= 1200 && lvl < 2) {
    return 'คุณทำมาเยอะแล้ว แต่ยังไม่มีหลักฐานจากลูกค้าหรือตลาดรองรับ — ก่อนลงเงินเพิ่ม ให้เก็บหลักฐานก่อน'
  }
  if (xp >= 2500 && lvl < 3) {
    return 'XP สูงแต่หลักฐานยังตามไม่ทัน — ความขยันไม่ใช่ความจริง ลองกลับไปที่ขั้นที่ยังไม่มีหลักฐาน'
  }
  return null
}
