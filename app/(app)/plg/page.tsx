'use client'

export const runtime = 'edge'

import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/context/AppContext'
import { getProgress, getXp } from '@/lib/game'

const PLG_STAGES = [
  {
    id: 'aware', no: 1, th: 'ให้คนรู้จัก', color: '#16704A',
    tactics: [
      { t: 'SEO + Content', desc: 'เขียนบทความตอบ pain point ลูกค้า 1 บทความ/สัปดาห์' },
      { t: 'Social Proof', desc: 'แชร์ case study ลูกค้าจริงทุก 2 สัปดาห์' },
      { t: 'Community', desc: 'เข้า Facebook/Discord group ที่ลูกค้าอยู่ — ให้คุณค่าก่อน' },
    ]
  },
  {
    id: 'activate', no: 2, th: 'ให้ทดลองใช้', color: '#E8623D',
    tactics: [
      { t: 'Freemium Core', desc: 'ให้ feature หลักฟรี — limit ที่ทำให้ต้องอัปเกรด' },
      { t: 'Onboarding WoW', desc: 'ให้ผู้ใช้เห็น value ใน 5 นาทีแรก — ออกแบบ aha moment' },
      { t: 'Template Library', desc: 'แจก template/ตัวอย่างฟรีที่ใช้ได้เลย' },
    ]
  },
  {
    id: 'retain', no: 3, th: 'รักษาไว้', color: '#2F4B7C',
    tactics: [
      { t: 'Habit Loop', desc: 'ส่ง weekly digest / progress report กระตุ้นให้กลับมาใช้' },
      { t: 'In-app Tips', desc: 'แสดง tip ใหม่เมื่อผู้ใช้ถึง milestone' },
      { t: 'Gamification', desc: 'XP, badge, leaderboard ให้ผู้ใช้รู้สึกก้าวหน้า' },
    ]
  },
  {
    id: 'revenue', no: 4, th: 'แปลงเป็นเงิน', color: '#A87A1E',
    tactics: [
      { t: 'Usage Limit Gate', desc: 'จำกัดจำนวน ทำให้รู้สึกว่าต้องอัปเกรดจริงๆ' },
      { t: 'Feature Gate', desc: 'feature ที่ทีมงานแนะนำ ต้องใช้แผนที่สูงขึ้น' },
      { t: 'Annual Offer', desc: 'ส่วนลด 30-40% สำหรับจ่ายรายปี' },
    ]
  },
  {
    id: 'refer', no: 5, th: 'บอกต่อ', color: '#6B3F69',
    tactics: [
      { t: 'Referral Program', desc: 'ให้ชั่วโมง Consult ฟรีเมื่อแนะนำเพื่อน 1 คน' },
      { t: 'Co-branding', desc: 'ใส่ "Made with ตั้งต้น" ใน export PDF/แผนธุรกิจ' },
      { t: 'Success Story', desc: 'ขอ testimonial จากผู้ใช้ที่ประสบความสำเร็จ — แชร์ story' },
    ]
  },
]

const METRICS = [
  { label: 'Activation Rate', target: '40%', desc: 'ผู้ลงทะเบียน → ทำก้าวที่ 1' },
  { label: 'D7 Retention', target: '25%', desc: 'กลับมาใช้ภายใน 7 วัน' },
  { label: 'Paid Conversion', target: '5%', desc: 'Free → Paid ภายใน 14 วัน' },
  { label: 'NPS', target: '40+', desc: 'คะแนนแนะนำ' },
]

export default function PLGPage() {
  const { state } = useApp()
  const progress = getProgress(state)
  const xp = getXp(state)
  const [openStage, setOpenStage] = useState<string>('aware')

  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>กลยุทธ์</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>Product-Led Growth</h1>
      <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A' }}>ให้ตัวผลิตภัณฑ์เป็นเครื่องมือหลักในการหาลูกค้า รักษาลูกค้า และสร้างรายได้</p>

      {/* PLG funnel visual */}
      <div style={{ marginTop: 20, background: 'linear-gradient(135deg,#0F1623,#1A2035)', borderRadius: 20, padding: 24, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.03)' }} />
        <div style={{ color: 'rgba(255,255,255,.85)', fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14 }}>PLG Funnel — สถานะของคุณ</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {PLG_STAGES.map((stage, i) => {
            const h = 80 - i * 12
            return (
              <div key={stage.id} style={{ flex: 1, minWidth: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: '100%', height: h, borderRadius: '8px 8px 0 0', background: stage.color, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: openStage === stage.id ? 1 : 0.7 }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{stage.no}</span>
                </div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.8)', textAlign: 'center', fontWeight: 600 }}>{stage.th}</div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>ก้าวสำเร็จ</span>
            <div className="mono" style={{ color: '#EADB9C', fontSize: 20, fontWeight: 700 }}>{progress.done}/24</div>
          </div>
          <div>
            <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>XP รวม</span>
            <div className="mono" style={{ color: '#EADB9C', fontSize: 20, fontWeight: 700 }}>{xp.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Metrics targets */}
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {METRICS.map(m => (
          <div key={m.label} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 14, padding: '14px 16px' }}>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: '#16704A' }}>{m.target}</div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1C1A15', marginTop: 3 }}>{m.label}</div>
            <div style={{ fontSize: 12, color: '#8E8676', marginTop: 2 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Stage tactics */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1A15', marginBottom: 12 }}>กลยุทธ์แต่ละช่วง</div>
        {PLG_STAGES.map(stage => {
          const isOpen = openStage === stage.id
          return (
            <div key={stage.id} style={{ marginBottom: 10, background: '#FFFDF7', border: `1.5px solid ${isOpen ? stage.color + '66' : '#E5DECC'}`, borderRadius: 16, overflow: 'hidden' }}>
              <button onClick={() => setOpenStage(isOpen ? '' : stage.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: stage.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{stage.no}</span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: '#1C1A15' }}>{stage.th}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8676" strokeWidth="2" strokeLinecap="round" style={{ transition: 'transform .25s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {isOpen && (
                <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stage.tactics.map((tac, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: '#F6F2E8', borderRadius: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, flexShrink: 0, marginTop: 5 }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1C1A15', marginBottom: 3 }}>{tac.t}</div>
                        <div style={{ fontSize: 13, color: '#5C564A', lineHeight: 1.5 }}>{tac.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div style={{ marginTop: 20, background: '#F6F2E8', borderRadius: 18, padding: '20px 22px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1A15', marginBottom: 4 }}>ปรึกษากับ Growth Expert</div>
          <div style={{ fontSize: 13.5, color: '#5C564A' }}>วาง PLG roadmap ที่ใช้ได้จริงกับธุรกิจของคุณ</div>
        </div>
        <Link href="/consult" className="btn btn-primary" style={{ flexShrink: 0 }}>นัด Consult →</Link>
      </div>
    </div>
  )
}
