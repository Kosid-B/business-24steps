import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LISTINGS } from '@/lib/data/content'
import { catBySlug, listingById, listingsByCat } from '@/lib/data/directory'

export function generateStaticParams() {
  return LISTINGS.map(l => ({ category: l.cat, id: l.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; id: string }> }): Promise<Metadata> {
  const { category, id } = await params
  const l = listingById(id)
  const cat = catBySlug(category)
  if (!l || !cat) return {}
  return {
    title: `${l.name} | ${cat.th} | Business Intelligent`,
    description: `${l.headline} — ${l.loc} · ${l.kind}. จับคู่ธุรกิจกับ ${l.name} บน Business Intelligent`,
    alternates: { canonical: `https://app.theossphere.com/directory/${cat.slug}/${l.id}` },
  }
}

export default async function ListingPage({ params }: { params: Promise<{ category: string; id: string }> }) {
  const { category, id } = await params
  const l = listingById(id)
  const cat = catBySlug(category)
  if (!l || !cat || l.cat !== cat.slug) notFound()

  const related = listingsByCat(cat.slug).filter(r => r.id !== l.id).slice(0, 3)

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: l.name,
    description: l.headline,
    areaServed: l.loc,
    category: cat.th,
    provider: { '@type': 'Organization', name: l.name },
    ...(l.rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(l.rating),
        reviewCount: String(l.reviews ?? 1),
        bestRating: '5',
      },
    } : {}),
  }

  const facts: { label: string; val: string }[] = [
    { label: 'ที่ตั้ง', val: l.loc },
    { label: 'ประเภท', val: l.kind },
    { label: 'กลุ่มธุรกิจ', val: l.group },
    { label: 'กำลังมองหา', val: l.seek },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: '#8E8676', marginBottom: 16 }}>
        <Link href="/" style={{ color: '#8E8676', textDecoration: 'none' }}>หน้าแรก</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <Link href="/directory" style={{ color: '#8E8676', textDecoration: 'none' }}>ไดเรกทอรี</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <Link href={`/directory/${cat.slug}`} style={{ color: '#8E8676', textDecoration: 'none' }}>{cat.th}</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ color: '#1C1A15' }}>{l.name}</span>
      </nav>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <span className="chip" style={{ background: cat.color + '18', color: cat.color }}>{cat.th}</span>
        <span className="chip" style={{ background: '#F1ECDF', color: '#5C564A' }}>{l.group}</span>
        {l.verified && <span className="chip" style={{ background: '#E6F0EA', color: '#16704A' }}>✓ ยืนยันแล้ว</span>}
        {l.rating && <span className="chip" style={{ background: '#F6EECF', color: '#A87A1E' }}>⭐ {l.rating} ({l.reviews} รีวิว)</span>}
      </div>

      <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: '#1C1A15' }}>{l.name}</h1>
      <p style={{ margin: '0 0 22px', fontSize: 16, color: '#5C564A', lineHeight: 1.65, maxWidth: 720 }}>{l.headline}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 22 }}>
        {facts.map(f => (
          <div key={f.label} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 13, padding: '13px 16px' }}>
            <div style={{ fontSize: 11.5, color: '#8E8676', fontWeight: 600, marginBottom: 3 }}>{f.label}</div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1C1A15' }}>{f.val}</div>
          </div>
        ))}
      </div>

      {l.reqs && l.reqs.length > 0 && (
        <div style={{ background: '#F6F2E8', borderRadius: 16, padding: '16px 18px', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1C1A15', marginBottom: 8 }}>มาตรฐาน / ใบรับรองที่เกี่ยวข้อง</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {l.reqs.map(r => <span key={r} className="chip" style={{ background: cat.color + '14', color: cat.color }}>{r}</span>)}
          </div>
        </div>
      )}

      {/* CTA (มูลค่าดีล + จับคู่ อยู่หลัง signup) */}
      <div style={{ background: 'linear-gradient(135deg,#16704A,#0F5536)', borderRadius: 18, padding: '24px 26px', color: '#fff', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>สนใจจับคู่กับ {l.name}?</div>
          <div style={{ fontSize: 14, opacity: .9, marginTop: 2 }}>สมัคร Business Intelligent เพื่อดูมูลค่าดีลโดยประมาณ คะแนน Match และส่งคำขอจับคู่โดยตรง</div>
        </div>
        <Link href="/login" style={{ background: '#fff', color: '#0F5536', fontWeight: 700, fontSize: 15, padding: '12px 22px', borderRadius: 11, textDecoration: 'none', whiteSpace: 'nowrap' }}>เริ่มฟรี 7 วัน →</Link>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <>
          <h2 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 700 }}>{cat.th}อื่นที่คล้ายกัน</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {related.map(r => (
              <Link key={r.id} href={`/directory/${cat.slug}/${r.id}`} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 14, padding: 14, display: 'flex', gap: 12, alignItems: 'center', textDecoration: 'none' }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: cat.color + '14', color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{r.initials || r.name[0]}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: '#1C1A15' }}>{r.name}</div>
                  <div style={{ fontSize: 12.5, color: '#8E8676', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.headline}</div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  )
}
