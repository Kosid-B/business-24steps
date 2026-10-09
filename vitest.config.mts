import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

/**
 * มีไฟล์นี้เพื่ออย่างเดียว: ให้เทสต์ resolve alias `@/` ได้เหมือนที่ Next ทำ
 * เพื่อให้เทสต์ route handler ที่ import `@/lib/...` ได้ตรง ๆ โดยไม่ต้องแก้โค้ดจริง
 * ส่วนอื่นคงค่าเริ่มต้นของ vitest ไว้ทั้งหมด ไม่เปลี่ยนการค้นหาไฟล์เทสต์
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
})
