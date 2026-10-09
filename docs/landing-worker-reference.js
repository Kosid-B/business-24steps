/**
 * หน้าแรก ceoaithailand.org — ตัวอย่างอ้างอิงสำหรับ Cloudflare Worker `ceo-ai-thailand`
 * ============================================================================
 *
 * ⚠️ ไฟล์นี้ยังไม่ได้ถูก deploy และต้องไม่ถูก deploy อัตโนมัติ
 *    กฎแบรนด์ข้อ publishing (severity: block) — "AI ห้ามเผยแพร่ Creative อัตโนมัติ
 *    โดยไม่มี Human Approval ใน MVP" — ไฟล์นี้จึงเป็นของให้คนอ่าน อนุมัติ แล้ว deploy เอง
 *
 * ⚠️ ผมไม่เห็นซอร์สจริงของ Worker ตัวปัจจุบัน ไฟล์นี้จึงเป็น **ของอ้างอิงที่ต้องปรับ**
 *    ไม่ใช่ของที่วางทับได้ทันที โดยเฉพาะส่วนที่เขียน landing_funnel ซึ่งต้องคงของเดิมไว้
 *
 * ปัญหาที่ไฟล์นี้แก้ (ตัวเลขจาก docs/marketing-diagnosis.md §10 · 11 ส.ค. – 1 ต.ค. 2569)
 *
 *   235 session เข้าหน้านี้ · 214 คน (91%) ไม่เลื่อนหน้าเลยแม้แต่พิกเซลเดียว
 *   230 จาก 235 เห็นหน้า default ทั้งที่นิยาม segment ไว้ 5 กลุ่ม
 *   สมัคร 0 คนติดต่อกัน 6 สัปดาห์
 *
 * สองอย่างที่เปลี่ยน
 *   1. พาดหัวเริ่มจาก "ปัญหาของคนอ่าน" ไม่ใช่ชื่อหมวดสินค้า และเปลี่ยนตาม seg
 *   2. ปุ่มหลักพาไป /quickcheck (เช็ก 6 ข้อ 2 นาที ไม่ต้องสมัคร) ซึ่งเป็นขั้นกลาง
 *      ระหว่าง "อ่านเฉย ๆ" กับ "สมัครเต็มรูปแบบ" ที่เดิมไม่มี — และพา UTM กับ seg ติดไปด้วย
 *
 * กฎแบรนด์ที่ไฟล์นี้ต้องไม่แหก (ตาราง marketing_brand_rules ทุกข้อ severity = block)
 *   message_hierarchy  ห้ามใช้ "AI Business Operating System" เป็นพาดหัวแรก
 *   message_hierarchy  ห้ามใช้ ISO/มอก./PDPA เป็นสารนำกับกลุ่มทั่วไป ใช้ได้เฉพาะ seg=audit
 *   claim              ห้ามอ้างอันดับ 1 / ดีที่สุด / การันตีผล
 *   dark_pattern       ห้ามนับถอยหลัง ความเร่งด่วน หรือจำนวนจำกัดที่ไม่จริง
 *   testimonial        ห้ามสร้างรีวิวหรือกรณีความสำเร็จที่ไม่มีหลักฐาน
 *   tracking           ทุกปลายทางต้องติด UTM + segment ให้ครบ
 */

/** โดเมนของแอป — เปลี่ยนให้ตรงกับที่ deploy จริงก่อนใช้ */
const APP_ORIGIN = 'https://business-24steps.vercel.app'

/**
 * พาดหัวตาม segment — ลอกมาจาก docs/marketing-diagnosis.md §4.3 ตรงตัว
 * รหัส segment ตรงกับคอลัมน์ code ในตาราง marketing_audience_segments
 *
 * ทุกพาดหัวเริ่มจากปัญหาของคนอ่าน ไม่มีคำการันตี ไม่มีการเร่งเร้า
 */
export const SEGMENT_COPY = {
  // 230 จาก 235 คนเห็นอันนี้ — เป็นพาดหัวที่สำคัญที่สุดในหน้า
  default: {
    headline: 'มีไอเดียธุรกิจ แต่ยังไม่รู้ว่ามันจริงแค่ไหน',
    sub: 'ตอบ 6 คำถาม ใช้เวลาราว 2 นาที แล้วรู้ว่าตรงไหนยังไม่มีหลักฐานรองรับ ก่อนเอาเงินลงไป',
    cta: 'เช็กความพร้อมใน 2 นาที',
  },
  newbie: {
    headline: 'มีไอเดียแล้ว แต่ไม่รู้ว่าต้องทำอะไรก่อน',
    sub: 'ข้อมูลเยอะจนไม่รู้จะเริ่มตรงไหน — เริ่มจากเช็กว่าอะไรพร้อมแล้ว อะไรยัง',
    cta: 'เช็กความพร้อมใน 2 นาที',
  },
  employee: {
    headline: 'อยากมีรายได้เพิ่ม แต่ไม่อยากเสี่ยงกับงานประจำ',
    sub: 'เช็กก่อนว่าไอเดียมีคนซื้อจริงไหม จะได้ไม่ต้องเดิมพันด้วยงานที่มีอยู่',
    cta: 'ดูว่าเริ่มยังไงไม่ต้องลาออก',
  },
  graduate: {
    headline: 'เพิ่งจบ ทุนน้อย แต่อยากเริ่มธุรกิจของตัวเอง',
    sub: 'หลายขั้นแรกไม่ต้องใช้เงิน — เช็กว่าคุณอยู่ตรงไหนแล้วเริ่มจากขั้นนั้น',
    cta: 'เริ่มจากขั้นที่ไม่ต้องใช้เงิน',
  },
  growth: {
    headline: 'ยอดขายโตแล้ว แต่ยังต้องทำเองทุกอย่าง',
    sub: 'เช็กว่าตรงไหนเป็นคอขวด และระบบไหนควรวางก่อนถึงจะขยายได้โดยไม่พัง',
    cta: 'ดูว่าระบบไหนควรวางก่อน',
  },
  // ประตูข้าง — ใช้สารนำแบบนี้ได้เฉพาะ seg นี้เท่านั้น (กฎแบรนด์ข้อ message_hierarchy)
  audit: {
    headline: 'มีวันตรวจรออยู่ แต่เอกสารยังไม่พร้อม',
    sub: 'ประเมิน Gap เบื้องต้นด้วยตัวเองก่อน แล้วค่อยตัดสินใจว่าต้องการความช่วยเหลือระดับไหน',
    cta: 'ประเมิน Gap เบื้องต้น',
  },
}

/** พารามิเตอร์ที่ต้องส่งต่อให้ครบ — กฎแบรนด์ข้อ tracking (severity: block) */
const TRACKED_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'seg']

/**
 * เลือก segment จาก query string
 * รับเฉพาะรหัสที่รู้จักเท่านั้น ค่าที่ไม่รู้จักตกเป็น default
 * (กันทั้งการพิมพ์ผิด และกันค่าแปลกปลอมหลุดเข้าไปในหน้า)
 */
export function pickSegment(url) {
  const raw = new URL(url).searchParams.get('seg')
  return raw && Object.prototype.hasOwnProperty.call(SEGMENT_COPY, raw) && raw !== 'default'
    ? raw
    : 'default'
}

/**
 * ลิงก์ปุ่มหลัก → /quickcheck พร้อมพาที่มาติดไปให้ครบ
 *
 * ถ้าไม่ทำข้อนี้ lead ที่เก็บได้จะไม่รู้ที่มา ซึ่งคือปัญหาเดิมเป๊ะ ๆ
 * (3 จาก 235 session เท่านั้นที่มี UTM — เราจึงชี้ไม่ได้ว่าควรลงแรงต่อที่ช่องทางไหน)
 */
export function buildCtaHref(url, appOrigin = APP_ORIGIN) {
  const src = new URL(url).searchParams
  const dest = new URL('/quickcheck', appOrigin)
  for (const k of TRACKED_PARAMS) {
    const v = src.get(k)
    if (v) dest.searchParams.set(k, v)
  }
  // ไม่มี seg มาก็ยังบอกให้ชัดว่าคนนี้มาจากหน้าแรก จะได้แยกออกจากคนที่เข้า /quickcheck ตรง ๆ
  if (!dest.searchParams.get('seg')) dest.searchParams.set('seg', 'default')
  return dest.toString()
}

/** กันค่าที่ยังไม่ไว้ใจหลุดเข้า HTML */
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}

export function renderPage(url, appOrigin = APP_ORIGIN) {
  const seg = pickSegment(url)
  const c = SEGMENT_COPY[seg]
  const cta = buildCtaHref(url, appOrigin)

  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.headline)}</title>
<meta name="description" content="${esc(c.sub)}">
<meta property="og:title" content="${esc(c.headline)}">
<meta property="og:description" content="${esc(c.sub)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="th_TH">
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
  :root { --ink:#1C1A15; --muted:#5C564A; --green:#16704A; --cream:#F6F2E8; --line:#E5DECC; }
  * { box-sizing:border-box }
  body { margin:0; font-family:Kanit,system-ui,sans-serif; background:var(--cream); color:var(--ink); }
  .wrap { max-width:720px; margin:0 auto; padding:72px 20px 56px; }
  .brand { display:flex; align-items:center; gap:12px; margin-bottom:48px; }
  .mark { width:44px; height:44px; border-radius:13px; background:var(--green); color:#fff;
          display:flex; align-items:center; justify-content:center; font-weight:700; font-size:20px; }
  h1 { font-size:40px; line-height:1.3; margin:0 0 16px; font-weight:700; }
  .sub { font-size:18px; line-height:1.7; color:var(--muted); margin:0 0 36px; }
  .cta { display:inline-block; background:var(--green); color:#fff; text-decoration:none;
         padding:16px 28px; border-radius:12px; font-size:17px; font-weight:600; }
  .note { margin-top:14px; font-size:14px; color:var(--muted); }
  .how { margin-top:56px; padding-top:32px; border-top:1px solid var(--line); }
  .how h2 { font-size:15px; font-weight:600; color:var(--muted); margin:0 0 16px; }
  .how ol { margin:0; padding-left:20px; font-size:16px; line-height:2; color:var(--ink); }
  @media (max-width:560px){ .wrap{padding:44px 16px 40px} h1{font-size:30px} .sub{font-size:16px} }
</style>
</head>
<body>
  <main class="wrap">
    <div class="brand">
      <span class="mark">B.</span>
      <div>
        <div style="font-weight:700">ตั้งต้น</div>
        <div style="font-size:13px;color:var(--muted)">24 ก้าวสร้างธุรกิจ</div>
      </div>
    </div>

    <!-- พาดหัวเริ่มจากปัญหาของคนอ่าน ไม่ใช่ชื่อหมวดสินค้า -->
    <h1>${esc(c.headline)}</h1>
    <p class="sub">${esc(c.sub)}</p>

    <!-- ปุ่มเดียว ทางเดียว — คนที่ยังไม่พร้อมสมัครก็มีที่ไป -->
    <a class="cta" href="${esc(cta)}">${esc(c.cta)} →</a>
    <p class="note">ไม่ต้องสมัคร · เห็นผลก่อนแล้วค่อยตัดสินใจว่าจะให้อีเมลหรือไม่</p>

    <section class="how">
      <h2>เช็กอะไรบ้าง</h2>
      <ol>
        <li>ปัญหาที่จะแก้ มีคนเดือดร้อนจริงไหม</li>
        <li>รู้หรือยังว่าลูกค้าคือใคร</li>
        <li>ข้อเสนอเคยมีคนยอมจ่ายไหม</li>
        <li>ต้นทุนกับกำไรต่อหน่วยรู้ตัวเลขหรือยัง</li>
        <li>วัดผลได้หรือยังว่าคนมาจากไหน</li>
        <li>หลักฐานที่มีพอให้ตัดสินใจลงเงินหรือยัง</li>
      </ol>
    </section>
  </main>
</body>
</html>`
}

/**
 * ประกาศเป็นตัวแปรก่อน export เพื่อให้ Worker ตัวจริงเอาไปต่อยอด/ครอบได้ง่าย
 * (และถูกกฎ lint ของโปรเจกต์นี้ด้วย)
 */
const worker = {
  /**
   * @param request คำขอที่เข้ามา
   * @param env     environment binding ของ Worker (ใช้ APP_ORIGIN ถ้าตั้งไว้)
   *
   * หมายเหตุ: Worker ตัวจริงต้องรับพารามิเตอร์ที่สามคือ `ctx` ด้วย เพราะต้องใช้
   * `ctx.waitUntil()` ตอนเขียน landing_funnel — ไฟล์อ้างอิงนี้ไม่ได้ใส่ไว้เพราะยังไม่ได้ใช้
   */
  async fetch(request, env) {
    const url = new URL(request.url)

    // ── ส่วนที่ต้องคงของเดิมไว้ ──────────────────────────────────────────────
    // Worker ตัวจริงมีโค้ดที่เขียน landing_funnel อยู่ (เป็นแหล่งข้อมูลเดียวที่เรามี
    // และเป็นที่มาของตัวเลขทุกตัวใน docs/marketing-diagnosis.md)
    // เอาโค้ดเดิมมาวางตรงนี้ อย่าลบทิ้ง และอย่าเขียนใหม่โดยไม่เทียบของเดิม
    //
    //   ctx.waitUntil(recordLandingFunnel(request, env))   // ← ต้องเพิ่ม ctx เข้า signature ด้วย
    // ────────────────────────────────────────────────────────────────────────

    if (url.pathname !== '/') {
      // เส้นทางอื่นของ Worker เดิมมาต่อตรงนี้
      return new Response('Not found', { status: 404 })
    }

    return new Response(renderPage(request.url, env?.APP_ORIGIN || APP_ORIGIN), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        // หน้าเปลี่ยนตาม seg จึงต้องบอก cache ให้แยกตาม query ไม่งั้นคนละกลุ่มจะเห็นหน้าเดียวกัน
        'cache-control': 'public, max-age=60',
      },
    })
  },
}

export default worker
