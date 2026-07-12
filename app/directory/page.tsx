import type { Metadata } from 'next'
import Link from 'next/link'
import { DIR_CATS, listingsByCat } from '@/lib/data/directory'
import { LISTINGS } from '@/lib/data/content'

export const metadata: Metadata = {
  title: 'ไดเรกทอรีจับคู่ธุรกิจ — ซัพพลายเออร์ ผู้ซื้อ นักลงทุน ตัวแทน | Business Intelligent',
  description: 'ค้นหาและจับคู่กับซัพพลายเออร์ ผู้ซื้อ นักลงทุน และตัวแทนจำหน่ายไทยที่ผ่านการตรวจสอบ พร้อมคะแนนความเข้ากันจาก AI — Business Intelligent',
  alternates: { canonical: 'https://app.theossphere.com/directory' },
}

const ITEMLIST_LD = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'ไดเรกทอรีจับคู่ธุรกิจ Business Intelligent',
  numberOfItems: LISTINGS.length,
  itemListElement: LISTINGS.map((l, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: l.name,
    url: `https://app.theossphere.com/directory/${l.cat}/${l.id}`,
  })),
}

export default function DirectoryIndex() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ITEMLIST_LD) }} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: '#8E8676', marginBottom: 16 }}>
        <Link href="/" style={{ color: '#8E8676', textDecoration: 'none' }}>หน้าแรก</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ color: '#1C1A15' }}>ไดเรกทอรีจับคู่ธุรกิจ</span>
      </nav>

      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-.02em' }}>ไดเรกทอรีจับคู่ธุรกิจ</h1>
      <p style={{ margin: '10px 0 0', fontSize: 16, color: '#5C564A', maxWidth: 680, lineHeight: 1.7 }}>
        ค้นหาและจับคู่กับซัพพลายเออร์ ผู้ซื้อ นักลงทุน และตัวแทนจำหน่ายไทยที่ผ่านการตรวจสอบข้อมูลนิติบุคคลและระบุมาตรฐานที่ถืออยู่
        แต่ละรายมาพร้อมคะแนนความเข้ากันที่คำนวณด้วย AI จาก Business Intelligent — สมัครใช้งานเพื่อส่งคำขอจับคู่โดยตรง
      </p>

      {/* Category cards */}
      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
        {DIR_CATS.map(c => {
          const n = listingsByCat(c.slug).length
          return (
            <Link key={c.slug} href={`/directory/${c.slug}`} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 16, padding: 20, textDecoration: 'none', display: 'block' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 17, color: c.color }}>{c.th}</span>
                <span className="mono" style={{ fontSize: 13, color: '#8E8676' }}>{n} ราย</span>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: '#5C564A', lineHeight: 1.55 }}>{c.blurb}</p>
              <span style={{ display: 'inline-block', marginTop: 12, fontSize: 13.5, color: c.color, fontWeight: 600 }}>ดูทั้งหมด →</span>
            </Link>
          )
        })}
      </div>

      {/* All listings preview */}
      <h2 style={{ margin: '40px 0 16px', fontSize: 22, fontWeight: 700 }}>ธุรกิจในระบบทั้งหมด</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {LISTINGS.map(l => {
          const cat = DIR_CATS.find(c => c.slug === l.cat)!
          return (
            <Link key={l.id} href={`/directory/${l.cat}/${l.id}`} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 14, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', textDecoration: 'none' }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: cat.color + '14', color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{l.initials || l.name[0]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span className="chip" style={{ background: cat.color + '14', color: cat.color }}>{cat.th}</span>
                  <span className="chip" style={{ background: '#F1ECDF', color: '#5C564A' }}>{l.group}</span>
                  {l.verified && <span className="chip" style={{ background: '#E6F0EA', color: '#16704A' }}>✓ ยืนยันแล้ว</span>}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15.5, color: '#1C1A15' }}>{l.name}</div>
                <div style={{ fontSize: 13.5, color: '#5C564A', lineHeight: 1.5, margin: '2px 0 4px' }}>{l.headline}</div>
                <div style={{ fontSize: 12.5, color: '#8E8676' }}>{l.loc} · {l.kind}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
