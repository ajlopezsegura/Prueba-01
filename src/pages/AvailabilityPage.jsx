import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, SlidersHorizontal, X, LayoutGrid, List, Check } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import AvailabilityChapterModal from '../components/ui/AvailabilityChapterModal'
import { useProject } from '../context/ProjectContext'
import { useLang } from '../context/LangContext'
import { tc } from '../i18n/content'
import { useCompare } from '../context/CompareContext'
import { useSession } from '../context/SessionContext'

const STATUS_CONFIG = {
  available: { es: 'Disponible', en: 'Available', color: 'var(--color-accent)',  bg: 'rgba(184,152,72,0.12)' },
  reserved:  { es: 'Reservada',  en: 'Reserved',  color: 'rgba(255,200,80,0.9)', bg: 'rgba(255,200,80,0.10)' },
  sold:      { es: 'Vendida',    en: 'Sold',       color: 'rgba(244,241,234,0.3)',bg: 'rgba(244,241,234,0.05)'},
}

const SORT_OPTIONS = [
  { value: 'unit_id',      es: 'Vivienda (A-Z)',            en: 'Unit (A-Z)'              },
  { value: 'price_asc',    es: 'Precio: menor a mayor',     en: 'Price: low to high'      },
  { value: 'price_desc',   es: 'Precio: mayor a menor',     en: 'Price: high to low'      },
  { value: 'surface_asc',  es: 'Superficie: menor a mayor', en: 'Surface: small to large' },
  { value: 'surface_desc', es: 'Superficie: mayor a menor', en: 'Surface: large to small' },
  { value: 'floor_asc',    es: 'Planta: ascendente',        en: 'Floor: ascending'        },
  { value: 'floor_desc',   es: 'Planta: descendente',       en: 'Floor: descending'       },
]

const DEFAULT_FILTERS = {
  status: 'all', bedrooms: 'all',
  priceMin: '', priceMax: '',
  surfaceMin: '', surfaceMax: '',
  has_terrace: false,
}

const labelStyle = { fontSize: '0.5rem', letterSpacing: '0.15em', color: 'rgba(184,152,72,0.5)' }
const inputStyle = {
  fontSize: '0.72rem', color: 'var(--color-text)', backgroundColor: 'transparent',
  border: 'none', borderBottom: '1px solid rgba(184,152,72,0.2)', outline: 'none',
  width: '90px', paddingBottom: '2px', fontFamily: 'inherit',
}

export default function AvailabilityPage() {
  const navigate = useNavigate()
  const { project, units } = useProject()
  const { lang, toggle } = useLang()

  const { ids: compareIds, toggle: toggleCompare, clear: clearCompare, isIn, canAdd } = useCompare()
  const { trackEvent } = useSession()

  const handleCompareToggle = useCallback((unitId) => {
    toggleCompare(unitId)
    if (!compareIds.includes(unitId)) trackEvent('compare_add', { unit_id: unitId })
  }, [toggleCompare, trackEvent, compareIds])

  const [filters, setFilters]         = useState(DEFAULT_FILTERS)
  const [sortBy, setSortBy]           = useState('unit_id')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode]       = useState('table') // 'table' | 'grid'

  const name = lang === 'es' ? project.name : project.nameEN

  const priceRange = useMemo(() => ({
    min: Math.min(...(units?.map(u => u.price) ?? [0])),
    max: Math.max(...(units?.map(u => u.price) ?? [0])),
  }), [units])

  const surfaceRange = useMemo(() => ({
    min: Math.min(...(units?.map(u => u.surface) ?? [0])),
    max: Math.max(...(units?.map(u => u.surface) ?? [0])),
  }), [units])

  const filtered = useMemo(() => {
    if (!units) return []
    let result = [...units]
    if (filters.status !== 'all')   result = result.filter(u => u.status === filters.status)
    if (filters.bedrooms !== 'all') {
      const n = parseInt(filters.bedrooms)
      result = n === 4 ? result.filter(u => u.bedrooms >= 4) : result.filter(u => u.bedrooms === n)
    }
    if (filters.priceMin !== '')   result = result.filter(u => u.price >= parseInt(filters.priceMin))
    if (filters.priceMax !== '')   result = result.filter(u => u.price <= parseInt(filters.priceMax))
    if (filters.surfaceMin !== '') result = result.filter(u => u.surface >= parseInt(filters.surfaceMin))
    if (filters.surfaceMax !== '') result = result.filter(u => u.surface <= parseInt(filters.surfaceMax))
    if (filters.has_terrace)       result = result.filter(u => u.has_terrace)
    result.sort((a, b) => {
      switch (sortBy) {
        case 'unit_id':      return a.id.localeCompare(b.id, undefined, { numeric: true })
        case 'price_asc':    return a.price - b.price
        case 'price_desc':   return b.price - a.price
        case 'surface_asc':  return a.surface - b.surface
        case 'surface_desc': return b.surface - a.surface
        case 'floor_asc':    return parseInt(a.floor) - parseInt(b.floor)
        case 'floor_desc':   return parseInt(b.floor) - parseInt(a.floor)
        default:             return 0
      }
    })
    return result
  }, [units, filters, sortBy])

  const [expandedId, setExpandedId] = useState(null)

  const isFilterActive = Object.entries(filters).some(([k, v]) => v !== DEFAULT_FILTERS[k])
  const setFilter      = (key, value) => setFilters(f => ({ ...f, [key]: value }))
  const resetFilters   = () => { setFilters(DEFAULT_FILTERS); setExpandedId(null) }

  function chipStyle(active) {
    return {
      fontSize: '0.65rem', border: '1px solid',
      borderColor:     active ? 'var(--color-accent)' : 'rgba(184,152,72,0.18)',
      color:           active ? 'var(--color-accent)' : 'rgba(244,241,234,0.7)',
      backgroundColor: active ? 'rgba(184,152,72,0.07)' : 'transparent',
      minWidth: 32,
    }
  }

  function FilterControls({ mobile = false }) {
    return (
      <>
        {/* Status */}
        <div className="flex flex-col gap-2">
          <span className="label-luxury" style={labelStyle}>{lang === 'es' ? 'ESTADO' : 'STATUS'}</span>
          <div className="flex flex-wrap gap-1">
            {['all', 'available', 'reserved', 'sold'].map(s => {
              const label = s === 'all'
                ? (lang === 'es' ? 'Todas' : 'All')
                : (lang === 'es' ? STATUS_CONFIG[s].es : STATUS_CONFIG[s].en)
              return (
                <button key={s} onClick={() => setFilter('status', s)} data-cursor="hover"
                  className="label-luxury px-3 py-1.5 transition-all duration-200"
                  style={chipStyle(filters.status === s)}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bedrooms */}
        <div className="flex flex-col gap-2">
          <span className="label-luxury" style={labelStyle}>{lang === 'es' ? 'DORMITORIOS' : 'BEDROOMS'}</span>
          <div className="flex flex-wrap gap-1">
            {['all', '1', '2', '3', '4'].map(b => {
              const label = b === 'all' ? (lang === 'es' ? 'Todos' : 'All') : b === '4' ? '4+' : b
              return (
                <button key={b} onClick={() => setFilter('bedrooms', b)} data-cursor="hover"
                  className="label-luxury px-3 py-1.5 transition-all duration-200"
                  style={chipStyle(filters.bedrooms === b)}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-2">
          <span className="label-luxury" style={labelStyle}>{lang === 'es' ? 'PRECIO (€)' : 'PRICE (€)'}</span>
          {mobile ? (
            <div className="grid grid-cols-2 gap-3">
              <input type="text" inputMode="numeric" placeholder={`Mín`} value={filters.priceMin}
                onChange={e => setFilter('priceMin', e.target.value)}
                style={{ ...inputStyle, width: '100%' }} />
              <input type="text" inputMode="numeric" placeholder={`Máx`} value={filters.priceMax}
                onChange={e => setFilter('priceMax', e.target.value)}
                style={{ ...inputStyle, width: '100%' }} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input type="text" inputMode="numeric" placeholder={priceRange.min.toLocaleString('es-ES')} value={filters.priceMin}
                onChange={e => setFilter('priceMin', e.target.value)} style={inputStyle} />
              <span className="label-luxury" style={{ fontSize: '0.45rem', color: 'rgba(184,152,72,0.3)' }}>—</span>
              <input type="text" inputMode="numeric" placeholder={priceRange.max.toLocaleString('es-ES')} value={filters.priceMax}
                onChange={e => setFilter('priceMax', e.target.value)} style={inputStyle} />
            </div>
          )}
        </div>

        {/* Surface */}
        <div className="flex flex-col gap-2">
          <span className="label-luxury" style={labelStyle}>{lang === 'es' ? 'SUPERFICIE (m²)' : 'SURFACE (m²)'}</span>
          {mobile ? (
            <div className="grid grid-cols-2 gap-3">
              <input type="text" inputMode="numeric" placeholder={`Mín`} value={filters.surfaceMin}
                onChange={e => setFilter('surfaceMin', e.target.value)}
                style={{ ...inputStyle, width: '100%' }} />
              <input type="text" inputMode="numeric" placeholder={`Máx`} value={filters.surfaceMax}
                onChange={e => setFilter('surfaceMax', e.target.value)}
                style={{ ...inputStyle, width: '100%' }} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input type="text" inputMode="numeric" placeholder={String(surfaceRange.min)} value={filters.surfaceMin}
                onChange={e => setFilter('surfaceMin', e.target.value)} style={inputStyle} />
              <span className="label-luxury" style={{ fontSize: '0.45rem', color: 'rgba(184,152,72,0.3)' }}>—</span>
              <input type="text" inputMode="numeric" placeholder={String(surfaceRange.max)} value={filters.surfaceMax}
                onChange={e => setFilter('surfaceMax', e.target.value)} style={inputStyle} />
            </div>
          )}
        </div>

        {/* Terrace */}
        <div className="flex flex-col gap-2">
          <span className="label-luxury" style={labelStyle}>{lang === 'es' ? 'TERRAZA' : 'TERRACE'}</span>
          <button onClick={() => setFilter('has_terrace', !filters.has_terrace)} data-cursor="hover"
            className="label-luxury px-3 py-1.5 transition-all duration-200 self-start"
            style={chipStyle(filters.has_terrace)}>
            {lang === 'es' ? 'Con terraza' : 'With terrace'}
          </button>
        </div>
      </>
    )
  }

  // ── Table view ────────────────────────────────────────────────────────────────
  function TableView() {
    const cols = {
      gridTemplateColumns: '70px 90px 1fr 60px 60px 90px 100px 110px 130px',
      gap: '0 1rem',
    }
    return (
      <div>
        {/* Column headers */}
        <div className="hidden sm:grid label-luxury px-4 pb-2"
          style={{ ...cols, fontSize: '0.58rem', color: 'rgba(184,152,72,0.65)', letterSpacing: '0.15em' }}>
          <span style={{ color: 'rgba(184,152,72,0.85)' }}>{lang === 'es' ? 'COMPARAR' : 'COMPARE'}</span>
          <span>{lang === 'es' ? 'VIVIENDA' : 'UNIT'}</span>
          <span>{lang === 'es' ? 'TIPOLOGÍA' : 'TYPE'}</span>
          <span>{lang === 'es' ? 'PLANTA' : 'FLOOR'}</span>
          <span>{lang === 'es' ? 'DORM.' : 'BEDS'}</span>
          <span>{lang === 'es' ? 'SUPERFICIE' : 'AREA'}</span>
          <span>{lang === 'es' ? 'ORIENTACIÓN' : 'ORIENT.'}</span>
          <span>{lang === 'es' ? 'PRECIO' : 'PRICE'}</span>
          <span>{lang === 'es' ? 'ESTADO' : 'STATUS'}</span>
        </div>
        <div className="h-px mb-1" style={{ backgroundColor: 'rgba(184,152,72,0.1)' }} />

        <AnimatePresence mode="popLayout">
          {filtered.map((unit, i) => {
            const st         = STATUS_CONFIG[unit.status]
            const canExplore = unit.status === 'available'
            const isExpanded = expandedId === unit.id

            return (
              <motion.div key={unit.id}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.2) }}
                style={{
                  borderBottom: '1px solid rgba(184,152,72,0.07)',
                  borderLeft: `2px solid ${isExpanded ? 'var(--color-accent)' : 'transparent'}`,
                  transition: 'border-color 0.2s',
                }}>

                {/* Desktop row — clickable */}
                <div
                  role="button" tabIndex={0}
                  className="hidden sm:grid w-full text-left items-center px-4 py-3 transition-colors duration-200 cursor-pointer"
                  style={{ ...cols, backgroundColor: isExpanded ? 'rgba(184,152,72,0.05)' : 'transparent' }}
                  onClick={() => setExpandedId(isExpanded ? null : unit.id)}
                  onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.03)' }}
                  onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.backgroundColor = 'transparent' }}>
                  {/* Compare toggle */}
                  <button
                    onClick={e => { e.stopPropagation(); handleCompareToggle(unit.id) }}
                    data-cursor="hover"
                    disabled={!isIn(unit.id) && !canAdd(unit.id)}
                    className="flex items-center justify-center transition-all duration-200"
                    style={{
                      width: 26, height: 26, flexShrink: 0,
                      border: `1px solid ${isIn(unit.id) ? 'var(--color-accent)' : 'rgba(184,152,72,0.45)'}`,
                      backgroundColor: isIn(unit.id) ? 'rgba(184,152,72,0.15)' : 'rgba(184,152,72,0.06)',
                      opacity: !isIn(unit.id) && !canAdd(unit.id) ? 0.25 : 1,
                    }}
                    onMouseEnter={e => { if (!isIn(unit.id) && canAdd(unit.id)) { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.12)' } }}
                    onMouseLeave={e => { if (!isIn(unit.id)) { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.45)'; e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.06)' } }}>
                    {isIn(unit.id)
                      ? <Check size={11} style={{ color: 'var(--color-accent)' }} />
                      : <span style={{ fontSize: '0.8rem', color: 'rgba(184,152,72,0.7)', lineHeight: 1 }}>+</span>
                    }
                  </button>
                  <span className="display-heading text-text" style={{ fontSize: '0.82rem', letterSpacing: '0.06em' }}>
                    {unit.name}
                    {unit.featured && <span className="ml-1.5 label-luxury" style={{ fontSize: '0.38rem', color: 'var(--color-accent)', verticalAlign: 'middle' }}>★</span>}
                  </span>
                  <span className="label-luxury" style={{ fontSize: '0.65rem', color: 'rgba(244,241,234,0.78)' }}>{tc(unit.typology, lang)}</span>
                  <span className="label-luxury" style={{ fontSize: '0.65rem', color: 'rgba(244,241,234,0.78)' }}>{unit.floor}ª</span>
                  <span className="label-luxury" style={{ fontSize: '0.65rem', color: 'rgba(244,241,234,0.78)' }}>{unit.bedrooms}</span>
                  <span className="label-luxury" style={{ fontSize: '0.65rem', color: 'rgba(244,241,234,0.78)' }}>{unit.surface} m²</span>
                  <span className="label-luxury" style={{ fontSize: '0.65rem', color: 'rgba(244,241,234,0.78)' }}>{tc(unit.orientation, lang)}</span>
                  <span className="label-luxury" style={{ fontSize: '0.72rem', color: unit.status === 'sold' ? 'rgba(244,241,234,0.2)' : 'var(--color-text)' }}>
                    {unit.status === 'sold' ? '—' : unit.price.toLocaleString('es-ES') + ' €'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="label-luxury px-2 py-0.5 whitespace-nowrap"
                      style={{ fontSize: '0.62rem', color: st.color, backgroundColor: st.bg, border: `1px solid ${st.color}` }}>
                      {lang === 'es' ? st.es : st.en}
                    </span>
                    <span className="label-luxury ml-auto" style={{ fontSize: '0.55rem', color: 'rgba(184,152,72,0.4)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>
                      ↓
                    </span>
                  </div>
                </div>

                {/* Mobile row — clickable */}
                <div
                  role="button" tabIndex={0}
                  className="flex sm:hidden w-full items-center px-4 py-3 gap-3"
                  style={{ backgroundColor: isExpanded ? 'rgba(184,152,72,0.05)' : 'transparent' }}
                  onClick={() => setExpandedId(isExpanded ? null : unit.id)}>
                  {/* Compare toggle */}
                  <button
                    onClick={e => { e.stopPropagation(); handleCompareToggle(unit.id) }}
                    data-cursor="hover"
                    disabled={!isIn(unit.id) && !canAdd(unit.id)}
                    className="flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={{
                      width: 26, height: 26,
                      border: `1px solid ${isIn(unit.id) ? 'var(--color-accent)' : 'rgba(184,152,72,0.35)'}`,
                      backgroundColor: isIn(unit.id) ? 'rgba(184,152,72,0.15)' : 'rgba(184,152,72,0.04)',
                      opacity: !isIn(unit.id) && !canAdd(unit.id) ? 0.25 : 1,
                    }}>
                    {isIn(unit.id)
                      ? <Check size={10} style={{ color: 'var(--color-accent)' }} />
                      : <span style={{ fontSize: '0.75rem', color: 'rgba(184,152,72,0.6)', lineHeight: 1 }}>+</span>
                    }
                  </button>
                  <div className="flex flex-col gap-0.5 min-w-0 text-left flex-1">
                    <span className="display-heading text-text" style={{ fontSize: '0.85rem' }}>{unit.name}</span>
                    <span className="label-luxury text-text/40" style={{ fontSize: '0.5rem' }}>
                      {unit.floor}ª · {unit.bedrooms}{lang === 'es' ? 'D' : 'B'} · {unit.surface} m²
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="label-luxury" style={{ fontSize: '0.62rem', color: unit.status === 'sold' ? 'rgba(244,241,234,0.2)' : 'var(--color-text)' }}>
                      {unit.status === 'sold' ? '—' : unit.price.toLocaleString('es-ES') + ' €'}
                    </span>
                    <span className="label-luxury px-2 py-0.5"
                      style={{ fontSize: '0.44rem', color: st.color, backgroundColor: st.bg, border: `1px solid ${st.color}` }}>
                      {lang === 'es' ? st.es : st.en}
                    </span>
                    <span className="label-luxury" style={{ fontSize: '0.55rem', color: 'rgba(184,152,72,0.4)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>↓</span>
                  </div>
                </div>

                {/* Expanded card panel */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden', borderTop: '1px solid rgba(184,152,72,0.1)' }}>
                      <div className="flex flex-col sm:flex-row gap-0" style={{ backgroundColor: 'rgba(184,152,72,0.03)' }}>

                        {/* Image */}
                        {unit.hero_image && (
                          <div className="flex-shrink-0 overflow-hidden" style={{ width: '100%', maxWidth: 260, height: 180, backgroundColor: '#0d1117' }}>
                            <img src={unit.hero_image} alt={unit.name}
                              className="w-full h-full object-cover"
                              style={{ opacity: unit.status === 'sold' ? 0.35 : 0.9 }} />
                          </div>
                        )}

                        {/* Details */}
                        <div className="flex flex-col justify-between gap-4 px-5 py-4 flex-1">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="display-heading text-text" style={{ fontSize: '1rem', letterSpacing: '0.08em' }}>
                                  {unit.name}
                                  {unit.featured && <span className="ml-2 label-luxury" style={{ fontSize: '0.42rem', color: 'var(--color-accent)' }}>★ {lang === 'es' ? 'DESTACADA' : 'FEATURED'}</span>}
                                </p>
                                <p className="label-luxury mt-0.5" style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.5)' }}>{unit.typology}</p>
                              </div>
                              {unit.view_label && (
                                <span className="label-luxury px-2 py-1 flex-shrink-0"
                                  style={{ fontSize: '0.44rem', color: 'rgba(184,152,72,0.55)', border: '1px solid rgba(184,152,72,0.2)' }}>
                                  {unit.view_label}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                              {[
                                { label: lang === 'es' ? 'Planta'      : 'Floor',       value: `${unit.floor}ª`         },
                                { label: lang === 'es' ? 'Dormitorios' : 'Bedrooms',    value: unit.bedrooms            },
                                { label: lang === 'es' ? 'Baños'       : 'Bathrooms',   value: unit.bathrooms           },
                                { label: lang === 'es' ? 'Superficie'  : 'Surface',     value: `${unit.surface} m²`     },
                                { label: lang === 'es' ? 'Terraza'     : 'Terrace',     value: unit.terrace_area_m2 > 0 ? `${unit.terrace_area_m2} m²` : '—' },
                              ].map(d => (
                                <div key={d.label}>
                                  <p className="label-luxury" style={{ fontSize: '0.44rem', color: 'rgba(184,152,72,0.4)' }}>{d.label}</p>
                                  <p className="label-luxury text-text/70" style={{ fontSize: '0.6rem' }}>{d.value}</p>
                                </div>
                              ))}
                            </div>

                            {unit.short_description && (
                              <p className="label-luxury" style={{ fontSize: '0.52rem', color: 'rgba(244,241,234,0.35)', lineHeight: 1.7 }}>
                                {tc(unit.short_description, lang)}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-3" style={{ borderTop: '1px solid rgba(184,152,72,0.1)' }}>
                            <p className="display-heading"
                              style={{ fontSize: '1rem', letterSpacing: '0.04em', color: unit.status === 'sold' ? 'rgba(244,241,234,0.2)' : 'var(--color-accent)' }}>
                              {unit.status === 'sold' ? '—' : unit.price.toLocaleString('es-ES') + ' €'}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              {(canAdd(unit.id) || isIn(unit.id)) && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleCompareToggle(unit.id) }}
                                  data-cursor="hover"
                                  className="label-luxury flex items-center gap-1.5 px-4 py-2.5 transition-all duration-200 min-h-[40px]"
                                  style={{
                                    border: `1px solid ${isIn(unit.id) ? 'var(--color-accent)' : 'rgba(184,152,72,0.3)'}`,
                                    color: isIn(unit.id) ? 'var(--color-accent)' : 'rgba(244,241,234,0.5)',
                                    fontSize: '0.52rem',
                                    backgroundColor: isIn(unit.id) ? 'rgba(184,152,72,0.08)' : 'transparent',
                                  }}
                                  onMouseEnter={e => { if (!isIn(unit.id)) { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' } }}
                                  onMouseLeave={e => { if (!isIn(unit.id)) { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.3)'; e.currentTarget.style.color = 'rgba(244,241,234,0.5)' } }}>
                                  {isIn(unit.id)
                                    ? <><Check size={10} />{lang === 'es' ? 'En comparador' : 'In comparator'}</>
                                    : (lang === 'es' ? '+ Comparar' : '+ Compare')
                                  }
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    )
  }

  // ── Card view ─────────────────────────────────────────────────────────────────
  function GridView() {
    return (
      <AnimatePresence mode="popLayout">
        <motion.div key="grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((unit, i) => {
            const st         = STATUS_CONFIG[unit.status]
            const canExplore = unit.status === 'available'
            return (
              <motion.div key={unit.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                style={{ border: '1px solid rgba(184,152,72,0.15)', backgroundColor: 'rgba(184,152,72,0.02)' }}>
                <div className="relative overflow-hidden" style={{ height: 180, backgroundColor: '#0d1117' }}>
                  {unit.hero_image
                    ? <img src={unit.hero_image} alt={unit.name}
                        className="w-full h-full object-cover transition-transform duration-700"
                        style={{ opacity: unit.status === 'sold' ? 0.35 : 0.85 }}
                        onMouseEnter={e => { if (canExplore) e.currentTarget.style.transform = 'scale(1.04)' }}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                    : <div className="w-full h-full flex items-center justify-center">
                        <span className="label-luxury" style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.2)' }}>—</span>
                      </div>
                  }
                  <div className="absolute top-3 right-3">
                    <span className="label-luxury px-2.5 py-1"
                      style={{ fontSize: '0.46rem', color: st.color, backgroundColor: st.bg, border: `1px solid ${st.color}`, backdropFilter: 'blur(8px)' }}>
                      {lang === 'es' ? st.es : st.en}
                    </span>
                  </div>
                  {unit.featured && (
                    <div className="absolute top-3 left-3">
                      <span className="label-luxury px-2.5 py-1"
                        style={{ fontSize: '0.44rem', color: 'var(--color-bg)', backgroundColor: 'var(--color-accent)' }}>
                        {lang === 'es' ? 'DESTACADA' : 'FEATURED'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="display-heading text-text" style={{ fontSize: '1.05rem', letterSpacing: '0.08em' }}>{unit.name}</p>
                      <p className="label-luxury mt-0.5" style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.5)' }}>{unit.typology}</p>
                    </div>
                    {unit.view_label && (
                      <span className="label-luxury px-2 py-1 flex-shrink-0"
                        style={{ fontSize: '0.44rem', color: 'rgba(184,152,72,0.55)', border: '1px solid rgba(184,152,72,0.18)' }}>
                        {unit.view_label}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: lang === 'es' ? 'Planta'  : 'Floor',   value: `${unit.floor}ª`    },
                      { label: lang === 'es' ? 'Dorm.'   : 'Beds',    value: unit.bedrooms       },
                      { label: lang === 'es' ? 'Sup.'    : 'Area',    value: `${unit.surface}m²` },
                      { label: lang === 'es' ? 'Orient.' : 'Orient.', value: tc(unit.orientation, lang)    },
                    ].map(d => (
                      <div key={d.label}>
                        <p className="label-luxury" style={{ fontSize: '0.42rem', color: 'rgba(184,152,72,0.4)' }}>{d.label}</p>
                        <p className="label-luxury text-text/70" style={{ fontSize: '0.56rem' }}>{d.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Compare toggle */}
                  <button
                    onClick={e => { e.stopPropagation(); handleCompareToggle(unit.id) }}
                    disabled={!isIn(unit.id) && !canAdd(unit.id)}
                    data-cursor="hover"
                    className="self-start flex items-center gap-1.5 label-luxury px-3 py-2 transition-all duration-200"
                    style={{
                      border: `1px solid ${isIn(unit.id) ? 'var(--color-accent)' : 'rgba(184,152,72,0.35)'}`,
                      color: isIn(unit.id) ? 'var(--color-accent)' : 'rgba(244,241,234,0.6)',
                      backgroundColor: isIn(unit.id) ? 'rgba(184,152,72,0.08)' : 'rgba(184,152,72,0.04)',
                      fontSize: '0.48rem',
                      opacity: !isIn(unit.id) && !canAdd(unit.id) ? 0.3 : 1,
                    }}
                    onMouseEnter={e => { if (!isIn(unit.id) && canAdd(unit.id)) { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.08)' } }}
                    onMouseLeave={e => { if (!isIn(unit.id)) { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.35)'; e.currentTarget.style.color = 'rgba(244,241,234,0.6)'; e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.04)' } }}>
                    {isIn(unit.id) && <Check size={9} style={{ color: 'var(--color-accent)' }} />}
                    {isIn(unit.id)
                      ? (lang === 'es' ? 'En comparador' : 'In comparator')
                      : (lang === 'es' ? '+ Comparar' : '+ Compare')
                    }
                  </button>
                  <div className="pt-2" style={{ borderTop: '1px solid rgba(184,152,72,0.1)' }}>
                    <p className="display-heading"
                      style={{ fontSize: '0.9rem', letterSpacing: '0.04em', color: unit.status === 'sold' ? 'rgba(244,241,234,0.2)' : 'var(--color-accent)' }}>
                      {unit.status === 'sold' ? '—' : unit.price.toLocaleString('es-ES') + ' €'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <PageTransition>
      <AvailabilityChapterModal />
      <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* ── Header ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 sm:px-10 py-4"
          style={{ borderBottom: '1px solid rgba(184,152,72,0.12)' }}>
          <button onClick={() => navigate('/proyecto')} data-cursor="hover"
            className="flex items-center gap-2 label-luxury transition-colors duration-300"
            style={{ color: 'rgba(244,241,234,0.45)', fontSize: '0.6rem' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,241,234,0.45)'}>
            <ChevronLeft size={14} />
            {lang === 'es' ? 'Volver' : 'Back'}
          </button>
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

        {/* ── Title bar ── */}
        <div className="flex-shrink-0 px-6 sm:px-10 pt-6 pb-3 flex items-end justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="display-heading text-text"
              style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', letterSpacing: '0.1em' }}>
              {lang === 'es' ? 'DISPONIBILIDAD' : 'AVAILABILITY'}
            </h2>
            <p className="label-luxury mt-1" style={{ fontSize: '0.6rem', color: 'rgba(184,152,72,0.7)' }}>
              {filtered.length} {lang === 'es' ? 'unidades encontradas' : 'units found'}
            </p>
          </motion.div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex" style={{ border: '1px solid rgba(184,152,72,0.2)' }}>
              {[
                { mode: 'table', Icon: List },
                { mode: 'grid',  Icon: LayoutGrid },
              ].map(({ mode, Icon }) => (
                <button key={mode} onClick={() => setViewMode(mode)} data-cursor="hover"
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: 32, height: 32,
                    backgroundColor: viewMode === mode ? 'rgba(184,152,72,0.12)' : 'transparent',
                    color: viewMode === mode ? 'var(--color-accent)' : 'rgba(244,241,234,0.3)',
                    borderRight: mode === 'table' ? '1px solid rgba(184,152,72,0.2)' : 'none',
                  }}>
                  <Icon size={13} />
                </button>
              ))}
            </div>

            {/* Mobile filter toggle */}
            <button onClick={() => setFiltersOpen(o => !o)} data-cursor="hover"
              className="flex sm:hidden items-center gap-2 label-luxury px-3 py-2"
              style={{
                border: `1px solid ${isFilterActive ? 'var(--color-accent)' : 'rgba(184,152,72,0.25)'}`,
                color: isFilterActive ? 'var(--color-accent)' : 'rgba(244,241,234,0.5)',
                fontSize: '0.55rem',
              }}>
              <SlidersHorizontal size={12} />
              {isFilterActive && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />}
            </button>
          </div>
        </div>

        {/* ── Desktop filter bar ── */}
        <div className="hidden sm:flex flex-shrink-0 px-10 pb-4 gap-6 flex-wrap items-end"
          style={{ borderBottom: '1px solid rgba(184,152,72,0.08)' }}>
          {FilterControls({})}
          <div className="flex flex-col gap-2 ml-auto">
            <span className="label-luxury" style={labelStyle}>{lang === 'es' ? 'ORDENAR' : 'SORT'}</span>
            <div className="flex gap-3 items-center">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="label-luxury bg-transparent outline-none cursor-pointer"
                style={{ fontSize: '0.52rem', color: 'rgba(244,241,234,0.6)', border: '1px solid rgba(184,152,72,0.2)', padding: '0.3rem 0.5rem' }}>
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ backgroundColor: '#1a2130' }}>
                    {lang === 'es' ? o.es : o.en}
                  </option>
                ))}
              </select>
              {isFilterActive && (
                <button onClick={resetFilters} data-cursor="hover"
                  className="flex items-center gap-1 label-luxury transition-colors duration-200"
                  style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(184,152,72,0.5)'}>
                  <X size={10} />
                  {lang === 'es' ? 'Limpiar' : 'Clear'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile filter drawer ── */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
              className="flex-shrink-0 overflow-hidden sm:hidden"
              style={{ borderBottom: '1px solid rgba(184,152,72,0.1)', backgroundColor: 'rgba(184,152,72,0.02)' }}>
              <div className="px-6 py-5 flex flex-col gap-5">
                {FilterControls({ mobile: true })}
                <div className="flex items-center gap-4 flex-wrap pt-1" style={{ borderTop: '1px solid rgba(184,152,72,0.08)' }}>
                  <div className="flex flex-col gap-2">
                    <span className="label-luxury" style={labelStyle}>{lang === 'es' ? 'ORDENAR' : 'SORT'}</span>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                      className="label-luxury bg-transparent outline-none"
                      style={{ fontSize: '0.55rem', color: 'rgba(244,241,234,0.6)', border: '1px solid rgba(184,152,72,0.2)', padding: '0.35rem 0.5rem' }}>
                      {SORT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value} style={{ backgroundColor: '#1a2130' }}>
                          {lang === 'es' ? o.es : o.en}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isFilterActive && (
                    <button onClick={resetFilters} data-cursor="hover"
                      className="flex items-center gap-1.5 label-luxury self-end pb-1"
                      style={{ fontSize: '0.52rem', color: 'rgba(184,152,72,0.5)' }}>
                      <X size={11} />
                      {lang === 'es' ? 'Limpiar filtros' : 'Clear filters'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile compare hint ── */}
        <div className="flex sm:hidden items-center gap-3 px-6 py-2.5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(184,152,72,0.08)', backgroundColor: 'rgba(184,152,72,0.03)' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 18, height: 18, border: '1px solid rgba(184,152,72,0.35)',
            fontSize: '0.65rem', color: 'rgba(184,152,72,0.6)', lineHeight: 1, flexShrink: 0,
          }}>+</span>
          <span className="label-luxury" style={{ fontSize: '0.52rem', color: 'rgba(184,152,72,0.6)', letterSpacing: '0.08em' }}>
            {compareIds.length > 0
              ? (lang === 'es' ? `${compareIds.length} seleccionada${compareIds.length > 1 ? 's' : ''} para comparar` : `${compareIds.length} selected to compare`)
              : (lang === 'es' ? 'Pulsa + para comparar viviendas' : 'Tap + to compare units')}
          </span>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-10 py-5 pb-14">
          {filtered.length > 0 ? (
            viewMode === 'table' ? <TableView /> : <GridView />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="label-luxury" style={{ color: 'rgba(184,152,72,0.35)', fontSize: '0.6rem' }}>
                {lang === 'es' ? 'No hay unidades con esos filtros' : 'No units match those filters'}
              </p>
              {isFilterActive && (
                <button onClick={resetFilters} data-cursor="hover"
                  className="label-luxury px-5 py-2 transition-all duration-300"
                  style={{ border: '1px solid rgba(184,152,72,0.3)', color: 'rgba(184,152,72,0.5)', fontSize: '0.55rem' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.3)'; e.currentTarget.style.color = 'rgba(184,152,72,0.5)' }}>
                  {lang === 'es' ? 'Limpiar filtros' : 'Clear filters'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Compare floating bar ── */}
        <AnimatePresence>
          {compareIds.length >= 1 && (
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex-shrink-0 flex items-center justify-between gap-4 px-6 sm:px-10 py-3"
              style={{ borderTop: '1px solid rgba(184,152,72,0.3)', backgroundColor: 'rgba(13,17,23,0.97)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-3">
                <button onClick={clearCompare} data-cursor="hover"
                  className="flex items-center gap-1.5 label-luxury transition-colors duration-200"
                  style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.45)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(244,241,234,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(184,152,72,0.45)'}>
                  <X size={10} />
                </button>
                <span className="label-luxury" style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.6)' }}>
                  {compareIds.length === 1
                    ? (lang === 'es' ? 'Selecciona 1 más para comparar' : 'Select 1 more to compare')
                    : `${compareIds.length} ${lang === 'es' ? 'unidades seleccionadas' : 'units selected'}`
                  }
                </span>
              </div>
              <button
                onClick={() => navigate('/compare')}
                disabled={compareIds.length < 2}
                data-cursor="hover"
                className="label-luxury px-5 py-2.5 flex items-center gap-2 transition-all duration-200"
                style={{
                  backgroundColor: compareIds.length >= 2 ? 'var(--color-accent)' : 'rgba(184,152,72,0.12)',
                  color: compareIds.length >= 2 ? 'var(--color-bg)' : 'rgba(184,152,72,0.4)',
                  fontSize: '0.55rem', letterSpacing: '0.15em',
                  border: `1px solid ${compareIds.length >= 2 ? 'transparent' : 'rgba(184,152,72,0.2)'}`,
                  cursor: compareIds.length >= 2 ? 'pointer' : 'default',
                }}
                onMouseEnter={e => { if (compareIds.length >= 2) e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                {lang === 'es' ? `COMPARAR${compareIds.length >= 2 ? ` (${compareIds.length})` : ''} →` : `COMPARE${compareIds.length >= 2 ? ` (${compareIds.length})` : ''} →`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
