<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# CEO AI Thailand — กฎสำหรับ AI ทุกตัวที่แตะโค้ดนี้

โปรเจกต์นี้มี **ธรรมนูญ** ที่บังคับใช้จริง ไม่ใช่คำโฆษณา
อ่านฉบับเต็มที่ `docs/founder-constitution.md` · ฉบับที่เครื่องอ่านได้ที่ `lib/constitution/`

## Golden Question — ถามทุกครั้งก่อนลงมือ

> **สิ่งที่กำลังทำนี้ช่วยให้ธุรกิจเข้าใกล้ลูกค้า หลักฐาน กำไร หรือ Scale มากขึ้นอย่างไร?**

**ตอบไม่ได้ = ไม่ต้องสร้าง** ห้ามสร้าง feature หรือ content เพียงเพราะ AI ทำได้
ถ้าผู้ใช้ขอสิ่งที่ตอบคำถามนี้ไม่ได้ ให้บอกตรง ๆ แล้วเสนอสิ่งที่ใกล้เคียงที่สุดที่ตอบได้

## Product DNA

> Think Big. Start Small. Validate Fast. Learn Continuously. Build Systems. Scale Intelligently.

## Mission — ห่วงโซ่ที่ทุกฟีเจอร์ต้องรู้ว่าตัวเองอยู่ตรงไหน

```
ไอเดีย → ลูกค้า → หลักฐาน → รายได้ → ระบบ → Scale
```

## ข้อห้าม — ห้ามเขียนโค้ดที่ทำสิ่งเหล่านี้

1. สร้าง content เพียงเพราะ AI สร้างได้ โดยตอบ Golden Question ไม่ได้
2. พาผู้ใช้ไป scale เงียบ ๆ ทั้งที่ยังไม่ผ่าน Validation Gate โดยไม่เตือน
3. นับความเห็นของ AI หรือของผู้ก่อตั้งเป็นหลักฐาน
4. ให้รางวัล (คะแนน / ยศ / ป้าย) กับกิจกรรมที่ไม่มีหลักฐานรองรับ
5. แสดงตัวเลขที่คำนวณไม่ได้เป็น `0` หรือเดา — ให้คืน `null` แล้วแสดง "—" พร้อมบอกว่าต้องกรอกอะไรเพิ่ม

> ข้อ 4 **มีหนี้ค้างอยู่จริงในโค้ดตอนนี้**: `lib/game.ts` คิด XP จากกิจกรรมล้วน ๆ
> อย่าต่อยอดรูปแบบนี้เพิ่ม และอย่าแก้เองโดยไม่ถามเจ้าของโปรเจกต์ (กระทบยศผู้ใช้เดิม)

## Validation Gate

ก่อนเขียนโค้ดที่พาผู้ใช้ไปใช้เงินขยายผล (ยิงโฆษณา · จ้างทีม · ผลิตล็อตใหญ่ ·
เปิดช่องทางใหม่ · ระดมทุน) ให้เรียก:

```ts
import { readiness, warnBeforeScale, describeSkip } from '@/lib/constitution/gate'

const r = readiness(state)                              // state จาก AppContext ใช้ได้ตรง ๆ
const warn = warnBeforeScale('ยิงโฆษณาแบบเสียเงิน', r)   // null = พร้อมแล้ว ไม่ต้องเตือน
```

**เตือนแรง แต่ห้ามบล็อก** — ถ้าผู้ใช้ยืนยันจะข้าม ต้องบันทึกด้วย `describeSkip()`
การข้ามที่ไม่ถูกบันทึก = ข้อมูลที่หายไปตลอดกาล และผิดหลัก Compounding Learning

## กฎการเขียนโค้ดในโฟลเดอร์ `lib/constitution/`

- `constitution.ts` **ห้าม import อะไรทั้งสิ้น** — ธรรมนูญต้องไม่ผูกกับ UI, DB หรือ framework
- `gate.ts` ต้องเป็น **ฟังก์ชันบริสุทธิ์** — ห้ามแตะ DB, network, React
- แก้ตรรกะเมื่อไร ต้องมี unit test คุมเสมอ (`npm test`)
- เคสที่ห้ามให้แตกเด็ดขาด: **กดว่าทำครบ 24 ขั้นโดยไม่กรอกอะไรเลย ต้องยังไม่ `ready`**
  ถ้าเทสต์เคสนี้ผ่านเมื่อไร แปลว่าธรรมนูญถูกทำให้ไร้ผล

## แก้ธรรมนูญ

แก้ `docs/founder-constitution.md` แล้ว **ต้องแก้ `lib/constitution/constitution.ts` ด้วยเสมอ**
ไม่งั้นธรรมนูญนั้นไม่มีผลกับระบบ · ขึ้นเวอร์ชันและบันทึกเหตุผล + หลักฐานที่ทำให้เปลี่ยนใจ
ตามหัวข้อ "วิธีแก้ธรรมนูญ" ในเอกสาร

## คำสั่งที่ใช้บ่อย

```bash
npm run dev      # รันเครื่องพัฒนา
npm test         # ชุดทดสอบธรรมนูญ (vitest)
npm run lint     # eslint
npm run build    # next build
npx tsc --noEmit # ตรวจ type
```
