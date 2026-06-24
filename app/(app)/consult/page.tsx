'use client'

export const runtime = 'edge'

import { useState } from 'react'
import { useApp } from '@/lib/context/AppContext'
import { MENTORS } from '@/lib/data/content'
import Link from 'next/link'

const HOURS_MAP: Record<string, number> = { monthly: 2, yearly: 6 }

export default function ConsultPage() {
  const { state, addNotif } = useApp()
  const [booked, setBooked] = useState<string[]>(state.bookings?.map(b => b.mentorId) || [])
  const [selected, setSelected] = useState<typeof MENTORS[0] | null>(null)
  const [slot, setSlot] = useState('')

  const plan = state.plan || 'free'
  const hoursLeft = plan === 'free' ? 0 : (HOURS_MAP[plan] || 0) - (state.bookings?.length || 0)
  const canBook = plan !== 'free' && hoursLeft > 0

  const SLOTS = ['จ. 10:00', 'จ. 14:00', 'อ. 10:00', 'อ. 14:00', 'พ. 10:00', 'พ. 14:00', 'พฤ. 10:00', 'ศ. 10:00']

  async function confirmBook() {
    if (!selected || !slot || !canBook) return
    setBooked(b => [...b, selected.id])
    addNotif({ type: 'step', title: 'ยืนยันนัด Consult', body: `นัดกับ ${selected.name} เวลา ${slot} — ยืนยันทางอีเมลแล้ว` })
    setSelected(null)
    setSlot('')
  }

  if (selected) {
    return (
      <div className="anim-fade">
        <button onClick={() => setSelected(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#8E8676', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          กลับ
        </button>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#1C1A15' }}>นัด Consult กับ {selected.name}</h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#5C564A' }}>{selected.title} · {selected.years} ปีประสบการณ์</p>

        <div style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 16, padding: 18, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1C1A15', marginBottom: 10 }}>เลือกช่วงเวลา</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {SLOTS.map(s => (
              <button key={s} onClick={() => setSlot(s)} style={{
                padding: '8px 6px', borderRadius: 10, border: `1.5px solid ${slot === s ? '#16704A' : '#E5DECC'}`,
                background: slot === s ? '#E6F0EA' : '#FCFAF2',
                color: slot === s ? '#16704A' : '#5C564A',
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'Kanit, sans-serif',
              }}>{s}</button>
            ))}
          </div>
        </div>

        {!canBook && (
          <div style={{ background: '#FFF3E0', border: '1px solid #FFCC80', borderRadius: 14, padding: '14px 18px', marginBottom: 16, fontSize: 14, color: '#7A4700' }}>
            {plan === 'free'
              ? <>แผน Free ไม่รวม Consult — <Link href="/membership" style={{ color: '#E8623D', fontWeight: 700, textDecoration: 'none' }}>อัปเกรดแผน →</Link></>
              : `ใช้ชั่วโมง Consult ครบแล้ว (${HOURS_MAP[plan]} ชม./เดือน)`
            }
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={confirmBook} disabled={!slot || !canBook || booked.includes(selected.id)} className="btn btn-primary">
            {booked.includes(selected.id) ? '✅ นัดแล้ว' : 'ยืนยันนัด'}
          </button>
          <button onClick={() => setSelected(null)} className="btn btn-ghost">ยกเลิก</button>
        </div>
      </div>
    )
  }

  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>ปรึกษา</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>ปรึกษา Live กับผู้เชี่ยวชาญ</h1>
      <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A' }}>นัด 1:1 กับโค้ชและที่ปรึกษาธุรกิจจากเครือข่าย B. Training Consultant</p>

      {/* Hours gauge */}
      <div style={{ marginTop: 20, background: plan === 'free' ? '#1C1A15' : 'linear-gradient(120deg,#2C6E6A,#1C4C4A)', borderRadius: 18, padding: '18px 22px', display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7FC8C3" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          {plan === 'free' ? (
            <>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>แผน Free ไม่รวม Consult</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, marginTop: 2 }}>อัปเกรดเพื่อปลดล็อกชั่วโมงปรึกษาส่วนตัว</div>
            </>
          ) : (
            <>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>ชั่วโมง Consult เหลือ <span className="mono" style={{ color: '#7FC8C3' }}>{hoursLeft}</span> / {HOURS_MAP[plan]} ชม.</div>
              <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,.2)', marginTop: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round((hoursLeft / HOURS_MAP[plan]) * 100)}%`, background: '#7FC8C3', borderRadius: 99 }} />
              </div>
            </>
          )}
        </div>
        {plan === 'free' && (
          <Link href="/membership" className="btn btn-primary" style={{ flexShrink: 0 }}>อัปเกรด</Link>
        )}
      </div>

      {/* Mentor list */}
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {MENTORS.map(m => {
          const isBooked = booked.includes(m.id)
          return (
            <div key={m.id} style={{ background: '#FFFDF7', border: `1px solid ${isBooked ? '#cfe3d6' : '#E5DECC'}`, borderRadius: 18, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 56, height: 56, borderRadius: 15, background: `hsl(${m.id.charCodeAt(0) * 37 % 360},40%,60%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
                {m.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1C1A15', marginBottom: 2 }}>{m.name}</div>
                <div style={{ fontSize: 13.5, color: '#5C564A', marginBottom: 6 }}>{m.title} · {m.years} ปีประสบการณ์</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {m.tags.map(t => <span key={t} className="chip" style={{ background: '#F1ECDF', color: '#5C564A' }}>{t}</span>)}
                </div>
                <div style={{ fontSize: 13, color: '#8E8676' }}>{m.bio}</div>
              </div>
              <button
                onClick={() => canBook && !isBooked ? setSelected(m) : null}
                className="btn btn-sm"
                style={{ flexShrink: 0, background: isBooked ? '#E6F0EA' : (canBook ? '#16704A' : '#F1ECDF'), color: isBooked ? '#16704A' : (canBook ? '#fff' : '#8E8676'), border: 'none', cursor: canBook && !isBooked ? 'pointer' : 'default' }}
              >
                {isBooked ? '✅ นัดแล้ว' : (canBook ? 'นัด' : 'ล็อก')}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
