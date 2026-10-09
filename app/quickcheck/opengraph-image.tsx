/**
 * รูปพรีวิวตอนแชร์ลิงก์ `/quickcheck` — สร้างจากโค้ด ไม่ต้องมีไฟล์รูปในโปรเจกต์
 * Next จะใส่ `og:image` และ `twitter:image` ให้เองจากไฟล์ชื่อนี้
 * สีตรงกับที่ใช้ในแอป: เขียว #16704A บนพื้นครีม #F6F2E8
 */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'เช็กความพร้อมธุรกิจ 6 ข้อ ก่อนลงเงินก้อนใหญ่'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#F6F2E8',
          padding: '80px 88px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 48 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: '#16704A',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            B.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 32, color: '#1C1A15', fontWeight: 700 }}>ตั้งต้น</div>
            <div style={{ fontSize: 20, color: '#8E8676' }}>24 ก้าวสร้างธุรกิจ</div>
          </div>
        </div>

        <div style={{ fontSize: 62, lineHeight: 1.25, color: '#1C1A15', fontWeight: 700 }}>
          เช็กความพร้อมธุรกิจ 6 ข้อ
        </div>
        <div style={{ fontSize: 62, lineHeight: 1.25, color: '#16704A', fontWeight: 700 }}>
          ก่อนลงเงินก้อนใหญ่
        </div>

        <div style={{ fontSize: 28, color: '#5C564A', marginTop: 36 }}>
          2 นาที · ไม่ต้องสมัคร · รู้คะแนน 0–100 และสิ่งที่ควรทำก่อน
        </div>
      </div>
    ),
    size,
  )
}
