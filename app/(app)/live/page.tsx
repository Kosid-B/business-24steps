'use client'

export const runtime = 'edge'

import { useState } from 'react'

const UPCOMING = [
  { id: 'l1', title: 'Lean Startup ในยุค AI — ตั้งต้นอย่างไรให้รอด', host: 'ดร.ปัญญา วิริยะ', date: 'จ. 30 มิ.ย. 19:00', tags: ['Startup', 'AI'], live: true },
  { id: 'l2', title: 'สร้าง MVP ใน 48 ชั่วโมง — Workshop', host: 'คุณกานต์ สุขสันต์', date: 'พ. 2 ก.ค. 18:00', tags: ['Workshop', 'MVP'], live: false },
  { id: 'l3', title: 'เปิดบัญชีบริษัท & ภาษีสำหรับ Startup', host: 'ทีม B. Training', date: 'ศ. 4 ก.ค. 17:00', tags: ['ภาษี', 'กฎหมาย'], live: false },
  { id: 'l4', title: 'ระดมทุน Series A: สิ่งที่ VC ต้องการ', host: 'คุณสุทธิ โปร่งใส', date: 'อ. 8 ก.ค. 18:30', tags: ['Fundraising', 'VC'], live: false },
]

const ARCHIVE = [
  { id: 'a1', title: 'วิเคราะห์ตลาด EEC 2025', host: 'คุณนาถ อุตสาหะ', views: '1.2K', dur: '58 นาที' },
  { id: 'a2', title: 'Pricing Strategy ให้กำไรสูงสุด', host: 'ดร.ปัญญา วิริยะ', views: '847', dur: '44 นาที' },
  { id: 'a3', title: 'B2B Sales ตั้งแต่ 0 — เทคนิคปิดดีล', host: 'คุณกานต์ สุขสันต์', views: '2.1K', dur: '72 นาที' },
]

export default function LivePage() {
  const [joined, setJoined] = useState<string[]>([])
  const [tab, setTab] = useState<'upcoming' | 'archive'>('upcoming')

  const liveSession = UPCOMING.find(s => s.live)

  function join(id: string) {
    setJoined(j => [...j, id])
  }

  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>Live</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>Live สด</h1>
      <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A' }}>เรียนรู้แบบ Real-time กับผู้เชี่ยวชาญและชุมชนนักสร้างธุรกิจทั่วประเทศ</p>

      {/* Live now */}
      {liveSession && (
        <div style={{ marginTop: 20, background: '#1C1A15', borderRadius: 20, padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(232,98,61,.18), transparent 60%)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span className="pulse-dot" />
              <span style={{ color: '#E8623D', fontWeight: 700, fontSize: 13, letterSpacing: '.05em', textTransform: 'uppercase' }}>Live อยู่ตอนนี้</span>
              <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.08)', padding: '3px 10px', borderRadius: 999, color: 'rgba(255,255,255,.7)', fontSize: 11.5 }}>🎙 กำลังออกอากาศ</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.4 }}>{liveSession.title}</div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.75)', marginBottom: 14 }}>โดย {liveSession.host}</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {liveSession.tags.map(t => <span key={t} className="chip" style={{ background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.8)' }}>{t}</span>)}
            </div>
            <button
              onClick={() => join(liveSession.id)}
              className="btn"
              style={{ marginTop: 18, background: '#E8623D', color: '#fff', border: 'none' }}
            >
              {joined.includes(liveSession.id) ? '✅ เข้าร่วมแล้ว' : '▶ เข้าร่วม Live'}
            </button>
          </div>
        </div>
      )}

      {/* Tab */}
      <div style={{ display: 'inline-flex', gap: 6, background: '#F1ECDF', padding: 5, borderRadius: 12, margin: '20px 0' }}>
        {(['upcoming', 'archive'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'Kanit, sans-serif', fontSize: 14, fontWeight: 600,
            background: tab === t ? '#FFFDF7' : 'transparent',
            color: tab === t ? '#1C1A15' : '#8E8676',
            boxShadow: tab === t ? '0 1px 4px rgba(28,26,21,.1)' : 'none',
          }}>
            {t === 'upcoming' ? 'กำลังจะมา' : 'ย้อนดู'}
          </button>
        ))}
      </div>

      {tab === 'upcoming' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {UPCOMING.filter(s => !s.live).map(s => (
            <div key={s.id} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 18, padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 50, height: 50, borderRadius: 13, background: '#F1ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8676" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  {s.tags.map(t => <span key={t} className="chip" style={{ background: '#F1ECDF', color: '#5C564A' }}>{t}</span>)}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15.5, color: '#1C1A15', marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#5C564A', marginBottom: 4 }}>โดย {s.host}</div>
                <div style={{ fontSize: 12.5, color: '#8E8676' }}>{s.date}</div>
              </div>
              <button
                onClick={() => join(s.id)}
                className="btn btn-sm"
                style={{ flexShrink: 0, background: joined.includes(s.id) ? '#E6F0EA' : '#F1ECDF', color: joined.includes(s.id) ? '#16704A' : '#5C564A', border: 'none' }}
              >
                {joined.includes(s.id) ? '✅ แจ้งเตือนแล้ว' : '🔔 แจ้งเตือน'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'archive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ARCHIVE.map(a => (
            <div key={a.id} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 18, padding: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: 13, background: '#1C1A15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round"><path d="M8 5l11 7-11 7V5z" fill="#fff" /></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: '#8E8676' }}>โดย {a.host} · {a.dur} · 👁 {a.views}</div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>ดูย้อนหลัง</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
