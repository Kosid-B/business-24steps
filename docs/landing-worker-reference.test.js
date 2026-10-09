import { describe, it, expect } from 'vitest'
import { SEGMENT_COPY, pickSegment, buildCtaHref, renderPage, esc } from './landing-worker-reference.js'

/**
 * เทสต์อยู่คู่กับไฟล์อ้างอิงโดยตั้งใจ — พาดหัวพวกนี้ถูกกฎแบรนด์ severity `block` คุมอยู่
 * ถ้าใครแก้ข้อความจนแหกกฎ เทสต์ต้องแตกก่อนจะได้ขึ้นเว็บ ไม่ใช่ไปรู้ตอนโดนทักทีหลัง
 */

const APP = 'https://app.test'
const LANDING = 'https://ceoaithailand.org/'
const SEGMENTS = ['newbie', 'employee', 'graduate', 'growth', 'audit']

describe('พาดหัวตาม segment', () => {
  it('ครบทั้ง 5 กลุ่ม บวก default', () => {
    for (const s of [...SEGMENTS, 'default']) expect(SEGMENT_COPY[s], s).toBeDefined()
    expect(Object.keys(SEGMENT_COPY).length).toBe(6)
  })

  it('ทุกอันมีพาดหัว คำอธิบาย และข้อความปุ่มครบ', () => {
    for (const [code, c] of Object.entries(SEGMENT_COPY)) {
      expect(c.headline.length, code).toBeGreaterThan(10)
      expect(c.sub.length, code).toBeGreaterThan(20)
      expect(c.cta.length, code).toBeGreaterThan(5)
    }
  })

  it('ตรงกับตารางใน docs/marketing-diagnosis.md §4.3', () => {
    expect(SEGMENT_COPY.newbie.headline).toBe('มีไอเดียแล้ว แต่ไม่รู้ว่าต้องทำอะไรก่อน')
    expect(SEGMENT_COPY.employee.headline).toBe('อยากมีรายได้เพิ่ม แต่ไม่อยากเสี่ยงกับงานประจำ')
    expect(SEGMENT_COPY.graduate.headline).toBe('เพิ่งจบ ทุนน้อย แต่อยากเริ่มธุรกิจของตัวเอง')
    expect(SEGMENT_COPY.growth.headline).toBe('ยอดขายโตแล้ว แต่ยังต้องทำเองทุกอย่าง')
    expect(SEGMENT_COPY.audit.headline).toBe('มีวันตรวจรออยู่ แต่เอกสารยังไม่พร้อม')
  })
})

describe('⭐ กฎแบรนด์ severity block — ห้ามแหก', () => {
  const allText = Object.values(SEGMENT_COPY)
    .flatMap((c) => [c.headline, c.sub, c.cta])
    .join(' ')

  it('message_hierarchy — ไม่ใช้ชื่อหมวดสินค้าเป็นพาดหัว', () => {
    for (const c of Object.values(SEGMENT_COPY)) {
      expect(c.headline.toLowerCase()).not.toContain('operating system')
      expect(c.headline.toLowerCase()).not.toContain('ai business')
    }
  })

  it('message_hierarchy — ISO/มอก./PDPA เป็นสารนำได้เฉพาะ seg=audit', () => {
    for (const [code, c] of Object.entries(SEGMENT_COPY)) {
      if (code === 'audit') continue
      const t = `${c.headline} ${c.sub} ${c.cta}`
      for (const word of ['ISO', 'มอก.', 'PDPA']) {
        expect(t, `${code} ไม่ควรมีคำว่า ${word}`).not.toContain(word)
      }
    }
  })

  it('claim — ไม่มีคำการันตีหรืออ้างอันดับ', () => {
    for (const word of ['การันตี', 'รับรองว่าได้', 'อันดับ 1', 'ดีที่สุด', '100%']) {
      expect(allText, `ห้ามมีคำว่า ${word}`).not.toContain(word)
    }
  })

  it('dark_pattern — ไม่มีการเร่งเร้าหรือจำนวนจำกัด', () => {
    for (const word of ['เหลือเวลา', 'เหลืออีก', 'ด่วน', 'รีบ', 'จำกัดเพียง', 'หมดเขต']) {
      expect(allText, `ห้ามมีคำว่า ${word}`).not.toContain(word)
    }
  })

  it('testimonial — ไม่อ้างลูกค้าหรือผลลัพธ์ที่ไม่มีหลักฐาน', () => {
    for (const word of ['ลูกค้ากว่า', 'ผู้ใช้กว่า', 'คนแล้ว', 'รีวิว']) {
      expect(allText, `ห้ามมีคำว่า ${word}`).not.toContain(word)
    }
  })

  it('⭐ tracking — ปลายทางต้องติด UTM และ segment ให้ครบ', () => {
    const href = buildCtaHref(
      `${LANDING}?utm_source=facebook&utm_medium=social&utm_campaign=oct2026&utm_content=post1&utm_term=t&seg=growth`,
      APP,
    )
    const q = new URL(href).searchParams
    expect(q.get('utm_source')).toBe('facebook')
    expect(q.get('utm_medium')).toBe('social')
    expect(q.get('utm_campaign')).toBe('oct2026')
    expect(q.get('utm_content')).toBe('post1')
    expect(q.get('utm_term')).toBe('t')
    expect(q.get('seg')).toBe('growth')
  })
})

describe('pickSegment', () => {
  it('รหัสที่รู้จัก → ใช้รหัสนั้น', () => {
    for (const s of SEGMENTS) expect(pickSegment(`${LANDING}?seg=${s}`)).toBe(s)
  })

  it('ไม่ส่ง seg มา → default', () => {
    expect(pickSegment(LANDING)).toBe('default')
  })

  it('รหัสที่ไม่รู้จัก → default ไม่ใช่พัง', () => {
    expect(pickSegment(`${LANDING}?seg=ไม่มีกลุ่มนี้`)).toBe('default')
    expect(pickSegment(`${LANDING}?seg=__proto__`)).toBe('default')
    expect(pickSegment(`${LANDING}?seg=constructor`)).toBe('default')
  })
})

describe('buildCtaHref', () => {
  it('ชี้ไปหน้าเช็ก 6 ข้อบนโดเมนแอป', () => {
    const u = new URL(buildCtaHref(LANDING, APP))
    expect(u.origin).toBe(APP)
    expect(u.pathname).toBe('/quickcheck')
  })

  it('ไม่มี seg มา → ติด seg=default ไปให้ แยกออกจากคนที่เข้าตรง ๆ ได้', () => {
    expect(new URL(buildCtaHref(LANDING, APP)).searchParams.get('seg')).toBe('default')
  })

  it('ไม่ลากพารามิเตอร์ที่ไม่เกี่ยวข้องไปด้วย', () => {
    const q = new URL(buildCtaHref(`${LANDING}?utm_source=line&fbclid=xyz&ref=abc`, APP)).searchParams
    expect(q.get('utm_source')).toBe('line')
    expect(q.get('fbclid')).toBeNull()
    expect(q.get('ref')).toBeNull()
  })

  it('ค่าว่างไม่ถูกส่งต่อ', () => {
    expect(new URL(buildCtaHref(`${LANDING}?utm_source=`, APP)).searchParams.get('utm_source')).toBeNull()
  })
})

describe('renderPage', () => {
  it('หน้า default ขึ้นพาดหัวของ default และมีปุ่มไป /quickcheck', () => {
    const html = renderPage(LANDING, APP)
    expect(html).toContain(SEGMENT_COPY.default.headline)
    expect(html).toContain('/quickcheck')
    expect(html).toContain('<!doctype html>')
  })

  it('ส่ง seg มา → ได้พาดหัวของกลุ่มนั้น ไม่ใช่ default', () => {
    const html = renderPage(`${LANDING}?seg=growth`, APP)
    expect(html).toContain(SEGMENT_COPY.growth.headline)
    expect(html).not.toContain(SEGMENT_COPY.default.headline)
  })

  it('มี OG tag ให้ลิงก์ที่แชร์มีหัวข้อ', () => {
    const html = renderPage(`${LANDING}?seg=newbie`, APP)
    expect(html).toContain('og:title')
    expect(html).toContain('og:description')
  })

  it('⭐ ค่าที่ผู้ใช้ยัดมาทาง URL ต้องแทรก HTML เข้าหน้าไม่ได้', () => {
    const payload = '"><script>alert(1)</script>'
    const html = renderPage(`${LANDING}?seg=${encodeURIComponent(payload)}&utm_source=${encodeURIComponent(payload)}`, APP)

    // ไม่มีแท็กจริงหลุดเข้าหน้า
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).not.toContain('"><script')

    // seg ที่ไม่รู้จักถูกตีกลับเป็น default ไม่ได้ถูกเอาไปแสดง
    expect(html).toContain(SEGMENT_COPY.default.headline)

    // utm_source ยังถูกส่งต่อไปปลายทางครบ แต่อยู่ในรูป percent-encoded ใน href
    // (URL ทำ encoding ให้ชั้นหนึ่ง แล้ว esc() ทำอีกชั้นตอนลง HTML)
    const href = html.match(/href="(https:[^"]*quickcheck[^"]*)"/)[1]
    expect(new URL(href.replace(/&amp;/g, '&')).searchParams.get('utm_source')).toBe(payload)
  })

  it('esc แปลงอักขระที่อันตรายครบ', () => {
    expect(esc(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;')
  })
})
