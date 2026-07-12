import type { Metadata } from 'next'
import Link from 'next/link'
import { POSTS } from '@/lib/data/blog'

export const metadata: Metadata = {
  title: 'บทความและคู่มือธุรกิจ — วางแผน มาตรฐาน จับคู่ค้า | Business Intelligent',
  description: 'คู่มือปฏิบัติสำหรับ SME ไทย — ค่าทำ ISO 9001, วิธีจับคู่ธุรกิจ, เขียนแผนธุรกิจ 1 หน้า และอื่น ๆ จาก Business Intelligent',
  alternates: { canonical: 'https://app.theossphere.com/blog' },
}

export default function BlogIndex() {
  const posts = [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1))
  return (
    <>
      <nav style={{ fontSize: 13, color: '#8E8676', marginBottom: 16 }}>
        <Link href="/" style={{ color: '#8E8676', textDecoration: 'none' }}>หน้าแรก</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ color: '#1C1A15' }}>บทความ</span>
      </nav>

      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-.02em' }}>บทความและคู่มือธุรกิจ</h1>
      <p style={{ margin: '10px 0 0', fontSize: 16, color: '#5C564A', maxWidth: 640, lineHeight: 1.7 }}>
        คู่มือปฏิบัติสำหรับผู้ประกอบการไทย — ตั้งแต่วางแผนธุรกิจ ทำมาตรฐาน ไปจนถึงหาคู่ค้า เขียนโดยทีมที่ปรึกษาของ Business Intelligent
      </p>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {posts.map(p => (
          <Link key={p.slug} href={`/blog/${p.slug}`} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 16, padding: 22, textDecoration: 'none', display: 'block' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <span className="chip" style={{ background: '#E6F0EA', color: '#16704A' }}>{p.cat}</span>
              <span style={{ fontSize: 12.5, color: '#8E8676' }}>{new Date(p.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} · อ่าน {p.readMin} นาที</span>
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: '#1C1A15' }}>{p.title}</h2>
            <p style={{ margin: 0, fontSize: 14.5, color: '#5C564A', lineHeight: 1.6 }}>{p.desc}</p>
            <span style={{ display: 'inline-block', marginTop: 12, fontSize: 14, color: '#16704A', fontWeight: 600 }}>อ่านต่อ →</span>
          </Link>
        ))}
      </div>
    </>
  )
}
