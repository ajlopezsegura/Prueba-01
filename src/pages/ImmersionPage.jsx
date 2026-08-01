import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sliders, X, Check, Sun, Moon } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import ImmersionChapterModal from '../components/ui/ImmersionChapterModal'
import { useUnit, useProject } from '../context/ProjectContext'
import { useLang } from '../context/LangContext'
import { useSession } from '../context/SessionContext'

// ─── Responsive hook ─────────────────────────────────────────────────────────
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

// ─── Time of day config ───────────────────────────────────────────────────────
// With real day/night renders in place, the overlays only add a hint of tint —
// the imagery carries the change itself.
const TIMES = [
  { id: 'day',   icon: Sun,  es: 'Día',   en: 'Day',   overlay: 'rgba(255,240,200,0.04)' },
  { id: 'night', icon: Moon, es: 'Noche', en: 'Night', overlay: 'rgba(0,0,0,0)'          },
]

// ─── Rooms ────────────────────────────────────────────────────────────────────
const ROOMS = [
  { id: 'salon',     es: 'Salón',         en: 'Living Room'   },
  { id: 'cocina',    es: 'Cocina',         en: 'Kitchen'       },
  { id: 'dormitorio',es: 'Dormitorio',     en: 'Master Bedroom'},
  { id: 'bano',      es: 'Baño',           en: 'Bathroom'      },
  { id: 'terraza',   es: 'Terraza',        en: 'Terrace'       },
]

// ─── Material category labels ─────────────────────────────────────────────────
const MAT_LABELS = {
  floor:   { es: 'Suelo',   en: 'Floor'   },
  walls:   { es: 'Paredes', en: 'Walls'   },
  kitchen: { es: 'Cocina',  en: 'Kitchen' },
}

// ─── Room → images by time of day ─────────────────────────────────────────────
// First entry in each list is the hero render for that time. The day/night
// pair in salon, cocina, bano, dormitorio and terraza is the same composition
// so the toggle reads as a true lighting switch.
const ROOM_IMAGES = {
  salon: {
    day: [
      './assets/images/salon/salon-day.webp',
      './assets/images/salon/salon-day-02.webp',
      './assets/images/salon/salon-day-03.webp',
      './assets/images/salon/salon-day-04.webp',
      './assets/images/salon/salon-day-05.webp',
    ],
    night: ['./assets/images/salon/salon-night.webp'],
  },
  cocina: {
    day: [
      './assets/images/cocina/cocina-day.webp',
      './assets/images/cocina/cocina-day-02.webp',
      './assets/images/cocina/cocina-day-03.webp',
    ],
    night: ['./assets/images/cocina/cocina-night.webp'],
  },
  dormitorio: {
    day: [
      './assets/images/dormitorio/dormitorio-day.webp',
      './assets/images/dormitorio/dormitorio-day-02.webp',
    ],
    night: [
      './assets/images/dormitorio/dormitorio-night.webp',
      './assets/images/dormitorio/dormitorio-night-02.webp',
    ],
  },
  bano: {
    day: [
      './assets/images/bano/bano-day.webp',
      './assets/images/bano/bano-day-02.webp',
      './assets/images/bano/bano-day-03.webp',
    ],
    night: ['./assets/images/bano/bano-night.webp'],
  },
  terraza: {
    day: [
      './assets/images/terraza/terraza-day.webp',
      './assets/images/terraza/terraza-day-02.webp',
    ],
    night: ['./assets/images/terraza/terraza-night.webp'],
  },
}

// ─── Pixel Streaming placeholder ─────────────────────────────────────────────
function PixelStreamingPlaceholder({ activeRoom, activeTime, imgIndex, timeOverlay }) {
  const imgs = ROOM_IMAGES[activeRoom]?.[activeTime] ?? []
  const src  = imgs[imgIndex] || imgs[0]

  return (
    <div className="absolute inset-0" style={{ backgroundColor: '#0d1117' }}>
      <AnimatePresence mode="wait">
        <motion.img key={src} src={src} alt=""
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 w-full h-full object-contain" />
      </AnimatePresence>
      <div className="absolute inset-0 transition-all duration-700" style={{ backgroundColor: timeOverlay }} />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ImmersionPage() {
  const { unitId }  = useParams()
  const navigate    = useNavigate()
  const unit        = useUnit(unitId)
  const { project, materials } = useProject()
  const { lang, toggle } = useLang()
  const { trackEvent }   = useSession()
  const mob = useIsMobile()
  const firstRender = useRef(true)

  const [loading, setLoading]       = useState(true)
  const [panelOpen, setPanelOpen]   = useState(false)
  const [videoOpen, setVideoOpen]   = useState(false)
  const [activeTime, setActiveTime] = useState('day')
  const [activeRoom, setActiveRoom] = useState('salon')
  const [imgIndex, setImgIndex]     = useState(0)
  const [selected, setSelected]   = useState({
    floor:   materials?.floor?.[0]?.id   ?? null,
    walls:   materials?.walls?.[0]?.id   ?? null,
    kitchen: materials?.kitchen?.[0]?.id ?? null,
  })

  // Simulate PS loading screen
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2200)
    return () => clearTimeout(t)
  }, [])

  // Reset image to main when room changes + track room view
  useEffect(() => {
    setImgIndex(0)
    if (firstRender.current) { firstRender.current = false; return }
    if (!loading) trackEvent('room_view', { room: activeRoom })
  }, [activeRoom])

  // Reset image when time of day changes so the index never exceeds the
  // length of the new day/night image list for the current room.
  useEffect(() => { setImgIndex(0) }, [activeTime])


  if (!unit) {
    return (
      <PageTransition>
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
          <p className="label-luxury" style={{ color: 'var(--color-accent)', opacity: 0.4 }}>Vivienda no encontrada</p>
        </div>
      </PageTransition>
    )
  }

  const name      = lang === 'es' ? project.name : project.nameEN
  const timeData  = TIMES.find(t => t.id === activeTime) ?? TIMES[1]
  const roomData  = ROOMS.find(r => r.id === activeRoom) ?? ROOMS[0]

  const activeKitchenMat = materials?.kitchen?.find(m => m.id === selected.kitchen)

  return (
    <PageTransition>
      <ImmersionChapterModal />
      <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#0d1117' }}>

        {/* ── Loading screen ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6"
              style={{ backgroundColor: 'var(--color-bg)' }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="flex flex-col items-center gap-2">
                <span className="display-heading text-text" style={{ fontSize: 'clamp(0.65rem, 2vw, 0.8rem)', letterSpacing: '0.14em' }}>
                  THE VISUALS BOUTIQUE·STUDIO
                </span>
                <span className="label-luxury text-accent" style={{ fontSize: '0.5rem', letterSpacing: '0.3em' }}>
                  {name?.toUpperCase()} · {unit.id}
                </span>
              </motion.div>
              {/* Progress bar */}
              <motion.div className="relative overflow-hidden" style={{ width: 160, height: 1, backgroundColor: 'rgba(184,152,72,0.2)' }}>
                <motion.div
                  initial={{ x: '-100%' }} animate={{ x: '0%' }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                  className="absolute inset-0" style={{ backgroundColor: 'var(--color-accent)' }} />
              </motion.div>
              <p className="label-luxury" style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.45)', letterSpacing: '0.2em' }}>
                {lang === 'es' ? 'CARGANDO EXPERIENCIA' : 'LOADING EXPERIENCE'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pixel Streaming area ── */}
        <PixelStreamingPlaceholder activeRoom={activeRoom} activeTime={activeTime} imgIndex={imgIndex} timeOverlay={timeData.overlay} />

        {/* Dark vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(13,17,23,0.65) 0%, transparent 25%, transparent 70%, rgba(13,17,23,0.75) 100%)' }} />

        {/* ── Image nav (manual prev/next with counter) ── */}
        {(() => {
          const imgs = ROOM_IMAGES[activeRoom]?.[activeTime] ?? []
          if (imgs.length <= 1 || loading || panelOpen) return null
          const goPrev = () => setImgIndex(i => (i - 1 + imgs.length) % imgs.length)
          const goNext = () => setImgIndex(i => (i + 1) % imgs.length)
          const arrowStyle = {
            width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(13,17,23,0.5)',
            border: '1px solid rgba(184,152,72,0.18)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(244,241,234,0.55)',
            transition: 'all 0.25s ease',
          }
          return (
            <div className="absolute flex items-center gap-3" style={{
              left: '50%', transform: 'translateX(-50%)',
              bottom: mob ? 132 : 82,
              zIndex: 15,
            }}>
              <button onClick={goPrev} data-cursor="hover" aria-label="Previous image"
                style={arrowStyle}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.18)'; e.currentTarget.style.color = 'rgba(244,241,234,0.55)' }}>
                <ChevronLeft size={14} strokeWidth={1.5} />
              </button>
              <span className="label-luxury" style={{ fontSize: '0.48rem', color: 'rgba(184,152,72,0.6)', letterSpacing: '0.2em', minWidth: 36, textAlign: 'center' }}>
                {String(imgIndex + 1).padStart(2, '0')} / {String(imgs.length).padStart(2, '0')}
              </span>
              <button onClick={goNext} data-cursor="hover" aria-label="Next image"
                style={arrowStyle}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.18)'; e.currentTarget.style.color = 'rgba(244,241,234,0.55)' }}>
                <ChevronRight size={14} strokeWidth={1.5} />
              </button>
            </div>
          )
        })()}

        {/* ── Header ── */}
        <div className="absolute top-0 left-0 right-0 z-10"
          style={{
            padding: mob ? '12px 14px' : '16px 32px',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 16,
          }}>
          <button onClick={() => navigate(`/availability/${unit.slug}`)} data-cursor="hover"
            className="flex items-center gap-1.5 label-luxury transition-all duration-300"
            style={{ color: 'rgba(244,241,234,0.5)', fontSize: '0.58rem', justifySelf: 'start' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,241,234,0.5)'}>
            <ChevronLeft size={13} />
            {lang === 'es' ? 'Volver' : 'Back'}
          </button>

          {/* Room indicator */}
          <div className="flex flex-col items-center">
            <span className="label-luxury text-accent" style={{ fontSize: '0.5rem', letterSpacing: '0.22em', opacity: 0.7 }}>
              {lang === 'es' ? roomData.es : roomData.en}
            </span>
            {!mob && (
              <span className="label-luxury text-text/30" style={{ fontSize: '0.44rem', letterSpacing: '0.15em' }}>
                {unit.id} · {unit.floor}ª {lang === 'es' ? 'planta' : 'floor'}
              </span>
            )}
          </div>

          <div className="flex items-center" style={{ gap: mob ? 8 : 12, justifySelf: 'end' }}>
            <button onClick={toggle} data-cursor="hover"
              className="flex items-center gap-1.5 label-luxury"
              style={{ fontSize: mob ? '0.52rem' : '0.58rem', backgroundColor: 'rgba(13,17,23,0.5)', backdropFilter: 'blur(8px)', padding: mob ? '0.35rem 0.55rem' : '0.4rem 0.75rem' }}>
              <span style={{ color: lang === 'es' ? 'var(--color-text)' : 'rgba(244,241,234,0.35)' }}>ES</span>
              <span style={{ color: 'var(--color-accent)' }}>|</span>
              <span style={{ color: lang === 'en' ? 'var(--color-text)' : 'rgba(244,241,234,0.35)' }}>EN</span>
            </button>
            <button onClick={() => { localStorage.setItem('tvbs_selection', JSON.stringify({ unitId: unit.id, materials: selected })); navigate('/decision') }} data-cursor="hover"
              className="label-luxury transition-all duration-300"
              style={{ border: '1px solid var(--color-accent)', color: 'var(--color-accent)', fontSize: '0.58rem',
                backgroundColor: 'rgba(26,33,48,0.5)', backdropFilter: 'blur(8px)',
                padding: mob ? '0.4rem 0.65rem' : '0.5rem 1.25rem', minHeight: mob ? 32 : 36 }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.14)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(26,33,48,0.5)'}>
              {mob ? '→' : (lang === 'es' ? 'Reservar →' : 'Reserve →')}
            </button>
          </div>
        </div>

        {/* ── Room navigation ── */}
        <div className="absolute z-10 flex"
          style={mob
            ? { bottom: 76, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4, padding: '0 12px' }
            : { left: 24, top: '50%', transform: 'translateY(-50%)', flexDirection: 'column', gap: 8 }
          }>
          {ROOMS.map(room => {
            const isActive = activeRoom === room.id
            return (
              <button key={room.id} onClick={() => setActiveRoom(room.id)} data-cursor="hover"
                className="label-luxury transition-all duration-300"
                style={mob
                  ? {
                      fontSize: '0.46rem',
                      padding: '5px 10px',
                      color: isActive ? 'var(--color-accent)' : 'rgba(244,241,234,0.4)',
                      backgroundColor: isActive ? 'rgba(184,152,72,0.12)' : 'rgba(13,17,23,0.5)',
                      backdropFilter: 'blur(8px)',
                      border: `1px solid ${isActive ? 'rgba(184,152,72,0.4)' : 'rgba(184,152,72,0.1)'}`,
                      whiteSpace: 'nowrap',
                    }
                  : {
                      fontSize: '0.52rem',
                      padding: '8px 12px',
                      paddingLeft: '0.75rem',
                      textAlign: 'left',
                      borderLeft: `2px solid ${isActive ? 'var(--color-accent)' : 'rgba(184,152,72,0.2)'}`,
                      color: isActive ? 'var(--color-accent)' : 'rgba(244,241,234,0.35)',
                      backgroundColor: isActive ? 'rgba(184,152,72,0.06)' : 'transparent',
                    }
                }>
                {lang === 'es' ? room.es : room.en}
              </button>
            )
          })}
        </div>

        {/* ── Time of day control ── */}
        <div className="absolute z-10 flex"
          style={mob
            ? { top: 52, right: 12, flexDirection: 'row', gap: 4 }
            : { right: 24, top: '50%', transform: 'translateY(-50%)', flexDirection: 'column', gap: 8 }
          }>
          {TIMES.map(t => {
            const Icon = t.icon
            const isActive = activeTime === t.id
            return (
              <button key={t.id} onClick={() => setActiveTime(t.id)} data-cursor="hover"
                className="flex items-center transition-all duration-300"
                style={mob
                  ? {
                      flexDirection: 'column', gap: 0,
                      padding: '5px 7px',
                      border: `1px solid ${isActive ? 'rgba(184,152,72,0.5)' : 'rgba(184,152,72,0.1)'}`,
                      backgroundColor: isActive ? 'rgba(184,152,72,0.1)' : 'rgba(13,17,23,0.5)',
                      backdropFilter: 'blur(8px)',
                    }
                  : {
                      flexDirection: 'column', gap: 4,
                      padding: '8px',
                      border: `1px solid ${isActive ? 'rgba(184,152,72,0.5)' : 'rgba(184,152,72,0.12)'}`,
                      backgroundColor: isActive ? 'rgba(184,152,72,0.08)' : 'rgba(13,17,23,0.4)',
                      backdropFilter: 'blur(8px)',
                    }
                }>
                <Icon size={mob ? 11 : 13} color={isActive ? 'var(--color-accent)' : 'rgba(244,241,234,0.35)'} strokeWidth={1.5} />
                {!mob && (
                  <span className="label-luxury" style={{ fontSize: '0.42rem', color: isActive ? 'var(--color-accent)' : 'rgba(244,241,234,0.3)' }}>
                    {lang === 'es' ? t.es : t.en}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Bottom bar ── */}
        <div className="absolute bottom-0 left-0 right-0 z-10"
          style={mob
            ? { display: 'flex', flexDirection: 'row', gap: 8, padding: '0 12px 14px 12px' }
            : { display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', padding: '0 32px 20px 32px', gap: 16 }
          }>
          {/* PS launch button */}
          <button onClick={() => { setVideoOpen(true); trackEvent('immersive_video_open', { unit: unit.id }) }}
            data-cursor="hover"
            className="flex items-center justify-center gap-2 label-luxury transition-all duration-300"
            style={{
              border: '1px solid rgba(184,152,72,0.5)', color: 'var(--color-accent)',
              fontSize: mob ? '0.52rem' : '0.58rem',
              backgroundColor: 'rgba(13,17,23,0.55)', backdropFilter: 'blur(10px)',
              padding: mob ? '10px 12px' : '10px 16px',
              minHeight: mob ? 36 : 40,
              flex: mob ? 1 : 'none',
              justifySelf: mob ? undefined : 'start',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(13,17,23,0.55)'}>
            {mob
              ? (lang === 'es' ? 'Experiencia' : 'Experience')
              : (lang === 'es' ? 'Empezar experiencia' : 'Start experience')}
          </button>

          {/* Material config toggle */}
          <button onClick={() => setPanelOpen(true)} data-cursor="hover"
            className="flex items-center justify-center gap-2 label-luxury transition-all duration-300"
            style={{
              border: '1px solid rgba(184,152,72,0.3)', color: 'rgba(244,241,234,0.65)',
              fontSize: mob ? '0.52rem' : '0.58rem',
              backgroundColor: 'rgba(13,17,23,0.55)', backdropFilter: 'blur(10px)',
              padding: mob ? '10px 12px' : '10px 16px',
              minHeight: mob ? 36 : 40,
              flex: mob ? 1 : 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(184,152,72,0.3)'}>
            <Sliders size={12} />
            {lang === 'es' ? 'Materiales' : 'Materials'}
          </button>

          {/* Selected kitchen material (desktop only) */}
          {!mob && activeKitchenMat && (
            <div className="flex items-center gap-1.5" style={{ justifySelf: 'end' }}>
              <div className="w-3.5 h-3.5" style={{
                backgroundColor: activeKitchenMat.swatch,
                backgroundImage: activeKitchenMat.texture ? `url(${activeKitchenMat.texture})` : undefined,
                backgroundSize: 'cover', backgroundPosition: 'center',
                border: '1px solid rgba(244,241,234,0.2)',
              }} />
              <span className="label-luxury" style={{ fontSize: '0.48rem', color: 'rgba(244,241,234,0.4)' }}>
                {lang === 'es' ? activeKitchenMat.label : activeKitchenMat.labelEN}
              </span>
            </div>
          )}
        </div>

        {/* ── Immersive experience video modal ── */}
        <AnimatePresence>
          {videoOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-50 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(8,11,16,0.98)', backdropFilter: 'blur(12px)' }}
              onClick={() => setVideoOpen(false)}>
              <button onClick={() => setVideoOpen(false)} data-cursor="hover"
                className="absolute top-5 right-5 z-10 flex items-center gap-2 label-luxury transition-colors duration-200"
                style={{ color: 'rgba(244,241,234,0.5)', fontSize: '0.58rem', letterSpacing: '0.18em' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,241,234,0.5)'}>
                {lang === 'es' ? 'CERRAR' : 'CLOSE'}
                <X size={14} />
              </button>
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  width: 'min(92vw, 1600px)',
                  aspectRatio: '16 / 9',
                  maxHeight: '86vh',
                  boxShadow: '0 40px 120px rgba(184,152,72,0.08)',
                }}>
                <iframe
                  src="https://www.youtube.com/embed/3uOUCQOxP_o?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&color=white&playsinline=1"
                  title="Las Conchas · Immersive Experience"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Material configurator panel ── */}
        <AnimatePresence>
          {panelOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setPanelOpen(false)}
                className="absolute inset-0 z-20"
                style={{ backgroundColor: 'rgba(13,17,23,0.45)', backdropFilter: 'blur(3px)' }} />

              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.35, ease: [0.43, 0.13, 0.23, 0.96] }}
                className="absolute top-0 right-0 bottom-0 z-30 flex flex-col overflow-y-auto"
                style={{ width: 'min(320px, 88vw)', backgroundColor: 'rgba(26,33,48,0.97)',
                  borderLeft: '1px solid rgba(184,152,72,0.15)', backdropFilter: 'blur(16px)' }}>

                <div className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(184,152,72,0.1)' }}>
                  <div>
                    <p className="display-heading text-text" style={{ fontSize: '0.72rem', letterSpacing: '0.12em' }}>
                      {lang === 'es' ? 'MATERIALES' : 'MATERIALS'}
                    </p>
                    <p className="label-luxury mt-0.5" style={{ fontSize: '0.48rem', color: 'rgba(184,152,72,0.55)' }}>
                      {lang === 'es' ? 'Vivienda' : 'Unit'} {unit.id}
                    </p>
                  </div>
                  <button onClick={() => setPanelOpen(false)} data-cursor="hover"
                    style={{ color: 'rgba(244,241,234,0.3)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,241,234,0.3)'}>
                    <X size={15} />
                  </button>
                </div>

                <div className="flex flex-col gap-3 px-5 py-5">
                  {(materials?.kitchen ?? []).map(opt => {
                    const isSel = selected.kitchen === opt.id
                    const description = lang === 'es' ? opt.description : (opt.descriptionEN ?? opt.description)
                    return (
                      <button key={opt.id}
                        onClick={() => {
                          setSelected(s => ({ ...s, kitchen: opt.id }))
                          trackEvent('material_select', { category: 'kitchen', material: opt.id, label: opt.label })
                        }}
                        data-cursor="hover"
                        className="text-left transition-all duration-200"
                        style={{
                          border: '1px solid',
                          borderColor: isSel ? 'rgba(184,152,72,0.45)' : 'rgba(184,152,72,0.1)',
                          backgroundColor: isSel ? 'rgba(184,152,72,0.05)' : 'transparent',
                          padding: '14px 14px 16px',
                        }}>
                        <div className="flex items-center gap-3 mb-2">
                          <div style={{
                            width: 38, height: 38, flexShrink: 0,
                            backgroundColor: opt.swatch,
                            backgroundImage: opt.texture ? `url(${opt.texture})` : undefined,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            border: '1px solid rgba(244,241,234,0.14)',
                          }} />
                          <div className="flex-1 min-w-0">
                            {opt.collection && (
                              <p className="label-luxury" style={{ fontSize: '0.46rem', color: 'rgba(184,152,72,0.7)', letterSpacing: '0.2em', marginBottom: 3 }}>
                                {opt.collection.toUpperCase()}
                              </p>
                            )}
                            <p className="label-luxury" style={{ fontSize: '0.7rem', color: isSel ? 'var(--color-text)' : 'rgba(244,241,234,0.85)', letterSpacing: '0.06em', textTransform: 'none' }}>
                              {lang === 'es' ? opt.label : opt.labelEN}
                            </p>
                          </div>
                          {isSel && <Check size={13} color="var(--color-accent)" />}
                        </div>
                        {description && (
                          <p style={{ fontSize: '0.58rem', color: 'rgba(244,241,234,0.6)', lineHeight: 1.6, letterSpacing: '0.01em' }}>
                            {description}
                          </p>
                        )}
                        {opt.source_url && (
                          <a href={opt.source_url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="inline-block label-luxury"
                            style={{ marginTop: 10, fontSize: '0.46rem', color: 'rgba(184,152,72,0.7)', letterSpacing: '0.18em', borderBottom: '1px solid rgba(184,152,72,0.3)', paddingBottom: 1 }}>
                            {lang === 'es' ? 'VER FICHA TÉCNICA →' : 'TECHNICAL SHEET →'}
                          </a>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-auto px-5 py-5" style={{ borderTop: '1px solid rgba(184,152,72,0.1)' }}>
                  <p className="label-luxury mb-3" style={{ fontSize: '0.48rem', color: 'rgba(184,152,72,0.4)', lineHeight: 1.6 }}>
                    {lang === 'es'
                      ? 'La selección de materiales se enviará junto con tu reserva.'
                      : 'Your material selection will be sent with your reservation.'}
                  </p>
                  <button onClick={() => { localStorage.setItem('tvbs_selection', JSON.stringify({ unitId: unit.id, materials: selected })); navigate('/decision') }} data-cursor="hover"
                    className="w-full label-luxury py-3 transition-opacity duration-200"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: '0.6rem', letterSpacing: '0.15em' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    {lang === 'es' ? 'CONFIRMAR Y RESERVAR' : 'CONFIRM & RESERVE'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
