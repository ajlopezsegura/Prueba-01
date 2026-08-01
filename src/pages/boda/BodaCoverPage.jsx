import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// ─── Wedding cover ────────────────────────────────────────────────────────────
// Art direction lifted from the physical save-the-date: linen paper, brick
// terracotta ink, editorial serif and a white photo frame as the hero object.
//
// Mobile is the primary case (most guests open this on a phone), so the phone
// layout is the one designed first: label row, the frame taking every pixel of
// remaining height, names and date as the closing caption. On a wide screen a
// lone portrait card would float in an empty linen field, so from 900px up the
// composition opens into an editorial two-column spread instead.

// TODO — swap for the real names.
const COUPLE = { a: 'Nombre', b: 'Nombre' }
const DATE   = '12.12.2026'
const PLACE  = 'Jaén'

const LINEN = '#EDE6DA'
const PAPER = '#FCFAF6'
const TERRA = '#A8452F'
const INK   = '#3A322B'
const MUTED = '#8F8274'

const SERIF = '"Cormorant Garamond", Georgia, serif'
const SANS  = '"Inter", "Helvetica Neue", Arial, sans-serif'

const EASE = [0.22, 0.61, 0.36, 1]

// Fine paper grain so the linen reads as fabric instead of flat beige.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

// Inline styles can't read media queries, so the breakpoint lives in JS.
function useIsWide(bp = 900) {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= bp)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${bp}px)`)
    const onChange = e => setWide(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [bp])
  return wide
}

function Label({ children, color = TERRA, delay = 0, style }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 1, ease: EASE }}
      style={{
        fontFamily: SANS,
        fontSize: 'clamp(0.55rem, 1.3vw, 0.66rem)',
        letterSpacing: '0.34em',
        textTransform: 'uppercase',
        fontWeight: 500,
        color,
        ...style,
      }}>
      {children}
    </motion.span>
  )
}

function Frame({ wide }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.5, ease: EASE }}
      style={{
        margin: 0,
        flex: wide ? '0 1 auto' : 1,
        minHeight: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: wide ? '78vh' : '100%',
      }}>
      <div style={{
        position: 'relative',
        height: '100%',
        aspectRatio: '9 / 16',
        maxWidth: '100%',
        background: PAPER,
        padding: 'clamp(7px, 1vw, 13px)',
        boxShadow: '0 34px 70px -28px rgba(58,50,43,0.42), 0 2px 6px rgba(58,50,43,0.06)',
      }}>
        <video
          src="/assets/videos/boda-portada.mp4"
          autoPlay muted loop playsInline preload="auto"
          style={{
            display: 'block',
            width: '100%', height: '100%',
            objectFit: 'cover',
            backgroundColor: '#E4DCCE',
          }}
        />
        {/* warm wash so the footage lives in the same colour world as the paper */}
        <div aria-hidden style={{
          position: 'absolute', inset: 'clamp(7px, 1vw, 13px)',
          background: 'linear-gradient(180deg, rgba(168,69,47,0.05) 0%, rgba(58,50,43,0.10) 100%)',
          pointerEvents: 'none',
        }} />
      </div>
    </motion.figure>
  )
}

function Names({ wide }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 1.2, ease: EASE }}
      style={{
        margin: 0,
        fontFamily: SERIF,
        fontWeight: 400,
        fontSize: wide ? 'clamp(3rem, 5.4vw, 5rem)' : 'clamp(2.1rem, 11vw, 3rem)',
        lineHeight: wide ? 0.98 : 1.02,
        letterSpacing: '-0.015em',
        color: INK,
      }}>
      {COUPLE.a}
      <span style={{ color: TERRA, fontStyle: 'italic', padding: '0 0.14em' }}>&amp;</span>
      {COUPLE.b}
    </motion.h1>
  )
}

function DateMark({ wide }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.68, duration: 1.2, ease: EASE }}
      style={{
        fontFamily: SERIF,
        fontSize: wide ? 'clamp(1.5rem, 2.4vw, 2rem)' : 'clamp(1.3rem, 6.4vw, 1.7rem)',
        letterSpacing: '0.05em',
        color: TERRA,
        lineHeight: 1,
      }}>
      {DATE}
    </motion.div>
  )
}

export default function BodaCoverPage() {
  const wide = useIsWide()

  // The app shell paints a dark navy body; hold it linen while we're here so
  // iOS overscroll never flashes the wrong colour.
  useEffect(() => {
    const prev = document.body.style.backgroundColor
    document.body.style.backgroundColor = LINEN
    return () => { document.body.style.backgroundColor = prev }
  }, [])

  return (
    <div style={{
      position: 'relative',
      minHeight: '100dvh',
      background: LINEN,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: GRAIN, opacity: 0.038, mixBlendMode: 'multiply',
      }} />

      {wide ? (
        /* ── Wide: editorial spread ─────────────────────────── */
        <div style={{
          position: 'relative',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: 'clamp(40px, 7vw, 110px)',
          padding: 'clamp(40px, 5vw, 76px)',
          maxWidth: 1320,
          width: '100%',
          margin: '0 auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(26px, 4vh, 46px)' }}>
            <Label delay={0.15}>Save the date</Label>
            <Names wide />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <DateMark wide />
              <Label delay={0.85} color={MUTED}>{PLACE}</Label>
            </div>
          </div>
          <Frame wide />
        </div>
      ) : (
        /* ── Phone: the save-the-date, alive ────────────────── */
        <div style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(14px, 2.4vh, 26px)',
          padding: 'clamp(18px, 5vw, 30px) clamp(18px, 5vw, 30px) clamp(22px, 3.6vh, 34px)',
          width: '100%',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14 }}>
            <Label delay={0.15}>Save the date</Label>
            <Label delay={0.3} color={MUTED}>{PLACE}</Label>
          </div>

          <Frame wide={false} />

          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <Names wide={false} />
            <DateMark wide={false} />
          </div>
        </div>
      )}
    </div>
  )
}
