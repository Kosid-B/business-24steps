import type { Theme, Step } from '@/types'

export const THEMES: Theme[] = [
  { id: 'who',     no: 1, th: 'ลูกค้าของคุณคือใคร?',        en: 'Who is your customer?',              color: '#1B5E3F' },
  { id: 'value',   no: 2, th: 'คุณทำอะไรให้ลูกค้าได้บ้าง?',   en: 'What can you do for your customer?', color: '#C0573B' },
  { id: 'acquire', no: 3, th: 'ลูกค้าซื้อสินค้าอย่างไร?',     en: 'How does your customer acquire it?', color: '#2F4B7C' },
  { id: 'money',   no: 4, th: 'คุณหารายได้อย่างไร?',         en: 'How do you make money?',             color: '#A87A1E' },
  { id: 'build',   no: 5, th: 'ออกแบบและสร้างอย่างไร?',      en: 'How do you design & build it?',      color: '#6B3F69' },
  { id: 'scale',   no: 6, th: 'ขยายธุรกิจอย่างไร?',          en: 'How do you scale?',                  color: '#2C6E6A' },
]

export function themeOf(id: string): Theme {
  return THEMES.find(t => t.id === id) || THEMES[0]
}

export const STEPS: Step[] = [
  { n: 1, theme: 'who', th: 'แบ่งส่วนตลาด', en: 'Market Segmentation',
    guide: 'ธุรกิจจะเกิดก็ต่อเมื่อมีคนยอมจ่ายเงิน — เริ่มจากลูกค้า ไม่ใช่ผลิตภัณฑ์',
    obj: ['ระดมกลุ่มลูกค้า/ตลาดที่เป็นไปได้', 'คัดให้เหลือ 6–12 ตลาดที่มีแววที่สุด', 'เก็บข้อมูลตลาดเหล่านั้น'],
    ws: { type: 'list', label: 'กลุ่มลูกค้า/ตลาดที่เป็นไปได้', placeholder: 'เช่น ร้านกาแฟอิสระในกรุงเทพฯ' } },

  { n: 2, theme: 'who', th: 'เลือกตลาดหัวหาด', en: 'Select the Beachhead Market',
    guide: 'โฟกัสคือทักษะสำคัญที่สุด — เลือกตลาดเดียวที่จะครองให้ได้ก่อน',
    obj: ['วิเคราะห์ 6–12 ตลาด เลือก 1 ตลาดมาเจาะลึก', 'แบ่งย่อยจนได้ "ตลาดหัวหาด"'],
    ws: { type: 'notes', prompts: [
      { k: 'market', label: 'ตลาดที่เลือกเจาะลึก', ph: 'ตลาดไหน เพราะอะไร' },
      { k: 'sub', label: 'แบ่งย่อยเป็นตลาดหัวหาดอย่างไร', ph: 'ระบุกลุ่มที่แคบและชัดเจน' },
    ]} },

  { n: 3, theme: 'who', th: 'สร้างโปรไฟล์ผู้ใช้ปลายทาง', en: 'Build an End User Profile',
    guide: 'สร้างธุรกิจจากสิ่งที่ลูกค้าต้องการจริง ไม่ใช่สิ่งที่เราเดา',
    obj: ['ร่างภาพผู้ใช้ปลายทางในตลาดของคุณจากข้อมูลจริง'],
    ws: { type: 'fields', fields: [
      { k: 'demo', label: 'ข้อมูลประชากร' },
      { k: 'pains', label: 'ปัญหา/ความกังวลหลัก', area: true },
      { k: 'goals', label: 'เป้าหมาย/แรงจูงใจ', area: true },
      { k: 'where', label: 'ไปรวมตัว/หาข้อมูลที่ไหน' },
    ]} },

  { n: 4, theme: 'who', th: 'คำนวณ TAM ของตลาดหัวหาด', en: 'Calculate the TAM',
    guide: 'TAM บอกว่าตลาดหัวหาดใหญ่พอจะคุ้ม และเล็กพอจะครองได้ไหม',
    obj: ['คำนวณ Total Addressable Market ของตลาดหัวหาด', 'ใช้ตัวเลขตัดสินว่าต้องแบ่งตลาดย่อยลงอีกไหม'],
    ws: { type: 'calc',
      inputs: [
        { k: 'users', label: 'จำนวนผู้ใช้ปลายทางในตลาด', unit: 'ราย', def: 50000 },
        { k: 'val', label: 'มูลค่าต่อรายต่อปี', unit: '฿', def: 3000 },
      ],
      compute: (v) => v.users * v.val,
      resultLabel: 'TAM ต่อปี', unit: '฿',
    } },

  { n: 5, theme: 'who', th: 'กำหนด Persona', en: 'Define the Persona',
    guide: 'Persona คือลูกค้าตัวจริงหนึ่งคนที่ทั้งทีมยึดเป็นเข็มทิศ',
    obj: ['เลือกผู้ใช้ปลายทาง 1 คนเป็น Persona', 'ลงรายละเอียด และแนะนำให้ทั้งทีมรู้จัก'],
    ws: { type: 'fields', fields: [
      { k: 'name', label: 'ชื่อ (สมมติ)' },
      { k: 'role', label: 'อาชีพ/บทบาท' },
      { k: 'story', label: 'เรื่องราวโดยย่อ', area: true },
      { k: 'prio', label: 'สิ่งที่ให้ความสำคัญ 3 อันดับแรก', area: true },
      { k: 'fear', label: 'สิ่งที่กลัว/หลีกเลี่ยง' },
    ]} },

  { n: 6, theme: 'value', th: 'วาดวงจรการใช้งานเต็มรูปแบบ', en: 'Full Life Cycle Use Case',
    guide: 'เข้าใจวงจรการใช้งานทั้งหมดช่วยเจอปัญหาแต่เนิ่นๆ และประหยัดต้นทุน',
    obj: ['อธิบายว่า Persona ค้นพบ/ซื้อ/ใช้/จ่าย/ซื้อซ้ำ/บอกต่อ ผลิตภัณฑ์อย่างไร'],
    ws: { type: 'notes', prompts: [
      { k: 'discover', label: 'ลูกค้าค้นพบและเลือกซื้ออย่างไร', ph: '' },
      { k: 'use', label: 'ใช้งาน จ่ายเงิน และบอกต่ออย่างไร', ph: '' },
    ]} },

  { n: 7, theme: 'value', th: 'ร่างหน้าตาผลิตภัณฑ์', en: 'Sketch the Product',
    guide: 'ทำให้ทุกคนเห็นภาพตรงกันว่า "มัน" คืออะไร และเน้นประโยชน์ของลูกค้า',
    obj: ['แปลงไอเดียผลิตภัณฑ์เป็นภาพ', 'เน้นประโยชน์จากฟีเจอร์ ไม่ใช่ตัวฟีเจอร์'],
    ws: { type: 'notes', prompts: [
      { k: 'sketch', label: 'อธิบายภาพร่างผลิตภัณฑ์', ph: '' },
      { k: 'benefit', label: 'ประโยชน์หลักที่ลูกค้าได้รับ', ph: '' },
    ]} },

  { n: 8, theme: 'value', th: 'วัดคุณค่าที่ส่งมอบ', en: 'Quantify the Value Proposition',
    guide: 'ถ้าวัดคุณค่าเป็นตัวเลขได้ ประโยชน์จะจับต้องได้จริง',
    obj: ['แปลงประโยชน์เป็นคุณค่าในสายตาลูกค้า', 'กำหนดตัวชี้วัดเชิงปริมาณ'],
    ws: { type: 'fields', fields: [
      { k: 'asis', label: 'สภาพปัจจุบันของลูกค้า (As-is)', area: true },
      { k: 'tobe', label: 'สภาพหลังใช้ผลิตภัณฑ์ (To-be)', area: true },
      { k: 'metric', label: 'ตัวชี้วัดที่ใช้วัด' },
    ]} },

  { n: 9, theme: 'value', th: 'ระบุลูกค้า 10 รายถัดไป', en: 'Identify Next 10 Customers',
    guide: 'ลูกค้า 10 รายถัดไปช่วยยืนยันว่าเรามาถูกทาง',
    obj: ['ระบุลูกค้าอีก 10 รายที่ตรงโปรไฟล์', 'ติดต่อเพื่อยืนยันความสนใจ'],
    ws: { type: 'list', label: 'ลูกค้า 10 รายถัดไป', placeholder: 'ชื่อ/บริษัท ที่ตรงโปรไฟล์' } },

  { n: 10, theme: 'value', th: 'นิยามแก่นความได้เปรียบ', en: 'Define Your Core',
    guide: 'หาแก่น (Core) ที่คู่แข่งเลียนแบบไม่ได้ — มันคือมงกุฎเพชรของบริษัท',
    obj: ['อธิบายว่าทำไมธุรกิจคุณแก้ปัญหาได้ในแบบที่คู่แข่งทำตามไม่ได้'],
    ws: { type: 'notes', prompts: [
      { k: 'core', label: 'แก่นความได้เปรียบของคุณคืออะไร', ph: '' },
      { k: 'why', label: 'ทำไมคู่แข่งเลียนแบบไม่ได้', ph: '' },
    ]} },

  { n: 11, theme: 'value', th: 'วางตำแหน่งการแข่งขัน', en: 'Chart the Competitive Position',
    guide: 'วางตำแหน่งจากสิ่งที่ Persona ให้ความสำคัญสองอันดับแรก',
    obj: ['ตรวจว่าผลิตภัณฑ์ตอบ 2 เรื่องสำคัญของ Persona ได้ดีแค่ไหน', 'เทียบกับผลิตภัณฑ์ที่มีอยู่'],
    ws: { type: 'notes', prompts: [
      { k: 'p1', label: 'เรื่องสำคัญอันดับ 1 ของ Persona — เราตอบได้แค่ไหน', ph: '' },
      { k: 'p2', label: 'เรื่องสำคัญอันดับ 2 — คู่แข่งทำได้แค่ไหน', ph: '' },
    ]} },

  { n: 12, theme: 'acquire', th: 'ระบุหน่วยตัดสินใจซื้อ', en: "Customer's Decision-Making Unit",
    guide: 'การซื้อมักมีหลายคนเกี่ยวข้อง — รู้บทบาทของแต่ละคน',
    obj: ['หาว่าใครมีอำนาจซื้อ และใครสนับสนุนการตัดสินใจ', 'รู้จักคนที่มีอิทธิพลต่อการซื้อ'],
    ws: { type: 'fields', fields: [
      { k: 'champion', label: 'ผู้ผลักดัน (Champion)' },
      { k: 'economic', label: 'ผู้มีอำนาจจ่ายเงิน' },
      { k: 'enduser', label: 'ผู้ใช้จริง' },
      { k: 'veto', label: 'ผู้มีสิทธิ์ยับยั้ง (Veto)' },
    ]} },

  { n: 13, theme: 'acquire', th: 'แผนกระบวนการได้มาซึ่งลูกค้า', en: 'Map the Customer Acquisition Process',
    guide: 'รู้ว่าลูกค้าตัดสินใจซื้ออย่างไร และมีอุปสรรคอะไรบ้าง',
    obj: ['วาดกระบวนการตัดสินใจซื้อ', 'ประเมินรอบการขาย', 'ระบุอุปสรรคด้านงบ/กฎ/ขั้นตอน'],
    ws: { type: 'notes', prompts: [
      { k: 'process', label: 'ขั้นตอนการตัดสินใจซื้อ', ph: '' },
      { k: 'barrier', label: 'อุปสรรค งบประมาณ กฎระเบียบ', ph: '' },
    ]} },

  { n: 14, theme: 'money', th: 'คำนวณ TAM ของตลาดต่อยอด', en: 'TAM for Follow-on Markets',
    guide: 'ระหว่างครองตลาดหัวหาด อย่าลืมวางแผนตลาดต่อไป',
    obj: ['ประเมินตลาดต่อยอดหลังครองตลาดหัวหาด', 'คำนวณขนาดตลาดเหล่านั้น'],
    ws: { type: 'calc',
      inputs: [
        { k: 'markets', label: 'จำนวนตลาดต่อยอด', unit: 'ตลาด', def: 3 },
        { k: 'avg', label: 'TAM เฉลี่ยต่อตลาด', unit: '฿', def: 80000000 },
      ],
      compute: (v) => v.markets * v.avg,
      resultLabel: 'TAM ต่อยอดรวม', unit: '฿',
    } },

  { n: 15, theme: 'money', th: 'ออกแบบโมเดลธุรกิจ', en: 'Design the Business Model',
    guide: 'อย่าใช้เวลากับโมเดลธุรกิจน้อยเกินไป — มันคือวิธีเก็บมูลค่า',
    obj: ['สำรวจโมเดลธุรกิจหลายแบบ', 'ออกแบบโมเดลที่เก็บมูลค่าที่คุณสร้างให้ลูกค้า'],
    ws: { type: 'notes', prompts: [
      { k: 'model', label: 'โมเดลธุรกิจที่เลือก', ph: 'เช่น สมาชิกรายเดือน, ตามการใช้งาน' },
      { k: 'why', label: 'ทำไมจึงเหมาะกับลูกค้าและธุรกิจ', ph: '' },
    ]} },

  { n: 16, theme: 'money', th: 'กำหนดกรอบราคา', en: 'Determine the Pricing Framework',
    guide: 'ราคาส่งผลต่อกำไรมหาศาล แต่รอข้อมูลให้พอก่อนค่อยตั้ง',
    obj: ['ใช้โมเดลธุรกิจ + คุณค่าเชิงปริมาณ กำหนดกรอบราคาที่เหมาะสม'],
    ws: { type: 'notes', prompts: [
      { k: 'frame', label: 'กรอบราคา', ph: 'เช่น รายเดือน, ตามการใช้งาน, ขั้นบันได' },
      { k: 'anchor', label: 'อ้างอิงราคาจากคุณค่า/คู่แข่งอย่างไร', ph: '' },
    ]} },

  { n: 17, theme: 'money', th: 'คำนวณมูลค่าตลอดอายุลูกค้า', en: 'Lifetime Value (LTV)',
    guide: 'ได้ลูกค้ามาด้วยต้นทุนต่ำกว่ามูลค่าที่เขาสร้างหรือเปล่า?',
    obj: ['คำนวณรายได้รวมที่คาดได้ต่อลูกค้า 1 ราย'],
    ws: { type: 'calc',
      inputs: [
        { k: 'rev', label: 'รายได้ต่อรายต่อปี', unit: '฿', def: 6000 },
        { k: 'margin', label: 'กำไรขั้นต้น', unit: '%', def: 60 },
        { k: 'years', label: 'จำนวนปีที่อยู่กับเรา', unit: 'ปี', def: 3 },
      ],
      compute: (v) => Math.round(v.rev * (v.margin / 100) * v.years),
      resultLabel: 'LTV โดยประมาณ', unit: '฿',
    } },

  { n: 18, theme: 'acquire', th: 'วางแผนกระบวนการขาย', en: 'Map the Sales Process',
    guide: 'หาวิธีย่นรอบการขายและใช้ทรัพยากรอย่างมีประสิทธิภาพ',
    obj: ['วางกลยุทธ์การขายระยะสั้น–กลาง–ยาว'],
    ws: { type: 'notes', prompts: [
      { k: 'short', label: 'กลยุทธ์ขายระยะสั้น', ph: '' },
      { k: 'long', label: 'ระยะกลาง–ยาว', ph: '' },
    ]} },

  { n: 19, theme: 'acquire', th: 'คำนวณต้นทุนการได้ลูกค้า', en: 'Cost of Customer Acquisition (COCA)',
    guide: 'COCA คือตัวเลขสำคัญ — คำนวณให้ถูก อย่ามองข้าม',
    obj: ['คำนวณต้นทุนการได้ลูกค้า 1 ราย ระยะสั้น–กลาง–ยาว'],
    ws: { type: 'calc',
      inputs: [
        { k: 'cost', label: 'ค่าการตลาด+ขายรวมต่อช่วง', unit: '฿', def: 300000 },
        { k: 'cust', label: 'จำนวนลูกค้าใหม่ในช่วงนั้น', unit: 'ราย', def: 100 },
      ],
      compute: (v) => v.cust ? Math.round(v.cost / v.cust) : 0,
      resultLabel: 'COCA ต่อลูกค้า 1 ราย', unit: '฿',
    } },

  { n: 20, theme: 'build', th: 'ระบุสมมติฐานสำคัญ', en: 'Identify Key Hypotheses',
    guide: 'ระบุสมมติฐานที่ยังไม่ได้พิสูจน์ก่อนจะลงทุนสร้างจริง',
    obj: ['ตรวจหาสมมติฐานที่ยังไม่ได้ทดสอบ', 'จัดลำดับ 5–10 ข้อสำคัญ'],
    ws: { type: 'list', label: 'สมมติฐานสำคัญ', placeholder: 'เช่น ลูกค้ายอมจ่าย ฿500/เดือน' } },

  { n: 21, theme: 'build', th: 'ทดสอบสมมติฐานสำคัญ', en: 'Test Key Hypotheses',
    guide: 'เลือกวิธีทดสอบที่ถูก เร็ว ง่ายที่สุด เพื่อเก็บข้อมูลจริง',
    obj: ['ออกแบบการทดลองทดสอบสมมติฐาน', 'ทำเร็วและประหยัดเพื่อลดความเสี่ยง'],
    ws: { type: 'list', label: 'การทดลองที่จะทำ', placeholder: 'เช่น พรีออเดอร์ผ่านหน้า Landing' } },

  { n: 22, theme: 'build', th: 'สร้าง MVBP', en: 'Minimum Viable Business Product',
    guide: 'MVBP คือสินค้าที่เรียบง่ายที่สุดที่ลูกค้ายอมจ่ายเงินซื้อ',
    obj: ['รวมสมมติฐานทั้งหมดเป็นผลิตภัณฑ์ที่ลูกค้ายอมจ่าย', 'ออกแบบฟีเจอร์ให้เรียบง่ายที่สุด'],
    ws: { type: 'notes', prompts: [
      { k: 'mvbp', label: 'MVBP ของคุณคืออะไร ฟีเจอร์ขั้นต่ำ', ph: '' },
      { k: 'pay', label: 'ทำไมลูกค้าถึงยอมจ่าย', ph: '' },
    ]} },

  { n: 23, theme: 'build', th: 'พิสูจน์ว่าลูกค้าจะซื้อ', en: 'Prove Customers Will Buy',
    guide: 'ปล่อย MVBP เพื่อพิสูจน์ว่าลูกค้ายอมรับและจ่ายเงินจริง',
    obj: ['พิสูจน์เชิงปริมาณว่าลูกค้าจะจ่ายเงินซื้อ MVBP', 'วัดระดับการบอกต่อ'],
    ws: { type: 'notes', prompts: [
      { k: 'metric', label: 'ตัวชี้วัดว่าลูกค้าจะซื้อ', ph: '' },
      { k: 'wom', label: 'วัดการบอกต่ออย่างไร', ph: '' },
    ]} },

  { n: 24, theme: 'scale', th: 'วางแผนผลิตภัณฑ์', en: 'Develop the Product Plan',
    guide: 'พิสูจน์แล้วว่าขายได้ ก็วางแผนการเติบโตของผลิตภัณฑ์เชิงกลยุทธ์',
    obj: ['วางแผนต่อยอดผลิตภัณฑ์เกิน MVBP', 'เตรียมขยายสู่ตลาดข้างเคียง'],
    ws: { type: 'notes', prompts: [
      { k: 'beyond', label: 'ฟีเจอร์ถัดไปหลัง MVBP', ph: '' },
      { k: 'adjacent', label: 'ตลาดข้างเคียงที่จะขยายไป', ph: '' },
    ]} },
]
