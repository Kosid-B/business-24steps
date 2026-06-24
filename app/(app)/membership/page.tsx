'use client'

export const runtime = 'edge'

import { useState } from 'react'
import { useApp } from '@/lib/context/AppContext'
import { PLANS } from '@/lib/data/content'

const PLAN_COLORS: Record<string, string> = {
  free: '#8E8676',
  monthly: '#16704A',
  yearly: '#A87A1E',
}

export default function MembershipPage() {
  const { state, upgradePlan } = useApp()
  const [upgrading, setUpgrading] = useState('')

  const currentPlan = state.plan || 'free'

  async function handleUpgrade(planId: string) {
    if (planId === currentPlan) return
    setUpgrading(planId)
    await upgradePlan(planId as 'free' | 'monthly' | 'yearly')
    setUpgrading('')
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
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || upgrading === plan.id}
                className="btn"
                style={{
                  background: isCurrent ? 'transparent' : color,
                  color: isCurrent ? color : '#fff',
                  border: isCurrent ? `1.5px solid ${color}` : 'none',
                  cursor: isCurrent ? 'default' : 'pointer',
                  fontWeight: 700, fontSize: 15,
                }}
              >
                {upgrading === plan.id ? 'กำลังอัปเกรด…' : isCurrent ? 'แผนปัจจุบัน' : plan.cta}
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
    </div>
  )
}
