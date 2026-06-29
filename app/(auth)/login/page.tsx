'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name, company } },
        })
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F6F2E8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
          <span style={{ width: 48, height: 48, borderRadius: 14, background: '#16704A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22 }}>B.</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#1C1A15' }}>ตั้งต้น</div>
            <div style={{ fontSize: 12, color: '#8E8676' }}>24 ก้าวสร้างธุรกิจ</div>
          </div>
        </div>

        <div className="card card-pad" style={{ borderRadius: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 22, color: '#1C1A15', marginBottom: 6 }}>
            {mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครทดลองฟรี 15 วัน'}
          </h2>
          <p style={{ fontSize: 14, color: '#8E8676', marginBottom: 24 }}>
            {mode === 'login' ? 'ยินดีต้อนรับกลับ' : 'ไม่ต้องใช้บัตรเครดิต · ปลดล็อกทั้งระบบทันที'}
          </p>

          {error && (
            <div style={{ background: '#FBEAE3', border: '1px solid #f0c4b4', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: '#C0573B', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#5C564A', display: 'block', marginBottom: 6 }}>ชื่อ-นามสกุล</label>
                  <input className="tt-input" value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อของคุณ" required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#5C564A', display: 'block', marginBottom: 6 }}>ชื่อธุรกิจ/โปรเจกต์</label>
                  <input className="tt-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="เช่น Brew Lab, ร้านอาหาร, SaaS ใหม่" />
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#5C564A', display: 'block', marginBottom: 6 }}>อีเมล</label>
              <input className="tt-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#5C564A', display: 'block', marginBottom: 6 }}>รหัสผ่าน</label>
              <input className="tt-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="อย่างน้อย 8 ตัวอักษร" required minLength={8} />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4, fontSize: 16 }}>
              {loading ? 'กำลังดำเนินการ…' : mode === 'login' ? 'เข้าสู่ระบบ' : 'เริ่มทดลองฟรี'}
            </button>
          </form>

          <div style={{ position: 'relative', margin: '20px 0', textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #E5DECC', position: 'absolute', top: '50%', left: 0, right: 0 }} />
            <span style={{ position: 'relative', background: '#FFFDF7', padding: '0 12px', fontSize: 12, color: '#8E8676' }}>หรือ</span>
          </div>

          <button className="btn btn-ghost" onClick={handleGoogle} disabled={loading} style={{ width: '100%', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            เข้าด้วย Google
          </button>

          <p style={{ textAlign: 'center', fontSize: 13.5, color: '#8E8676', marginTop: 20 }}>
            {mode === 'login' ? (
              <>ยังไม่มีบัญชี? <button onClick={() => { setMode('signup'); setError('') }} style={{ background: 'none', border: 'none', color: '#16704A', fontWeight: 600, cursor: 'pointer', fontSize: 13.5 }}>สมัครฟรี →</button></>
            ) : (
              <>มีบัญชีแล้ว? <button onClick={() => { setMode('login'); setError('') }} style={{ background: 'none', border: 'none', color: '#16704A', fontWeight: 600, cursor: 'pointer', fontSize: 13.5 }}>เข้าสู่ระบบ</button></>
            )}
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#A8A097', marginTop: 20 }}>
          © {new Date().getFullYear()} B. Training Consultant Co., Ltd.
        </p>
      </div>
    </div>
  )
}
