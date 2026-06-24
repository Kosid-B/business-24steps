'use client'

export const runtime = 'edge'

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/lib/context/AppContext'
import { PLANS } from '@/lib/data/content'
import { createClient } from '@/lib/supabase/client'

const PLAN_COLORS: Record<string, string> = {
  free: '#8E8676',
  monthly: '#16704A',
  yearly: '#A87A1E',
}

const OMISE_PUBLIC_KEY = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY ?? ''
const EDGE_FN = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/create-charge'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    OmiseCard: any
  }
}

type PaymentState = 'idle' | 'loading' | 'qr' | 'success' | 'error'

export default function MembershipPage() {
  const { state, upgradePlan, toast } = useApp()
  const [modal, setModal] = useState<{ plan: typeof PLANS[0] } | null>(null)
  const [payState, setPayState] = useState<PaymentState>('idle')
  const [qrUri, setQrUri] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [tab, setTab] = useState<'promptpay' | 'card'>('promptpay')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const supabase = createClient()

  const currentPlan = state.plan || 'free'

  // โหลด Omise.js เมื่อเปิด modal
  useEffect(() => {
    if (!modal || tab !== 'card') return
    if (window.OmiseCard) return
    const s = document.createElement('script')
    s.src = 'https://cdn.omise.co/omise.js'
    s.async = true
    document.head.appendChild(s)
  }, [modal, tab])

  // poll สถานะ PromptPay ทุก 5 วินาที
  useEffect(() => {
    if (payState !== 'qr' || !modal) return
    pollRef.current = setInterval(async () => {
      const { data } = await supabase
        .from('billings')
        .select('status,plan')
        .eq('member_id', state.account?.email ?? '')
        .eq('plan', modal.plan.id)
        .eq('status', 'paid')
        .maybeSingle()
      if (data) {
        clearInterval(pollRef.current!)
        await upgradePlan(data.plan as 'monthly' | 'yearly')
        setPayState('success')
      }
    }, 5000)
    return () => clearInterval(pollRef.current!)
  }, [payState, modal]) // eslint-disable-line react-hooks/exhaustive-deps

  function closeModal() {
    clearInterval(pollRef.current!)
    setModal(null)
    setPayState('idle')
    setQrUri('')
    setErrorMsg('')
    setTab('promptpay')
  }

  async function getUserId() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  async function payPromptPay(plan: typeof PLANS[0]) {
    setPayState('loading')
    setErrorMsg('')
    const user = await getUserId()
    if (!user) { setPayState('error'); setErrorMsg('กรุณาเข้าสู่ระบบ'); return }
    try {
      const res = await fetch(EDGE_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
        body: JSON.stringify({ memberId: user.id, memberEmail: user.email, memberName: state.account?.name, plan: plan.id, sourceType: 'promptpay' }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'ไม่สามารถสร้าง QR ได้')
      setQrUri(json.authorizeUri)
      setPayState('qr')
    } catch (e) {
      setPayState('error')
      setErrorMsg(String(e).replace('Error: ', ''))
    }
  }

  async function payCard(plan: typeof PLANS[0]) {
    if (!window.OmiseCard) { toast('กำลังโหลด Omise.js...'); return }
    if (!OMISE_PUBLIC_KEY) { toast('ยังไม่ได้ตั้งค่า OMISE_PUBLIC_KEY'); return }
    window.OmiseCard.configure({ publicKey: OMISE_PUBLIC_KEY })
    window.OmiseCard.open({
      amount: plan.price * 100,
      currency: 'THB',
      frameLabel: 'B. Training Consultant',
      submitLabel: `ชำระ ฿${plan.price.toLocaleString()}`,
      onCreateTokenSuccess: async (token: string) => {
        setPayState('loading')
        setErrorMsg('')
        const user = await getUserId()
        if (!user) { setPayState('error'); setErrorMsg('กรุณาเข้าสู่ระบบ'); return }
        try {
          const res = await fetch(EDGE_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
            body: JSON.stringify({ memberId: user.id, memberEmail: user.email, memberName: state.account?.name, plan: plan.id, token, sourceType: 'card' }),
          })
          const json = await res.json()
          if (!res.ok || json.error) throw new Error(json.error || 'ตัดบัตรไม่สำเร็จ')
          await upgradePlan(plan.id as 'monthly' | 'yearly')
          setPayState('success')
        } catch (e) {
          setPayState('error')
          setErrorMsg(String(e).replace('Error: ', ''))
        }
      },
      onFormClosed: () => setPayState('idle'),
    })
  }

  function priceDisplay(plan: typeof PLANS[0]) {
    if (plan.id === 'free') return { main: 'ฟรี', sub: '' }
    if (plan.id === 'monthly') return { main: `฿${plan.price.toLocaleString()}`, sub: '/เดือน' }
    if (plan.id === 'yearly') return { main: `฿${plan.price.toLocaleString()}`, sub: '/ปี · ≈ ฿416/เดือน' }
    return { main: `฿${plan.price.toLocaleString()}`, sub: plan.period }
  }

  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>สมาชิก</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>เลือกแผนที่ใช่สำหรับคุณ</h1>
      <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A' }}>สร้างธุรกิจจากศูนย์สู่รายได้จริงด้วยการสนับสนุนที่เหมาะกับคุณ</p>

      {/* Plan cards */}
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {PLANS.map(plan => {
          const color = PLAN_COLORS[plan.id] || '#8E8676'
          const isCurrent = currentPlan === plan.id
          const isHighlight = plan.id === 'yearly'
          const { main, sub } = priceDisplay(plan)

          return (
            <div key={plan.id} style={{
              background: isHighlight ? 'linear-gradient(145deg,#1C1A15,#2A2416)' : '#FFFDF7',
              border: `2px solid ${isCurrent ? color : (isHighlight ? color + '80' : '#E5DECC')}`,
              borderRadius: 20, padding: 22, display: 'flex', flexDirection: 'column', position: 'relative',
              boxShadow: isHighlight ? `0 16px 40px rgba(168,122,30,.2)` : 'none',
            }}>
              {isHighlight && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#A87A1E', color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '3px 16px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                  ประหยัดที่สุด 🏆
                </div>
              )}
              {isCurrent && (
                <div style={{ position: 'absolute', top: 14, right: 14, background: color + '20', color, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999 }}>
                  แผนของคุณ
                </div>
              )}
              <div style={{ fontSize: 13, fontWeight: 700, color: isHighlight ? 'rgba(255,255,255,.7)' : '#8E8676', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span className="mono" style={{ fontSize: 30, fontWeight: 700, color: isHighlight ? '#EADB9C' : color }}>{main}</span>
              </div>
              {sub && <div style={{ fontSize: 12, color: isHighlight ? 'rgba(255,255,255,.55)' : '#8E8676', marginBottom: 8 }}>{sub}</div>}
              <div style={{ fontSize: 13, color: isHighlight ? 'rgba(255,255,255,.75)' : '#5C564A', marginBottom: 18, lineHeight: 1.5 }}>{plan.tagline}</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 5, background: isHighlight ? color + 'cc' : color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isHighlight ? '#fff' : color} strokeWidth="3" strokeLinecap="round"><path d="M5 12.5 10 17l9-10" /></svg>
                    </span>
                    <span style={{ fontSize: 13, color: isHighlight ? 'rgba(255,255,255,.85)' : '#1C1A15', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => plan.id !== 'free' && !isCurrent ? setModal({ plan }) : undefined}
                disabled={isCurrent || plan.id === 'free'}
                className="btn"
                style={{
                  background: isCurrent || plan.id === 'free' ? 'transparent' : color,
                  color: isCurrent || plan.id === 'free' ? color : '#fff',
                  border: isCurrent || plan.id === 'free' ? `1.5px solid ${color}` : 'none',
                  cursor: isCurrent || plan.id === 'free' ? 'default' : 'pointer',
                  fontWeight: 700, fontSize: 15,
                }}
              >
                {isCurrent ? 'แผนปัจจุบัน' : plan.cta}
              </button>
            </div>
          )
        })}
      </div>

      {/* Feature comparison */}
      <div style={{ marginTop: 32, background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #F1ECDF', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15' }}>ฟีเจอร์</div>
          {(['free', 'monthly', 'yearly'] as const).map(p => (
            <div key={p} style={{ textAlign: 'center', fontWeight: 700, fontSize: 13.5, color: PLAN_COLORS[p] }}>
              {PLANS.find(pl => pl.id === p)?.name}
            </div>
          ))}
        </div>
        {[
          { label: 'ก้าว 24 ขั้น', free: true, monthly: true, yearly: true },
          { label: 'บทเรียนออนไลน์', free: true, monthly: true, yearly: true },
          { label: 'สรุปแผนธุรกิจ', free: true, monthly: true, yearly: true },
          { label: 'Business Matching', free: false, monthly: true, yearly: true },
          { label: 'Consult 1:1 (ชม./เดือน)', free: '—', monthly: '2', yearly: '24/ปี' },
          { label: 'Live sessions ย้อนหลัง', free: false, monthly: true, yearly: true },
          { label: 'กลุ่ม VIP', free: false, monthly: false, yearly: true },
        ].map(row => (
          <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', alignItems: 'center', padding: '12px 22px', borderBottom: '1px solid #F1ECDF' }}>
            <div style={{ fontSize: 14, color: '#1C1A15' }}>{row.label}</div>
            {(['free', 'monthly', 'yearly'] as const).map(p => {
              const val = row[p]
              return (
                <div key={p} style={{ textAlign: 'center' }}>
                  {typeof val === 'boolean' ? (
                    val
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16704A" strokeWidth="2.5" strokeLinecap="round" style={{ margin: '0 auto' }}><path d="M5 12.5 10 17l9-10" /></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9BFA8" strokeWidth="2" strokeLinecap="round" style={{ margin: '0 auto' }}><path d="M18 6 6 18M6 6l12 12" /></svg>
                  ) : (
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: PLAN_COLORS[p] }}>{val}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1A15', marginBottom: 14 }}>คำถามที่พบบ่อย</div>
        {[
          { q: 'สามารถยกเลิกได้ตลอดเวลาหรือไม่?', a: 'ได้เลย — ยกเลิกแผนรายเดือนได้ทุกเมื่อ ไม่มีค่าธรรมเนียมเพิ่ม' },
          { q: 'ชั่วโมง Consult สะสมข้ามเดือนได้ไหม?', a: 'แผนรายปีได้ 24 ชั่วโมงต่อปี ใช้ยืดหยุ่นได้ตลอดปี' },
          { q: 'ข้อมูลแผนธุรกิจของฉันปลอดภัยไหม?', a: 'ข้อมูลทั้งหมดเข้ารหัสและเก็บในระบบ Supabase (Tier ISO 27001) — เป็นของคุณ 100%' },
          { q: 'มีส่วนลดสำหรับทีม/กลุ่มไหม?', a: 'ติดต่อ support@b-tctraining.com เพื่อราคาพิเศษสำหรับ 5 คนขึ้นไป' },
        ].map(faq => (
          <div key={faq.q} style={{ marginBottom: 10, background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 14, padding: '14px 18px' }}>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: '#1C1A15', marginBottom: 6 }}>{faq.q}</div>
            <div style={{ fontSize: 14, color: '#5C564A', lineHeight: 1.5 }}>{faq.a}</div>
          </div>
        ))}
      </div>

      {/* ── Payment Modal ─────────────────────────────────────── */}
      {modal && (
        <div
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div style={{ background: '#FFFDF7', borderRadius: 24, padding: 28, width: '100%', maxWidth: 420, position: 'relative' }}>
            {/* close */}
            <button onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#8E8676', lineHeight: 1 }}>✕</button>

            {/* success */}
            {payState === 'success' && (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
                <div style={{ fontWeight: 700, fontSize: 20, color: '#1C1A15', marginBottom: 8 }}>ชำระเงินสำเร็จ!</div>
                <div style={{ fontSize: 14, color: '#5C564A', marginBottom: 20 }}>เปิดใช้งานแผน{modal.plan.name}แล้ว — ตรวจสอบอีเมลสำหรับใบเสร็จ</div>
                <button onClick={closeModal} className="btn" style={{ background: PLAN_COLORS[modal.plan.id], color: '#fff', border: 'none', fontWeight: 700, width: '100%' }}>
                  เริ่มใช้งาน
                </button>
              </div>
            )}

            {/* main flow */}
            {payState !== 'success' && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: '#8E8676', textTransform: 'uppercase', marginBottom: 4 }}>ชำระเงิน</div>
                  <div style={{ fontWeight: 700, fontSize: 20, color: '#1C1A15' }}>แผน{modal.plan.name}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: PLAN_COLORS[modal.plan.id], marginTop: 4 }}>
                    ฿{modal.plan.price.toLocaleString()}
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#8E8676', marginLeft: 6 }}>{modal.plan.period}</span>
                  </div>
                </div>

                {/* Tabs */}
                {payState !== 'qr' && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    {(['promptpay', 'card'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                          flex: 1, padding: '9px 0', borderRadius: 12, fontWeight: 700, fontSize: 14,
                          background: tab === t ? '#1C1A15' : 'transparent',
                          color: tab === t ? '#fff' : '#5C564A',
                          border: `1.5px solid ${tab === t ? '#1C1A15' : '#E5DECC'}`,
                          cursor: 'pointer',
                        }}
                      >
                        {t === 'promptpay' ? '📱 PromptPay' : '💳 บัตรเครดิต'}
                      </button>
                    ))}
                  </div>
                )}

                {/* PromptPay tab */}
                {tab === 'promptpay' && payState !== 'qr' && (
                  <div>
                    <div style={{ background: '#F6F2E9', borderRadius: 14, padding: '14px 16px', marginBottom: 16, fontSize: 13.5, color: '#5C564A', lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 700, color: '#1C1A15', marginBottom: 4 }}>วิธีชำระ</div>
                      1. กด &ldquo;สร้าง QR Code&rdquo;<br />
                      2. เปิดแอปธนาคาร → สแกน QR<br />
                      3. ยืนยันการชำระ — ระบบอัปเดตทันที
                    </div>
                    {payState === 'error' && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#B91C1C' }}>
                        {errorMsg}
                      </div>
                    )}
                    <button
                      onClick={() => payPromptPay(modal.plan)}
                      disabled={payState === 'loading'}
                      className="btn"
                      style={{ background: PLAN_COLORS[modal.plan.id], color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, width: '100%', opacity: payState === 'loading' ? .6 : 1 }}
                    >
                      {payState === 'loading' ? 'กำลังสร้าง QR…' : 'สร้าง QR Code'}
                    </button>
                  </div>
                )}

                {/* QR Code */}
                {tab === 'promptpay' && payState === 'qr' && qrUri && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#5C564A', marginBottom: 14 }}>สแกน QR ด้วยแอปธนาคาร — รอยืนยันอัตโนมัติ</div>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 16, display: 'inline-block', border: '1px solid #E5DECC', marginBottom: 14 }}>
                      <img src={qrUri} alt="PromptPay QR" width={200} height={200} style={{ display: 'block' }} />
                    </div>
                    <div style={{ fontSize: 12, color: '#8E8676', marginBottom: 16 }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: '#F59E0B', marginRight: 6, verticalAlign: 'middle', animation: 'pulse 1.5s infinite' }} />
                      รอการยืนยัน...
                    </div>
                    <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#8E8676', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
                      ยกเลิก
                    </button>
                  </div>
                )}

                {/* Card tab */}
                {tab === 'card' && (
                  <div>
                    <div style={{ background: '#F6F2E9', borderRadius: 14, padding: '14px 16px', marginBottom: 16, fontSize: 13.5, color: '#5C564A', lineHeight: 1.6 }}>
                      ชำระด้วยบัตรเครดิต/เดบิต Visa, Mastercard<br />
                      <span style={{ fontSize: 12, color: '#8E8676' }}>ข้อมูลบัตรเข้ารหัสด้วย Omise — ปลอดภัย 100%</span>
                    </div>
                    {payState === 'error' && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#B91C1C' }}>
                        {errorMsg}
                      </div>
                    )}
                    <button
                      onClick={() => payCard(modal.plan)}
                      disabled={payState === 'loading'}
                      className="btn"
                      style={{ background: PLAN_COLORS[modal.plan.id], color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, width: '100%', opacity: payState === 'loading' ? .6 : 1 }}
                    >
                      {payState === 'loading' ? 'กำลังประมวลผล…' : `ชำระ ฿${modal.plan.price.toLocaleString()} ด้วยบัตร`}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Security note */}
            {payState !== 'success' && (
              <div style={{ marginTop: 16, textAlign: 'center', fontSize: 11.5, color: '#C9BFA8' }}>
                🔒 ชำระผ่าน Omise (Opn Payments) — PCI DSS Level 1
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
