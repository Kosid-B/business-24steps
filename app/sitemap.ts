import type { MetadataRoute } from 'next'
import { DIR_CATS } from '@/lib/data/directory'
import { LISTINGS } from '@/lib/data/content'

// หน้า public ทั้งหมดที่ crawl ได้ (landing + directory) — ส่วน app หลัง auth ไม่รวม
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://app.theossphere.com'
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/login`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/directory`, changeFrequency: 'weekly', priority: 0.9 },
    ...DIR_CATS.map(c => ({
      url: `${base}/directory/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...LISTINGS.map(l => ({
      url: `${base}/directory/${l.cat}/${l.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
