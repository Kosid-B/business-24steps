// Anonymous top-of-funnel tracking (ก่อน signup) — ยิงไป edge function track-event
// PDPA: anon_id เป็น random ที่ client สร้างเอง ไม่ใช่ PII, ไม่เก็บ IP
const FN = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/track-event'
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function anonId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = localStorage.getItem('bi_anon_id')
    if (!id) {
      id = (crypto.randomUUID?.() ?? String(Math.random()).slice(2))
      localStorage.setItem('bi_anon_id', id)
    }
    return id
  } catch {
    return ''
  }
}

export function trackAnon(event: string, props: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  try {
    fetch(FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON || '' },
      body: JSON.stringify({ event, anon_id: anonId(), props }),
      keepalive: true, // ให้ request รอดแม้ผู้ใช้กดลิงก์ออกไปทันที
    }).catch(() => {})
  } catch {
    /* non-blocking */
  }
}
