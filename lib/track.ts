import { createClient } from '@/lib/supabase/client'

/**
 * First-party funnel tracking (Dark AI Marketing #3/#14).
 * เก็บเฉพาะ event ของผู้ใช้ที่ login แล้ว (member_id = auth.uid() ผ่าน RLS)
 * non-blocking: ล้มเหลวเงียบ ไม่กระทบ UX
 */
export async function track(event: string, props: Record<string, unknown> = {}) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('funnel_events').insert({ event, props })
  } catch {
    /* tracking ต้องไม่ทำให้ flow หลักพัง */
  }
}
