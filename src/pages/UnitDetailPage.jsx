import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Check, Car, Package, Eye, X, GitCompareArrows, Share2 } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import UnitChapterModal from '../components/ui/UnitChapterModal'
import { useUnit, useProject } from '../context/ProjectContext'
import { useLang } from '../context/LangContext'
import { tc } from '../i18n/content'
import { useCompare } from '../context/CompareContext'
import { shareOrCopy, shareBase } from '../lib/share'
import { useSession } from '../context/SessionContext'

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

const STATUS_CONFIG = {
  available: { es: 'Disponible', en: 'Available', color: 'var(--color-accent)',  bg: 'rgba(184,152,72,0.12)' },
  reserved:  { es: 'Reservada',  en: 'Reserved',  color: 'rgba(255,200,80,0.9)', bg: 'rgba(255,200,80,0.10)' },
  sold:      { es: 'Vendida',    en: 'Sold',       color: 'rgba(244,241,234,0.3)',bg: 'rgba(244,241,234,0.05)'},
}

function GalleryModal({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length)
  const next = () => setIdx(i => (i + 1) % images.length)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(13,17,23,0.96)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <button onClick={onClose} className="absolute top-5 right-5 z-10"
        style={{ color: 'rgba(244,241,234,0.4)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,241,234,0.4)'}>
        <X size={20} />
      </button>
      <button onClick={e => { e.stopPropagation(); prev() }}
        className="absolute left-4 sm:left-8 label-luxury transition-colors duration-200"
        style={{ fontSize: '1.4rem', color: 'rgba(244,241,234,0.35)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,241,234,0.35)'}>‹</button>
      <img src={images[idx]} alt=""
        className="max-h-[85vh] max-w-[88vw] object-contain"
        onClick={e => e.stopPropagation()} />
      <button onClick={e => { e.stopPropagation(); next() }}
        className="absolute right-4 sm:right-8 label-luxury transition-colors duration-200"
        style={{ fontSize: '1.4rem', color: 'rgba(244,241,234,0.35)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,241,234,0.35)'}>›</button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setIdx(i) }}
            className="rounded-full transition-all duration-200"
            style={{ width: 6, height: 6, backgroundColor: i === idx ? 'var(--color-accent)' : 'rgba(244,241,234,0.25)' }} />
        ))}
      </div>
    </motion.div>
  )
}

export default function UnitDetailPage() {
  const { slug }     = useParams()
  const navigate     = useNavigate()
  const unit         = useUnit(slug)
  const { project }  = useProject()
  const { lang, toggle } = useLang()

  const { ids: compareIds, toggle: toggleCompare, isIn, canAdd } = useCompare()
  const { trackEvent } = useSession()
  const mob = useIsMobile()

  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIdx,  setGalleryIdx]  = useState(0)
  const [planOpen,    setPlanOpen]    = useState(false)
  const [shareDone,   setShareDone]   = useState(false)

  // Default per-unit floor plan when the unit doesn't have its own.
  // Each project can override at unit level via Supabase.plan_image.
  const planSrc = unit?.plan_image ?? './assets/images/plano-vivienda.webp'

  // Force the journey: a unit can only be opened after being staged in the
  // comparator. Direct URLs land back on /availability so the flow doesn't
  // get skipped.
  useEffect(() => {
    if (unit && !isIn(unit.id)) navigate('/availability', { replace: true })
  }, [unit, isIn, navigate])

  async function handleShare() {
    const url = `${shareBase()}#/availability/${unit.slug}`
    const result = await shareOrCopy(url, `${unit.name} · ${project?.name ?? ''}`)
    if (result === 'copied' || result === 'shared') {
      setShareDone(true)
      setTimeout(() => setShareDone(false), 2000)
    }
  }

  const openGallery = (i = 0) => {
    setGalleryIdx(i)
    setGalleryOpen(true)
    const imgPath = gallery[i] ?? ''
    const imgName = imgPath.split('/').pop().replace(/\.[^.]+$/, '')
    trackEvent('gallery_open', { unit: unit.id, image: imgName, index: i })
  }

  // ── 404 ──────────────────────────────────────────────────────────────────────
  if (!unit) {
    return (
      <PageTransition>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5"
          style={{ backgroundColor: 'var(--color-bg)' }}>
          <p className="display-heading text-text/20" style={{ fontSize: 'clamp(1rem,4vw,1.6rem)', letterSpacing: '0.1em' }}>
            {lang === 'es' ? 'VIVIENDA NO ENCONTRADA' : 'UNIT NOT FOUND'}
          </p>
          <button onClick={() => navigate('/availability')} data-cursor="hover"
            className="label-luxury px-6 py-3 transition-all duration-300"
            style={{ border: '1px solid rgba(184,152,72,0.3)', color: 'rgba(184,152,72,0.6)', fontSize: '0.58rem' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.3)'; e.currentTarget.style.color = 'rgba(184,152,72,0.6)' }}>
            {lang === 'es' ? '← Volver a disponibilidad' : '← Back to availability'}
          </button>
        </div>
      </PageTransition>
    )
  }

  const st           = STATUS_CONFIG[unit.status]
  const canAct       = unit.status !== 'sold'
  const gallery      = unit.gallery_images?.length ? unit.gallery_images : (unit.hero_image ? [unit.hero_image] : [])
  const projectName  = lang === 'es' ? project.name : project.nameEN

  const specs = [
    { label: lang === 'es' ? 'Dormitorios'  : 'Bedrooms',    value: unit.bedrooms                                              },
    { label: lang === 'es' ? 'Baños'        : 'Bathrooms',   value: unit.bathrooms                                             },
    { label: lang === 'es' ? 'Sup. total'   : 'Total area',  value: `${unit.built_area_m2} m²`                                 },
    { label: lang === 'es' ? 'Sup. interior': 'Interior',    value: `${unit.interior_area_m2} m²`                              },
    { label: lang === 'es' ? 'Terraza'      : 'Terrace',     value: unit.terrace_area_m2 > 0 ? `${unit.terrace_area_m2} m²` : '—' },
    { label: lang === 'es' ? 'Planta'       : 'Floor',       value: `${unit.floor}ª`                                           },
    { label: lang === 'es' ? 'Orientación'  : 'Orientation', value: tc(unit.orientation, lang)                                           },
    { label: lang === 'es' ? 'Bloque'       : 'Block',       value: unit.block                                                 },
  ]

  return (
    <PageTransition>
      <UnitChapterModal />
      <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* ── Header ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 sm:px-10 py-4"
          style={{ borderBottom: '1px solid rgba(184,152,72,0.12)' }}>
          <button onClick={() => navigate('/availability')} data-cursor="hover"
            className="flex items-center gap-2 label-luxury transition-colors duration-300"
            style={{ color: 'rgba(244,241,234,0.45)', fontSize: '0.6rem' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,241,234,0.45)'}>
            <ChevronLeft size={14} />
            {lang === 'es' ? 'Disponibilidad' : 'Availability'}
          </button>
          <button onClick={() => navigate('/')} data-cursor="hover"
            className="label-luxury text-text/40 hidden sm:block transition-colors duration-200"
            style={{ fontSize: '0.55rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = ''}>
            {projectName?.toUpperCase()} · {unit.name}
          </button>
          <div className="flex items-center gap-4">
            <button onClick={handleShare} data-cursor="hover"
              className="flex items-center gap-1.5 label-luxury transition-colors duration-300"
              style={{ fontSize: '0.55rem', color: shareDone ? 'var(--color-accent)' : 'rgba(244,241,234,0.45)' }}
              onMouseEnter={e => !shareDone && (e.currentTarget.style.color = 'var(--color-accent)')}
              onMouseLeave={e => !shareDone && (e.currentTarget.style.color = 'rgba(244,241,234,0.45)')}>
              {shareDone ? <Check size={12} /> : <Share2 size={12} />}
              {shareDone ? (lang === 'es' ? 'Copiado' : 'Copied') : (lang === 'es' ? 'Compartir' : 'Share')}
            </button>
            <button onClick={toggle} data-cursor="hover"
              className="flex items-center gap-2 label-luxury" style={{ fontSize: '0.6rem' }}>
              <span style={{ color: lang === 'es' ? 'var(--color-text)' : 'rgba(244,241,234,0.35)' }}>ES</span>
              <span style={{ color: 'var(--color-accent)' }}>|</span>
              <span style={{ color: lang === 'en' ? 'var(--color-text)' : 'rgba(244,241,234,0.35)' }}>EN</span>
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto pb-14">

          {/* ── HERO ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}
            className="relative cursor-pointer"
            style={{ height: 'clamp(240px, 45vw, 520px)', backgroundColor: '#0d1117' }}
            onClick={() => gallery.length && openGallery(0)}>
            {gallery[0] && (
              <img src={gallery[0]} alt={unit.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                style={{ opacity: 0.85 }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
            )}
            {/* Gradient */}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(13,17,23,0.1) 0%, transparent 40%, rgba(13,17,23,0.75) 100%)' }} />

            {/* Hero content */}
            <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-7"
              style={mob
                ? { display: 'flex', flexDirection: 'column', gap: 8 }
                : { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }
              }>
              <div>
                <div className="flex items-center gap-3 mb-2" style={{ flexWrap: 'wrap' }}>
                  <span className="label-luxury px-2.5 py-1"
                    style={{ fontSize: '0.48rem', color: st.color, backgroundColor: st.bg, border: `1px solid ${st.color}`, backdropFilter: 'blur(8px)' }}>
                    {lang === 'es' ? st.es : st.en}
                  </span>
                  {unit.featured && (
                    <span className="label-luxury px-2.5 py-1"
                      style={{ fontSize: '0.46rem', color: 'var(--color-bg)', backgroundColor: 'var(--color-accent)' }}>
                      {lang === 'es' ? 'DESTACADA' : 'FEATURED'}
                    </span>
                  )}
                  {unit.view_label && !mob && (
                    <span className="label-luxury px-2.5 py-1"
                      style={{ fontSize: '0.46rem', color: 'rgba(184,152,72,0.7)', border: '1px solid rgba(184,152,72,0.25)', backdropFilter: 'blur(8px)' }}>
                      {unit.view_label}
                    </span>
                  )}
                </div>
                <h1 className="display-heading text-text" style={{ fontSize: 'clamp(1.2rem, 3.5vw, 2rem)', letterSpacing: '0.1em', lineHeight: 1.1 }}>
                  {tc(unit.title, lang) ?? unit.name}
                </h1>
                <p className="label-luxury mt-1" style={{ fontSize: '0.52rem', color: 'rgba(184,152,72,0.6)' }}>
                  {tc(unit.typology, lang)} · {lang === 'es' ? 'Planta' : 'Floor'} {unit.floor} · {tc(unit.orientation, lang)}
                </p>
              </div>
              <div style={{ flexShrink: 0, textAlign: mob ? 'left' : 'right' }}>
                <p className="display-heading"
                  style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', letterSpacing: '0.06em', color: unit.status === 'sold' ? 'rgba(244,241,234,0.25)' : 'var(--color-accent)' }}>
                  {unit.status === 'sold' ? '—' : unit.price.toLocaleString('es-ES') + ' €'}
                </p>
                {gallery.length > 1 && (
                  <p className="label-luxury mt-1" style={{ fontSize: '0.46rem', color: 'rgba(244,241,234,0.3)' }}>
                    {lang === 'es' ? `Ver ${gallery.length} imágenes` : `View ${gallery.length} images`}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Two-column body ── */}
          <div className="px-6 sm:px-10 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

            {/* LEFT column */}
            <div className="flex flex-col gap-8">

              {/* Specs grid */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <p className="label-luxury mb-4" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)' }}>
                  {lang === 'es' ? 'ESPECIFICACIONES' : 'SPECIFICATIONS'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  {specs.map(s => (
                    <div key={s.label} className="flex flex-col gap-1 py-3 px-3"
                      style={{ borderBottom: '1px solid rgba(184,152,72,0.1)' }}>
                      <span className="label-luxury" style={{ fontSize: '0.44rem', color: 'rgba(184,152,72,0.45)' }}>{s.label}</span>
                      <span className="label-luxury text-text" style={{ fontSize: '0.72rem' }}>{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Included extras */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {unit.parking_included && (
                    <div className="flex items-center gap-1.5 label-luxury"
                      style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.6)' }}>
                      <Car size={11} style={{ color: 'var(--color-accent)' }} />
                      {lang === 'es' ? 'Garaje incluido' : 'Parking included'}
                    </div>
                  )}
                  {unit.storage_included && (
                    <div className="flex items-center gap-1.5 label-luxury"
                      style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.6)' }}>
                      <Package size={11} style={{ color: 'var(--color-accent)' }} />
                      {lang === 'es' ? 'Trastero incluido' : 'Storage included'}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Description + highlights */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <p className="label-luxury mb-4" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)' }}>
                  {lang === 'es' ? 'DESCRIPCIÓN' : 'DESCRIPTION'}
                </p>
                {unit.short_description && (
                  <p className="font-sans font-light text-text/60 mb-5" style={{ fontSize: '0.82rem', lineHeight: 1.75 }}>
                    {tc(unit.short_description, lang)}
                  </p>
                )}
                {unit.highlights?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {unit.highlights.map(h => (
                      <div key={h} className="flex items-center gap-2.5">
                        <Check size={12} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                        <span className="label-luxury text-text/55" style={{ fontSize: '0.58rem' }}>{tc(h, lang)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* CTAs */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col gap-3 pt-2">
                <p className="label-luxury mb-1" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)' }}>
                  {lang === 'es' ? 'SIGUIENTE PASO' : 'NEXT STEP'}
                </p>

                {/* Primary CTA */}
                {unit.status === 'available' ? (
                  <button onClick={() => navigate(`/inmersion/${unit.slug}`)} data-cursor="hover"
                    className="w-full label-luxury py-4 flex items-center justify-center gap-2 transition-opacity duration-200"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: '0.6rem', letterSpacing: '0.18em' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    <Eye size={14} />
                    {lang === 'es' ? 'CONFIGURADOR DE VIVIENDA' : 'UNIT CONFIGURATOR'}
                  </button>
                ) : canAct ? (
                  <button
                    onClick={() => {
                      localStorage.setItem('tvbs_lead_context', JSON.stringify({
                        source: 'unit_detail',
                        back_path: `/availability/${unit.slug}`,
                        unit_ids: [unit.id],
                        primary_unit_id: unit.id,
                      }))
                      navigate('/contact')
                    }}
                    data-cursor="hover"
                    className="w-full label-luxury py-4 flex items-center justify-center gap-2 transition-opacity duration-200"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: '0.6rem', letterSpacing: '0.18em' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    {lang === 'es' ? 'CONSULTAR DISPONIBILIDAD' : 'ENQUIRE AVAILABILITY'}
                  </button>
                ) : (
                  <button onClick={() => navigate('/availability')} data-cursor="hover"
                    className="w-full label-luxury py-4 flex items-center justify-center gap-2 transition-all duration-300"
                    style={{ border: '1px solid rgba(184,152,72,0.3)', color: 'rgba(184,152,72,0.6)', fontSize: '0.6rem', letterSpacing: '0.18em' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.3)'; e.currentTarget.style.color = 'rgba(184,152,72,0.6)' }}>
                    {lang === 'es' ? 'VER OTRAS UNIDADES' : 'VIEW OTHER UNITS'}
                  </button>
                )}

                {/* Secondary CTA — request info (only when available, since reserved units already use it as primary) */}
                {unit.status === 'available' && (
                  <button
                    onClick={() => {
                      localStorage.setItem('tvbs_lead_context', JSON.stringify({
                        source: 'unit_detail',
                        back_path: `/availability/${unit.slug}`,
                        unit_ids: [unit.id],
                        primary_unit_id: unit.id,
                      }))
                      navigate('/contact')
                    }}
                    data-cursor="hover"
                    className="w-full label-luxury py-3 flex items-center justify-center gap-2 transition-all duration-300"
                    style={{ border: '1px solid rgba(184,152,72,0.25)', color: 'rgba(244,241,234,0.55)', fontSize: '0.55rem' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-text)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.25)'; e.currentTarget.style.color = 'rgba(244,241,234,0.55)' }}>
                    {lang === 'es' ? 'Solicitar información' : 'Request information'}
                  </button>
                )}

                {/* Compare */}
                <div className="flex pt-1" style={{ gap: 12, flexDirection: mob ? 'column' : 'row' }}>
                  <button
                    onClick={() => toggleCompare(unit.id)}
                    disabled={!isIn(unit.id) && !canAdd(unit.id)}
                    data-cursor="hover"
                    className="flex-1 label-luxury py-3 flex items-center justify-center gap-2 transition-all duration-300"
                    style={{
                      border: `1px solid ${isIn(unit.id) ? 'var(--color-accent)' : 'rgba(184,152,72,0.2)'}`,
                      color: isIn(unit.id) ? 'var(--color-accent)' : 'rgba(244,241,234,0.4)',
                      fontSize: '0.55rem',
                      opacity: !isIn(unit.id) && !canAdd(unit.id) ? 0.35 : 1,
                    }}
                    onMouseEnter={e => { if (isIn(unit.id) || canAdd(unit.id)) e.currentTarget.style.borderColor = 'var(--color-accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isIn(unit.id) ? 'var(--color-accent)' : 'rgba(184,152,72,0.2)' }}>
                    {isIn(unit.id)
                      ? <><Check size={12} />{lang === 'es' ? 'En comparador' : 'In comparator'}</>
                      : <><GitCompareArrows size={12} />{lang === 'es' ? 'Añadir al comparador' : 'Add to comparator'}</>
                    }
                  </button>
                  {compareIds.length >= 2 && (
                    <button onClick={() => navigate('/compare')} data-cursor="hover"
                      className="label-luxury py-3 px-4 flex items-center justify-center gap-1.5 transition-all duration-300"
                      style={{ border: '1px solid rgba(184,152,72,0.25)', color: 'rgba(184,152,72,0.55)', fontSize: '0.52rem' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.25)'; e.currentTarget.style.color = 'rgba(184,152,72,0.55)' }}>
                      {lang === 'es' ? `Ver comparador (${compareIds.length})` : `View comparator (${compareIds.length})`} →
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* RIGHT column */}
            <div className="flex flex-col gap-8">

              {/* Floor plan */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
                <p className="label-luxury mb-4" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)' }}>
                  {lang === 'es' ? 'PLANO' : 'FLOOR PLAN'}
                </p>
                <div className="flex items-center justify-center"
                  style={{ height: 260, border: '1px solid rgba(184,152,72,0.12)', backgroundColor: 'rgba(184,152,72,0.02)' }}>
                  {planSrc ? (
                    <img src={planSrc} alt={`Plano ${unit.name}`}
                      onClick={() => setPlanOpen(true)}
                      data-cursor="hover"
                      className="w-full h-full object-contain p-4 transition-opacity duration-300"
                      style={{ opacity: 0.85, cursor: 'zoom-in' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0.85'} />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center px-8">
                      <div className="grid grid-cols-3 gap-1 opacity-15">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} style={{ width: 18, height: 18, backgroundColor: 'var(--color-accent)', opacity: i % 3 === 1 ? 0.3 : 0.6 }} />
                        ))}
                      </div>
                      <p className="label-luxury" style={{ fontSize: '0.52rem', color: 'rgba(184,152,72,0.35)' }}>
                        {lang === 'es' ? 'Plano disponible próximamente' : 'Floor plan coming soon'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Gallery */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
                <p className="label-luxury mb-4" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)' }}>
                  {lang === 'es' ? 'GALERÍA' : 'GALLERY'}
                </p>
                {gallery.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {gallery.map((img, i) => (
                      <button key={i} onClick={() => openGallery(i)} data-cursor="hover"
                        className="relative overflow-hidden transition-opacity duration-300"
                        style={{ height: i === 0 ? 160 : 100, gridColumn: i === 0 ? 'span 3' : 'span 1' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                        <img src={img} alt="" className="w-full h-full object-cover" style={{ opacity: 0.88 }} />
                        {i === 0 && gallery.length > 1 && (
                          <div className="absolute bottom-2 right-2 label-luxury px-2 py-1"
                            style={{ fontSize: '0.44rem', color: 'rgba(244,241,234,0.7)', backgroundColor: 'rgba(13,17,23,0.7)', backdropFilter: 'blur(6px)' }}>
                            {lang === 'es' ? `+${gallery.length - 1} fotos` : `+${gallery.length - 1} photos`}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center"
                    style={{ height: 160, border: '1px solid rgba(184,152,72,0.1)', backgroundColor: 'rgba(184,152,72,0.02)' }}>
                    <p className="label-luxury" style={{ fontSize: '0.52rem', color: 'rgba(184,152,72,0.3)' }}>
                      {lang === 'es' ? 'Imágenes próximamente' : 'Images coming soon'}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Gallery lightbox ── */}
        <AnimatePresence>
          {galleryOpen && (
            <GalleryModal images={gallery} startIndex={galleryIdx} onClose={() => setGalleryOpen(false)} />
          )}
        </AnimatePresence>

        {/* ── Floor-plan lightbox ── */}
        <AnimatePresence>
          {planOpen && planSrc && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(13,17,23,0.96)', backdropFilter: 'blur(12px)' }}
              onClick={() => setPlanOpen(false)}>
              <button onClick={() => setPlanOpen(false)} className="absolute top-5 right-5 z-10"
                style={{ color: 'rgba(244,241,234,0.4)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,241,234,0.4)'}>
                <X size={20} />
              </button>
              <motion.img
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0.24, 1] }}
                src={planSrc}
                alt={`Plano ${unit.name}`}
                onClick={e => e.stopPropagation()}
                className="select-none"
                style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain' }}
                draggable={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
