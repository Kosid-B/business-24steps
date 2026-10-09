/**
 * CEO AI Thailand — Founder Constitution (ฉบับที่เครื่องอ่านได้)
 *
 * ไฟล์นี้คือ "ธรรมนูญ" ในรูปแบบข้อมูล ไม่ใช่ข้อความโฆษณา
 * ทุกอย่างที่ระบบต้องบังคับใช้ต้องอยู่ที่นี่ที่เดียว — แก้ที่นี่แล้วมีผลทั้งระบบ
 *
 * ฉบับเต็มพร้อมเหตุผลอยู่ที่  docs/founder-constitution.md
 * ตัวบังคับใช้ (Founder Mindset Engine) อยู่ที่  lib/constitution/gate.ts
 *
 * กติกาของไฟล์นี้: **ห้าม import อะไรทั้งสิ้น** — ธรรมนูญต้องไม่ขึ้นกับ UI, DB หรือ framework
 * เพื่อให้เอาไปรันทดสอบ เอาไปใช้ฝั่ง server หรือส่งให้ agent อ่านได้เหมือนกันหมด
 */

export const CONSTITUTION_VERSION = '1.0.0'

// ══════════════════════════════ 1. Vision ══════════════════════════════

export const VISION = {
  th: 'ทำให้คนไทยทุกคนเปลี่ยนไอเดียให้เป็นธุรกิจที่มีลูกค้า มีหลักฐาน มีระบบ และขยายได้ ด้วย AI',
  moonshot_en: "Build Thailand's Business Intelligence Infrastructure",
  moonshot_th:
    'สร้างโครงสร้างพื้นฐาน AI ที่ช่วยให้คนไทยสร้างธุรกิจที่แข็งแรงและแข่งขันได้ในระดับโลก',
} as const

// ══════════════════════════════ 2. Mission ══════════════════════════════
// ห่วงโซ่ที่ธุรกิจต้องเดินผ่านตามลำดับ — ข้ามขั้นได้ แต่ระบบต้องรู้ว่ากำลังข้าม
// หมายเหตุ: ธีมในหลักสูตร 24 ขั้น (who/value/acquire/money/build/scale) ไม่มีขั้น "หลักฐาน"
// แยกออกมา — ธรรมนูญจึงยกมันขึ้นเป็นข้อหนึ่งของ Mission โดยเฉพาะ

export const MISSION_CHAIN = [
  { id: 'idea', th: 'ไอเดีย', en: 'Idea' },
  { id: 'customer', th: 'ลูกค้า', en: 'Customer' },
  { id: 'evidence', th: 'หลักฐาน', en: 'Evidence' },
  { id: 'revenue', th: 'รายได้', en: 'Revenue' },
  { id: 'system', th: 'ระบบ', en: 'System' },
  { id: 'scale', th: 'ขยาย', en: 'Scale' },
] as const

// ══════════════════════════════ 3. Mindset ══════════════════════════════

export const MINDSET = [
  {
    id: 'first_principles',
    en: 'First Principles',
    th: 'เริ่มจากปัญหาจริงและข้อเท็จจริง ไม่ใช่จากสิ่งที่คนอื่นทำ',
  },
  {
    id: 'ten_x',
    en: '10x Thinking',
    th: 'ไม่ถามว่าทำอย่างไรให้ดีขึ้น 10% แต่ถามว่าต้องออกแบบใหม่อย่างไรให้ดีขึ้น 10 เท่า',
  },
  {
    id: 'experiment_fast',
    en: 'Experiment Fast',
    th: 'ทุกสมมติฐานต้องแปลงเป็นการทดลองที่วัดผลได้',
  },
  {
    id: 'evidence_over_opinion',
    en: 'Evidence > Opinion',
    th: 'ความเห็นของผู้ก่อตั้งหรือของ AI ไม่สำคัญเท่าหลักฐานจากลูกค้าและผลลัพธ์จริง',
  },
  {
    id: 'failure_is_data',
    en: 'Failure = Learning Data',
    th: 'การทดลองที่ไม่ผ่านไม่ใช่ความล้มเหลว แต่เป็นข้อมูลที่ลดความไม่แน่นอน',
  },
  {
    id: 'compounding_learning',
    en: 'Compounding Learning',
    th: 'ทุกผู้ใช้ ทุกการทดลอง ทุกแคมเปญ และทุกผลลัพธ์ ต้องทำให้ระบบเก่งขึ้น',
  },
] as const

// ══════════════════════════════ 4. POD / Moat ══════════════════════════════

export const POD = {
  en: 'Validation-to-Scale Operating System',
  th: 'ระบบปฏิบัติการที่พาธุรกิจจากการพิสูจน์ไปสู่การขยาย',
} as const

export const MOAT = [
  { id: 'business_genome', th: 'Business Genome — ภาพธุรกิจที่ระบบสะสมไว้' },
  { id: 'decision_engine', th: 'Decision Engine — ตัวตัดสินว่าอะไรควรทำถัดไป' },
  { id: 'thai_playbook', th: 'Thai Business Playbook — วิธีทำธุรกิจในบริบทไทย' },
  { id: 'experiment_memory', th: 'Experiment Memory — จำได้ว่าอะไรเคยได้ผลและไม่ได้ผล' },
  { id: 'outcome_dataset', th: 'Outcome Dataset — ผลลัพธ์จริงที่วัดได้' },
  { id: 'benchmark_network', th: 'Benchmark Network — เทียบกับธุรกิจอื่นในอุตสาหกรรมเดียวกัน' },
] as const

// ══════════════════════════════ 5. Product DNA (freeze) ══════════════════════════════

export const PRODUCT_DNA = {
  en: 'Think Big. Start Small. Validate Fast. Learn Continuously. Build Systems. Scale Intelligently.',
  th: 'คิดให้ใหญ่ เริ่มให้เล็ก พิสูจน์ให้เร็ว เรียนรู้ตลอดเวลา สร้างให้เป็นระบบ แล้วขยายอย่างชาญฉลาด',
} as const

export const GOLDEN_QUESTION = {
  th: 'สิ่งที่กำลังทำนี้ช่วยให้ธุรกิจเข้าใกล้ลูกค้า หลักฐาน กำไร หรือ Scale มากขึ้นอย่างไร?',
  rule_th:
    'ถ้าตอบไม่ได้ ระบบต้องไม่สร้าง feature หรือ content นั้น เพียงเพราะ AI ทำได้',
} as const

/** สิ่งที่ระบบจะไม่ทำ แม้ผู้ใช้จะขอ — ต้องเสนอทางที่ถูกต้องแทน ไม่ใช่ปฏิเสธเฉย ๆ */
export const FORBIDDEN = [
  {
    id: 'content_for_its_own_sake',
    th: 'สร้าง content เพียงเพราะ AI สร้างได้ โดยตอบ Golden Question ไม่ได้',
  },
  {
    id: 'scale_before_validation',
    th: 'พาไป scale เงียบ ๆ ทั้งที่ยังไม่ผ่าน Validation Gate โดยไม่เตือน',
  },
  {
    id: 'opinion_as_evidence',
    th: 'นับความเห็นของ AI หรือของผู้ก่อตั้งเป็นหลักฐาน',
  },
  {
    id: 'reward_activity_not_evidence',
    th: 'ให้รางวัล (คะแนน/ยศ/ป้าย) กับกิจกรรมที่ไม่มีหลักฐานรองรับ',
  },
  {
    id: 'hide_uncertainty',
    th: 'แสดงตัวเลขที่คำนวณไม่ได้เป็น 0 หรือเดาแทนที่จะบอกว่ายังไม่รู้',
  },
] as const

// ══════════════════════════════ 6. Validation Gate ══════════════════════════════
//
// 6 ประตูที่ต้องตอบให้ได้ก่อนใช้เงินขยายผล (ยิง Ads, จ้างทีม, ผลิตล็อตใหญ่)
//
// steps  = ขั้นในหลักสูตร 24 ขั้นที่เป็นเจ้าของคำตอบของประตูนั้น (อ้างจาก lib/data/steps.ts จริง)
// weight = น้ำหนักในคะแนนความพร้อม รวมกันได้ 100

export type GateId =
  | 'problem_validated'
  | 'customer_defined'
  | 'offer_validated'
  | 'unit_economics'
  | 'tracking_ready'
  | 'evidence_sufficient'

export interface GateSpec {
  id: GateId
  th: string
  en: string
  weight: number
  /** ขั้นที่ต้องมีคำตอบ — เลขตรงกับ STEPS ใน lib/data/steps.ts */
  steps: number[]
  /** หลักฐานที่นับได้จริงสำหรับประตูนี้ (ใช้เขียนคำแนะนำให้ผู้ใช้) */
  evidence: string[]
  /** ทำไมประตูนี้สำคัญ — ใช้แสดงตอนเตือน */
  why: string
}

export const GATES: readonly GateSpec[] = [
  {
    id: 'problem_validated',
    th: 'ปัญหาได้รับการยืนยันแล้วหรือยัง',
    en: 'Problem validated?',
    weight: 25,
    // 3 โปรไฟล์ผู้ใช้ปลายทาง (ปัญหา/ความกังวล) · 6 วงจรการใช้งานเต็มรูปแบบ · 20 ระบุสมมติฐานสำคัญ
    steps: [3, 6, 20],
    evidence: [
      'สัมภาษณ์ผู้ใช้ปลายทางจริง ไม่ใช่คนรู้จักที่เกรงใจ',
      'ปัญหาเดิมซ้ำในหลายราย ไม่ใช่รายเดียว',
      'ผู้ใช้เคยพยายามแก้ปัญหานี้เองมาก่อน (จ่ายเงินหรือลงแรงไปแล้ว)',
    ],
    why: 'ถ้าปัญหาไม่จริง ทุกบาทที่ใช้ขยายผลคือการซื้อคำตอบที่ผิดให้เร็วขึ้น',
  },
  {
    id: 'customer_defined',
    th: 'ลูกค้าชัดหรือยัง',
    en: 'Customer defined?',
    weight: 20,
    // 1 แบ่งส่วนตลาด · 2 เลือกตลาดหัวหาด · 4 คำนวณ TAM · 5 กำหนด Persona
    steps: [1, 2, 4, 5],
    evidence: [
      'ระบุตลาดหัวหาดได้แคบพอจะครองได้',
      'มี Persona ที่มาจากข้อมูลจริง ไม่ใช่จินตนาการ',
      'TAM คำนวณจากตัวเลขที่อ้างอิงได้',
    ],
    why: 'ยิงโฆษณาโดยไม่รู้ว่าใครคือลูกค้า คือการจ่ายเงินให้แพลตฟอร์มเดาแทนเรา',
  },
  {
    id: 'offer_validated',
    th: 'ข้อเสนอถูกพิสูจน์หรือยัง',
    en: 'Offer validated?',
    weight: 20,
    // 8 วัดคุณค่าที่ส่งมอบ · 9 ลูกค้า 10 รายถัดไป · 22 สร้าง MVBP · 23 พิสูจน์ว่าลูกค้าจะซื้อ
    steps: [8, 9, 22, 23],
    evidence: [
      'มีคนจ่ายเงินจริง หรือวางมัดจำ หรือเซ็นใบสั่งซื้อ',
      'ระบุลูกค้า 10 รายถัดไปได้เป็นชื่อจริง',
      'วัดคุณค่าที่ส่งมอบเป็นตัวเลขได้',
    ],
    why: 'คนบอกว่า "น่าสนใจ" ไม่ใช่หลักฐาน — คนจ่ายเงินคือหลักฐาน',
  },
  {
    id: 'unit_economics',
    th: 'รู้ต้นทุนและกำไรต่อหน่วยไหม',
    en: 'Unit economics known?',
    weight: 15,
    // 15 ออกแบบโมเดลธุรกิจ · 16 กำหนดกรอบราคา · 17 LTV · 19 COCA
    steps: [15, 16, 17, 19],
    evidence: ['รู้ LTV', 'รู้ COCA', 'LTV > COCA อย่างมีนัยสำคัญ'],
    why: 'ถ้า COCA สูงกว่า LTV การขยายผลจะเร่งการขาดทุน ไม่ใช่เร่งการเติบโต',
  },
  {
    id: 'tracking_ready',
    th: 'วัดผลได้หรือยัง',
    en: 'Tracking ready?',
    weight: 10,
    // 13 แผนกระบวนการได้มาซึ่งลูกค้า · 18 วางแผนกระบวนการขาย
    steps: [13, 18],
    evidence: [
      'รู้ว่าจะวัดอะไร ที่จุดไหนของกระบวนการ',
      'แยกได้ว่าลูกค้ามาจากช่องทางไหน',
    ],
    why: 'ใช้เงินโดยวัดผลไม่ได้ = ซื้อข้อมูลไม่ได้เลยสักบาท ผิดหลัก Compounding Learning',
  },
  {
    id: 'evidence_sufficient',
    th: 'หลักฐานพอไหม',
    en: 'Evidence sufficient?',
    weight: 10,
    // 20 ระบุสมมติฐานสำคัญ · 21 ทดสอบสมมติฐานสำคัญ · 23 พิสูจน์ว่าลูกค้าจะซื้อ
    steps: [20, 21, 23],
    evidence: [
      'สมมติฐานสำคัญถูกเขียนออกมาชัด',
      'สมมติฐานถูกทดสอบแล้ว และมีผลลัพธ์บันทึกไว้',
    ],
    why: 'หลักฐานที่ยังไม่ถูกบันทึก เท่ากับไม่มี — ระบบเรียนรู้จากมันไม่ได้',
  },
] as const

// ══════════════════════════════ 7. อะไรนับเป็น "มีเนื้อหาจริง" ══════════════════════════════
//
// ข้อจำกัดที่ต้องยอมรับตรง ๆ: ตอนนี้ระบบเก็บคำตอบเป็นข้อความอิสระ
// จึงยังตรวจ "คุณภาพ" ของหลักฐานไม่ได้ ตรวจได้แค่ว่า "มีเนื้อหาหรือเปล่า"
// นี่คือตัวแทนที่ดีที่สุดที่ทำได้วันนี้ และเป็นเหตุผลที่ต้องมีตารางหลักฐานจริงในรอบถัดไป
// (ดู docs/constitution-derivation.md)

export const EVIDENCE_THRESHOLDS = {
  /** worksheet แบบ list ต้องมีรายการที่ไม่ว่างอย่างน้อยกี่รายการ */
  minListItems: 3,
  /** worksheet แบบข้อความ ต้องมีตัวอักษรรวมอย่างน้อยกี่ตัว */
  minTextChars: 60,
  /** worksheet แบบข้อความ ต้องตอบอย่างน้อยกี่ช่องจากทั้งหมด (สัดส่วน) */
  minFilledRatio: 0.5,
  /** สัดส่วนขั้นที่ต้องมีเนื้อหาจริง ประตูถึงจะ "ผ่าน" */
  gatePassEvidence: 0.6,
} as const

/**
 * ชนิดหลักฐานของแต่ละขั้น — ประกาศไว้ตรงนี้เพราะเป็น "นโยบายว่าอะไรนับเป็นหลักฐาน"
 * ไม่ใช่รายละเอียดหน้าจอ (ตรงกับ ws.type ใน lib/data/steps.ts)
 */
export type EvidenceKind = 'list' | 'text' | 'calc'

export const STEP_EVIDENCE_KIND: Readonly<Record<number, EvidenceKind>> = {
  1: 'list', 2: 'text', 3: 'text', 4: 'calc', 5: 'text', 6: 'text',
  7: 'text', 8: 'text', 9: 'list', 10: 'text', 11: 'text', 12: 'text',
  13: 'text', 14: 'calc', 15: 'text', 16: 'text', 17: 'calc', 18: 'text',
  19: 'calc', 20: 'list', 21: 'list', 22: 'text', 23: 'text', 24: 'text',
}

// ══════════════════════════════ 8. เกณฑ์ตัดสินความพร้อม ══════════════════════════════
//
// คะแนนของแต่ละประตู = weight × (0.4 × ความคืบหน้า + 0.6 × หลักฐาน)
// ให้น้ำหนักหลักฐานมากกว่าความคืบหน้า เพราะหลัก Evidence > Opinion
// ผลข้างเคียงที่ตั้งใจ: กด "ทำแล้ว" ครบ 24 ขั้นโดยไม่กรอกอะไรเลย ได้เต็มที่ 40 คะแนน → ยังไม่พร้อม

export const SCORE_WEIGHTS = { completion: 0.4, evidence: 0.6 } as const

export const VERDICT_THRESHOLDS = {
  /** พร้อมขยายผล — และต้องไม่มีประตูไหนที่ยังไม่เริ่มเลย */
  ready: 75,
  /** เริ่มได้แต่เสี่ยง ต้องรู้ตัวว่าเสี่ยงตรงไหน */
  risky: 45,
} as const

/** การกระทำที่ถือว่าเป็น "การขยายผล" และต้องผ่าน Gate ก่อน */
export const SCALE_ACTIONS = [
  { id: 'paid_ads', th: 'ยิงโฆษณาแบบเสียเงิน' },
  { id: 'hire_team', th: 'จ้างทีมเพิ่ม' },
  { id: 'bulk_production', th: 'ผลิตล็อตใหญ่' },
  { id: 'open_channel', th: 'เปิดช่องทางขายใหม่' },
  { id: 'raise_funding', th: 'ระดมทุน' },
] as const
