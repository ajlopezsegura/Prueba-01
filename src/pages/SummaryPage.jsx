import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Download, Car, Package, Check } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { useUnit, useProject } from '../context/ProjectContext'
import { useLang } from '../context/LangContext'
import { tc } from '../i18n/content'

// ── Print layout (white editorial) ──────────────────────────────────────────
function PrintLayout({ unit, project, lang, selMats, matConfig, today }) {
  const t = (es, en) => lang === 'es' ? es : en

  const specs = [
    { label: t('Tipología',    'Typology'),    value: tc(unit.typology, lang)                                                      },
    { label: t('Planta',       'Floor'),        value: `${unit.floor}ª`                                                   },
    { label: t('Dormitorios',  'Bedrooms'),     value: unit.bedrooms                                                      },
    { label: t('Baños',        'Bathrooms'),    value: unit.bathrooms                                                     },
    { label: t('Sup. total',   'Total area'),   value: `${unit.built_area_m2} m²`                                        },
    { label: t('Interior',     'Interior'),     value: `${unit.interior_area_m2} m²`                                     },
    { label: t('Terraza',      'Terrace'),      value: unit.terrace_area_m2 > 0 ? `${unit.terrace_area_m2} m²` : '—'    },
    { label: t('Orientación',  'Orientation'),  value: tc(unit.orientation, lang)                                                   },
  ]

  const matEntries = Object.entries(selMats ?? {}).map(([cat, id]) => {
    const item = matConfig?.[cat]?.find(m => m.id === id)
    return item ? { cat, item } : null
  }).filter(Boolean)

  const catLabel = (cat) => t(
    cat === 'floor' ? 'Suelo' : cat === 'walls' ? 'Paredes' : 'Cocina',
    cat === 'floor' ? 'Floor' : cat === 'walls' ? 'Walls'  : 'Kitchen'
  )

  return (
    <div style={{ fontFamily: "'Montserrat','Inter',sans-serif", backgroundColor: 'white', color: '#1a1a1a', width: '100%' }}>

      {/* Header */}
      <div style={{ borderBottom: '2px solid #B89848', paddingBottom: 12, marginBottom: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 7, letterSpacing: '0.25em', color: '#B89848', marginBottom: 4, textTransform: 'uppercase', margin: '0 0 4px 0' }}>
            {project.architect ?? 'The Visuals Boutique'}
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.12em', color: '#1a1a1a', textTransform: 'uppercase', margin: 0 }}>
            {project.name}
          </h1>
          <p style={{ fontSize: 8, color: '#888', letterSpacing: '0.12em', margin: '3px 0 0 0' }}>
            {project.subtitle}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', color: '#1a1a1a', margin: '0 0 2px 0' }}>
            {tc(unit.title, lang) ?? unit.name}
          </p>
          <p style={{ fontSize: 7, color: '#888', letterSpacing: '0.1em', margin: 0 }}>
            {t('Ficha de vivienda', 'Unit brochure')} · {today}
          </p>
        </div>
      </div>

      {/* Hero image */}
      {unit.hero_image && (
        <div style={{ width: '100%', height: 200, overflow: 'hidden', marginBottom: 20 }}>
          <img src={unit.hero_image} alt={unit.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Price row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #e8e0d0' }}>
        <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.08em', color: '#B89848', margin: 0 }}>
          {unit.status === 'sold' ? '—' : unit.price.toLocaleString('es-ES') + ' €'}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          {unit.parking_included && (
            <p style={{ fontSize: 7, color: '#888', letterSpacing: '0.1em', margin: 0 }}>
              {t('✓ GARAJE INCLUIDO', '✓ PARKING INCLUDED')}
            </p>
          )}
          {unit.storage_included && (
            <p style={{ fontSize: 7, color: '#888', letterSpacing: '0.1em', margin: 0 }}>
              {t('✓ TRASTERO INCLUIDO', '✓ STORAGE INCLUDED')}
            </p>
          )}
        </div>
      </div>

      {/* Specs grid — 4 col */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px 16px', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #e8e0d0' }}>
        {specs.map(s => (
          <div key={s.label} style={{ borderBottom: '1px solid #e8e0d0', paddingBottom: 8 }}>
            <p style={{ fontSize: 6, letterSpacing: '0.18em', color: '#B89848', textTransform: 'uppercase', margin: '0 0 4px 0' }}>{s.label}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Plan + highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 6.5, letterSpacing: '0.2em', color: '#B89848', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
            {t('PLANO', 'FLOOR PLAN')}
          </p>
          {planSrc ? (
            <div style={{ border: '1px solid #e8e0d0', height: 160, overflow: 'hidden' }}>
              <img src={planSrc} alt="Plano"
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
            </div>
          ) : (
            <div style={{ border: '1px solid #e8e0d0', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 7, color: '#ccc', letterSpacing: '0.1em', margin: 0 }}>
                {t('Plano no disponible', 'Floor plan not available')}
              </p>
            </div>
          )}
        </div>
        <div>
          <p style={{ fontSize: 6.5, letterSpacing: '0.2em', color: '#B89848', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
            {t('DESTACADOS', 'HIGHLIGHTS')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(unit.highlights ?? []).map(h => (
              <div key={h} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span style={{ color: '#B89848', flexShrink: 0, fontSize: 9, marginTop: 1 }}>✓</span>
                <p style={{ fontSize: 8, color: '#555', lineHeight: 1.4, margin: 0 }}>{tc(h, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {unit.short_description && (
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e8e0d0' }}>
          <p style={{ fontSize: 6.5, letterSpacing: '0.2em', color: '#B89848', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
            {t('DESCRIPCIÓN', 'DESCRIPTION')}
          </p>
          <p style={{ fontSize: 8.5, color: '#555', lineHeight: 1.75, margin: 0 }}>
            {tc(unit.short_description, lang)}
          </p>
        </div>
      )}

      {/* Materials */}
      {matEntries.length > 0 && (
        <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e8e0d0' }}>
          <p style={{ fontSize: 6.5, letterSpacing: '0.2em', color: '#B89848', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
            {t('MATERIALES SELECCIONADOS', 'SELECTED MATERIALS')}
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {matEntries.map(({ cat, item }) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 16, height: 16, backgroundColor: item.swatch, border: '1px solid #ddd', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 6, color: '#B89848', letterSpacing: '0.12em', margin: '0 0 2px 0', textTransform: 'uppercase' }}>
                    {catLabel(cat)}
                  </p>
                  <p style={{ fontSize: 8, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
                    {lang === 'es' ? item.label : item.labelEN}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e8e0d0', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 6, color: '#aaa', letterSpacing: '0.1em', margin: 0 }}>
          {project.architect ?? 'The Visuals Boutique'} · {project.subtitle}
        </p>
        <p style={{ fontSize: 6, color: '#ccc', letterSpacing: '0.08em', margin: 0 }}>
          {t(
            'Este documento es confidencial y está destinado exclusivamente al destinatario.',
            'This document is confidential and intended solely for the addressee.'
          )}
        </p>
      </div>
    </div>
  )
}

// ── Screen page ──────────────────────────────────────────────────────────────
export default function SummaryPage() {
  const { slug }    = useParams()
  const navigate    = useNavigate()
  const unit        = useUnit(slug)
  const { project, materials: matConfig } = useProject()
  const { lang, toggle } = useLang()

  // Default per-unit floor plan when the unit doesn't have its own.
  const planSrc = unit?.plan_image ?? './assets/images/plano-vivienda.webp'

  const selMats = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tvbs_selection') ?? '{}')
      return saved.unitId === unit?.id ? (saved.materials ?? {}) : {}
    } catch { return {} }
  }, [unit?.id])

  const today = new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  // Inject @media print CSS
  useEffect(() => {
    const el = document.createElement('style')
    el.id = 'tvbs-print'
    el.textContent = `
      @media print {
        html, body {
          background: white !important;
          height: auto !important;
          overflow: visible !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .summary-root {
          position: static !important;
          inset: auto !important;
          overflow: visible !important;
          height: auto !important;
          width: 100% !important;
        }
        .summary-screen { display: none !important; }
        .summary-print  { display: block !important; }
        @page { margin: 12mm 15mm; size: A4 portrait; }
      }
    `
    document.head.appendChild(el)
    return () => document.getElementById('tvbs-print')?.remove()
  }, [])

  function handlePrint() {
    const projectSlug = (project?.name ?? 'proyecto').toLowerCase().replace(/\s+/g, '-')
    const original = document.title
    document.title = `${projectSlug}_${unit?.slug ?? unit?.id}_ficha`
    window.print()
    setTimeout(() => { document.title = original }, 500)
  }

  // ── 404 ──────────────────────────────────────────────────────────────────────
  if (!unit) {
    return (
      <PageTransition>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5"
          style={{ backgroundColor: 'var(--color-bg)' }}>
          <p className="display-heading text-text/20"
            style={{ fontSize: 'clamp(1rem,4vw,1.6rem)', letterSpacing: '0.1em' }}>
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

  const projectName = lang === 'es' ? project.name : project.nameEN
  const gallery     = unit.gallery_images?.length ? unit.gallery_images : (unit.hero_image ? [unit.hero_image] : [])

  const specs = [
    { label: lang === 'es' ? 'Dormitorios' : 'Bedrooms',   value: unit.bedrooms                                                      },
    { label: lang === 'es' ? 'Baños'       : 'Bathrooms',  value: unit.bathrooms                                                     },
    { label: lang === 'es' ? 'Sup. total'  : 'Total area', value: `${unit.built_area_m2} m²`                                         },
    { label: lang === 'es' ? 'Terraza'     : 'Terrace',    value: unit.terrace_area_m2 > 0 ? `${unit.terrace_area_m2} m²` : '—'     },
    { label: lang === 'es' ? 'Planta'      : 'Floor',      value: `${unit.floor}ª`                                                   },
    { label: lang === 'es' ? 'Orientación' : 'Orientation',value: tc(unit.orientation, lang)                                                    },
  ]

  return (
    <PageTransition className="summary-root">

      {/* Hidden on screen — visible in @media print */}
      <div className="summary-print" style={{ display: 'none' }}>
        <PrintLayout unit={unit} project={project} lang={lang}
          selMats={selMats} matConfig={matConfig} today={today} />
      </div>

      {/* Screen view */}
      <div className="summary-screen absolute inset-0 flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* ── Header ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 sm:px-10 py-4"
          style={{ borderBottom: '1px solid rgba(184,152,72,0.12)' }}>
          <button onClick={() => navigate('/decision')} data-cursor="hover"
            className="flex items-center gap-2 label-luxury transition-colors duration-300"
            style={{ color: 'rgba(244,241,234,0.45)', fontSize: '0.6rem' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,241,234,0.45)'}>
            <ChevronLeft size={14} />
            {lang === 'es' ? 'Resumen' : 'Summary'}
          </button>
          <span className="label-luxury text-text/40 hidden sm:block" style={{ fontSize: '0.55rem' }}>
            {projectName?.toUpperCase()} · {unit.name} · DOSSIER
          </span>
          <button onClick={toggle} data-cursor="hover"
            className="flex items-center gap-2 label-luxury" style={{ fontSize: '0.6rem' }}>
            <span style={{ color: lang === 'es' ? 'var(--color-text)' : 'rgba(244,241,234,0.35)' }}>ES</span>
            <span style={{ color: 'var(--color-accent)' }}>|</span>
            <span style={{ color: lang === 'en' ? 'var(--color-text)' : 'rgba(244,241,234,0.35)' }}>EN</span>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto pb-14">
          <div className="px-6 sm:px-10 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

            {/* LEFT column */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="flex flex-col gap-8">

              {/* Hero */}
              <div className="relative overflow-hidden" style={{ height: 260 }}>
                {gallery[0] ? (
                  <img src={gallery[0]} alt={unit.title}
                    className="w-full h-full object-cover" style={{ opacity: 0.88 }} />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: 'rgba(184,152,72,0.05)' }} />
                )}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(13,17,23,0.65) 100%)' }} />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="display-heading text-text" style={{ fontSize: 'clamp(1rem,3vw,1.5rem)', letterSpacing: '0.1em', lineHeight: 1.1 }}>
                      {tc(unit.title, lang) ?? unit.name}
                    </h2>
                    <p className="label-luxury mt-1" style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.65)' }}>
                      {tc(unit.typology, lang)} · {lang === 'es' ? 'Planta' : 'Floor'} {unit.floor} · {tc(unit.orientation, lang)}
                    </p>
                  </div>
                  <p className="display-heading flex-shrink-0"
                    style={{ fontSize: 'clamp(0.85rem,2vw,1.2rem)', letterSpacing: '0.06em', color: 'var(--color-accent)' }}>
                    {unit.status === 'sold' ? '—' : unit.price.toLocaleString('es-ES') + ' €'}
                  </p>
                </div>
              </div>

              {/* Specs */}
              <div>
                <p className="label-luxury mb-4" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)' }}>
                  {lang === 'es' ? 'ESPECIFICACIONES' : 'SPECIFICATIONS'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {specs.map(s => (
                    <div key={s.label} className="flex flex-col gap-1 py-3 px-3"
                      style={{ borderBottom: '1px solid rgba(184,152,72,0.1)' }}>
                      <span className="label-luxury" style={{ fontSize: '0.44rem', color: 'rgba(184,152,72,0.45)' }}>{s.label}</span>
                      <span className="label-luxury text-text" style={{ fontSize: '0.7rem' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
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
              </div>

              {/* Description */}
              {unit.short_description && (
                <div>
                  <p className="label-luxury mb-3" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)' }}>
                    {lang === 'es' ? 'DESCRIPCIÓN' : 'DESCRIPTION'}
                  </p>
                  <p className="font-sans font-light text-text/55" style={{ fontSize: '0.82rem', lineHeight: 1.75 }}>
                    {tc(unit.short_description, lang)}
                  </p>
                </div>
              )}

              {/* Materials (from immersion flow) */}
              {Object.keys(selMats).length > 0 && (
                <div>
                  <p className="label-luxury mb-4" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)' }}>
                    {lang === 'es' ? 'MATERIALES SELECCIONADOS' : 'SELECTED MATERIALS'}
                  </p>
                  <div className="flex flex-wrap gap-5">
                    {Object.entries(selMats).map(([cat, id]) => {
                      const item = matConfig?.[cat]?.find(m => m.id === id)
                      if (!item) return null
                      return (
                        <div key={cat} className="flex items-center gap-2.5">
                          <div className="flex-shrink-0"
                            style={{ width: 20, height: 20, backgroundColor: item.swatch, border: '1px solid rgba(244,241,234,0.15)' }} />
                          <div>
                            <p className="label-luxury" style={{ fontSize: '0.42rem', color: 'rgba(184,152,72,0.45)', letterSpacing: '0.12em' }}>
                              {lang === 'es'
                                ? (cat === 'floor' ? 'Suelo' : cat === 'walls' ? 'Paredes' : 'Cocina')
                                : (cat === 'floor' ? 'Floor' : cat === 'walls' ? 'Walls'   : 'Kitchen')}
                            </p>
                            <p className="label-luxury text-text/70" style={{ fontSize: '0.58rem' }}>
                              {lang === 'es' ? item.label : item.labelEN}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* RIGHT column */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-8">

              {/* Highlights */}
              {unit.highlights?.length > 0 && (
                <div>
                  <p className="label-luxury mb-4" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)' }}>
                    {lang === 'es' ? 'DESTACADOS' : 'HIGHLIGHTS'}
                  </p>
                  <div className="flex flex-col gap-3">
                    {unit.highlights.map(h => (
                      <div key={h} className="flex items-center gap-3">
                        <Check size={12} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                        <span className="label-luxury text-text/60" style={{ fontSize: '0.6rem' }}>{tc(h, lang)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Floor plan */}
              <div>
                <p className="label-luxury mb-4" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)' }}>
                  {lang === 'es' ? 'PLANO' : 'FLOOR PLAN'}
                </p>
                <div className="flex items-center justify-center"
                  style={{ height: 220, border: '1px solid rgba(184,152,72,0.12)', backgroundColor: 'rgba(184,152,72,0.02)' }}>
                  {planSrc ? (
                    <img src={planSrc} alt={`Plano ${unit.name}`}
                      className="w-full h-full object-contain p-4" style={{ opacity: 0.85 }} />
                  ) : (
                    <p className="label-luxury" style={{ fontSize: '0.52rem', color: 'rgba(184,152,72,0.35)' }}>
                      {lang === 'es' ? 'Plano disponible próximamente' : 'Floor plan coming soon'}
                    </p>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3 pt-4" style={{ borderTop: '1px solid rgba(184,152,72,0.1)' }}>
                <p className="label-luxury mb-1" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)' }}>
                  DOSSIER
                </p>
                <button disabled aria-disabled="true"
                  className="w-full label-luxury py-4 flex items-center justify-center gap-2"
                  style={{
                    border: '1px solid rgba(184,152,72,0.18)',
                    color: 'rgba(244,241,234,0.28)',
                    fontSize: '0.6rem', letterSpacing: '0.18em',
                    cursor: 'not-allowed',
                    background: 'transparent',
                  }}>
                  <Download size={14} />
                  {lang === 'es' ? 'DESCARGAR PDF' : 'DOWNLOAD PDF'}
                  <span style={{ fontSize: '0.44rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)', marginLeft: 4 }}>
                    · {lang === 'es' ? 'PRÓXIMAMENTE' : 'COMING SOON'}
                  </span>
                </button>
                <button onClick={() => navigate('/decision')} data-cursor="hover"
                  className="w-full label-luxury py-3 flex items-center justify-center gap-2 transition-all duration-300"
                  style={{ border: '1px solid rgba(184,152,72,0.25)', color: 'rgba(244,241,234,0.5)', fontSize: '0.55rem' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-text)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.25)'; e.currentTarget.style.color = 'rgba(244,241,234,0.5)' }}>
                  {lang === 'es' ? '← Volver al resumen' : '← Back to summary'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
