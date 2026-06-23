'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { AppState, StepProgress } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { defaultState } from '@/lib/game'

interface AppContextValue {
  state: AppState
  loading: boolean
  markStep: (n: number, done: boolean, data?: Record<string, string | string[]>) => Promise<void>
  markLesson: (id: string) => Promise<void>
  updateVenture: (patch: Partial<AppState['venture']>) => Promise<void>
  updateAccount: (patch: Partial<AppState['account']>) => Promise<void>
  upgradePlan: (plan: AppState['plan']) => Promise<void>
  addNotif: (notif: Omit<AppState['notifs'][0], 'id' | 'read' | 'createdAt'>) => void
  readAllNotifs: () => void
  toast: (msg: string) => void
  toastMsg: string | null
  setSidebarOpen: (v: boolean) => void
}

const AppContext = createContext<AppContextValue | null>(null)

const LOCAL_KEY = 'tt_state_v3'

export function AppProvider({ children, userId, userEmail, userName }: {
  children: ReactNode; userId: string; userEmail: string; userName: string
}) {
  const [state, setState] = useState<AppState>(defaultState)
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('members')
          .select('state')
          .eq('id', userId)
          .maybeSingle()
        if (data?.state) {
          setState({ ...defaultState(), ...data.state })
        } else {
          const local = localStorage.getItem(LOCAL_KEY)
          const base = local ? { ...defaultState(), ...JSON.parse(local) } : defaultState()
          setState({ ...base, account: { ...base.account, email: userEmail, name: userName } })
        }
      } catch {
        const local = localStorage.getItem(LOCAL_KEY)
        const base = local ? { ...defaultState(), ...JSON.parse(local) } : defaultState()
        setState({ ...base, account: { ...base.account, email: userEmail, name: userName } })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback(async (next: AppState) => {
    setState(next)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next))
    try {
      await supabase.from('members').upsert({
        id: userId,
        email: next.account?.email || userEmail || null,
        name: next.account?.name || userName || null,
        plan: next.plan,
        hours: next.hours,
        venture_name: next.venture?.name || null,
        state: next,
        updated_at: new Date().toISOString(),
      })
    } catch { /* ignore — local already saved */ }
  }, [userId, supabase])

  const markStep = useCallback(async (n: number, done: boolean, data: Record<string, string | string[]> = {}) => {
    const next: AppState = {
      ...state,
      progress: {
        ...state.progress,
        [n]: { done, data: { ...(state.progress[n]?.data || {}), ...data } },
      },
    }
    await persist(next)
  }, [state, persist])

  const markLesson = useCallback(async (id: string) => {
    if (state.lessonDone[id]) return
    await persist({ ...state, lessonDone: { ...state.lessonDone, [id]: true } })
  }, [state, persist])

  const updateVenture = useCallback(async (patch: Partial<AppState['venture']>) => {
    await persist({ ...state, venture: { ...state.venture, ...patch } })
  }, [state, persist])

  const updateAccount = useCallback(async (patch: Partial<AppState['account']>) => {
    await persist({ ...state, account: { ...state.account, ...patch } })
  }, [state, persist])

  const upgradePlan = useCallback(async (plan: AppState['plan']) => {
    const hours = plan === 'monthly' ? 2 : plan === 'yearly' ? 24 : 0
    await persist({ ...state, plan, hours })
  }, [state, persist])

  const addNotif = useCallback((notif: Omit<AppState['notifs'][0], 'id' | 'read' | 'createdAt'>) => {
    const n = { ...notif, id: Date.now().toString(), read: false, createdAt: new Date().toISOString() }
    persist({ ...state, notifs: [n, ...state.notifs] })
  }, [state, persist])

  const readAllNotifs = useCallback(() => {
    persist({ ...state, notifs: state.notifs.map(n => ({ ...n, read: true })) })
  }, [state, persist])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }, [])

  const setSidebarOpen = useCallback((v: boolean) => {
    persist({ ...state, sidebarOpen: v })
  }, [state, persist])

  return (
    <AppContext.Provider value={{
      state, loading,
      markStep, markLesson,
      updateVenture, updateAccount, upgradePlan,
      addNotif, readAllNotifs,
      toast, toastMsg,
      setSidebarOpen,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
