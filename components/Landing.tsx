'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

const AUDIT_QUESTIONS = [
  { id: 'docs', label: 'ทีมคุณยังทำเอกสารมาตรฐาน (ISO/TIS) ด้วยมือ คัดลอกไฟล์เดิมๆ' },
  { id: 'consultant', label: 'เคยจ้างที่ปรึกษาหลักหมื่น–หลักแสน เพื่อทำระบบให้ผ่าน' },
  { id: 'slow', label: 'งานเอกสาร/แผนธุรกิจ ใช้เวลาเป็นสัปดาห์กว่าจะเสร็จ' },
  { id: 'plan', label: 'ยังไม่มีแผนธุรกิจที่ชัดเจน พร้อมยื่นขอทุน/นักลงทุน' },
  { id: 'scale', label: 'อยากโตเร็วขึ้น แต่ติดที่กระบวนการภายในรุงรัง' },
]

export default function Landing() {
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [showResult, setShowResult] = useState(false)

  const score = useMemo(
    () => AUDIT_QUESTIONS.filter(q => answers[q.id]).length,
    [answers]
  )
  const pct = Math.round((score / AUDIT_QUESTIONS.length) * 100)

  const verdict = useMemo(() => {
    if (score >= 4) return { title: 'ธุรกิจคุณพร้อมเปลี่ยนเป็นระบบอัตโนมัติทันที', tone: 'text-amber-400', desc: 'คุณกำลังเสียเวลาและเงินไปกับงานที่ AI ทำแทนได้ใน 3 วินาที — ยิ่งเริ่มเร็ว ยิ่งทิ้งคู่แข่งไกล' }
    if (score >= 2) return { title: 'มีช่องว่างที่ AI ช่วยคุณประหยัดได้มหาศาล', tone: 'text-cyan-400', desc: 'ลองให้พนักงาน AI จัดการงานเอกสารและแผน แล้วเอาเวลาไปโฟกัสการเติบโตจริง' }
    return { title: 'คุณจัดการได้ดีอยู่แล้ว — แต่ยังเร่งได้อีก', tone: 'text-emerald-400', desc: 'ใช้ AI เป็นผู้ช่วยเสริมทัพ เพื่อรักษาความได้เปรียบและสเกลโดยไม่เพิ่มคน' }
  }, [score])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden" style={{ fontFamily: "'Kanit', sans-serif" }}>
      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-lg">B.</span>
          <span className="font-bold text-lg tracking-tight">ตั้งต้น</span>
        </div>
        <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
          เข้าสู่ระบบ →
        </Link>
      </nav>

      {/* ── Hero: Above the Fold ── */}
      <section className="relative flex flex-col items-center justify-center min-h-[88vh] px-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-7 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-300 text-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            พนักงาน AI สำหรับธุรกิจไทย
          </span>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            ธุรกิจคุณโตได้...<br />
            <span className="text-cyan-400">ถ้าไม่ต้องรอพนักงานทำเอกสาร</span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
            เลิกจ้างที่ปรึกษาหลักแสน เพื่อมานั่งทำ ISO/TIS ให้ผ่านแบบเดิมๆ
            เปลี่ยนมาจ้าง <strong className="text-white">&lsquo;พนักงาน AI&rsquo;</strong> ที่รู้จบทุกขั้นตอนมาตรฐานไทยใน 3 วินาที
          </p>

          <div className="flex flex-col items-center">
            <Link
              href="/login"
              className="group relative px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              จ้าง AI พนักงานตัวแรกของคุณ — ฟรี 7 วัน
            </Link>
            <div className="mt-4 text-slate-500 text-sm">
              เหลือสิทธิ์จ้างงานวันนี้อีก <span className="text-amber-400 font-semibold">8 บริษัท</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-20 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-sm uppercase tracking-widest text-cyan-500 mb-8">
            บริษัทชั้นนำในไทยกว่า 500 แห่ง กำลังรันมาตรฐานด้วยระบบอัตโนมัติ
          </p>
          <div className="flex justify-center items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="text-2xl font-bold italic tracking-tighter text-slate-300">TRUSTED BY INDUSTRY LEADERS</div>
          </div>
        </div>
      </section>

      {/* ── The AI Logic ── */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
          ทำงานเสร็จใน <span className="text-cyan-400">3 ขั้นตอน</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { title: '1. จ้าง', desc: 'เลือกทักษะ (Skill) ที่คุณขาด (ISO, กลยุทธ์, การเงิน)' },
            { title: '2. รัน', desc: 'AI เริ่มทำงานให้คุณ 24 ชม. ตั้งแต่วินาทีแรก' },
            { title: '3. รับ', desc: 'ผลลัพธ์ (เอกสารมาตรฐาน, แผนธุรกิจ) ที่พร้อมยื่นทันที' },
          ].map((item, idx) => (
            <div key={idx} className="border-l border-slate-700 pl-6">
              <h3 className="text-2xl font-bold mb-2 text-cyan-300">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Audit Tool: Viewer → Lead ── */}
      <section className="relative py-24 px-6 border-t border-slate-800 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-900/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-sm uppercase tracking-widest text-amber-500">เครื่องมือทดสอบความพร้อม</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-3">
              ธุรกิจคุณพร้อมจ้าง AI แล้วหรือยัง?
            </h2>
            <p className="text-slate-400">ตอบ 5 ข้อใน 30 วินาที แล้วดูว่าคุณกำลังเสียโอกาสไปเท่าไหร่</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-6 md:p-8">
            <div className="space-y-3">
              {AUDIT_QUESTIONS.map((q, i) => {
                const on = !!answers[q.id]
                return (
                  <button
                    key={q.id}
                    onClick={() => { setAnswers(a => ({ ...a, [q.id]: !a[q.id] })); setShowResult(false) }}
                    className={`w-full flex items-center gap-4 text-left px-4 py-3.5 rounded-xl border transition-all ${
                      on
                        ? 'border-cyan-500/60 bg-cyan-500/10'
                        : 'border-slate-700 bg-slate-950/40 hover:border-slate-600'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border transition-all ${
                      on ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'
                    }`}>
                      {on && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#020617" strokeWidth="3" strokeLinecap="round"><path d="M5 12.5 10 17l9-10" /></svg>
                      )}
                    </span>
                    <span className={`text-[15px] ${on ? 'text-white' : 'text-slate-300'}`}>
                      <span className="text-slate-600 mr-1.5">{i + 1}.</span>{q.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Live score bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">ระดับความเร่งด่วน</span>
                <span className="font-mono font-semibold text-amber-400">{pct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-amber-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {!showResult ? (
              <button
                onClick={() => setShowResult(true)}
                disabled={score === 0}
                className="mt-7 w-full px-6 py-3.5 rounded-lg font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-cyan-500 hover:bg-cyan-400 text-slate-950"
              >
                {score === 0 ? 'เลือกอย่างน้อย 1 ข้อ' : 'ดูผลวิเคราะห์ของฉัน'}
              </button>
            ) : (
              <div className="mt-7 rounded-xl border border-slate-700 bg-slate-950/60 p-6 text-center animate-[fadeIn_.4s_ease]">
                <div className={`text-xl font-bold mb-2 ${verdict.tone}`}>{verdict.title}</div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{verdict.desc}</p>
                <Link
                  href="/login"
                  className="inline-block w-full px-6 py-3.5 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                >
                  เริ่มทดลองฟรี 7 วัน — ปลดล็อกพนักงาน AI ทันที
                </Link>
                <div className="mt-3 text-xs text-slate-500">ไม่ต้องใช้บัตรเครดิต · ยกเลิกได้ทุกเมื่อ</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-sm">B.</span>
            <span>© {new Date().getFullYear()} B. Training Consultant Co., Ltd.</span>
          </div>
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">เข้าสู่ระบบ / สมัครใช้งาน →</Link>
        </div>
      </footer>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
