/**
 * URL หลักของเว็บ ใช้แปลงลิงก์แบบ relative ใน metadata ให้เป็น absolute
 * (og:url, og:image, canonical) — ถ้าไม่ตั้ง Next จะเตือนและใช้ localhost
 *
 * ลำดับ: ตั้งเองด้วย NEXT_PUBLIC_SITE_URL ก่อน → โดเมน production ของ Vercel → localhost
 * ตั้ง NEXT_PUBLIC_SITE_URL ใน Vercel เมื่อผูกโดเมนจริงแล้ว เพื่อให้ลิงก์ที่แชร์ชี้โดเมนนั้น
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
