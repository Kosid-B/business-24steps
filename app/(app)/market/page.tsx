'use client'

export const runtime = 'edge'

import { useState } from 'react'
import { useApp } from '@/lib/context/AppContext'
import { LISTINGS } from '@/lib/data/content'
import type { Listing } from '@/types'

const CAT_COLORS: Record<string, string> = {
  supplier: '#16704A',
  buyer: '#2F4B7C',
  investor: '#A87A1E',
  distributor: '#6B3F69',
}
const CAT_TH: Record<string, string> = {
  supplier: 'ซัพพลายเออร์',
  buyer: 'ผู้ซื้อ',
  investor: 'นักลงทุน',
  distributor: 'ตัวแทนจำหน่าย',
}

export default function MarketPage() {
  const { state, addNotif } = useApp()
  const [filter, setFilter] = useState<string>('all')
  const [requested, setRequested] = useState<string[]>(state.matches?.map(m => m.listingId) || [])
  const [detail, setDetail] = useState<Listing | null>(null)

  const cats = ['all', 'supplier', 'buyer', 'investor', 'distributor']
  const filtered = filter === 'all' ? LISTINGS : LISTINGS.filter(l => l.cat === filter)

  async function requestMatch(listing: Listing) {
    if (requested.includes(listing.id)) return
    setRequested(r => [...r, listing.id])
    addNotif({ type: 'match', title: 'ส่งคำขอจับคู่แล้ว', body: `ส่งคำขอจับคู่ไปยัง ${listing.name} — ทีมงานจะติดต่อกลับใน 24 ชม.` })
  }

  if (detail) {
    const color = CAT_COLORS[detail.cat] || '#16704A'
    return (
      <div className="anim-fade">
        <button onClick={() => setDetail(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#8E8676', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          กลับไปตลาด
        </button>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <span className="chip" style={{ background: color + '18', color }}>{CAT_TH[detail.cat]}</span>
          <span className="chip" style={{ background: '#F1ECDF', color: '#5C564A' }}>{detail.group}</span>
          {detail.verified && <span className="chip" style={{ background: '#E6F0EA', color: '#16704A' }}>✓ ยืนยันแล้ว</span>}
        </div>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: '#1C1A15' }}>{detail.name}</h1>
        <p style={{ margin: '0 0 20px', fontSize: 15, color: '#5C564A', lineHeight: 1.6 }}>{detail.headline}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'ที่ตั้ง', val: detail.loc },
            { label: 'ประเภท', val: detail.kind },
            { label: 'ต้องการ', val: detail.seek },
            { label: 'คะแนนความเข้ากัน', val: `${detail.score ?? 0}%` },
            detail.deal ? { label: 'มูลค่าดีล', val: `฿${detail.deal.toLocaleString()}` } : null,
            detail.rating ? { label: 'คะแนน', val: `⭐ ${detail.rating} (${detail.reviews} รีวิว)` } : null,
          ].filter(Boolean).map(r => r && (
            <div key={r.label} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 13, padding: '13px 16px' }}>
              <div style={{ fontSize: 11.5, color: '#8E8676', fontWeight: 600, marginBottom: 3 }}>{r.label}</div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1C1A15' }}>{r.val}</div>
            </div>
          ))}
        </div>
        {detail.reqs && detail.reqs.length > 0 && (
          <div style={{ background: '#F6F2E8', borderRadius: 16, padding: '16px 18px', marginBottom: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1C1A15', marginBottom: 8 }}>ใบรับรองที่ต้องการ</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {detail.reqs.map(r => <span key={r} className="chip" style={{ background: color + '14', color }}>{r}</span>)}
            </div>
          </div>
        )}
        <button
          onClick={() => requestMatch(detail)}
          disabled={requested.includes(detail.id)}
          className="btn btn-primary"
          style={{ minWidth: 200 }}
        >
          {requested.includes(detail.id) ? '✅ ส่งคำขอแล้ว' : 'ส่งคำขอจับคู่'}
        </button>
      </div>
    )
  }

  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>ตลาด</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>จับคู่ธุรกิจ</h1>
      <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A' }}>เชื่อมต่อกับซัพพลายเออร์ ผู้ซื้อ นักลงทุน และตัวแทนจำหน่ายที่ตรงกับธุรกิจคุณ</p>

      {/* Stats */}
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { val: requested.length, label: 'คำขอที่ส่ง', color: '#16704A', icon: 'M8 11l2.5-2.5a2 2 0 0 1 3 0L18 13M11 13l2 2M9 15l2 2' },
          { val: LISTINGS.length, label: 'ธุรกิจในระบบ', color: '#2F4B7C', icon: 'M4 7v14l8-3 8 3V7M12 4l-8 3 8 3 8-3-8-3z' },
          { val: Math.max(...LISTINGS.map(l => l.score ?? 0)) + '%', label: 'คะแนน Match สูงสุด', color: '#A87A1E', icon: 'M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.2 1-5.5-4-3.9 5.5-.8Z' },
        ].map(s => (
          <div key={s.label} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '14', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d={s.icon} /></svg>
            </span>
            <div>
              <div className="mono" style={{ fontWeight: 700, fontSize: 18, color: '#1C1A15' }}>{s.val}</div>
              <div style={{ fontSize: 11.5, color: '#8E8676' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '20px 0' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '6px 16px', borderRadius: 999, border: '1.5px solid', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: 'Kanit, sans-serif',
            background: filter === c ? (c === 'all' ? '#1C1A15' : CAT_COLORS[c]) : 'transparent',
            color: filter === c ? '#fff' : (c === 'all' ? '#1C1A15' : CAT_COLORS[c]),
            borderColor: filter === c ? 'transparent' : (c === 'all' ? '#E5DECC' : CAT_COLORS[c] + '60'),
          }}>
            {c === 'all' ? 'ทั้งหมด' : CAT_TH[c]}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(l => {
          const color = CAT_COLORS[l.cat] || '#16704A'
          const isReq = requested.includes(l.id)
          return (
            <div key={l.id} style={{ background: '#FFFDF7', border: `1px solid ${isReq ? '#cfe3d6' : '#E5DECC'}`, borderRadius: 18, padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: color + '14', color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                {l.initials || l.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span className="chip" style={{ background: color + '14', color }}>{CAT_TH[l.cat]}</span>
                  <span className="chip" style={{ background: '#F1ECDF', color: '#5C564A' }}>{l.group}</span>
                  {l.score && <span className="chip" style={{ background: '#F6EECF', color: '#A87A1E' }}>Match {l.score}%</span>}
                  {l.verified && <span className="chip" style={{ background: '#E6F0EA', color: '#16704A' }}>✓</span>}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15.5, color: '#1C1A15', marginBottom: 4 }}>{l.name}</div>
                <div style={{ fontSize: 13.5, color: '#5C564A', lineHeight: 1.5, marginBottom: 8 }}>{l.headline}</div>
                <div style={{ fontSize: 12.5, color: '#8E8676' }}>{l.loc} · {l.kind}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                <button onClick={() => setDetail(l)} className="btn btn-ghost btn-sm">ดูรายละเอียด</button>
                <button
                  onClick={() => requestMatch(l)}
                  disabled={isReq}
                  className="btn btn-sm"
                  style={{ background: isReq ? '#E6F0EA' : color, color: isReq ? '#16704A' : '#fff', border: 'none' }}
                >
                  {isReq ? '✅ ส่งแล้ว' : 'จับคู่'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#8E8676', fontSize: 15 }}>ไม่พบรายการในหมวดนี้</div>
      )}
    </div>
  )
}
