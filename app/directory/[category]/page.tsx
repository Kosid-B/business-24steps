import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DIR_CATS, catBySlug, listingsByCat } from '@/lib/data/directory'

export function generateStaticParams() {
  return DIR_CATS.map(c => ({ category: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const cat = catBySlug(category)
  if (!cat) return {}
  return {
    title: `${cat.th}จับคู่ธุรกิจ — ค้นหา${cat.th}ไทยที่ผ่านการตรวจสอบ | Business Intelligent`,
    description: cat.intro.slice(0, 155),
    alternates: { canonical: `https://app.theossphere.com/directory/${cat.slug}` },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = catBySlug(category)
  if (!cat) notFound()

  const listings = listingsByCat(cat.slug)
  const others = DIR_CATS.filter(c => c.slug !== cat.slug)

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cat.th}จับคู่ธุรกิจ — Business Intelligent`,
    numberOfItems: listings.length,
    itemListElement: listings.map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: l.name,
      url: `https://app.theossphere.com/directory/${cat.slug}/${l.id}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: '#8E8676', marginBottom: 16 }}>
        <Link href="/" style={{ color: '#8E8676', textDecoration: 'none' }}>หน้าแรก</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <Link href="/directory" style={{ color: '#8E8676', textDecoration: 'none' }}>ไดเรกทอรี</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ color: '#1C1A15' }}>{cat.th}</span>
      </nav>

      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-.02em', color: cat.color }}>{cat.th}จับคู่ธุรกิจ</h1>
      <p style={{ margin: '12px 0 0', fontSize: 15.5, color: '#5C564A', maxWidth: 720, lineHeight: 1.75 }}>{cat.intro}</p>

      <h2 style={{ margin: '32px 0 14px', fontSize: 20, fontWeight: 700 }}>{cat.th}ในระบบ ({listings.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {listings.map(l => (
          <Link key={l.id} href={`/directory/${cat.slug}/${l.id}`} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 14, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', textDecoration: 'none' }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: cat.color + '14', color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{l.initials || l.name[0]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span className="chip" style={{ background: '#F1ECDF', color: '#5C564A' }}>{l.group}</span>
                {l.verified && <span className="chip" style={{ background: '#E6F0EA', color: '#16704A' }}>✓ ยืนยันแล้ว</span>}
                {l.rating && <span className="chip" style={{ background: '#F6EECF', color: '#A87A1E' }}>⭐ {l.rating}</span>}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15.5, color: '#1C1A15' }}>{l.name}</div>
              <div style={{ fontSize: 13.5, color: '#5C564A', lineHeight: 1.5, margin: '2px 0 4px' }}>{l.headline}</div>
              <div style={{ fontSize: 12.5, color: '#8E8676' }}>{l.loc} · {l.kind}</div>
            </div>
          </Link>
        ))}
        {listings.length === 0 && <div style={{ color: '#8E8676', fontSize: 15, padding: '12px 0' }}>ยังไม่มีรายการในหมวดนี้</div>}
      </div>

      {/* Cross-links to other categories */}
      <h2 style={{ margin: '36px 0 14px', fontSize: 18, fontWeight: 700 }}>หมวดอื่น</h2>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {others.map(c => (
          <Link key={c.slug} href={`/directory/${c.slug}`} style={{ padding: '8px 16px', borderRadius: 999, border: `1.5px solid ${c.color}55`, color: c.color, fontSize: 13.5, fontWeight: 600, textDecoration: 'none', background: '#FFFDF7' }}>
            {c.th}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div style={{ marginTop: 40, background: 'linear-gradient(135deg,#16704A,#0F5536)', borderRadius: 18, padding: '24px 26px', color: '#fff', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>พร้อมจับคู่กับ{cat.th}เหล่านี้แล้วหรือยัง?</div>
          <div style={{ fontSize: 14, opacity: .9, marginTop: 2 }}>สมัคร Business Intelligent เพื่อดูรายละเอียดและส่งคำขอจับคู่โดยตรง</div>
        </div>
        <Link href="/login" style={{ background: '#fff', color: '#0F5536', fontWeight: 700, fontSize: 15, padding: '12px 22px', borderRadius: 11, textDecoration: 'none', whiteSpace: 'nowrap' }}>เริ่มฟรี 7 วัน →</Link>
      </div>
    </>
  )
}
