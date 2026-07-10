import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Keep `/` statically cacheable: detect a session by cookie presence only, so the
// landing page never pays a Supabase round-trip. `/dashboard` still does the real
// `getUser()` check and bounces stale cookies back to `/login`.
export default function proxy(req: NextRequest) {
  const hasSession = req.cookies
    .getAll()
    .some(c => c.name.startsWith('sb-') && c.name.includes('auth-token'))

  if (hasSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/'] }
