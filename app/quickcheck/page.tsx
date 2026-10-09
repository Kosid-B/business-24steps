/**
 * หน้า `/quickcheck` ฝั่ง server — มีไว้เพื่อประกาศ metadata เท่านั้น
 *
 * ทำไมต้องแยกไฟล์: ตัวฟอร์มต้องเป็น client component (useState) และ client component
 * ประกาศ `metadata` ไม่ได้ ผลคือก่อนหน้านี้ลิงก์นี้ถูกแชร์ลงโซเชียลโดยไม่มีหัวข้อ
 * ไม่มีคำบรรยาย ไม่มีรูป — ขึ้นหัวข้อรวมของเว็บทั้งเว็บแทน
 *
 * ข้อมูลใน docs/marketing-diagnosis.md บอกว่า social 32 ครั้ง → สมัคร 0 คน
 * ลิงก์ที่แชร์ออกไปแล้วไม่มีหน้าตา คือหนึ่งในสาเหตุที่กดเข้ามาแล้วออกทันที
 * (72/85 session ไม่เลื่อนหน้าเลย)
 *
 * ตรรกะทั้งหมดอยู่ใน QuickCheckForm.tsx ไฟล์นี้ไม่มีตรรกะและต้องไม่มี
 */

import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site'
import QuickCheckForm from './QuickCheckForm'

const title = 'เช็กความพร้อมธุรกิจ 6 ข้อ ก่อนลงเงินก้อนใหญ่'
const description =
  'ตอบ 6 คำถาม ใช้เวลา 2 นาที รู้คะแนนความพร้อม 0–100 และสิ่งที่ควรทำก่อนทันที ' +
  'ไม่ต้องสมัคร ไม่ต้องให้อีเมลก่อนเห็นผล'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: '/quickcheck' },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: '/quickcheck',
    siteName: 'ตั้งต้น — 24 ก้าวสร้างธุรกิจ',
    title,
    description,
  },
  twitter: { card: 'summary_large_image', title, description },
}

export default function QuickCheckPage() {
  return <QuickCheckForm />
}
