'use client'

import { useState } from 'react'
import { useApp } from '@/lib/context/AppContext'
import { LESSONS, ARTICLES } from '@/lib/data/content'
import { themeOf } from '@/lib/data/steps'

export default function LearnPage() {
  const { state, markLesson } = useApp()
  const [tab, setTab] = useState<'lessons' | 'articles'>('lessons')
  const [reading, setReading] = useState<typeof LESSONS[0] | typeof ARTICLES[0] | null>(null)

  const readCount = Object.values(state.lessonDone || {}).filter(Boolean).length
  const totalXp = readCount * 40

  async function openLesson(lesson: typeof LESSONS[0]) {
    setReading(lesson)
    await markLesson(lesson.id)
  }

  if (reading && 'step' in reading) {
    const lesson = reading as typeof LESSONS[0]
    const theme = themeOf(lesson.theme)
    return (
      <div className="anim-fade">
        <button onClick={() => setReading(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#8E8676', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          กลับ
        </button>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <span className="chip" style={{ background: theme.color + '18', color: theme.color }}>{lesson.level}</span>
          <span style={{ fontSize: 13, color: '#8E8676' }}>⏱ {lesson.dur} นาที</span>
          {state.lessonDone[lesson.id] && <span className="chip" style={{ background: '#E6F0EA', color: '#16704A' }}>✓ อ่านแล้ว +40 XP</span>}
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700, color: '#1C1A15' }}>{lesson.title}</h1>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: '#5C564A', lineHeight: 1.6 }}>{lesson.excerpt}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {lesson.body.map((para, i) => (
            <div key={i} style={{ fontSize: 15.5, color: '#1C1A15', lineHeight: 1.75, background: '#FCFAF2', borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${theme.color}` }}>
              {para}
            </div>
          ))}
        </div>
        <button onClick={() => setReading(null)} className="btn btn-primary" style={{ marginTop: 28 }}>
          อ่านจบ — กลับไปคลังความรู้
        </button>
      </div>
    )
  }

  if (reading && 'cat' in reading) {
    const article = reading as typeof ARTICLES[0]
    return (
      <div className="anim-fade">
        <button onClick={() => setReading(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#8E8676', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          กลับ
        </button>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <span className="chip" style={{ background: '#F1ECDF', color: '#5C564A' }}>{article.cat}</span>
          <span style={{ fontSize: 13, color: '#8E8676' }}>{article.date} · {article.read} นาที</span>
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700, color: '#1C1A15' }}>{article.title}</h1>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: '#5C564A', lineHeight: 1.6 }}>โดย {article.author}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {article.body.map((para, i) => (
            <p key={i} style={{ fontSize: 15.5, color: '#1C1A15', lineHeight: 1.75, margin: 0 }}>{para}</p>
          ))}
        </div>
        <button onClick={() => setReading(null)} className="btn btn-primary" style={{ marginTop: 28 }}>กลับ</button>
      </div>
    )
  }

  return (
    <div className="anim-fade">
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8E8676', marginBottom: 6 }}>คลังความรู้</div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-.01em', color: '#1C1A15' }}>บทเรียน & บทความ</h1>
      <p style={{ margin: '7px 0 0', fontSize: 14.5, color: '#5C564A' }}>เรียนรู้ทีละก้าวไปพร้อมลงมือทำจริง — อัปเดตเนื้อหาใหม่ทุกสัปดาห์</p>

      {/* XP banner */}
      <div style={{ marginTop: 20, background: 'linear-gradient(120deg,#2A2640,#1C1A2E)', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,.12)', color: '#EADB9C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5 2.2 1-5.5-4-3.9 5.5-.8Z" /></svg>
        </span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14.5 }}>เข้าใจบทเรียน = ปลดล็อกทักษะ + เลื่อนยศ</div>
          <div style={{ color: 'rgba(255,255,255,.72)', fontSize: 12.5 }}>อ่านจบแล้ว <b style={{ color: '#fff' }}>{readCount}</b> บท · ได้ <b style={{ color: '#EADB9C' }}>{totalXp} XP</b> เข้าสมรรถนะธุรกิจ</div>
        </div>
      </div>

      {/* Tab */}
      <div style={{ display: 'inline-flex', gap: 6, background: '#F1ECDF', padding: 5, borderRadius: 12, margin: '20px 0' }}>
        {(['lessons', 'articles'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'Kanit, sans-serif', fontSize: 14, fontWeight: 600,
            background: tab === t ? '#FFFDF7' : 'transparent',
            color: tab === t ? '#1C1A15' : '#8E8676',
            boxShadow: tab === t ? '0 1px 4px rgba(28,26,21,.1)' : 'none',
          }}>
            {t === 'lessons' ? `บทเรียน ${LESSONS.length}` : `บทความ ${ARTICLES.length}`}
          </button>
        ))}
      </div>

      {tab === 'lessons' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {LESSONS.map(l => {
            const theme = themeOf(l.theme)
            const done = state.lessonDone[l.id]
            return (
              <button key={l.id} onClick={() => openLesson(l)} style={{ textAlign: 'left', background: '#FFFDF7', border: `1px solid ${done ? '#cfe3d6' : '#E5DECC'}`, borderRadius: 16, padding: 18, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', overflow: 'hidden' }}>
                {done && <span style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: 6, background: '#16704A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 12.5 10 17l9-10" /></svg>
                </span>}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="chip" style={{ background: theme.color + '18', color: theme.color }}>{l.level}</span>
                  <span style={{ fontSize: 11.5, color: '#8E8676' }}>⏱ {l.dur} นาที</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1C1A15', lineHeight: 1.4 }}>{l.title}</div>
                <div style={{ fontSize: 13, color: '#5C564A', lineHeight: 1.5 }}>{l.excerpt}</div>
                <div style={{ fontSize: 12, color: '#A87A1E', fontWeight: 600 }}>+40 XP เมื่ออ่านจบ</div>
              </button>
            )
          })}
        </div>
      )}

      {tab === 'articles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ARTICLES.map(a => (
            <button key={a.id} onClick={() => setReading(a)} style={{ textAlign: 'left', background: '#FFFDF7', border: '1px solid #E5DECC', borderRadius: 16, padding: 18, cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span className="chip" style={{ background: '#F1ECDF', color: '#5C564A', flexShrink: 0 }}>{a.cat}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5, color: '#1C1A15', marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: '#5C564A', lineHeight: 1.5 }}>{a.excerpt}</div>
                <div style={{ fontSize: 12, color: '#8E8676', marginTop: 6 }}>{a.author} · {a.date} · {a.read} นาที</div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9BFA8" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
