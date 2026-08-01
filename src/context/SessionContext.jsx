import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SessionContext = createContext(null)
const PROJECT_SLUG = (import.meta.env.VITE_PROJECT_SLUG ?? 'las-conchas').trim()

/* Pages that should never be tracked */
const EXCLUDED = ['/admin', '/privacy', '/boda']

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getDeviceType() {
  const ua = navigator.userAgent
  if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'tablet'
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile'
  return 'desktop'
}

function getVisitorId() {
  const key = 'tvbs_vid'
  let id = localStorage.getItem(key)
  if (!id) { id = generateId(); localStorage.setItem(key, id) }
  return id
}

function getVisitNumber(visitorId) {
  const key = `tvbs_visits_${visitorId}`
  const n = parseInt(localStorage.getItem(key) || '0', 10) + 1
  localStorage.setItem(key, String(n))
  return n
}

function getReferrerSource() {
  const ref = document.referrer
  if (!ref) return 'directo'
  try {
    const host = new URL(ref).hostname
    const ownHost = typeof window !== 'undefined' ? window.location.hostname : ''
    // Filter out self-traffic (own site, deploy platforms, local dev)
    if (host === ownHost) return 'directo'
    if (host.endsWith('.vercel.app') || host === 'vercel.com') return 'directo'
    if (host.endsWith('.github.io') || host === 'github.com')  return 'directo'
    if (host === 'localhost' || host === '127.0.0.1')          return 'directo'
    if (host.includes('google'))    return 'google'
    if (host.includes('instagram')) return 'instagram'
    if (host.includes('facebook') || host.includes('fb.'))  return 'facebook'
    if (host.includes('linkedin'))  return 'linkedin'
    if (host.includes('twitter') || host.includes('t.co'))  return 'twitter'
    if (host.includes('whatsapp') || host.includes('wa.'))  return 'whatsapp'
    if (host.includes('tiktok'))    return 'tiktok'
    return host
  } catch { return ref.slice(0, 60) }
}

export function SessionProvider({ children }) {
  const location = useLocation()

  const [sessionId] = useState(() => {
    const stored = sessionStorage.getItem('tvbs_sid')
    if (stored) return stored
    const id = generateId()
    sessionStorage.setItem('tvbs_sid', id)
    return id
  })

  const [visitorId]   = useState(getVisitorId)
  const [visitNumber] = useState(() => getVisitNumber(getVisitorId()))
  const [referrer]    = useState(getReferrerSource)
  const [userLang]    = useState(() => navigator.language || 'unknown')
  const [screenSize]  = useState(() => `${screen.width}x${screen.height}`)
  const [geo, setGeo] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('tvbs_geo') || 'null') } catch { return null }
  })

  // Resolve approximate visitor location via free IP geolocation (ipapi.co).
  // Cached in sessionStorage so we only hit the API once per tab/session.
  useEffect(() => {
    if (geo) return
    let cancelled = false
    fetch('https://ipapi.co/json/')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled || !d) return
        const next = { city: d.city ?? null, country: d.country_name ?? null }
        sessionStorage.setItem('tvbs_geo', JSON.stringify(next))
        setGeo(next)
      })
      .catch(() => { /* analytics must never break the app */ })
    return () => { cancelled = true }
  }, [geo])

  // trailRef is always current (updated synchronously on every mutation)
  // trail state is derived — only used to expose trail to consumers (ContactPage)
  const trailRef  = useRef([{
    type: 'device_info', device: getDeviceType(), ts: Date.now(),
    screen: `${screen.width}x${screen.height}`,
    lang: navigator.language || 'unknown',
    referrer: getReferrerSource(),
  }])
  const [trail, setTrail] = useState(trailRef.current)

  const enterTime = useRef(Date.now())
  const prevPage  = useRef(null)

  // ── Save session to Supabase ──────────────────────────────────────────────
  const saveSession = useCallback(async (converted = false) => {
    const t = trailRef.current
    if (t.length === 0) return

    const base = {
      session_id:    sessionId,
      visitor_id:    visitorId,
      visit_number:  visitNumber,
      referrer,
      user_lang:     userLang,
      screen_size:   screenSize,
      project_slug:  PROJECT_SLUG,
      trail:         t,
      pages_count:   t.filter(e => e.type === 'page_view').length,
      converted,
      updated_at:    new Date().toISOString(),
    }
    const withGeo = { ...base, city: geo?.city ?? null, country: geo?.country ?? null }

    try {
      // Try with location columns first; if they don't exist yet (migration
      // not run), Supabase returns an error — fall back to the base payload
      // so a session is never lost over an optional field.
      const { error } = await supabase
        .from('page_sessions')
        .upsert(withGeo, { onConflict: 'session_id' })
      if (error) {
        await supabase.from('page_sessions').upsert(base, { onConflict: 'session_id' })
      }
    } catch {
      try {
        await supabase.from('page_sessions').upsert(base, { onConflict: 'session_id' })
      } catch { /* silent — analytics must never break the app */ }
    }
  }, [sessionId, visitorId, visitNumber, referrer, userLang, screenSize, geo])

  // ── Auto-track page views ─────────────────────────────────────────────────
  useEffect(() => {
    const now  = Date.now()
    const page = location.pathname

    if (EXCLUDED.some(p => page.startsWith(p))) return

    // Close previous page: find its page_view entry and stamp duration_ms
    if (prevPage.current && !EXCLUDED.some(p => prevPage.current.startsWith(p))) {
      const duration_ms = now - enterTime.current
      let found = false
      const updated = trailRef.current.map(e => {
        if (!found && e.type === 'page_view' && e.page === prevPage.current && e.duration_ms === null) {
          found = true
          return { ...e, duration_ms }
        }
        return e
      })
      if (found) {
        trailRef.current = updated
        setTrail(updated)
      }
    }

    prevPage.current  = page
    enterTime.current = now

    // Prevent duplicate entries (React StrictMode fires effects twice in dev)
    const last = trailRef.current[trailRef.current.length - 1]
    if (last?.type === 'page_view' && last?.page === page) return

    const next = [...trailRef.current, { type: 'page_view', page, ts: now, duration_ms: null }]
    trailRef.current = next
    setTrail(next)

    // Persist after every navigation so admin always sees up-to-date data
    saveSession(false)
  }, [location.pathname, saveSession])

  // ── Save on tab hide and on page unload (belt + suspenders) ──────────────
  useEffect(() => {
    function onHide()   { if (document.visibilityState === 'hidden') saveSession(false) }
    function onUnload() { saveSession(false) }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('beforeunload', onUnload)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [saveSession])

  // ── Manual event tracking ─────────────────────────────────────────────────
  // Updates trailRef synchronously so saveSession() always reads fresh data
  const trackEvent = useCallback((type, data = {}) => {
    const event = { type, ...data, ts: Date.now() }
    trailRef.current = [...trailRef.current, event]
    setTrail(prev => [...prev, event])
  }, [])

  // ── Mark as converted (call after lead insert) ────────────────────────────
  const markConverted = useCallback(() => saveSession(true), [saveSession])

  return (
    <SessionContext.Provider value={{ sessionId, trail, trackEvent, markConverted }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
