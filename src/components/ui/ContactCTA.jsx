import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { useCompare } from '../../context/CompareContext'

/* Pages where the CTA should NOT appear */
const HIDDEN_EXACT  = ['/']
const HIDDEN_PREFIX = ['/contact', '/admin', '/privacy', '/summary']

export default function ContactCTA() {
  const location = useLocation()
  const navigate = useNavigate()
  const { lang } = useLang()
  const { ids } = useCompare()

  /* Lift button above the comparator bar when it's visible on the availability page */
  const compareBarVisible = location.pathname.startsWith('/availability') && ids.length >= 2
  const bottomPos = compareBarVisible ? 88 : 24

  const hidden =
    HIDDEN_EXACT.includes(location.pathname) ||
    HIDDEN_PREFIX.some(p => location.pathname.startsWith(p))

  function handleClick() {
    // Preserve any existing lead context (unit pages set this already).
    // If none exists, create a minimal one with just the source page.
    const existing = (() => {
      try { return JSON.parse(localStorage.getItem('tvbs_lead_context') ?? 'null') }
      catch { return null }
    })()

    if (!existing) {
      const source = location.pathname.replace('/', '') || 'cover'
      localStorage.setItem('tvbs_lead_context', JSON.stringify({
        source,
        unit_ids: [],
        primary_unit_id: null,
        back_path: location.pathname,
      }))
    } else {
      // Update source to current page so we know where CTA was clicked
      localStorage.setItem('tvbs_lead_context', JSON.stringify({
        ...existing,
        source: existing.source ?? (location.pathname.replace('/', '') || 'cover'),
        back_path: existing.back_path ?? location.pathname,
      }))
    }

    navigate('/contact')
  }

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.button
          key="contact-cta"
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          onClick={handleClick}
          data-cursor="hover"
          style={{
            position: 'fixed', bottom: bottomPos, right: 20, zIndex: 40,
            transition: 'bottom 0.25s ease, border-color 0.25s, background 0.25s, color 0.25s',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 20px',
            background: 'rgba(184,152,72,0.10)',
            border: '1px solid rgba(184,152,72,0.7)',
            color: 'var(--color-accent)',
            fontSize: '0.58rem', letterSpacing: '0.22em',
            fontFamily: 'inherit', cursor: 'pointer',
            backdropFilter: 'blur(12px)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--color-accent)'
            e.currentTarget.style.background  = 'rgba(184,152,72,0.18)'
            e.currentTarget.style.color       = '#ffffff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(184,152,72,0.7)'
            e.currentTarget.style.background  = 'rgba(184,152,72,0.10)'
            e.currentTarget.style.color       = 'var(--color-accent)'
          }}>
          <MessageCircle size={14} />
          <span className="hidden sm:inline">{lang === 'es' ? 'CONTACTAR' : 'CONTACT'}</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
