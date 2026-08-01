import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Waves, Dumbbell, TreePine, Car, ShieldCheck, Sparkles,
  Anchor, Flag, ShoppingBag, Plane, Utensils, MapPin, Images, X, ChevronLeft, ChevronRight,
} from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import ProjectChapterModal from '../components/ui/ProjectChapterModal'
import { useProject } from '../context/ProjectContext'
import { useLang } from '../context/LangContext'
import { useSession } from '../context/SessionContext'

const ALL_ICONS = { Waves, Dumbbell, TreePine, Car, ShieldCheck, Sparkles, Anchor, Flag, ShoppingBag, Plane, Utensils, MapPin }

const TABS = [
  { id: 'obra',      es: 'OBRA',      en: 'BUILD'     },
  { id: 'entorno',   es: 'ENTORNO',   en: 'LOCATION'  },
  { id: 'amenities', es: 'AMENITIES', en: 'AMENITIES' },
]

// ─── Image carousel (controlled) ────────────────────────────────────────────
function ImageCarousel({ images, resetKey, interval = 4000 }) {
  const [idx, setIdx] = useState(0)
  const len = images?.length ?? 0

  // Reset to 0 whenever the image set changes
  useEffect(() => { setIdx(0) }, [resetKey])

  useEffect(() => {
    if (len <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % len), interval)
    return () => clearInterval(t)
  }, [len, interval])

  if (!len) return null
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      <AnimatePresence mode="wait">
        <motion.img key={`${resetKey}-${idx}`} src={images[idx]} alt=""
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 w-full h-full object-contain" />
      </AnimatePresence>
    </div>
  )
}

// ─── Shared item row (amenity or nearby) ─────────────────────────────────────
function ItemRow({ item, isSelected, onClick, lang, showDist }) {
  const Icon  = ALL_ICONS[item.icon] ?? MapPin
  const label = lang === 'es' ? (item.label ?? item.es) : (item.labelEN ?? item.en)
  return (
    <button onClick={onClick} data-cursor="hover"
      className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 text-left"
      style={{
        border: `1px solid ${isSelected ? 'rgba(184,152,72,0.5)' : 'rgba(184,152,72,0.12)'}`,
        backgroundColor: isSelected ? 'rgba(184,152,72,0.07)' : 'transparent',
        marginBottom: 4,
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(184,152,72,0.28)' }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(184,152,72,0.12)' }}>
      <Icon size={14} strokeWidth={1.2}
        color={isSelected ? 'var(--color-accent)' : 'rgba(244,241,234,0.45)'}
        style={{ flexShrink: 0 }} />
      <span className="flex-1 label-luxury"
        style={{ fontSize: '0.6rem', color: isSelected ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
        {label}
      </span>
      {showDist && item.dist && (
        <span className="label-luxury flex-shrink-0"
          style={{ fontSize: '0.48rem', color: 'rgba(184,152,72,0.55)', letterSpacing: '0.1em' }}>
          {item.dist}
        </span>
      )}
    </button>
  )
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex = 0, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const len = images.length

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % len)
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + len) % len)
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [len, onClose])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(10,12,18,0.97)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img key={idx} src={images[idx]} alt=""
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          onClick={e => e.stopPropagation()}
          style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', userSelect: 'none' }} />
      </AnimatePresence>

      {/* Prev */}
      {len > 1 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + len) % len) }}
          style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(184,152,72,0.7)', background: 'rgba(18,16,12,0.6)', border: '1px solid rgba(184,152,72,0.2)',
            padding: '10px 8px', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(184,152,72,0.7)'}>
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Next */}
      {len > 1 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % len) }}
          style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(184,152,72,0.7)', background: 'rgba(18,16,12,0.6)', border: '1px solid rgba(184,152,72,0.2)',
            padding: '10px 8px', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(184,152,72,0.7)'}>
          <ChevronRight size={18} />
        </button>
      )}

      {/* Counter */}
      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)' }}
        onClick={e => e.stopPropagation()}>
        <span className="label-luxury" style={{ fontSize: '0.48rem', color: 'rgba(184,152,72,0.5)', letterSpacing: '0.2em' }}>
          {idx + 1} / {len}
        </span>
      </div>

      {/* Close */}
      <button onClick={onClose}
        style={{ position: 'absolute', top: 20, right: 20, color: 'rgba(184,152,72,0.6)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(184,152,72,0.6)'}>
        <X size={20} />
      </button>
    </motion.div>
  )
}

// ─── Detail panel (shown below list when item selected) ───────────────────────
function DetailPanel({ item, lang, onClose, onOpenGallery }) {
  const desc    = lang === 'es' ? (item.description ?? item.descriptionEN) : (item.descriptionEN ?? item.description)
  const hasImgs = (item.images?.length ?? 0) > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.25 }}
      style={{ border: '1px solid rgba(184,152,72,0.2)', borderTop: 'none', padding: '16px 16px 14px', backgroundColor: 'rgba(184,152,72,0.03)' }}>

      <div className="flex items-start justify-between gap-4 mb-3">
        <p className="font-sans font-light flex-1"
          style={{ fontSize: '0.82rem', lineHeight: 1.75, color: 'var(--color-text-muted)' }}>
          {desc ?? (lang === 'es' ? 'Sin descripción disponible.' : 'No description available.')}
        </p>
        <button onClick={onClose} data-cursor="hover"
          style={{ color: 'rgba(184,152,72,0.4)', flexShrink: 0, marginTop: 2 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(184,152,72,0.4)'}>
          <X size={14} />
        </button>
      </div>

      {hasImgs && (
        <button onClick={onOpenGallery} data-cursor="hover"
          className="label-luxury flex items-center gap-1.5 transition-colors duration-200"
          style={{ fontSize: '0.48rem', color: 'rgba(184,152,72,0.55)', letterSpacing: '0.15em', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(184,152,72,0.55)'}>
          <Images size={11} />
          {lang === 'es' ? `VER GALERÍA →` : `SEE GALLERY →`}
        </button>
      )}
    </motion.div>
  )
}

// ─── OBRA tab ─────────────────────────────────────────────────────────────────
function ObraTab({ construction, lang }) {
  if (!construction) return (
    <p className="label-luxury" style={{ fontSize: '0.55rem', color: 'rgba(244,241,234,0.3)' }}>
      {lang === 'es' ? 'Información de obra no disponible.' : 'Build info not available.'}
    </p>
  )
  const status = lang === 'es' ? construction.status  : construction.statusEN
  const phase  = lang === 'es' ? construction.phase   : construction.phaseEN
  const pct    = construction.completion ?? 0

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="label-luxury px-3 py-1.5" style={{
          fontSize: '0.5rem', letterSpacing: '0.15em',
          color: 'rgba(255,200,80,0.9)', backgroundColor: 'rgba(255,200,80,0.08)',
          border: '1px solid rgba(255,200,80,0.3)',
        }}>● {status?.toUpperCase()}</span>
      </div>
      <div>
        <p className="label-luxury mb-1.5" style={{ fontSize: '0.48rem', color: 'rgba(184,152,72,0.5)', letterSpacing: '0.18em' }}>
          {lang === 'es' ? 'FASE ACTUAL' : 'CURRENT PHASE'}
        </p>
        <p className="font-sans font-light text-text" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{phase}</p>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="label-luxury" style={{ fontSize: '0.48rem', color: 'rgba(184,152,72,0.5)', letterSpacing: '0.18em' }}>
            {lang === 'es' ? 'AVANCE DE OBRA' : 'BUILD PROGRESS'}
          </p>
          <p className="label-luxury" style={{ fontSize: '0.52rem', color: 'var(--color-accent)' }}>{pct}%</p>
        </div>
        <div style={{ height: 3, backgroundColor: 'rgba(184,152,72,0.12)', borderRadius: 2 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
            style={{ height: '100%', backgroundColor: 'var(--color-accent)', borderRadius: 2 }} />
        </div>
      </div>
      <div>
        <p className="label-luxury mb-1.5" style={{ fontSize: '0.48rem', color: 'rgba(184,152,72,0.5)', letterSpacing: '0.18em' }}>
          {lang === 'es' ? 'ENTREGA ESTIMADA' : 'ESTIMATED DELIVERY'}
        </p>
        <p className="font-sans font-light text-text" style={{ fontSize: '0.9rem' }}>{construction.delivery}</p>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ContextPage() {
  const navigate  = useNavigate()
  const { project, building, amenities, construction, nearby } = useProject()
  const { lang, toggle } = useLang()
  const { trackEvent } = useSession()

  const [activeTab,    setActiveTab]    = useState('obra')
  const [selectedItem, setSelectedItem] = useState(null) // { type, item }
  const [lightbox,     setLightbox]     = useState(null) // { images, index }

  const name        = lang === 'es' ? project.name        : project.nameEN
  const description = lang === 'es' ? project.description : project.descriptionEN
  const defaultImages = (project.exteriorImages?.length > 0) ? project.exteriorImages : (project.gallery ?? [project.aerialImage])

  // Left panel shows selected item images or exterior-only default
  const displayImages  = (selectedItem?.item?.images?.length > 0) ? selectedItem.item.images : defaultImages
  const carouselKey    = selectedItem?.item?.id ?? 'gallery'

  function switchTab(tab) {
    setActiveTab(tab)
    setSelectedItem(null)
    trackEvent('section_view', { section: tab })
  }

  function handleItemClick(type, item) {
    if (selectedItem?.item?.id === item.id) {
      setSelectedItem(null)
    } else {
      setSelectedItem({ type, item })
      if (type === 'amenity') trackEvent('amenity_open', { id: item.id, label: item.label })
      else                    trackEvent('nearby_view',  { id: item.id, label: item.es   })
    }
  }

  return (
    <PageTransition>
      <ProjectChapterModal />

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox images={lightbox.images} startIndex={lightbox.index}
            onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 sm:px-10 py-4"
          style={{ borderBottom: '1px solid rgba(184,152,72,0.12)' }}>
          <div className="flex flex-col gap-0.5">
            <span className="display-heading text-text" style={{ fontSize: 'clamp(0.6rem, 2vw, 0.75rem)', letterSpacing: '0.12em' }}>THE VISUALS</span>
            <span className="label-luxury text-accent" style={{ fontSize: '0.45rem', letterSpacing: '0.22em' }}>BOUTIQUE·STUDIO</span>
          </div>
          <button onClick={() => navigate('/')} data-cursor="hover"
            className="label-luxury text-text/40 hidden sm:block transition-colors duration-200"
            style={{ fontSize: '0.55rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = ''}>
            {name?.toUpperCase()}
          </button>
          <button onClick={toggle} data-cursor="hover"
            className="flex items-center gap-2 label-luxury" style={{ fontSize: '0.6rem' }}>
            <span style={{ color: lang === 'es' ? 'var(--color-text)' : 'rgba(244,241,234,0.35)' }}>ES</span>
            <span style={{ color: 'var(--color-accent)' }}>|</span>
            <span style={{ color: lang === 'en' ? 'var(--color-text)' : 'rgba(244,241,234,0.35)' }}>EN</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">

          {/* Left — dynamic image panel */}
          <div className="relative flex-shrink-0 md:w-1/2 h-48 sm:h-64 md:h-full overflow-hidden">
            <ImageCarousel images={displayImages} resetKey={carouselKey} interval={4000} />

            {/* Label overlay when showing a specific item */}
            <AnimatePresence>
              {selectedItem && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute bottom-6 left-6 label-luxury"
                  style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.8)',
                    backgroundColor: 'rgba(13,17,23,0.7)', padding: '4px 10px', backdropFilter: 'blur(8px)' }}>
                  {lang === 'es'
                    ? (selectedItem.item.label ?? selectedItem.item.es)
                    : (selectedItem.item.labelEN ?? selectedItem.item.en)}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent 55%, var(--color-bg) 100%)' }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent 65%, var(--color-bg) 100%)' }} />
          </div>

          {/* Right — info */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-10 py-6 sm:py-8 pb-14 flex flex-col gap-6">

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <p className="label-luxury mb-3" style={{ color: 'var(--color-accent)' }}>{project.subtitle}</p>
              <p className="font-sans font-light" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', lineHeight: 1.85, color: 'var(--color-text-muted)' }}>
                {description}
              </p>
            </motion.div>

            {/* Key data */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <div className="h-px mb-5" style={{ backgroundColor: 'rgba(184,152,72,0.15)' }} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: lang === 'es' ? 'Unidades'   : 'Units',      value: building?.totalUnits },
                  { label: lang === 'es' ? 'Tipologías' : 'Typologies', value: building?.typologies?.join(', ') },
                  { label: lang === 'es' ? 'Superficie' : 'Surface',    value: building?.surfaceRange },
                  { label: lang === 'es' ? 'Precio'     : 'Price',      value: building?.priceRange },
                ].map(item => (
                  <div key={item.label}>
                    <p className="label-luxury mb-1" style={{ color: 'var(--color-accent)', opacity: 0.6, fontSize: '0.55rem' }}>{item.label}</p>
                    <p className="font-sans font-light text-text" style={{ fontSize: 'clamp(0.78rem, 1.8vw, 0.9rem)' }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="h-px mt-5" style={{ backgroundColor: 'rgba(184,152,72,0.15)' }} />
            </motion.div>

            {/* ── 3 Tabs ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col gap-4">

              {/* Tab headers */}
              <div className="flex" style={{ borderBottom: '1px solid rgba(184,152,72,0.12)' }}>
                {TABS.map(tab => {
                  const isActive = activeTab === tab.id
                  return (
                    <button key={tab.id} onClick={() => switchTab(tab.id)} data-cursor="hover"
                      className="label-luxury px-4 py-2.5 transition-all duration-200 relative"
                      style={{ fontSize: '0.65rem', letterSpacing: '0.18em',
                        color: isActive ? 'var(--color-accent)' : 'rgba(244,241,234,0.35)' }}>
                      {lang === 'es' ? tab.es : tab.en}
                      {isActive && (
                        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-px"
                          style={{ backgroundColor: 'var(--color-accent)' }} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                <motion.div key={activeTab}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                  {/* OBRA */}
                  {activeTab === 'obra' && <ObraTab construction={construction} lang={lang} />}

                  {/* ENTORNO — same pattern as amenities */}
                  {activeTab === 'entorno' && (
                    <div>
                      {nearby?.map(item => (
                        <div key={item.id}>
                          <ItemRow item={item} lang={lang} showDist
                            isSelected={selectedItem?.item?.id === item.id}
                            onClick={() => handleItemClick('nearby', item)} />
                          <AnimatePresence>
                            {selectedItem?.item?.id === item.id && (
                              <DetailPanel item={item} lang={lang} onClose={() => setSelectedItem(null)}
                            onOpenGallery={() => setLightbox({ images: item.images, index: 0 })} />
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AMENITIES */}
                  {activeTab === 'amenities' && (
                    <div>
                      {amenities?.map(item => (
                        <div key={item.id}>
                          <ItemRow item={item} lang={lang} showDist={false}
                            isSelected={selectedItem?.item?.id === item.id}
                            onClick={() => handleItemClick('amenity', item)} />
                          <AnimatePresence>
                            {selectedItem?.item?.id === item.id && (
                              <DetailPanel item={item} lang={lang} onClose={() => setSelectedItem(null)}
                            onOpenGallery={() => setLightbox({ images: item.images, index: 0 })} />
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}
              className="flex-shrink-0 pb-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button onClick={() => navigate('/availability')} data-cursor="hover"
                className="label-luxury border transition-all duration-500 min-h-[44px] px-8 flex items-center gap-2 justify-center sm:justify-start"
                style={{ borderColor: 'rgba(184,152,72,0.45)', color: 'var(--color-text)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.45)'; e.currentTarget.style.backgroundColor = 'transparent' }}>
                {lang === 'es' ? 'Ver viviendas disponibles →' : 'View available residences →'}
              </button>
              <button onClick={() => navigate('/map')} data-cursor="hover"
                className="label-luxury border transition-all duration-500 min-h-[44px] px-6 flex items-center gap-2 justify-center sm:justify-start"
                style={{ borderColor: 'rgba(184,152,72,0.2)', color: 'rgba(244,241,234,0.45)', fontSize: '0.52rem' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.45)'; e.currentTarget.style.color = 'var(--color-text)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.2)'; e.currentTarget.style.color = 'rgba(244,241,234,0.45)' }}>
                {lang === 'es' ? 'Ver plano →' : 'Floor plan →'}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
