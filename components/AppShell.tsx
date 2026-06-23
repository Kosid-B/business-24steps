'use client'

import { AppProvider } from '@/lib/context/AppContext'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import Toast from '@/components/ui/Toast'

export default function AppShell({ userId, userEmail, userName, children }: {
  userId: string; userEmail: string; userName: string; children: React.ReactNode
}) {
  return (
    <AppProvider userId={userId} userEmail={userEmail} userName={userName}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F6F2E8' }}>
        <Sidebar />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Topbar />
          <main className="tt-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <div style={{ padding: '30px 36px 44px', maxWidth: 900, margin: '0 auto' }}>
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toast />
    </AppProvider>
  )
}
