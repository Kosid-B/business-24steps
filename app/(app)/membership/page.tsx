'use client'

export const runtime = 'edge'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useApp } from '@/lib/context/AppContext'
import { PLANS } from '@/lib/data/content'
import { createClient } from '@/lib/supabase/client'

const PLAN_COLORS: Record<string, string> = {
  free: '#8E8676',
  monthly: '#16704A',
  yearly: '#A87A1E',
}

const EDGE_FN = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/create-charge'

type PaymentState = 'idle' | 'loading' | 'success' | 'error'

type Billing = {
  id: string
  charge_id: string
  source_type: string
  plan: string
  amount: number
  status: string
  paid_at: string | null
  expires_at: string | null
  created_at: string
}

export default function MembershipPage() {
  const { state, upgradePlan } = useApp()
  const [modal, setModal] = useState<{ plan: typeof PLANS[0] } | null>(null)
  const [payState, setPayState] = useState<PaymentState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [billings, setBillings] = useState<Billing[]>([])
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const searchParams = useSearchParams()
  const supabase = createClient()

  const currentPlan = state.plan || 'free'

  // โหลดประวัติ billing + plan_expires_at
  useEffect(() => {
    async function load() {
      const { data: member } = await supabase
        .from('members')
        .select('plan_expires_at')
        .maybeSingle()
      if (member?.plan_expires_at) setPlanExpiresAt(member.plan_expires_at)

      const { data } = await supabase
        .from('billings')
        .select('id,charge_id,source_type,plan,amount,status,paid_at,expires_at,created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      if (data) setBillings(data as Billing[])
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ตรวจ ?payment=done เมื่อ Xendit redirect กลับมา
  useEffect(() => {
    const payment = searchParams.get('payment')
    const ref     = searchParams.get('ref')
    if (payment !== 'done' || !ref) return

    // poll billing จนกว่า webhook จะอัปเดตเป็น paid
    pollRef.current = setInterval(async () => {
      const { data } = await supabase
        .from('billings')
        .select('status,plan')
        .eq('charge_id', ref)
        .eq('status', 'paid')
        .maybeSingle()
      if (data) {
        clearInterval(pollRef.current!)
        await upgradePlan(data.plan as 'monthly' | 'yearly')
        setPayState('success')
        setModal(null)
      }
    }, 3000)

    return () => clearInterval(pollRef.current!)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function closeModal() {
    clearInterval(pollRef.current!)
    setModal(null)
    setPayState('idle')
    setErrorMsg('')
  }

  async function payWithXendit(plan: typeof PLANS[0]) {
    setPayState('loading')
    setErrorMsg('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('กรุณาเข้าสู่ระบบ')

      const token = (await supabase.auth.getSession()).data.session?.access_token ?? ''
      const res = await fetch(EDGE_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          memberId:   user.id,
          memberEmail: user.email,
          memberName: state.account?.name,
          plan:       plan.id,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'สร้าง Invoice ไม่สำเร็จ')

      // redirect ไปหน้าชำระเงิน Xendit
      window.location.href = json.invoiceUrl
    } catch (e) {
      setPayState('error')
      setErrorMsg(String(e).replace('Error: ', ''))
    }
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

      {/* success banner (กลับจาก Xendit) */}
      {payState === 'success' && (
        <div style={{ marginTop: 20, padding: '16px 20px', borderRadius: 16, background: '#F0FAF4', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28 }}>🎉</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#16704A' }}>ชำระเงินสำเร็จ!</div>
            <div style={{ fontSize: 13.5, color: '#5C564A' }}>เปิดใช้งานแผนแล้ว — ตรวจสอบอีเมลสำหรับใบเสร็จ</div>
          </div>
        </div>
      )}

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

      {/* Plan expiry notice */}
      {currentPlan !== 'free' && planExpiresAt && (() => {
        const exp = new Date(planExpiresAt)
        const daysLeft = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        const isWarning = daysLeft <= 7
        return (
          <div style={{
            marginTop: 16, padding: '12px 18px', borderRadius: 14,
            background: isWarning ? '#FEF9EC' : '#F0FAF4',
            border: `1px solid ${isWarning ? '#F59E0B' : '#86EFAC'}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 18 }}>{isWarning ? '⏰' : '✅'}</span>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1C1A15' }}>
                {isWarning ? `แผนหมดในอีก ${daysLeft} วัน` : 'แผนยังใช้งานได้'}
              </span>
              <span style={{ fontSize: 13, color: '#5C564A', marginLeft: 8 }}>
                ถึง {exp.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        )
      })()}

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

      {/* Billing History */}
      {billings.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1A15', marginBottom: 14 }}>ประวัติการชำระเงิน</div>
          <div style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 80px', padding: '12px 20px', borderBottom: '1px solid #F1ECDF', fontSize: 12, fontWeight: 700, color: '#8E8676', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              <div>วันที่</div>
              <div style={{ textAlign: 'center' }}>แผน</div>
              <div style={{ textAlign: 'right' }}>จำนวน</div>
              <div style={{ textAlign: 'center' }}>สถานะ</div>
            </div>
            {billings.map(b => {
              const date = new Date(b.paid_at ?? b.created_at)
              const planColor = PLAN_COLORS[b.plan] ?? '#8E8676'
              const planLabel = b.plan === 'monthly' ? 'รายเดือน' : 'รายปี'
              const srcIcon = b.source_type === 'promptpay' ? '📱' : '💳'
              const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
                paid:     { label: 'สำเร็จ',  bg: '#DCFCE7', color: '#16704A' },
                pending:  { label: 'รอชำระ', bg: '#FEF9EC', color: '#B45309' },
                failed:   { label: 'ล้มเหลว', bg: '#FEE2E2', color: '#B91C1C' },
                refunded: { label: 'คืนเงิน', bg: '#EDE9FE', color: '#6D28D9' },
              }
              const st = statusConfig[b.status] ?? statusConfig.pending
              return (
                <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 80px', alignItems: 'center', padding: '13px 20px', borderBottom: '1px solid #F1ECDF' }}>
                  <div>
                    <div style={{ fontSize: 13.5, color: '#1C1A15', fontWeight: 500 }}>
                      {srcIcon} {date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#8E8676', marginTop: 2 }}>
                      Ref: {b.charge_id?.slice(0, 16)}…
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: planColor }}>{planLabel}</span>
                  </div>
                  <div className="mono" style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#1C1A15' }}>
                    ฿{b.amount.toLocaleString()}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 999 }}>
                      {st.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {modal && (
        <div
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div style={{ background: '#FFFDF7', borderRadius: 24, padding: 28, width: '100%', maxWidth: 400, position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#8E8676', lineHeight: 1 }}>✕</button>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: '#8E8676', textTransform: 'uppercase', marginBottom: 4 }}>ชำระเงิน</div>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#1C1A15' }}>แผน{modal.plan.name}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: PLAN_COLORS[modal.plan.id], marginTop: 4 }}>
                ฿{modal.plan.price.toLocaleString()}
                <span style={{ fontSize: 13, fontWeight: 400, color: '#8E8676', marginLeft: 6 }}>{modal.plan.period}</span>
              </div>
            </div>

            <div style={{ background: '#F6F2E9', borderRadius: 14, padding: '14px 16px', marginBottom: 20, fontSize: 13.5, color: '#5C564A', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: '#1C1A15', marginBottom: 4 }}>ชำระผ่าน Xendit</div>
              รองรับ PromptPay QR · บัตรเครดิต/เดบิต<br />
              กด &ldquo;ไปหน้าชำระเงิน&rdquo; แล้วเลือกวิธีชำระบนหน้าถัดไป
            </div>

            {payState === 'error' && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#B91C1C' }}>
                {errorMsg}
              </div>
            )}

            <button
              onClick={() => payWithXendit(modal.plan)}
              disabled={payState === 'loading'}
              className="btn"
              style={{
                background: PLAN_COLORS[modal.plan.id], color: '#fff', border: 'none',
                fontWeight: 700, fontSize: 15, width: '100%',
                opacity: payState === 'loading' ? .6 : 1,
              }}
            >
              {payState === 'loading' ? 'กำลังสร้าง Invoice…' : 'ไปหน้าชำระเงิน →'}
            </button>

            <div style={{ marginTop: 14, textAlign: 'center', fontSize: 11.5, color: '#C9BFA8' }}>
              🔒 ชำระผ่าน Xendit — PCI DSS Compliant
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
