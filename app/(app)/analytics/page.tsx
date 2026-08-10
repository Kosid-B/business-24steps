'use client'

export const runtime = 'edge'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

type Row = { member_id: string | null; anon_id: string | null; event: string; created_at: string }

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
const RANGES = [
  { id: '7', label: '7 วัน', days: 7 },
  { id: '30', label: '30 วัน', days: 30 },
  { id: '90', label: '90 วัน', days: 90 },
  { id: 'all', label: 'ทั้งหมด', days: 0 },
] as const

function dayKey(iso: string) { return iso.slice(0, 10) }

export default function AnalyticsPage() {
  const [status, setStatus] = useState<'loading' | 'denied' | 'ready'>('loading')
  const [rows, setRows] = useState<Row[]>([])
  const [range, setRange] = useState<string>('30')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
        const { data: admin } = await supabase.rpc('is_admin')
        if (!admin) { setStatus('denied'); return }
        const { data } = await supabase
          .from('funnel_events')
          .select('member_id, anon_id, event, created_at')
          .order('created_at', { ascending: true })
          .limit(20000)
        setRows((data as Row[]) || [])
        setStatus('ready')
      } catch {
        setStatus('denied')
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cutoff = useMemo(() => {
    const r = RANGES.find(x => x.id === range)!
    if (r.days === 0) return null
    return new Date(Date.now() - r.days * 86400000).toISOString()
  }, [range])

  const filtered = useMemo(
    () => cutoff ? rows.filter(r => r.created_at >= cutoff) : rows,
    [rows, cutoff]
  )

  const agg = useMemo(() => {
    const uniqAnon = (ev: string) => new Set(filtered.filter(r => r.event === ev && r.anon_id).map(r => r.anon_id)).size
    const uniqMember = (ev: string) => new Set(filtered.filter(r => r.event === ev && r.member_id).map(r => r.member_id)).size
    return {
      anon: ANON_FUNNEL.map(s => ({ ...s, n: uniqAnon(s.event) })),
      auth: AUTH_FUNNEL.map(s => ({ ...s, n: uniqMember(s.event) })),
      otherEvents: [...new Set(filtered.map(r => r.event))].filter(e => !KNOWN.has(e))
        .map(e => ({ event: e, total: filtered.filter(r => r.event === e).length })),
      totalEvents: filtered.length,
      visitors: new Set(filtered.filter(r => r.anon_id).map(r => r.anon_id)).size,
      signups: uniqMember('signup'),
      paid: uniqMember('pay'),
    }
  }, [filtered])

  // daily trend: visitors (distinct anon_id on landing_view) + signups per day
  const daily = useMemo(() => {
    const vByDay = new Map<string, Set<string>>()
    const sByDay = new Map<string, Set<string>>()
    for (const r of filtered) {
      const d = dayKey(r.created_at)
      if (r.event === 'landing_view' && r.anon_id) {
        if (!vByDay.has(d)) vByDay.set(d, new Set()); vByDay.get(d)!.add(r.anon_id)
      }
      if (r.event === 'signup' && r.member_id) {
        if (!sByDay.has(d)) sByDay.set(d, new Set()); sByDay.get(d)!.add(r.member_id)
      }
    }
    const r = RANGES.find(x => x.id === range)!
    let days: number = r.days
    if (days === 0) {
      const first = filtered[0]?.created_at
      days = first ? Math.min(120, Math.ceil((Date.now() - new Date(first).getTime()) / 86400000) + 1) : 14
    }
    const out: { date: string; label: string; visitors: number; signups: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 86400000)
      const key = dt.toISOString().slice(0, 10)
      out.push({
        date: key,
        label: dt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        visitors: vByDay.get(key)?.size ?? 0,
        signups: sByDay.get(key)?.size ?? 0,
      })
    }
    return out
  }, [filtered, range])

  if (status === 'loading') return <div style={{ padding: 40, color: '#8E8676' }}>กำลังโหลด…</div>
  if (status === 'denied') return (
    <div className="anim-fade" style={{ padding: '48px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1C1A15' }}>เฉพาะผู้ดูแลระบบ</h1>
      <p style={{ fontSize: 14.5, color: '#8E8676', marginTop: 6 }}>หน้านี้เปิดให้เฉพาะบัญชีที่มีสิทธิ์ผู้ดูแล (admin) เท่านั้น</p>
    </div>
  )

  const maxDaily = Math.max(1, ...daily.map(d => Math.max(d.visitors, d.signups)))

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>ผู้ดูแลระบบ</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>Funnel Analytics</h1>
          <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A' }}>ข้อมูล first-party จาก event จริง · conversion rate แต่ละขั้น</p>
        </div>
        {/* Time-range filter */}
        <div style={{ display: 'inline-flex', background: '#F1ECDF', borderRadius: 999, padding: 4, gap: 3, flexShrink: 0 }}>
          {RANGES.map(r => (
            <button key={r.id} onClick={() => setRange(r.id)} style={{
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '7px 14px', borderRadius: 999,
              fontSize: 13, fontWeight: 700,
              background: range === r.id ? '#FFFDF7' : 'transparent',
              color: range === r.id ? '#1C1A15' : '#8E8676',
              boxShadow: range === r.id ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
            }}>{r.label}</button>
          ))}
        </div>
      </div>

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

      {/* Daily trend */}
      <div className="card card-pad" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15' }}>แนวโน้มรายวัน</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#5C564A' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#2F4B7C' }} />ผู้เข้าชม</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#5C564A' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#16704A' }} />สมัคร</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: daily.length > 45 ? 1 : 3, height: 120, minWidth: '100%' }}>
            {daily.map(d => (
              <div key={d.date} title={`${d.label}: ผู้เข้าชม ${d.visitors} · สมัคร ${d.signups}`}
                style={{ flex: 1, minWidth: daily.length > 45 ? 3 : 6, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 2, height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: '100%', width: '100%', justifyContent: 'center' }}>
                  <div style={{ width: '45%', maxWidth: 10, height: `${Math.round((d.visitors / maxDaily) * 100)}%`, background: '#2F4B7C', borderRadius: '2px 2px 0 0', minHeight: d.visitors ? 2 : 0 }} />
                  <div style={{ width: '45%', maxWidth: 10, height: `${Math.round((d.signups / maxDaily) * 100)}%`, background: '#16704A', borderRadius: '2px 2px 0 0', minHeight: d.signups ? 2 : 0 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#8E8676' }}>
          <span>{daily[0]?.label}</span>
          <span>{daily[daily.length - 1]?.label}</span>
        </div>
      </div>

      {agg.totalEvents === 0 ? (
        <div className="card card-pad" style={{ marginTop: 16, textAlign: 'center', color: '#8E8676' }}>
          ยังไม่มี event ในช่วงนี้ — ลองเลือกช่วง &ldquo;ทั้งหมด&rdquo; หรือรอข้อมูลเข้ามา
        </div>
      ) : (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
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
