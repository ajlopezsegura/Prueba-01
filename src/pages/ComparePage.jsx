import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, X, Check, ArrowRight, Share2 } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import CompareChapterModal from '../components/ui/CompareChapterModal'
import { useCompare } from '../context/CompareContext'
import { useProject } from '../context/ProjectContext'
import { useLang } from '../context/LangContext'
import { tc } from '../i18n/content'
import { shareOrCopy, shareBase } from '../lib/share'

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

const COMPARE_ROWS = [
  { key: 'price',            labelEs: 'PRECIO',        labelEn: 'PRICE',        best: 'min',
    getValue: u => u.status === 'sold' ? null : u.price,
    format:   v => v != null ? v.toLocaleString('es-ES') + ' €' : '—' },
  { key: 'typology',         labelEs: 'TIPOLOGÍA',     labelEn: 'TYPOLOGY',     best: null,
    getValue: u => u.typology,           format: v => v ?? '—' },
  { key: 'floor',            labelEs: 'PLANTA',        labelEn: 'FLOOR',        best: null,
    getValue: u => u.floor,              format: v => v != null ? `${v}ª` : '—' },
  { key: 'bedrooms',         labelEs: 'DORMITORIOS',   labelEn: 'BEDROOMS',     best: 'max',
    getValue: u => u.bedrooms,           format: v => v ?? '—' },
  { key: 'bathrooms',        labelEs: 'BAÑOS',         labelEn: 'BATHROOMS',    best: 'max',
    getValue: u => u.bathrooms,          format: v => v ?? '—' },
  { key: 'built_area_m2',    labelEs: 'SUP. TOTAL',    labelEn: 'TOTAL AREA',   best: 'max',
    getValue: u => u.built_area_m2,      format: v => v != null ? `${v} m²` : '—' },
  { key: 'interior_area_m2', labelEs: 'SUP. INTERIOR', labelEn: 'INTERIOR',     best: 'max',
    getValue: u => u.interior_area_m2,   format: v => v != null ? `${v} m²` : '—' },
  { key: 'terrace_area_m2',  labelEs: 'TERRAZA',       labelEn: 'TERRACE',      best: 'max',
    getValue: u => u.terrace_area_m2 ?? 0,
    format:   v => v > 0 ? `${v} m²` : '—' },
  { key: 'orientation',      labelEs: 'ORIENTACIÓN',   labelEn: 'ORIENTATION',  best: null,
    getValue: u => u.orientation,        format: v => v ?? '—' },
  { key: 'parking_included', labelEs: 'GARAJE',        labelEn: 'PARKING',      best: 'bool',
    getValue: u => u.parking_included ?? false, format: () => null },
  { key: 'storage_included', labelEs: 'TRASTERO',      labelEn: 'STORAGE',      best: 'bool',
    getValue: u => u.storage_included ?? false, format: () => null },
]

function getBestSet(row, units) {
  if (!row.best || row.best === 'bool') return new Set()
  const values = units.map(u => row.getValue(u))

  const nums = values.map((v, i) => ({ v, i }))
    .filter(x => typeof x.v === 'number' && x.v != null)

  if (nums.length === 0) return new Set()

  if (row.best === 'max') {
    const maxV = Math.max(...nums.map(x => x.v))
    const winners = nums.filter(x => x.v === maxV)
    if (winners.length === nums.length) return new Set() // all equal — don't highlight
    return new Set(winners.map(x => x.i))
  }

  if (row.best === 'min') {
    const minV = Math.min(...nums.map(x => x.v))
    const winners = nums.filter(x => x.v === minV)
    if (winners.length === nums.length) return new Set()
    return new Set(winners.map(x => x.i))
  }

  return new Set()
}

// Builds a one-sentence value descriptor that reads each unit against
// the rest of the comparison set: only traits where this unit is
// strictly distinctive are surfaced. No subjective copy ("frescor",
// "luz") and no traits shared with the other units. Returns null when
// the unit has nothing singular to say.
function unitDescriptor(unit, units, lang) {
  if (!unit || units.length < 2) return null
  const others = units.filter(u => u.id !== unit.id)
  const traits = []

  const isMaxAndNotTied = (val, getter) => {
    if (val == null) return false
    const vals = others.map(getter).filter(v => v != null)
    if (vals.length === 0) return false
    return vals.every(v => v < val)
  }
  const isMinAndNotTied = (val, getter) => {
    if (val == null) return false
    const vals = others.map(getter).filter(v => v != null)
    if (vals.length === 0) return false
    return vals.every(v => v > val)
  }

  // Price — lower is better
  if (unit.status !== 'sold' && isMinAndNotTied(unit.price, u => u.status === 'sold' ? null : u.price)) {
    traits.push({
      weight: 5,
      headline: lang === 'es' ? 'La más asequible' : 'The most accessible',
      data:     unit.price.toLocaleString(lang === 'es' ? 'es-ES' : 'en-US') + ' €',
    })
  }

  // Built area — higher is better
  if (isMaxAndNotTied(unit.built_area_m2, u => u.built_area_m2)) {
    traits.push({
      weight: 5,
      headline: lang === 'es' ? 'La más amplia' : 'The largest',
      data:     `${unit.built_area_m2} m²`,
    })
  }

  // Terrace — higher is better, must have one
  const terr = unit.terrace_area_m2 ?? 0
  if (terr > 0 && isMaxAndNotTied(terr, u => u.terrace_area_m2 ?? 0)) {
    traits.push({
      weight: 4,
      headline: lang === 'es' ? 'La de mayor terraza' : 'The largest terrace',
      data:     lang === 'es' ? `terraza de ${terr} m²` : `${terr} m² terrace`,
    })
  }

  // Floor — higher is better
  if (isMaxAndNotTied(unit.floor, u => u.floor)) {
    traits.push({
      weight: 3,
      headline: lang === 'es' ? 'La planta más alta' : 'The highest floor',
      data:     lang === 'es' ? `planta ${unit.floor}` : `floor ${unit.floor}`,
    })
  }

  // Bedrooms — higher is better
  if (isMaxAndNotTied(unit.bedrooms, u => u.bedrooms)) {
    traits.push({
      weight: 3,
      headline: lang === 'es' ? 'Más dormitorios' : 'More bedrooms',
      data:     lang === 'es' ? `${unit.bedrooms} dormitorios` : `${unit.bedrooms} bedrooms`,
    })
  }

  // Bathrooms — higher is better
  if (isMaxAndNotTied(unit.bathrooms, u => u.bathrooms)) {
    traits.push({
      weight: 2,
      headline: lang === 'es' ? 'Más baños' : 'More bathrooms',
      data:     lang === 'es' ? `${unit.bathrooms} baños` : `${unit.bathrooms} bathrooms`,
    })
  }

  // Parking — only if this unit has it and at least one other doesn't
  if (unit.parking_included && others.some(u => !u.parking_included)) {
    traits.push({
      weight: 2,
      headline: lang === 'es' ? 'La única con garaje' : 'The only one with parking',
      data:     null,
    })
  }

  // Storage — only if this unit has it and at least one other doesn't
  if (unit.storage_included && others.some(u => !u.storage_included)) {
    traits.push({
      weight: 2,
      headline: lang === 'es' ? 'La única con trastero' : 'The only one with storage',
      data:     null,
    })
  }

  // Fallback: when this unit has no strictly distinctive trait, surface
  // the key facts without a comparative claim so the column never reads
  // empty next to peers that do have a descriptor.
  if (traits.length === 0) {
    const parts = []
    if (unit.built_area_m2 != null) parts.push(`${unit.built_area_m2} m²`)
    if (unit.bedrooms != null) {
      parts.push(lang === 'es'
        ? `${unit.bedrooms} ${unit.bedrooms === 1 ? 'dormitorio' : 'dormitorios'}`
        : `${unit.bedrooms} ${unit.bedrooms === 1 ? 'bedroom' : 'bedrooms'}`)
    }
    if (unit.floor != null) {
      parts.push(lang === 'es' ? `planta ${unit.floor}` : `floor ${unit.floor}`)
    }
    if (parts.length === 0) return null
    const join = lang === 'es' ? ', ' : ', '
    return `${parts.join(join)}.`
  }

  traits.sort((a, b) => b.weight - a.weight)

  const setLabel = lang === 'es' ? 'del conjunto' : 'of the set'
  const top = traits.slice(0, 2)

  if (top.length === 1) {
    const t = top[0]
    return t.data ? `${t.headline} ${setLabel}, ${t.data}.` : `${t.headline} ${setLabel}.`
  }

  const [t1, t2] = top
  if (t1.data && t2.data) {
    const join = lang === 'es' ? ' y ' : ' and '
    return `${t1.headline} ${setLabel}, con ${t1.data}${join}${t2.data}.`
  }
  if (t1.data && !t2.data) {
    const also = lang === 'es' ? ' y' : ' and'
    return `${t1.headline} ${setLabel}, ${t1.data}${also} ${t2.headline.toLowerCase()}.`
  }
  // Both headline-only (rare)
  const join = lang === 'es' ? ' y ' : ' and '
  return `${t1.headline}${join}${t2.headline.toLowerCase()} ${setLabel}.`
}

export default function ComparePage() {
  const navigate              = useNavigate()
  const { ids, toggle: toggleCompare, remove, clear } = useCompare()
  const { units: allUnits }   = useProject()
  const { lang, toggle }      = useLang()
  const [searchParams]        = useSearchParams()
  const mob                         = useIsMobile()
  const [shareDone,  setShareDone]  = useState(false)

  /* Restore compare state from shared URL: #/compare?units=1a,2b,3a */
  useEffect(() => {
    const param = searchParams.get('units')
    if (!param || !allUnits) return
    param.split(',').forEach(id => {
      if (!ids.includes(id) && allUnits.find(u => u.id === id)) toggleCompare(id)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUnits])

  async function handleShare() {
    const url = `${shareBase()}#/compare?units=${ids.join(',')}`
    const result = await shareOrCopy(url, lang === 'es' ? 'Comparativa de viviendas' : 'Unit comparison')
    if (result === 'copied' || result === 'shared') {
      setShareDone(true)
      setTimeout(() => setShareDone(false), 2000)
    }
  }

  const units = ids.map(id => allUnits?.find(u => u.id === id)).filter(Boolean)
  const nCols = units.length

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (nCols < 2) {
    return (
      <PageTransition>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5"
          style={{ backgroundColor: 'var(--color-bg)' }}>
          <p className="display-heading text-text/20"
            style={{ fontSize: 'clamp(1rem,4vw,1.5rem)', letterSpacing: '0.1em', textAlign: 'center' }}>
            {lang === 'es' ? 'SELECCIONA 2 UNIDADES PARA COMPARAR' : 'SELECT 2 UNITS TO COMPARE'}
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

  const labelW   = mob ? '90px' : 'max(140px, 12vw)'
  const gridCols = `${labelW} repeat(${nCols}, 1fr)`

  return (
    <PageTransition>
      <CompareChapterModal />
      <div className="absolute inset-0 flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg)' }}>

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
          <span className="label-luxury text-text/40 hidden sm:block" style={{ fontSize: '0.55rem' }}>
            {lang === 'es' ? 'COMPARADOR DE UNIDADES' : 'UNIT COMPARATOR'}
          </span>
          <div className="flex items-center gap-4">
            {ids.length >= 2 && (
              <button onClick={handleShare} data-cursor="hover"
                className="flex items-center gap-1.5 label-luxury transition-colors duration-300"
                style={{ fontSize: '0.55rem', color: shareDone ? 'var(--color-accent)' : 'rgba(244,241,234,0.45)' }}
                onMouseEnter={e => !shareDone && (e.currentTarget.style.color = 'var(--color-accent)')}
                onMouseLeave={e => !shareDone && (e.currentTarget.style.color = 'rgba(244,241,234,0.45)')}>
                {shareDone ? <Check size={12} /> : <Share2 size={12} />}
                {shareDone ? (lang === 'es' ? 'Copiado' : 'Copied') : (lang === 'es' ? 'Compartir' : 'Share')}
              </button>
            )}
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
          <div className="px-6 sm:px-10 py-6">

            {/* Title + clear */}
            <div className="flex items-end justify-between mb-6">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="display-heading text-text"
                  style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', letterSpacing: '0.1em' }}>
                  {lang === 'es' ? 'COMPARADOR' : 'COMPARATOR'}
                </h2>
                <p className="label-luxury mt-1" style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.5)' }}>
                  {nCols} {lang === 'es' ? 'unidades seleccionadas' : 'units selected'}
                </p>
              </motion.div>
              <button onClick={clear} data-cursor="hover"
                className="flex items-center gap-1.5 label-luxury transition-colors duration-200"
                style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.4)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(184,152,72,0.4)'}>
                <X size={10} />
                {lang === 'es' ? 'Limpiar todo' : 'Clear all'}
              </button>
            </div>

            {/* Table — horizontally scrollable on mobile */}
            <div className="overflow-x-auto">
              <div style={{ minWidth: mob ? (nCols === 2 ? 340 : nCols * 150 + 90) : (nCols === 2 ? 540 : 720), width: '100%' }}>

                {/* ── Unit header cards ── */}
                <div className="grid gap-3 mb-px" style={{ gridTemplateColumns: gridCols }}>
                  <div /> {/* label column spacer */}
                  {units.map((unit, i) => {
                    const st = STATUS_CONFIG[unit.status]
                    return (
                      <motion.div key={unit.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        style={{ border: '1px solid rgba(184,152,72,0.15)' }}>
                        {/* Image */}
                        <div className="relative overflow-hidden" style={{ height: mob ? 90 : 130, backgroundColor: '#0d1117' }}>
                          {unit.hero_image
                            ? <img src={unit.hero_image} alt={unit.name}
                                className="w-full h-full object-cover"
                                style={{ opacity: unit.status === 'sold' ? 0.3 : 0.85 }} />
                            : <div className="w-full h-full flex items-center justify-center">
                                <span className="label-luxury" style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.2)' }}>—</span>
                              </div>
                          }
                          {/* Remove */}
                          <button onClick={() => remove(unit.id)} data-cursor="hover"
                            className="absolute top-2 right-2 flex items-center justify-center transition-colors duration-200"
                            style={{ width: 22, height: 22, backgroundColor: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(8px)' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(200,50,50,0.45)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(13,17,23,0.8)'}>
                            <X size={10} style={{ color: 'rgba(244,241,234,0.5)' }} />
                          </button>
                          {/* Status badge */}
                          <div className="absolute bottom-2 left-2">
                            <span className="label-luxury px-2 py-0.5"
                              style={{ fontSize: '0.42rem', color: st.color, backgroundColor: st.bg,
                                border: `1px solid ${st.color}`, backdropFilter: 'blur(6px)' }}>
                              {lang === 'es' ? st.es : st.en}
                            </span>
                          </div>
                        </div>
                        {/* Name */}
                        <div style={{ padding: mob ? '6px 8px' : '10px 12px' }}>
                          <p className="display-heading text-text" style={{ fontSize: mob ? '0.68rem' : '0.85rem', letterSpacing: '0.08em' }}>
                            {unit.name}
                          </p>
                          <p className="label-luxury mt-0.5" style={{ fontSize: mob ? '0.4rem' : '0.45rem', color: 'rgba(184,152,72,0.5)' }}>
                            {tc(unit.typology, lang)}
                          </p>
                          {(() => {
                            const desc = unitDescriptor(unit, units, lang)
                            if (!desc) return null
                            return (
                              <p style={{
                                marginTop: mob ? 6 : 10,
                                paddingTop: mob ? 6 : 9,
                                borderTop: '1px solid rgba(184,152,72,0.15)',
                                fontSize: mob ? '0.52rem' : '0.6rem',
                                lineHeight: 1.55,
                                color: 'rgba(244,241,234,0.78)',
                                letterSpacing: '0.01em',
                              }}>
                                {desc}
                              </p>
                            )
                          })()}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* ── Comparison rows ── */}
                {COMPARE_ROWS.map((row, rowIdx) => {
                  const bestSet = getBestSet(row, units)

                  return (
                    <div key={row.key} className="grid"
                      style={{
                        gridTemplateColumns: gridCols,
                        backgroundColor: rowIdx % 2 === 0 ? 'rgba(184,152,72,0.02)' : 'transparent',
                        borderBottom: '1px solid rgba(184,152,72,0.06)',
                      }}>
                      {/* Label */}
                      <div className="flex items-center"
                        style={{ padding: mob ? '8px 6px' : '12px', borderRight: '1px solid rgba(184,152,72,0.07)' }}>
                        <span className="label-luxury"
                          style={{ fontSize: mob ? '0.38rem' : '0.44rem', color: 'rgba(184,152,72,0.4)', letterSpacing: mob ? '0.08em' : '0.15em' }}>
                          {lang === 'es' ? row.labelEs : row.labelEn}
                        </span>
                      </div>

                      {/* Values */}
                      {units.map((unit, uIdx) => {
                        const val    = row.getValue(unit)
                        const isBest = bestSet.has(uIdx)
                        const isBool = row.best === 'bool'

                        return (
                          <div key={unit.id} className="flex items-center"
                            style={{
                              padding: mob ? '8px 6px' : '12px 16px',
                              borderRight: uIdx < nCols - 1 ? '1px solid rgba(184,152,72,0.06)' : 'none',
                              backgroundColor: isBest ? 'rgba(184,152,72,0.07)' : 'transparent',
                            }}>
                            {isBool ? (
                              val
                                ? <Check size={12} style={{ color: 'var(--color-accent)' }} />
                                : <span className="label-luxury" style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.18)' }}>—</span>
                            ) : (
                              <span className="label-luxury"
                                style={{
                                  fontSize: row.key === 'price' ? (mob ? '0.55rem' : '0.72rem') : (mob ? '0.48rem' : '0.63rem'),
                                  color: isBest ? 'var(--color-accent)' : 'rgba(244,241,234,0.6)',
                                  letterSpacing: row.key === 'price' ? '0.02em' : '0',
                                }}>
                                {tc(row.format(val), lang)}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}

                {/* ── CTA row ── */}
                <div className="grid gap-3 mt-6" style={{ gridTemplateColumns: gridCols }}>
                  <div />
                  {units.map(unit => (
                    <div key={unit.id} className="flex flex-col gap-2">
                      {unit.status !== 'sold' && (
                        <button
                          onClick={() => {
                            localStorage.setItem('tvbs_lead_context', JSON.stringify({
                              source: 'comparator',
                              back_path: '/compare',
                              unit_ids: units.map(u => u.id),
                              primary_unit_id: unit.id,
                            }))
                            navigate('/contact')
                          }}
                          data-cursor="hover"
                          className="w-full label-luxury py-3 flex items-center justify-center gap-1.5 transition-opacity duration-200"
                          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: '0.56rem', letterSpacing: '0.15em' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                          {lang === 'es' ? 'SOLICITAR' : 'ENQUIRE'}
                          <ArrowRight size={11} />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/availability/${unit.slug}`)}
                        data-cursor="hover"
                        className="w-full label-luxury py-2.5 flex items-center justify-center gap-1 transition-all duration-300"
                        style={{ border: '1px solid rgba(184,152,72,0.28)', color: 'rgba(184,152,72,0.55)', fontSize: '0.55rem' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.28)'; e.currentTarget.style.color = 'rgba(184,152,72,0.55)' }}>
                        {lang === 'es' ? 'Ver ficha' : 'View detail'} →
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
