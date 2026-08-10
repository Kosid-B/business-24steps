'use client'

export const runtime = 'edge'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

type Row = { member_id: string | null; anon_id: string | null; event: string }

const ANON_FUNNEL = [
  { event: 'landing_view', label: 'เข้าชมหน้าแรก' },
  { event: 'cta_click', label: 'กดปุ่ม CTA' },
  { event: 'audit_complete', label: 'ทำแบบประเมินเสร็จ' },
]
const AUTH_FUNNEL = [
  { event: 'signup', label: 'สมัครสมาชิก' },
  { event: 'activate', label: 'ทำก้าวแรกสำเร็จ' },
  { event: 'pay', label: 'ชำระเงิน' },
]
const KNOWN = new Set([...ANON_FUNNEL, ...AUTH_FUNNEL].map(x => x.event))

export default function AnalyticsPage() {
  const [status, setStatus] = useState<'loading' | 'denied' | 'ready'>('loading')
  const [rows, setRows] = useState<Row[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
        const { data: admin } = await supabase.rpc('is_admin')
        if (!admin) { setStatus('denied'); return }
        const { data } = await supabase
          .from('funnel_events')
          .select('member_id, anon_id, event')
          .limit(10000)
        setRows((data as Row[]) || [])
        setStatus('ready')
      } catch {
        setStatus('denied')
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const agg = useMemo(() => {
    const uniqAnon = (ev: string) => new Set(rows.filter(r => r.event === ev && r.anon_id).map(r => r.anon_id)).size
    const uniqMember = (ev: string) => new Set(rows.filter(r => r.event === ev && r.member_id).map(r => r.member_id)).size
    const anon = ANON_FUNNEL.map(s => ({ ...s, n: uniqAnon(s.event) }))
    const auth = AUTH_FUNNEL.map(s => ({ ...s, n: uniqMember(s.event) }))
    const otherEvents = [...new Set(rows.map(r => r.event))].filter(e => !KNOWN.has(e))
      .map(e => ({ event: e, total: rows.filter(r => r.event === e).length }))
    return {
      anon, auth, otherEvents,
      totalEvents: rows.length,
      visitors: new Set(rows.filter(r => r.anon_id).map(r => r.anon_id)).size,
      signups: uniqMember('signup'),
      paid: uniqMember('pay'),
    }
  }, [rows])

  if (status === 'loading') return <div style={{ padding: 40, color: '#8E8676' }}>กำลังโหลด…</div>
  if (status === 'denied') return (
    <div className="anim-fade" style={{ padding: '48px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1C1A15' }}>เฉพาะผู้ดูแลระบบ</h1>
      <p style={{ fontSize: 14.5, color: '#8E8676', marginTop: 6 }}>หน้านี้เปิดให้เฉพาะบัญชีที่มีสิทธิ์ผู้ดูแล (admin) เท่านั้น</p>
    </div>
  )

  function Funnel({ title, stages, colorBase }: { title: string; stages: { label: string; n: number }[]; colorBase: string }) {
    const top = Math.max(stages[0]?.n || 0, 1)
    return (
      <div className="card card-pad">
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', marginBottom: 16 }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stages.map((s, i) => {
            const prev = i > 0 ? stages[i - 1].n : null
            const conv = prev && prev > 0 ? Math.round((s.n / prev) * 100) : null
            return (
              <div key={s.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 4 }}>
                  <span style={{ color: '#1C1A15' }}>{s.label}</span>
                  <span className="mono" style={{ fontWeight: 700, color: colorBase }}>
                    {s.n}{conv !== null && <span style={{ color: conv >= 50 ? '#16704A' : '#C0573B', fontSize: 12, marginLeft: 8 }}>▸ {conv}%</span>}
                  </span>
                </div>
                <div style={{ height: 10, borderRadius: 99, background: '#F1ECDF', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round((s.n / top) * 100)}%`, background: colorBase, borderRadius: 99, transition: 'width .5s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>ผู้ดูแลระบบ</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>Funnel Analytics</h1>
      <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A' }}>ข้อมูล first-party จาก event จริง · conversion rate แต่ละขั้น</p>

      {/* Stat tiles */}
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'ผู้เข้าชม (ไม่ซ้ำ)', val: agg.visitors, color: '#2F4B7C' },
          { label: 'สมัครสมาชิก', val: agg.signups, color: '#16704A' },
          { label: 'ชำระเงิน', val: agg.paid, color: '#A87A1E' },
          { label: 'event ทั้งหมด', val: agg.totalEvents, color: '#6B3F69' },
        ].map(t => (
          <div key={t.label} style={{ background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 14, padding: '14px 16px' }}>
            <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: t.color }}>{t.val}</div>
            <div style={{ fontSize: 12.5, color: '#8E8676' }}>{t.label}</div>
          </div>
        ))}
      </div>

      {agg.totalEvents === 0 ? (
        <div className="card card-pad" style={{ marginTop: 18, textAlign: 'center', color: '#8E8676' }}>
          ยังไม่มี event เข้ามา — เมื่อมีผู้เข้าชม/สมัคร ตัวเลข funnel จะขึ้นที่นี่อัตโนมัติ
        </div>
      ) : (
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <Funnel title="Funnel นิรนาม (ก่อนสมัคร)" stages={agg.anon} colorBase="#2F4B7C" />
          <Funnel title="Funnel สมาชิก (หลังสมัคร)" stages={agg.auth} colorBase="#16704A" />
        </div>
      )}

      {agg.otherEvents.length > 0 && (
        <div className="card card-pad" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1C1A15', marginBottom: 10 }}>event อื่นๆ</div>
          {agg.otherEvents.map(e => (
            <div key={e.event} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '6px 0', borderTop: '1px solid #F1ECDF' }}>
              <span style={{ color: '#5C564A' }}>{e.event}</span>
              <span className="mono" style={{ fontWeight: 700, color: '#1C1A15' }}>{e.total}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11.5, color: '#8E8676', marginTop: 14 }}>
        นับผู้ไม่ซ้ำด้วย anon_id (นิรนาม) และ member_id (สมาชิก) · aggregate ฝั่ง client (เหมาะกับ volume ปัจจุบัน)
      </div>
    </div>
  )
}
