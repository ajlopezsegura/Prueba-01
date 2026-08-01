import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronLeft, ArrowRight } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { useProject } from '../context/ProjectContext'
import { useLang } from '../context/LangContext'

const STATUS_LABEL = {
  available: { es: 'Disponible', en: 'Available',  color: 'var(--color-accent)',          bg: 'rgba(184,152,72,0.12)' },
  reserved:  { es: 'Reservada',  en: 'Reserved',   color: 'rgba(255,200,80,0.9)',          bg: 'rgba(255,200,80,0.10)' },
  sold:      { es: 'Vendida',    en: 'Sold',        color: 'rgba(244,241,234,0.3)',         bg: 'rgba(244,241,234,0.05)' },
}

const FILTERS = [
  { id: 'all',       es: 'Todas',      en: 'All' },
  { id: 'available', es: 'Disponible', en: 'Available' },
  { id: 'reserved',  es: 'Reservada',  en: 'Reserved' },
  { id: 'sold',      es: 'Vendida',    en: 'Sold' },
]

export default function SelectionPage() {
  const navigate = useNavigate()
  const { project, units } = useProject()
  const { lang, toggle } = useLang()
  const [filter, setFilter] = useState('all')
  const [openUnit, setOpenUnit] = useState(null)

  const name = lang === 'es' ? project.name : project.nameEN

  const filtered = units?.filter(u => filter === 'all' || u.status === filter) ?? []

  return (
    <PageTransition>
      <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* Header */}
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
          <span className="label-luxury text-text/40 hidden sm:block" style={{ fontSize: '0.55rem' }}>{name?.toUpperCase()}</span>
          <button onClick={toggle} data-cursor="hover"
            className="flex items-center gap-2 label-luxury"
            style={{ fontSize: '0.6rem' }}>
            <span style={{ color: lang === 'es' ? 'var(--color-text)' : 'rgba(244,241,234,0.35)' }}>ES</span>
            <span style={{ color: 'var(--color-accent)' }}>|</span>
            <span style={{ color: lang === 'en' ? 'var(--color-text)' : 'rgba(244,241,234,0.35)' }}>EN</span>
          </button>
        </div>

        {/* Title + filters */}
        <div className="flex-shrink-0 px-6 sm:px-10 pt-6 pb-4">
          <motion.h2
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="display-heading text-text mb-5"
            style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', letterSpacing: '0.1em' }}>
            {lang === 'es' ? 'VIVIENDAS' : 'RESIDENCES'}
          </motion.h2>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => {
              const isActive = filter === f.id
              return (
                <button key={f.id} onClick={() => setFilter(f.id)} data-cursor="hover"
                  className="label-luxury px-4 py-2 transition-all duration-300 min-h-[36px]"
                  style={{
                    fontSize: '0.58rem',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--color-accent)' : 'rgba(184,152,72,0.2)',
                    color: isActive ? 'var(--color-accent)' : 'rgba(244,241,234,0.45)',
                    backgroundColor: isActive ? 'rgba(184,152,72,0.08)' : 'transparent',
                  }}>
                  {lang === 'es' ? f.es : f.en}
                  {f.id !== 'all' && (
                    <span className="ml-2" style={{ opacity: 0.6 }}>
                      {units?.filter(u => u.status === f.id).length ?? 0}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-10 pb-6">

          {/* Column headers — desktop */}
          <div className="hidden sm:grid label-luxury mb-2"
            style={{ gridTemplateColumns: '80px 60px 70px 90px 110px 110px 40px', gap: '0 1rem',
              fontSize: '0.5rem', color: 'rgba(184,152,72,0.5)', letterSpacing: '0.15em' }}>
            <span>{lang === 'es' ? 'VIVIENDA' : 'UNIT'}</span>
            <span>{lang === 'es' ? 'PLANTA' : 'FLOOR'}</span>
            <span>{lang === 'es' ? 'DORM.' : 'BEDS'}</span>
            <span>{lang === 'es' ? 'SUPERFICIE' : 'SURFACE'}</span>
            <span>{lang === 'es' ? 'PRECIO' : 'PRICE'}</span>
            <span>{lang === 'es' ? 'ESTADO' : 'STATUS'}</span>
            <span></span>
          </div>
          <div className="h-px mb-3" style={{ backgroundColor: 'rgba(184,152,72,0.1)' }} />

          <AnimatePresence mode="popLayout">
            {filtered.map((unit, i) => {
              const st = STATUS_LABEL[unit.status]
              const isOpen = openUnit === unit.id
              const canExplore = unit.status === 'available'

              return (
                <motion.div key={unit.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="mb-1"
                  style={{ border: '1px solid', borderColor: isOpen ? 'rgba(184,152,72,0.35)' : 'rgba(184,152,72,0.1)', transition: 'border-color 0.3s' }}>

                  {/* Row */}
                  <button
                    onClick={() => setOpenUnit(isOpen ? null : unit.id)}
                    data-cursor="hover"
                    className="w-full text-left px-4 py-3 transition-colors duration-300"
                    style={{ backgroundColor: isOpen ? 'rgba(184,152,72,0.04)' : 'transparent' }}>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid items-center"
                      style={{ gridTemplateColumns: '80px 60px 70px 90px 110px 110px 40px', gap: '0 1rem' }}>
                      <span className="display-heading text-text" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>{unit.id}</span>
                      <span className="label-luxury text-text/60" style={{ fontSize: '0.6rem' }}>{unit.floor}ª</span>
                      <span className="label-luxury text-text/60" style={{ fontSize: '0.6rem' }}>{unit.bedrooms} {lang === 'es' ? 'dorm.' : 'beds'}</span>
                      <span className="label-luxury text-text/60" style={{ fontSize: '0.6rem' }}>{unit.surface} m²</span>
                      <span className="label-luxury text-text" style={{ fontSize: '0.62rem' }}>
                        {unit.status === 'sold' ? '—' : unit.price.toLocaleString('es-ES') + ' €'}
                      </span>
                      <span className="label-luxury px-2 py-1 inline-flex w-fit items-center"
                        style={{ fontSize: '0.52rem', color: st.color, backgroundColor: st.bg, border: `1px solid ${st.color}`, opacity: 0.9 }}>
                        {lang === 'es' ? st.es : st.en}
                      </span>
                      <ChevronDown size={13} color="rgba(184,152,72,0.4)"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', justifySelf: 'end' }} />
                    </div>

                    {/* Mobile layout */}
                    <div className="flex sm:hidden items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="display-heading text-text" style={{ fontSize: '0.85rem' }}>{unit.id}</span>
                        <span className="label-luxury text-text/50" style={{ fontSize: '0.55rem' }}>
                          {unit.floor}ª · {unit.bedrooms}D · {unit.surface}m²
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="label-luxury px-2 py-0.5"
                          style={{ fontSize: '0.5rem', color: st.color, backgroundColor: st.bg, border: `1px solid ${st.color}` }}>
                          {lang === 'es' ? st.es : st.en}
                        </span>
                        <ChevronDown size={12} color="rgba(184,152,72,0.4)"
                          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                      </div>
                    </div>
                  </button>

                  {/* Expanded panel */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="panel"
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}>
                        <div className="px-4 pb-4 flex flex-col sm:flex-row gap-4 pt-1"
                          style={{ borderTop: '1px solid rgba(184,152,72,0.1)' }}>

                          {/* Thumbnail */}
                          {unit.thumbnail && (
                            <img src={unit.thumbnail} alt={`Vivienda ${unit.id}`}
                              className="w-full sm:w-48 h-32 object-contain flex-shrink-0 bg-[#0d1117]"
                              style={{ opacity: 0.85 }} />
                          )}

                          {/* Floor plan */}
                          {unit.floorPlan ? (
                            <img src={unit.floorPlan} alt={`Plano ${unit.id}`}
                              className="w-full sm:w-40 h-32 object-contain flex-shrink-0"
                              style={{ backgroundColor: 'rgba(244,241,234,0.04)', padding: 8 }} />
                          ) : (
                            <div className="w-full sm:w-40 h-32 flex-shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: 'rgba(184,152,72,0.04)', border: '1px dashed rgba(184,152,72,0.2)' }}>
                              <span className="label-luxury text-center" style={{ fontSize: '0.52rem', color: 'rgba(184,152,72,0.4)' }}>
                                {lang === 'es' ? 'Plano\npronto disponible' : 'Floor plan\ncoming soon'}
                              </span>
                            </div>
                          )}

                          {/* Details + CTA */}
                          <div className="flex flex-col justify-between gap-3">
                            <div className="flex flex-col gap-2">
                              {[
                                { label: lang === 'es' ? 'Orientación' : 'Orientation', value: unit.orientation },
                                { label: lang === 'es' ? 'Baños' : 'Bathrooms',         value: unit.bathrooms },
                                { label: lang === 'es' ? 'Superficie' : 'Surface',      value: `${unit.surface} m²` },
                                { label: lang === 'es' ? 'Precio' : 'Price',            value: unit.status === 'sold' ? '—' : unit.price.toLocaleString('es-ES') + ' €' },
                              ].map(d => (
                                <div key={d.label} className="flex gap-3">
                                  <span className="label-luxury" style={{ fontSize: '0.52rem', color: 'rgba(184,152,72,0.5)', minWidth: 72 }}>{d.label}</span>
                                  <span className="label-luxury text-text" style={{ fontSize: '0.58rem' }}>{d.value}</span>
                                </div>
                              ))}
                            </div>

                            {canExplore && (
                              <button
                                onClick={() => navigate(`/inmersion/${unit.id}`)}
                                data-cursor="hover"
                                className="label-luxury flex items-center gap-2 px-4 py-2 transition-all duration-300 self-start min-h-[36px]"
                                style={{ border: '1px solid var(--color-accent)', color: 'var(--color-accent)', fontSize: '0.58rem' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                {lang === 'es' ? 'Explorar vivienda' : 'Explore unit'}
                                <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="label-luxury" style={{ color: 'rgba(184,152,72,0.35)', fontSize: '0.6rem' }}>
                {lang === 'es' ? 'No hay viviendas con ese filtro' : 'No units match that filter'}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
