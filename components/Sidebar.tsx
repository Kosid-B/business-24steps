'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/lib/context/AppContext'

const NAV = [
  { href: '/', label: 'หน้าแรก', icon: 'M4 11l8-7 8 7M6 10v9h12v-9' },
  { href: '/roadmap', label: 'เส้นทาง 24 ก้าว', icon: 'M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2ZM9 4v14M15 6v14' },
  { href: '/learn', label: 'บทเรียน & บทความ', icon: 'M4 5.5A2 2 0 0 1 6 4h13v15H6a2 2 0 0 0-2 2V5.5ZM19 19H6a2 2 0 0 0-2 2' },
  { href: '/plan', label: 'แผนธุรกิจ', icon: 'M7 3h7l5 5v13H7zM14 3v5h5M9 13h6M9 17h6' },
  { href: '/market', label: 'จับคู่ธุรกิจ', icon: 'M8 11l2.5-2.5a2 2 0 0 1 3 0L18 13M11 13l2 2M9 15l2 2' },
  { href: '/rank', label: 'อันดับ & ความสำเร็จ', icon: 'M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0zM7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3' },
  { href: '/consult', label: 'ปรึกษา Live', icon: 'M4 5h16v11H9l-4 3.5V16H4ZM8 9h8M8 12h5' },
  { href: '/live', label: 'Live สด', icon: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM10 8.5l5 3.5-5 3.5Z' },
  { href: '/plg', label: 'กลยุทธ์เติบโต', icon: 'M3 17l5-5 4 4 8-9M16 7h5v5' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { state, setSidebarOpen } = useApp()
  const open = state.sidebarOpen !== false

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <aside style={{
      width: open ? 248 : 68,
      flexShrink: 0,
      background: '#FFFDF7',
      borderRight: '1px solid #E5DECC',
      display: 'flex',
      flexDirection: 'column',
      padding: open ? '20px 14px' : '20px 10px',
      gap: 4,
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      transition: 'width .25s cubic-bezier(.22,.61,.36,1)',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 14px', marginBottom: 4 }}>
        <span style={{ width: 38, height: 38, borderRadius: 11, background: '#16704A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 19, flexShrink: 0 }}>B.</span>
        {open && (
          <div style={{ lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1A15' }}>ตั้งต้น</div>
            <div style={{ fontSize: 11, color: '#8E8676' }}>24 ก้าวสร้างธุรกิจ</div>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!open)}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#8E8676', padding: 4, borderRadius: 6, flexShrink: 0 }}
          title={open ? 'ย่อแถบด้านข้าง' : 'ขยายแถบด้านข้าง'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M15 19l-7-7 7-7" /> : <path d="M9 5l7 7-7 7" />}
          </svg>
        </button>
      </div>

      {/* Nav */}
      {NAV.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-btn ${isActive(item.href) ? 'active' : ''}`}
          title={!open ? item.label : undefined}
          style={{ justifyContent: open ? 'flex-start' : 'center' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d={item.icon} />
          </svg>
          {open && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
        </Link>
      ))}

      {/* Bottom */}
      <div style={{ marginTop: 'auto', paddingTop: 12 }}>
        {open && state.plan === 'free' && (
          <div style={{ background: '#FBEAE3', border: '1px solid #f0c4b4', borderRadius: 14, padding: '13px 14px', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1A15' }}>ทดลองฟรี เหลือ 15 วัน</div>
            <Link href="/membership" style={{ display: 'block', marginTop: 9, width: '100%', textAlign: 'center', minHeight: 38, lineHeight: '38px', borderRadius: 9, background: '#E8623D', color: '#fff', fontWeight: 600, fontSize: 13.5, textDecoration: 'none' }}>
              สมัครสมาชิก
            </Link>
          </div>
        )}
        {open && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 12, background: '#F1ECDF' }}>
            <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#16704A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0, fontSize: 14 }}>
              {state.account?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1C1A15', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {state.venture?.name || state.account?.name || 'ธุรกิจของคุณ'}
              </div>
              <div style={{ fontSize: 11, color: '#8E8676' }}>
                {state.plan === 'free' ? 'ทดลองใช้' : state.plan === 'monthly' ? 'แผนรายเดือน' : 'แผนรายปี'}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
