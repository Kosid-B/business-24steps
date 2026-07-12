import type { MetadataRoute } from 'next'

// เปิดให้ crawl เฉพาะหน้า public — ส่วน app ทั้งหมดอยู่หลัง auth ไม่มีประโยชน์ต่อ SEO
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/roadmap', '/step', '/plan', '/market', '/learn', '/rank', '/consult', '/live', '/plg', '/coach', '/membership', '/auth'],
    },
    sitemap: 'https://app.theossphere.com/sitemap.xml',
  }
}
