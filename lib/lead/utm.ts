/**
 * อ่านที่มาของผู้เข้าชม (UTM) ให้ไม่หายระหว่างทาง
 *
 * ปัญหาที่เจอตอนทดสอบจริง: คนกดโฆษณามาลง `/login?utm_source=facebook&...`
 * แล้วกดลิงก์ "ยังไม่พร้อมสมัคร? เช็ก 6 ข้อ" ต่อไปที่ `/quickcheck`
 * query string ไม่ติดไปด้วย → lead ที่เก็บได้กลายเป็นไม่รู้ที่มา
 *
 * ซึ่งคือปัญหาเดียวกับที่วินิจฉัยไว้เป๊ะ ๆ: 83 จาก 85 session ไม่มี UTM
 * ถ้าไม่รู้ว่า lead มาจากช่องทางไหน ก็ตัดสินใจไม่ได้ว่าควรลงแรงต่อที่ไหน
 *
 * ทางแก้: ถ้าหน้านี้ไม่มี UTM ให้ย้อนไปอ่านจาก referrer ที่เป็นเว็บเราเอง
 * จำกัดเฉพาะ same-origin เพราะ query string จากเว็บอื่นเป็นข้อมูลที่เราคุมไม่ได้
 *
 * ฟังก์ชันบริสุทธิ์ — ไม่แตะ window เพื่อให้เทสต์ได้ตรง ๆ
 */

export interface Utm {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  seg?: string
  referrer?: string
}

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'seg'] as const

function pick(search: string): Utm {
  const p = new URLSearchParams(search)
  const out: Utm = {}
  for (const k of KEYS) {
    const v = p.get(k)
    if (v) out[k] = v
  }
  return out
}

/** referrer เป็นหน้าของเราเองไหม — ถ้าใช่ค่อยเชื่อ query string ของมัน */
function sameOriginSearch(referrer: string, origin: string): string {
  try {
    const u = new URL(referrer)
    return u.origin === origin ? u.search : ''
  } catch {
    return ''
  }
}

export function readUtmFrom(search: string, referrer: string, origin: string): Utm {
  const own = pick(search)
  // มี UTM ของตัวเองแล้วก็ใช้อันนั้น ไม่ต้องย้อนไปดู referrer
  const utm = Object.keys(own).length > 0 ? own : pick(sameOriginSearch(referrer, origin))
  return { ...utm, referrer: referrer || undefined }
}
