import type { AppState } from '@/types'
import { THEMES, themeOf, STEPS } from '@/lib/data/steps'

export const RANK_TIERS = [
  { tier: 'ร็อกกี้', en: 'Rookie',   minXp: 0,    color: '#8E8676', stars: 1 },
  { tier: 'ท้าวสี่',  en: 'Explorer', minXp: 500,  color: '#2F4B7C', stars: 2 },
  { tier: 'นักสร้าง', en: 'Builder',  minXp: 1200, color: '#16704A', stars: 3 },
  { tier: 'นักรบ',   en: 'Fighter',  minXp: 2500, color: '#A87A1E', stars: 4 },
  { tier: 'แชมป์',   en: 'Champion', minXp: 5000, color: '#C0573B', stars: 5 },
]

export function getXp(state: AppState) {
  const done = STEPS.filter(s => state.progress[s.n]?.done).length
  const lessons = Object.keys(state.lessonDone || {}).length
  const matches = (state.matches || []).length
  const bookings = (state.bookings || []).length
  return done * 100 + lessons * 40 + matches * 120 + bookings * 60
}

export function getRankTier(xp: number) {
  let tier = RANK_TIERS[0]
  for (const t of RANK_TIERS) {
    if (xp >= t.minXp) tier = t
  }
  return tier
}

export function getProgress(state: AppState) {
  const done = STEPS.filter(s => state.progress[s.n]?.done).length
  const pct = done / 24
  const nextStep = STEPS.find(s => !state.progress[s.n]?.done) || STEPS[STEPS.length - 1]
  return { done, pct, next: nextStep }
}

export function getPhaseProgress(state: AppState) {
  return THEMES.map(theme => {
    const themeSteps = STEPS.filter(s => s.theme === theme.id)
    const doneCnt = themeSteps.filter(s => state.progress[s.n]?.done).length
    return {
      ...theme,
      total: themeSteps.length,
      done: doneCnt,
      pct: doneCnt / themeSteps.length,
    }
  })
}

export function getPowerLevels(state: AppState) {
  return THEMES.map(theme => {
    const themeSteps = STEPS.filter(s => s.theme === theme.id)
    const doneCnt = themeSteps.filter(s => state.progress[s.n]?.done).length
    const lessonsDone = Object.entries(state.lessonDone || {})
      .filter(([id, done]) => done && id.startsWith('l') && themeSteps.some(s => String(s.n) === id.slice(1)))
      .length
    const rawXp = doneCnt * 100 + lessonsDone * 40
    const lvl = Math.min(10, Math.floor(rawXp / 80))
    return {
      id: theme.id,
      th: theme.th.split('?')[0].replace('คุณ', '').trim(),
      short: theme.en.split(' ')[0],
      color: theme.color,
      soft: theme.color + '18',
      lvl,
      icon: themeIcon(theme.id),
    }
  })
}

function themeIcon(id: string) {
  const icons: Record<string, string> = {
    who: 'M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5',
    value: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
    acquire: 'M5 12h14M12 5l7 7-7 7',
    money: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    build: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    scale: 'M3 17l5-5 4 4 8-9M16 7h5v5',
  }
  return icons[id] || 'M12 2v20'
}

export function fmt(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

export function fmtBaht(n: number) {
  return '฿' + n.toLocaleString('th-TH')
}

export function defaultState(): AppState {
  return {
    plan: 'free',
    hours: 0,
    account: { name: '', email: '', company: '' },
    venture: { name: '' },
    progress: {},
    lessonDone: {},
    matches: [],
    bookings: [],
    notifs: [],
    listing: null,
    sidebarOpen: true,
  }
}
