import type { Metadata } from 'next'
import Landing from '@/components/Landing'

export const metadata: Metadata = {
  title: 'ตั้งต้น — จ้างพนักงาน AI ทำมาตรฐาน ISO/TIS ใน 3 วินาที',
  description: 'เลิกจ้างที่ปรึกษาหลักแสนเพื่อทำ ISO/TIS เปลี่ยนมาจ้างพนักงาน AI ที่รู้จบทุกขั้นตอนมาตรฐานไทย ทดลองฟรี 7 วัน',
}

export default function RootPage() {
  return <Landing />
}
