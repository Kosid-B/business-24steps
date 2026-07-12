import type { MetadataRoute } from 'next'

// เฉพาะหน้า public ที่ crawl ได้ (ที่เหลืออยู่หลัง auth)
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://app.theossphere.com'
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/login`, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
