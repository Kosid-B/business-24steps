import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ตั้งต้น — 24 ก้าวสร้างธุรกิจ',
  description: 'แพลตฟอร์ม SaaS พาผู้เริ่มต้นธุรกิจเดินทีละก้าวจนมีลูกค้าจ่ายเงินจริง อิงกรอบ MIT Disciplined Entrepreneurship',
  themeColor: '#16704A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full">{children}</body>
    </html>
  )
}
