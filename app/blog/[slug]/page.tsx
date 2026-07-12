import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { POSTS, postBySlug } from '@/lib/data/blog'

export function generateStaticParams() {
  return POSTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = postBySlug(slug)
  if (!post) return {}
  return {
    title: `${post.title} | Business Intelligent`,
    description: post.desc,
    keywords: post.keywords,
    alternates: { canonical: `https://app.theossphere.com/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.desc, type: 'article', locale: 'th_TH' },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = postBySlug(slug)
  if (!post) notFound()

  const related = POSTS.filter(p => p.slug !== post.slug).slice(0, 2)

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.desc,
    datePublished: post.date,
    inLanguage: 'th-TH',
    author: { '@type': 'Organization', name: 'Business Intelligent' },
    publisher: { '@type': 'Organization', name: 'B. Training Consultant Co., Ltd.' },
    mainEntityOfPage: `https://app.theossphere.com/blog/${post.slug}`,
    keywords: post.keywords.join(', '),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      <nav style={{ fontSize: 13, color: '#8E8676', marginBottom: 16 }}>
        <Link href="/" style={{ color: '#8E8676', textDecoration: 'none' }}>หน้าแรก</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <Link href="/blog" style={{ color: '#8E8676', textDecoration: 'none' }}>บทความ</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ color: '#1C1A15' }}>{post.cat}</span>
      </nav>

      <article>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <span className="chip" style={{ background: '#E6F0EA', color: '#16704A' }}>{post.cat}</span>
          <span style={{ fontSize: 12.5, color: '#8E8676' }}>{new Date(post.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} · อ่าน {post.readMin} นาที</span>
        </div>

        <h1 style={{ margin: '0 0 14px', fontSize: 30, fontWeight: 700, letterSpacing: '-.01em', lineHeight: 1.3 }}>{post.title}</h1>
        <p style={{ margin: '0 0 28px', fontSize: 17, color: '#5C564A', lineHeight: 1.75 }}>{post.lead}</p>

        {post.body.map((s, i) => (
          <section key={i} style={{ marginBottom: 26 }}>
            {s.h && <h2 style={{ margin: '0 0 12px', fontSize: 21, fontWeight: 700, color: '#1C1A15' }}>{s.h}</h2>}
            {s.p?.map((para, j) => (
              <p key={j} style={{ margin: '0 0 12px', fontSize: 16, color: '#3B3730', lineHeight: 1.8 }}>{para}</p>
            ))}
            {s.ul && (
              <ul style={{ margin: '4px 0 0', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {s.ul.map((li, k) => (
                  <li key={k} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15.5, color: '#3B3730', lineHeight: 1.6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16704A', flexShrink: 0, marginTop: 9 }} />
                    <span>{li}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* CTA */}
        <div style={{ marginTop: 32, background: 'linear-gradient(135deg,#16704A,#0F5536)', borderRadius: 18, padding: '26px 28px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 19, marginBottom: 6 }}>เริ่มลงมือกับ Business Intelligent</div>
          <div style={{ fontSize: 14.5, opacity: .9, marginBottom: 18, maxWidth: 460, margin: '0 auto 18px' }}>แพลตฟอร์มปัญญาธุรกิจที่พา SME ไทยเดินครบตั้งแต่วางแผน จับคู่ค้า ไปจนถึงทำมาตรฐาน</div>
          <Link href={post.ctaHref} style={{ display: 'inline-block', background: '#fff', color: '#0F5536', fontWeight: 700, fontSize: 15, padding: '13px 26px', borderRadius: 12, textDecoration: 'none' }}>{post.ctaLabel}</Link>
        </div>
      </article>

      {/* Related */}
      <h2 style={{ margin: '40px 0 14px', fontSize: 19, fontWeight: 700 }}>อ่านต่อ</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {related.map(r => (
          <Link key={r.slug} href={`/blog/${r.slug}`} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 14, padding: 16, textDecoration: 'none', display: 'block' }}>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: '#1C1A15', marginBottom: 3 }}>{r.title}</div>
            <div style={{ fontSize: 13, color: '#8E8676' }}>{r.desc}</div>
          </Link>
        ))}
      </div>
    </>
  )
}
