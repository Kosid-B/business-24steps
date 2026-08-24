/**
 * Founder Mindset Engine — ตัวบังคับใช้ธรรมนูญ
 *
 * หน้าที่เดียว: ตอบว่า "ธุรกิจนี้พร้อมขยายผลหรือยัง และถ้ายัง ควรทำอะไรถัดไป"
 *
 * กติกาการออกแบบ
 * 1. **ฟังก์ชันบริสุทธิ์ทั้งหมด** — ไม่แตะ DB ไม่แตะ network ไม่แตะ React
 *    เพื่อให้ทดสอบได้ตรง ๆ และเรียกได้ทั้งฝั่ง client, server และ agent
 * 2. **ไม่ block ผู้ใช้** — คืนคำตัดสินกับเหตุผลให้ UI ตัดสินใจ
 *    ตามนโยบาย "เตือนแรง แต่ข้ามได้" · การข้ามต้องถูกบันทึกด้วย describeSkip()
 * 3. **ไม่เดาแทนความไม่รู้** — ยังไม่มีข้อมูลก็บอกว่าไม่มี ไม่แสดงเป็น 0 เฉย ๆ
 *    (ธรรมนูญข้อ FORBIDDEN.hide_uncertainty)
 */

import {
  GATES,
  EVIDENCE_THRESHOLDS,
  SCORE_WEIGHTS,
  VERDICT_THRESHOLDS,
  STEP_EVIDENCE_KIND,
  CONSTITUTION_VERSION,
  type GateId,
  type GateSpec,
} from './constitution'

// ── รูปร่างข้อมูลขาเข้า ─────────────────────────────────────────────────────
// จงใจนิยามแบบ structural ไม่ import AppState เข้ามา
// เพื่อให้ engine ไม่ผูกกับ type ของแอป (AppState ใช้ได้อยู่แล้วโดยอัตโนมัติ)

export interface StepRecordLike {
  done?: boolean
  data?: Record<string, unknown>
}

export interface ReadinessInput {
  progress?: Record<number, StepRecordLike | undefined>
}

export type GateStatus = 'pass' | 'partial' | 'missing'
export type Verdict = 'ready' | 'risky' | 'not_ready'

export interface GateResult {
  id: GateId
  th: string
  en: string
  weight: number
  status: GateStatus
  /** สัดส่วนขั้นที่กดว่า "ทำแล้ว" (0–1) */
  completion: number
  /** สัดส่วนขั้นที่มีเนื้อหาจริง (0–1) */
  evidence: number
  /** คะแนนที่ได้จากประตูนี้ (0–weight) */
  score: number
  /** ขั้นที่ยังไม่ได้เริ่มเลย */
  missingSteps: number[]
  /** ขั้นที่กดว่าทำแล้ว แต่ยังไม่มีเนื้อหาพอจะเรียกว่าหลักฐาน */
  thinSteps: number[]
  why: string
}

export interface NextBestAction {
  th: string
  why: string
  gateId: GateId
  stepNo?: number
}

export interface Readiness {
  constitutionVersion: string
  /** 0–100 ถ่วงน้ำหนักตาม GATES */
  score: number
  verdict: Verdict
  gates: GateResult[]
  /** ประโยคสั้น ๆ ที่เอาไปแสดงเป็นคำเตือนได้เลย */
  blockers: string[]
  nextBestAction: NextBestAction | null
}

// ── ตรวจว่า "มีเนื้อหาจริง" ไหม ────────────────────────────────────────────

const asText = (v: unknown): string => {
  if (typeof v === 'string') return v
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : ''
  if (Array.isArray(v)) return v.map(asText).join(' ')
  return ''
}

/**
 * ขั้นนี้มีหลักฐานพอจะนับได้ไหม
 *
 * ข้อจำกัดที่ยอมรับตรง ๆ: วันนี้ตรวจได้แค่ "มีเนื้อหาหรือเปล่า" ยังตรวจ "คุณภาพ" ไม่ได้
 * เพราะระบบเก็บคำตอบเป็นข้อความอิสระ — ดู docs/constitution-derivation.md
 */
export function hasEvidence(stepNo: number, rec: StepRecordLike | undefined): boolean {
  const data = rec?.data
  if (!data) return false
  const values = Object.values(data)
  if (values.length === 0) return false

  const kind = STEP_EVIDENCE_KIND[stepNo] ?? 'text'

  if (kind === 'list') {
    const items = values
      .flatMap((v) => (Array.isArray(v) ? v : [v]))
      .map(asText)
      .map((s) => s.trim())
      .filter(Boolean)
    return items.length >= EVIDENCE_THRESHOLDS.minListItems
  }

  if (kind === 'calc') {
    // ตัวเลขต้องกรอกครบและมากกว่าศูนย์ — กรอก 0 ไว้เฉย ๆ ไม่ใช่การคำนวณ
    const nums = values.map((v) => (typeof v === 'number' ? v : Number(asText(v))))
    return nums.length > 0 && nums.every((n) => Number.isFinite(n) && n > 0)
  }

  // text (notes / fields)
  const texts = values.map(asText).map((s) => s.trim())
  const filled = texts.filter(Boolean)
  const chars = filled.join('').length
  const ratio = filled.length / texts.length
  return chars >= EVIDENCE_THRESHOLDS.minTextChars && ratio >= EVIDENCE_THRESHOLDS.minFilledRatio
}

// ── คิดผลของประตูหนึ่งบาน ──────────────────────────────────────────────────

function evaluateGate(spec: GateSpec, input: ReadinessInput): GateResult {
  const progress = input.progress ?? {}
  const missingSteps: number[] = []
  const thinSteps: number[] = []
  let doneCount = 0
  let evidenceCount = 0

  for (const n of spec.steps) {
    const rec = progress[n]
    const done = rec?.done === true
    const evidenced = hasEvidence(n, rec)
    if (done) doneCount++
    if (evidenced) evidenceCount++
    if (!done && !evidenced) missingSteps.push(n)
    else if (!evidenced) thinSteps.push(n)
  }

  const total = spec.steps.length
  const completion = total ? doneCount / total : 0
  const evidence = total ? evidenceCount / total : 0
  const score =
    spec.weight * (SCORE_WEIGHTS.completion * completion + SCORE_WEIGHTS.evidence * evidence)

  let status: GateStatus
  if (completion >= 1 && evidence >= EVIDENCE_THRESHOLDS.gatePassEvidence) status = 'pass'
  else if (doneCount > 0 || evidenceCount > 0) status = 'partial'
  else status = 'missing'

  return {
    id: spec.id,
    th: spec.th,
    en: spec.en,
    weight: spec.weight,
    status,
    completion: round2(completion),
    evidence: round2(evidence),
    score: round2(score),
    missingSteps,
    thinSteps,
    why: spec.why,
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100

// ── ผลรวม ──────────────────────────────────────────────────────────────────

/**
 * ประเมินความพร้อมขยายผลจากความคืบหน้า 24 ขั้น
 *
 * @example
 * const r = readiness(state)
 * if (r.verdict !== 'ready') showWarning(r.blockers, r.nextBestAction)
 */
export function readiness(input: ReadinessInput): Readiness {
  const gates = GATES.map((g) => evaluateGate(g, input))
  const score = round2(gates.reduce((sum, g) => sum + g.score, 0))

  // "พร้อม" ต้องผ่าน **ทุกประตู** ไม่ใช่แค่คะแนนรวมถึงเกณฑ์
  //
  // เหตุผล: ถ้าดูแค่คะแนนรวม ประตูที่แข็งแรงจะกลบประตูที่ยังไม่ผ่านได้
  // เช่น ผ่าน 5 ประตูเต็ม (90 คะแนน) แต่ยังไม่เคยทดสอบสมมติฐานเลย
  // คะแนนจะขึ้นไปถึง 96 แล้วระบบจะบอกว่า "พร้อมยิง Ads" ทั้งที่ยังไม่มีหลักฐาน
  // — ขัดธรรมนูญข้อ Evidence > Opinion ตรง ๆ (เคสนี้มี unit test คุมไว้)
  const allPass = gates.every((g) => g.status === 'pass')
  let verdict: Verdict
  if (score >= VERDICT_THRESHOLDS.ready && allPass) verdict = 'ready'
  else if (score >= VERDICT_THRESHOLDS.risky) verdict = 'risky'
  else verdict = 'not_ready'

  const blockers = gates
    .filter((g) => g.status !== 'pass')
    .sort((a, b) => b.weight - a.weight)
    .map((g) => {
      if (g.status === 'missing') return `${g.th} — ยังไม่ได้เริ่ม`
      if (g.thinSteps.length) return `${g.th} — กดว่าทำแล้วแต่ยังไม่มีหลักฐานในขั้น ${g.thinSteps.join(', ')}`
      return `${g.th} — ยังทำไม่ครบ (ขั้นที่เหลือ ${g.missingSteps.join(', ')})`
    })

  return {
    constitutionVersion: CONSTITUTION_VERSION,
    score,
    verdict,
    gates,
    blockers,
    nextBestAction: pickNextBestAction(gates),
  }
}

/**
 * เลือกสิ่งที่ควรทำถัดไป — ประตูที่น้ำหนักมากที่สุดที่ยังไม่ผ่าน
 * ภายในประตูนั้นเลือกขั้นที่ยังไม่เริ่มก่อน ถ้าเริ่มหมดแล้วจึงเลือกขั้นที่หลักฐานบาง
 */
export function pickNextBestAction(gates: GateResult[]): NextBestAction | null {
  const candidates = gates
    .filter((g) => g.status !== 'pass')
    .sort((a, b) => b.weight - a.weight || a.score - b.score)
  const g = candidates[0]
  if (!g) return null

  const stepNo = g.missingSteps[0] ?? g.thinSteps[0]
  const th = stepNo
    ? `ทำก้าวที่ ${stepNo} ให้เสร็จพร้อมหลักฐาน เพื่อปิดประตู "${g.th}"`
    : `เก็บหลักฐานเพิ่มให้ประตู "${g.th}"`

  return { th, why: g.why, gateId: g.id, stepNo }
}

// ── การข้าม Gate ───────────────────────────────────────────────────────────

export interface SkipRecord {
  constitutionVersion: string
  action: string
  scoreAtSkip: number
  verdictAtSkip: Verdict
  unmetGates: GateId[]
  blockers: string[]
}

/**
 * สร้างบันทึกการข้าม Gate ให้เอาไปเก็บเป็นข้อมูลได้
 *
 * นี่คือจุดที่ Outcome Dataset เริ่มมีของจริง — ถ้าไม่บันทึกการข้าม
 * เราจะไม่มีวันตอบได้ว่า "คนที่ validate ก่อน scale ได้ผลดีกว่าจริงไหม"
 * ซึ่งเป็นคำถามที่ทำให้ Decision Engine เก่งขึ้น (หลัก Compounding Learning)
 *
 * ตัว engine ไม่บันทึกเอง — ผู้เรียกเป็นคนตัดสินใจว่าจะเก็บที่ไหน
 */
export function describeSkip(action: string, r: Readiness): SkipRecord {
  return {
    constitutionVersion: r.constitutionVersion,
    action,
    scoreAtSkip: r.score,
    verdictAtSkip: r.verdict,
    unmetGates: r.gates.filter((g) => g.status !== 'pass').map((g) => g.id),
    blockers: r.blockers,
  }
}

/**
 * ข้อความเตือนสำหรับการขยายผล เช่น "อยากยิง Ads 100,000 บาท"
 * คืน null เมื่อพร้อมแล้ว — ผู้เรียกไม่ต้องแสดงอะไร
 */
export function warnBeforeScale(
  actionTh: string,
  r: Readiness,
): { title: string; body: string[]; nextBestAction: NextBestAction | null } | null {
  if (r.verdict === 'ready') return null
  const head =
    r.verdict === 'not_ready'
      ? `ยังไม่ควร${actionTh} — ความพร้อม ${r.score}/100`
      : `${actionTh}ได้ แต่เสี่ยง — ความพร้อม ${r.score}/100`
  return { title: head, body: r.blockers, nextBestAction: r.nextBestAction }
}
