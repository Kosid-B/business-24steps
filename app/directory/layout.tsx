import Link from 'next/link'

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F6F2E8', color: '#1C1A15', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #E5DECC', background: '#FFFDF7' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: '#16704A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17 }}>B.</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1C1A15' }}>Business Intelligent</span>
          </Link>
          <Link href="/login" style={{ fontSize: 14, color: '#16704A', fontWeight: 600, textDecoration: 'none' }}>เข้าสู่ระบบ →</Link>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1080, width: '100%', margin: '0 auto', padding: '32px 24px 56px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #E5DECC', background: '#FFFDF7' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#8E8676' }}>
          <span>© {new Date().getFullYear()} B. Training Consultant Co., Ltd. · Business Intelligent</span>
          <Link href="/directory" style={{ color: '#16704A', textDecoration: 'none', fontWeight: 600 }}>ไดเรกทอรีจับคู่ธุรกิจ</Link>
        </div>
      </footer>
    </div>
  )
}
