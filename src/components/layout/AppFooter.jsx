import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProject } from '../../context/ProjectContext'
import { useLang } from '../../context/LangContext'
import { useCompare } from '../../context/CompareContext'

const HIDDEN_EXACT   = ['/']
const HIDDEN_PREFIX  = ['/contact', '/admin', '/privacy', '/summary', '/inmersion', '/tvbs', '/v1', '/boda']

// ── Journey steps ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'proyecto',       es: 'PROYECTO',       en: 'PROJECT'      },
  { id: 'disponibilidad', es: 'DISPONIB.',       en: 'AVAILABILITY' },
  { id: 'vivienda',       es: 'VIVIENDA',        en: 'UNIT'         },
  { id: 'decision',       es: 'DECISIÓN',        en: 'DECISION'     },
]

function getStepIndex(pathname) {
  if (pathname === '/proyecto' || pathname === '/map') return 0
  if (pathname === '/availability' || pathname === '/compare') return 1
  if (pathname.startsWith('/availability/')) return 2
  if (pathname === '/decision') return 3
  return -1
}

function useIsMobile(bp = 640) {
  const [m, setM] = useState(() => window.innerWidth < bp)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`)
    const h = e => setM(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [bp])
  return m
}

export default function AppFooter() {
  const location = useLocation()
  const navigate = useNavigate()
  const { project } = useProject()
  const { lang } = useLang()
  const { ids } = useCompare()
  const mob = useIsMobile()

  const compareBarActive = location.pathname === '/availability' && ids.length >= 2

  const hidden =
    HIDDEN_EXACT.includes(location.pathname) ||
    HIDDEN_PREFIX.some(p => location.pathname.startsWith(p)) ||
    compareBarActive

  const currentStep = getStepIndex(location.pathname)

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.footer
          key="app-footer"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
            height: 52,
            backgroundColor: 'var(--color-bg)',
            borderTop: '1px solid rgba(184,152,72,0.12)',
          }}>

          {/* ── Journey progress — absolutely left-aligned ── */}
          <div style={{
            position: 'absolute',
            left: mob ? 14 : 32,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
          }}>
            {STEPS.map((step, i) => {
              const isPast    = currentStep > i
              const isCurrent = currentStep === i

              return (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>

                  {/* Connecting line (skip first) */}
                  {i > 0 && (
                    <div style={{
                      width: mob ? 10 : 18,
                      height: 1,
                      backgroundColor: (isPast || isCurrent)
                        ? 'rgba(184,152,72,0.4)'
                        : 'rgba(184,152,72,0.1)',
                      transition: 'background-color 0.4s',
                    }} />
                  )}

                  {/* Dot + label */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width:  isCurrent ? 8 : 6,
                      height: isCurrent ? 8 : 6,
                      borderRadius: '50%',
                      backgroundColor: isCurrent
                        ? 'var(--color-accent)'
                        : isPast
                          ? 'rgba(184,152,72,0.45)'
                          : 'rgba(184,152,72,0.15)',
                      boxShadow: isCurrent ? '0 0 6px rgba(184,152,72,0.5)' : 'none',
                      transition: 'all 0.4s',
                      flexShrink: 0,
                    }} />

                    {/* Label — desktop only */}
                    {!mob && (
                      <span style={{
                        fontSize: '0.42rem',
                        letterSpacing: '0.12em',
                        fontWeight: 400,
                        fontFamily: "'Montserrat', sans-serif",
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        lineHeight: 1,
                        color: isCurrent
                          ? 'rgba(184,152,72,0.75)'
                          : isPast
                            ? 'rgba(184,152,72,0.35)'
                            : 'rgba(184,152,72,0.18)',
                        transition: 'color 0.4s',
                      }}>
                        {lang === 'es' ? step.es : step.en}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── CONTACTAR — absolutely centered ── */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}>
            <button
              onClick={() => navigate('/contact')}
              data-cursor="hover"
              className="label-luxury flex items-center gap-2.5 transition-all duration-300"
              style={{
                border: '1px solid rgba(184,152,72,0.7)',
                backgroundColor: 'rgba(184,152,72,0.10)',
                color: 'var(--color-accent)',
                fontSize: mob ? '0.52rem' : '0.58rem',
                letterSpacing: '0.22em',
                padding: mob ? '7px 16px' : '8px 22px',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.18)'
                e.currentTarget.style.borderColor = 'var(--color-accent)'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.10)'
                e.currentTarget.style.borderColor = 'rgba(184,152,72,0.7)'
                e.currentTarget.style.color = 'var(--color-accent)'
              }}
            >
              {lang === 'es' ? 'CONTACTAR' : 'CONTACT'}
            </button>
          </div>

        </motion.footer>
      )}
    </AnimatePresence>
  )
}
