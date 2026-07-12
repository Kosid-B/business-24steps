import type { Metadata } from 'next'
import Landing from '@/components/Landing'

export const metadata: Metadata = {
  title: 'Business Intelligent — AI สร้างธุรกิจ วางแผน จับคู่ค้า ทำมาตรฐาน ISO/TIS',
  description: 'แพลตฟอร์มปัญญาธุรกิจสำหรับ SME ไทย — วางแผนธุรกิจ 24 ก้าวด้วย AI, จับคู่ซัพพลายเออร์/นักลงทุน, และทำเอกสารมาตรฐาน ISO/มอก. อัตโนมัติ ทดลองฟรี 7 วัน',
  keywords: ['สร้างธุรกิจ', 'AI ธุรกิจ', 'แผนธุรกิจ', 'ISO', 'มอก.', 'TIS', 'จับคู่ธุรกิจ', 'SME ไทย', 'business intelligent'],
  openGraph: {
    title: 'Business Intelligent — AI สร้างธุรกิจครบวงจรสำหรับ SME ไทย',
    description: 'วางแผน 24 ก้าว จับคู่คู่ค้า ทำมาตรฐาน ISO/มอก. ด้วยพนักงาน AI — ทดลองฟรี 7 วัน',
    type: 'website',
    locale: 'th_TH',
    url: 'https://app.theossphere.com',
    siteName: 'Business Intelligent',
  },
  alternates: { canonical: 'https://app.theossphere.com' },
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Business Intelligent',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'แพลตฟอร์มปัญญาธุรกิจสำหรับ SME ไทย — วางแผนธุรกิจด้วย AI, จับคู่ธุรกิจ, และทำเอกสารมาตรฐาน ISO/มอก. อัตโนมัติ',
  url: 'https://app.theossphere.com',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'THB',
    lowPrice: '6900',
    highPrice: '49000',
    offerCount: '3',
  },
  provider: {
    '@type': 'Organization',
    name: 'B. Training Consultant Co., Ltd.',
    email: 'support@b-tctraining.com',
  },
}

export default function RootPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Landing />
    </>
  )
}
