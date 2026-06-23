export type Plan = 'free' | 'monthly' | 'yearly'

export interface Member {
  id: string
  email: string | null
  name: string | null
  plan: Plan
  hours: number
  venture_name: string | null
  state: AppState
  created_at: string
  updated_at: string
}

export interface StepProgress {
  done: boolean
  data: Record<string, string | string[]>
}

export interface AppState {
  plan: Plan
  hours: number
  account: {
    name: string
    email: string
    company: string
    color?: string
  }
  venture: {
    name: string
    tagline?: string
    category?: string
  }
  progress: Record<number, StepProgress>
  lessonDone: Record<string, boolean>
  matches: MatchRequest[]
  bookings: Booking[]
  notifs: Notification[]
  listing?: Listing | null
  sidebarOpen?: boolean
  celebrate?: boolean
  toast?: string | null
}

export interface MatchRequest {
  id: string
  listingId: string
  status: 'pending' | 'accepted' | 'closed'
  name: string
  date: string
}

export interface Booking {
  id: string
  mentorId: string
  slot: string
  status: 'pending' | 'confirmed' | 'done'
}

export interface Notification {
  id: string
  type: 'match' | 'live' | 'rank' | 'step'
  title: string
  body: string
  read: boolean
  createdAt: string
}

export interface Listing {
  id: string
  name: string
  initials: string
  color: string
  cat: 'supplier' | 'buyer' | 'investor' | 'distributor'
  dbd: string
  kind: string
  group: string
  verified?: boolean
  loc: string
  headline: string
  seek: string
  score?: number
  deal?: number
  rating?: number
  reviews?: number
  reqs?: string[]
}

export interface Theme {
  id: string
  no: number
  th: string
  en: string
  color: string
}

export interface Step {
  n: number
  theme: string
  th: string
  en: string
  guide: string
  obj: string[]
  ws: Worksheet
}

export type Worksheet =
  | { type: 'list'; label: string; placeholder: string }
  | { type: 'notes'; prompts: { k: string; label: string; ph: string }[]; vrio?: boolean }
  | { type: 'fields'; fields: { k: string; label: string; area?: boolean }[] }
  | { type: 'calc'; inputs: { k: string; label: string; unit: string; def: number }[]; compute: (v: Record<string, number>) => number; resultLabel: string; unit: string }

export interface Lesson {
  id: string
  theme: string
  step: number
  title: string
  dur: number
  level: string
  excerpt: string
  body: string[]
}

export interface Article {
  id: string
  cat: string
  title: string
  author: string
  date: string
  read: number
  excerpt: string
  body: string[]
}

export interface Mentor {
  id: string
  name: string
  initials: string
  expertise: string
  rate: number
  color: string
  title: string
  rating: number
  reviews: number
  sessions: number
  years: number
  lead?: boolean
  tags: string[]
  bio: string
  slots: string[]
}

export interface PlanOption {
  id: Plan
  name: string
  price: number
  period: string
  tagline: string
  features: string[]
  hours: number
  discount: number
  cta: string
}
