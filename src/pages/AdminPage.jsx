import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Check, Loader2, ChevronDown, ChevronRight, Flame, Snowflake, Monitor, Smartphone, Tablet, Globe, RotateCcw, BarChart3 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import OverviewTab from './admin/OverviewTab'
import LeadsCharts from './admin/LeadsCharts'
import ActivityCharts from './admin/ActivityCharts'
import AdminPasswordModal from '../components/ui/AdminPasswordModal'
import AdminEnterModal from '../components/ui/AdminEnterModal'

const PROJECT_SLUG   = (import.meta.env.VITE_PROJECT_SLUG   ?? 'las-conchas').trim()
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD ?? 'conchas2026').trim()

const STATUS = {
  available: { es: 'Disponible', color: 'var(--color-accent)',   bg: 'rgba(184,152,72,0.10)' },
  reserved:  { es: 'Reservada',  color: 'rgba(255,200,80,0.9)',  bg: 'rgba(255,200,80,0.09)' },
  sold:      { es: 'Vendida',    color: 'rgba(180,180,180,0.5)', bg: 'rgba(180,180,180,0.06)' },
}

const PAGE_LABELS = {
  '/':              'Portada',
  '/proyecto':      'El Proyecto',
  '/availability':  'Disponibilidad',
  '/decision':      'Decisión',
  '/compare':       'Comparador',
  '/contact':       'Formulario',
}

function pageLabel(page) {
  if (!page) return 'Desconocida'
  if (page.startsWith('/availability/')) return `Detalle · ${page.split('/').pop()}`
  if (page.startsWith('/inmersion/'))    return `Inmersión · ${page.split('/').pop()}`
  if (page.startsWith('/summary/'))      return `Dossier · ${page.split('/').pop()}`
  return PAGE_LABELS[page] ?? page
}

function formatDuration(ms) {
  if (!ms || ms < 1000) return null
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

/* ─── Custom status dropdown ──────────────────────────────── */
function StatusSelect({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const cfg = STATUS[value] ?? STATUS.available
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => !disabled && setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 12px',
        border: `1px solid ${cfg.color}`, background: cfg.bg, color: cfg.color,
        fontSize: '0.62rem', letterSpacing: '0.14em', fontFamily: 'inherit',
        cursor: disabled ? 'default' : 'pointer', whiteSpace: 'nowrap', minWidth: 110,
        transition: 'opacity 0.15s', opacity: disabled ? 0.5 : 1,
      }}>
        <span style={{ flex: 1, textAlign: 'left' }}>{cfg.es.toUpperCase()}</span>
        {disabled
          ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          : <ChevronDown size={10} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }} style={{
              position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 50, minWidth: '100%',
              background: 'rgba(18,16,12,0.97)', border: '1px solid rgba(184,152,72,0.18)',
              backdropFilter: 'blur(12px)',
            }}>
            {Object.entries(STATUS).map(([key, s]) => (
              <button key={key} onClick={() => { onChange(key); setOpen(false) }} style={{
                display: 'block', width: '100%', padding: '9px 14px',
                background: key === value ? s.bg : 'transparent', border: 'none',
                borderBottom: '1px solid rgba(184,152,72,0.07)', color: s.color,
                fontSize: '0.62rem', letterSpacing: '0.14em', fontFamily: 'inherit',
                cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = s.bg}
              onMouseLeave={e => e.currentTarget.style.background = key === value ? s.bg : 'transparent'}>
                {s.es.toUpperCase()}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Lead card ───────────────────────────────────────────── */
const INTENT_LABEL = {
  info:  { label: 'INFORMACIÓN', color: 'rgba(140,180,255,0.8)', bg: 'rgba(140,180,255,0.08)' },
  visit: { label: 'VISITA',      color: 'rgba(255,140,0,0.9)',   bg: 'rgba(255,140,0,0.08)'   },
  call:  { label: 'LLAMADA',     color: 'rgba(184,152,72,0.9)',  bg: 'rgba(184,152,72,0.08)'  },
}

const MATERIAL_LABELS = {
  floor:   { roble: 'Roble Natural',   caliza: 'Caliza Natural',  microcemento: 'Microcemento' },
  walls:   { blanco: 'Blanco Roto',    caliza_p: 'Caliza Pintada', grafito: 'Grafito' },
  kitchen: {
    keena:         'Dekton Keena',
    phantome:      'Eclos Phantome',
    fantasy_brown: 'Scalea Fantasy Brown',
    // legacy
    marquina:      'Mármol Marquina',
    bianco:        'Mármol Bianco',
    laton:         'Latón Mate',
  },
}
const CAT_LABEL = { floor: 'SUELO', walls: 'PAREDES', kitchen: 'COCINA' }

function matLabel(cat, id) {
  return MATERIAL_LABELS[cat]?.[id] ?? id
}

function formatPreferredDate(d) {
  if (!d) return null
  try {
    const dt = new Date(d)
    return dt.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return d }
}

function LeadCard({ lead, index, mob }) {
  const [expanded, setExpanded] = useState(false)
  const isHot  = lead.lead_temperature === 'hot'
  const trail  = Array.isArray(lead.session_trail) ? lead.session_trail : []
  const views  = trail.filter(e => e.type === 'page_view')
  const contact = lead.contact ?? {}
  const unit   = lead.primary_unit_id ?? lead.unit_ids?.[0] ?? null
  const snapshot     = Array.isArray(lead.unit_snapshot) ? lead.unit_snapshot : []
  const primarySnap  = snapshot.find(s => s.unit_id === unit) ?? snapshot[0] ?? null
  const materials    = contact?.materials ?? null
  const intentMeta   = INTENT_LABEL[lead.intent] ?? null
  const preferred    = formatPreferredDate(contact?.preferred_date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        border: `1px solid ${isHot ? 'rgba(255,140,0,0.2)' : 'rgba(184,152,72,0.08)'}`,
        background: isHot ? 'rgba(255,140,0,0.03)' : 'rgba(184,152,72,0.015)',
        marginBottom: 8,
      }}>

      {/* Main row */}
      <div style={mob ? {
        padding: '14px 14px', cursor: trail.length > 0 ? 'pointer' : 'default',
      } : {
        display: 'grid', gridTemplateColumns: '28px 1fr 1fr 120px 160px 32px',
        gap: 16, padding: '14px 16px', alignItems: 'center',
        cursor: trail.length > 0 ? 'pointer' : 'default',
      }} onClick={() => trail.length > 0 && setExpanded(e => !e)}>

        {mob ? (
          /* ── Mobile card ── */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              {isHot
                ? <Flame size={13} style={{ color: 'rgba(255,140,0,0.8)' }} />
                : <Snowflake size={13} style={{ color: 'rgba(140,180,255,0.6)' }} />}
              <span style={{ fontSize: '0.75rem', color: 'rgba(244,241,234,0.85)', flex: 1 }}>{contact.name ?? '—'}</span>
              {intentMeta && (
                <span style={{
                  fontSize: '0.42rem', letterSpacing: '0.14em',
                  padding: '2px 6px', border: `1px solid ${intentMeta.color}`,
                  color: intentMeta.color, backgroundColor: intentMeta.bg,
                }}>{intentMeta.label}</span>
              )}
              {trail.length > 0 && <ChevronRight size={12} style={{ color: 'rgba(184,152,72,0.4)', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.65)', marginBottom: 3 }}>{contact.email ?? ''}</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.65)' }}>{contact.phone ?? '—'}</span>
              {unit && <span style={{ padding: '2px 8px', border: '1px solid rgba(184,152,72,0.25)', fontSize: '0.5rem', letterSpacing: '0.12em', color: 'rgba(184,152,72,0.7)' }}>VIV. {unit}</span>}
              <span style={{ fontSize: '0.5rem', color: 'rgba(244,241,234,0.4)', marginLeft: 'auto' }}>{formatDate(lead.created_at).split(' · ')[0]}</span>
            </div>
          </>
        ) : (
          /* ── Desktop row ── */
          <>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {isHot
                ? <Flame size={14} style={{ color: 'rgba(255,140,0,0.8)' }} />
                : <Snowflake size={14} style={{ color: 'rgba(140,180,255,0.6)' }} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(244,241,234,0.85)', letterSpacing: '0.04em' }}>{contact.name ?? '—'}</div>
                {intentMeta && (
                  <span style={{
                    fontSize: '0.42rem', letterSpacing: '0.14em',
                    padding: '2px 6px', border: `1px solid ${intentMeta.color}`,
                    color: intentMeta.color, backgroundColor: intentMeta.bg,
                  }}>{intentMeta.label}</span>
                )}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(244,241,234,0.68)', letterSpacing: '0.06em' }}>{contact.email ?? ''}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(244,241,234,0.78)', marginBottom: 3 }}>{contact.phone ?? '—'}</div>
              {unit && <div style={{ display: 'inline-block', padding: '2px 8px', border: '1px solid rgba(184,152,72,0.25)', fontSize: '0.45rem', letterSpacing: '0.12em', color: 'rgba(184,152,72,0.7)' }}>VIVIENDA {unit}</div>}
            </div>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.08em', color: 'rgba(244,241,234,0.65)' }}>
              <div style={{ marginBottom: 2 }}>VÍA {(lead.source_page ?? 'unknown').toUpperCase()}</div>
              <div>{views.length} páginas visitadas</div>
            </div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.65)', letterSpacing: '0.04em' }}>{formatDate(lead.created_at)}</div>
            {trail.length > 0 && <ChevronRight size={12} style={{ color: 'rgba(184,152,72,0.4)', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />}
          </>
        )}
      </div>

      {/* Trail detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '0 16px 16px 60px',
              borderTop: '1px solid rgba(184,152,72,0.08)',
            }}>
              {/* Resumen comercial: vivienda, fecha preferida, materiales */}
              {(primarySnap || preferred || materials) && (
                <div style={{
                  paddingTop: 12, paddingBottom: 12,
                  borderBottom: '1px solid rgba(184,152,72,0.08)',
                  marginBottom: 12,
                  display: 'grid',
                  gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)',
                  gap: 16,
                }}>
                  {/* Vivienda detallada */}
                  {primarySnap && (
                    <div>
                      <div style={{ fontSize: '0.42rem', letterSpacing: '0.15em', color: 'rgba(184,152,72,0.45)', marginBottom: 8 }}>
                        VIVIENDA DE INTERÉS
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(244,241,234,0.9)', letterSpacing: '0.04em', marginBottom: 4 }}>
                        {primarySnap.unit_id} · {primarySnap.typology ?? ''}
                      </div>
                      <div style={{ fontSize: '0.55rem', color: 'rgba(244,241,234,0.55)', lineHeight: 1.6 }}>
                        {primarySnap.surface ? `${primarySnap.surface} m²` : ''}
                        {primarySnap.bedrooms != null ? ` · ${primarySnap.bedrooms} dorm.` : ''}
                        {primarySnap.floor != null ? ` · planta ${primarySnap.floor}` : ''}
                      </div>
                      {primarySnap.price != null && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-accent)', marginTop: 4, letterSpacing: '0.04em' }}>
                          {primarySnap.price.toLocaleString('es-ES')} €
                        </div>
                      )}
                      {snapshot.length > 1 && (
                        <div style={{ fontSize: '0.48rem', color: 'rgba(244,241,234,0.4)', marginTop: 6 }}>
                          + {snapshot.length - 1} vivienda{snapshot.length > 2 ? 's' : ''} comparada{snapshot.length > 2 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fecha preferida */}
                  {preferred && (
                    <div>
                      <div style={{ fontSize: '0.42rem', letterSpacing: '0.15em', color: 'rgba(184,152,72,0.45)', marginBottom: 8 }}>
                        {lead.intent === 'visit' ? 'VISITA SOLICITADA' : lead.intent === 'call' ? 'LLAMADA SOLICITADA' : 'FECHA PREFERIDA'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(244,241,234,0.85)', letterSpacing: '0.03em' }}>
                        {preferred}
                      </div>
                    </div>
                  )}

                  {/* Materiales configurados */}
                  {materials && Object.values(materials).some(Boolean) && (
                    <div>
                      <div style={{ fontSize: '0.42rem', letterSpacing: '0.15em', color: 'rgba(184,152,72,0.45)', marginBottom: 8 }}>
                        MATERIALES CONFIGURADOS
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {['floor','walls','kitchen'].map(cat => materials[cat] && (
                          <div key={cat} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontSize: '0.42rem', letterSpacing: '0.15em', color: 'rgba(184,152,72,0.5)', minWidth: 55 }}>
                              {CAT_LABEL[cat]}
                            </span>
                            <span style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.78)' }}>
                              {matLabel(cat, materials[cat])}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{
                fontSize: '0.42rem', letterSpacing: '0.15em',
                color: 'rgba(184,152,72,0.4)', marginBottom: 10,
              }}>RECORRIDO DE SESIÓN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {views.map((ev, i) => {
                  const dur = formatDuration(ev.duration_ms)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(184,152,72,0.4)',
                      }} />
                      <span style={{ fontSize: '0.52rem', color: 'rgba(244,241,234,0.55)' }}>
                        {pageLabel(ev.page)}
                      </span>
                      {dur && (
                        <span style={{ fontSize: '0.58rem', color: 'rgba(184,152,72,0.75)' }}>
                          {dur}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              {contact.message && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(184,152,72,0.08)' }}>
                  <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: 'rgba(184,152,72,0.65)', marginBottom: 6 }}>MENSAJE</div>
                  <div style={{ fontSize: '0.55rem', color: 'rgba(244,241,234,0.5)', fontStyle: 'italic' }}>
                    "{contact.message}"
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Activity card (anonymous session) ──────────────────── */
function ActivityCard({ sess, index, mob, allSessions }) {
  const [expanded, setExpanded] = useState(false)
  const trail   = Array.isArray(sess.trail) ? sess.trail : []
  const views   = trail.filter(e => e.type === 'page_view')
  const totalMs = views.reduce((acc, e) => acc + (e.duration_ms ?? 0), 0)
  const hasUnit = views.some(e => e.page?.startsWith('/availability/'))
  const hasImm  = views.some(e => e.page?.startsWith('/inmersion/'))
  const hasCmp  = views.some(e => e.page === '/compare') || trail.some(e => e.type === 'compare_add')
  const hasDec  = views.some(e => e.page === '/decision')
  const hasAmen = trail.some(e => e.type === 'amenity_open')
  const hasEnto = trail.some(e => e.type === 'section_view' && e.section === 'entorno')
  const device  = trail.find(e => e.type === 'device_info')?.device ?? 'desktop'
  const DeviceIcon = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor

  // New enriched data
  const visitorVisits = sess.visitor_id
    ? allSessions.filter(s => s.visitor_id === sess.visitor_id).length
    : 1
  const isReturning   = visitorVisits > 1
  const referrer      = sess.referrer || trail.find(e => e.type === 'device_info')?.referrer || 'directo'
  const userLang      = sess.user_lang || trail.find(e => e.type === 'device_info')?.lang || null
  const screenSize    = sess.screen_size || trail.find(e => e.type === 'device_info')?.screen || null
  const cityLine = [sess.city, sess.country].filter(Boolean).join(', ') || null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      style={{ border: '1px solid rgba(184,152,72,0.07)', marginBottom: 6, background: 'rgba(184,152,72,0.01)' }}>

      <div style={mob ? {
        padding: '12px 14px', cursor: views.length > 0 ? 'pointer' : 'default',
      } : {
        display: 'grid', gridTemplateColumns: '1fr 90px 50px 60px 60px 100px 32px',
        gap: 16, padding: '12px 16px', alignItems: 'center',
        cursor: views.length > 0 ? 'pointer' : 'default',
      }} onClick={() => views.length > 0 && setExpanded(e => !e)}>

        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', ...(mob ? { marginBottom: 8 } : {}) }}>
          {isReturning && (
            <span style={{
              padding: '2px 7px', fontSize: '0.55rem', letterSpacing: '0.1em',
              border: '1px solid rgba(255,180,60,0.4)', color: 'rgba(255,180,60,0.85)',
              background: 'rgba(255,180,60,0.08)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <RotateCcw size={8} /> {visitorVisits}ª VISITA
            </span>
          )}
          {referrer !== 'directo' && (
            <span style={{
              padding: '2px 7px', fontSize: '0.55rem', letterSpacing: '0.1em',
              border: '1px solid rgba(140,180,255,0.3)', color: 'rgba(140,180,255,0.7)',
            }}>{referrer.toUpperCase()}</span>
          )}
          {[
            { show: hasUnit, label: 'VIVIENDA' },
            { show: hasCmp,  label: 'COMPARÓ' },
            { show: hasImm,  label: 'INMERSIÓN' },
            { show: hasDec,  label: 'DECISIÓN' },
            { show: hasAmen, label: 'AMENITIES' },
            { show: hasEnto, label: 'ENTORNO' },
          ].filter(m => m.show).map(m => (
            <span key={m.label} style={{
              padding: '2px 7px', fontSize: '0.55rem', letterSpacing: '0.1em',
              border: '1px solid rgba(184,152,72,0.25)', color: 'rgba(184,152,72,0.7)',
            }}>{m.label}</span>
          ))}
          {!isReturning && !hasUnit && !hasCmp && !hasImm && !hasDec && !hasAmen && !hasEnto && referrer === 'directo' && (
            <span style={{ fontSize: '0.5rem', color: 'rgba(244,241,234,0.25)' }}>Solo exploró</span>
          )}
          {mob && <ChevronRight size={12} style={{ color: 'rgba(184,152,72,0.4)', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', marginLeft: 'auto' }} />}
        </div>

        {/* Meta row */}
        {mob ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.55rem', color: 'rgba(244,241,234,0.55)', flexWrap: 'wrap' }}>
            <DeviceIcon size={11} style={{ color: 'rgba(184,152,72,0.45)' }} />
            <span>{views.length} págs</span>
            <span>{formatDuration(totalMs) ?? '—'}</span>
            {userLang && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Globe size={9} style={{ color: 'rgba(184,152,72,0.35)' }} />{userLang.toUpperCase().slice(0, 2)}
            </span>}
            {cityLine && (
              <span style={{ color: 'rgba(184,152,72,0.7)' }}>{cityLine}</span>
            )}
            <span style={{ marginLeft: 'auto' }}>{formatDate(sess.updated_at)}</span>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <DeviceIcon size={11} style={{ color: 'rgba(184,152,72,0.45)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.58rem', color: 'rgba(244,241,234,0.65)', letterSpacing: '0.08em' }}>{device.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {userLang && <Globe size={9} style={{ color: 'rgba(184,152,72,0.35)', flexShrink: 0 }} />}
              <span style={{ fontSize: '0.58rem', color: 'rgba(244,241,234,0.55)' }}>{userLang ? userLang.toUpperCase().slice(0, 2) : '—'}</span>
            </div>
            <span style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.72)' }}>{views.length}</span>
            <span style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.72)' }}>{formatDuration(totalMs) ?? '—'}</span>
            <span style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.65)', display: 'flex', flexDirection: 'column', lineHeight: 1.35 }}>
              {cityLine && <span style={{ color: 'rgba(184,152,72,0.75)', fontSize: '0.55rem' }}>{cityLine}</span>}
              <span>{formatDate(sess.updated_at)}</span>
            </span>
            <ChevronRight size={12} style={{ color: 'rgba(184,152,72,0.4)', transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 16px 14px 16px', borderTop: '1px solid rgba(184,152,72,0.07)' }}>
              {/* Session metadata */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '10px 0 8px', marginBottom: 4, borderBottom: '1px solid rgba(184,152,72,0.05)' }}>
                {[
                  { label: 'ORIGEN', value: referrer.toUpperCase() },
                  { label: 'IDIOMA', value: userLang ? userLang.toUpperCase() : null },
                  { label: 'PANTALLA', value: screenSize },
                  { label: 'VISITA', value: isReturning ? `${visitorVisits}ª de este visitante` : 'Primera' },
                ].filter(m => m.value).map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize: '0.45rem', letterSpacing: '0.15em', color: 'rgba(184,152,72,0.45)', marginBottom: 3 }}>{m.label}</div>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(244,241,234,0.65)' }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: 'rgba(184,152,72,0.65)', margin: '10px 0 8px' }}>
                RECORRIDO
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {trail.filter(ev => ['page_view','section_view','amenity_open','nearby_view','compare_add'].includes(ev.type)).map((ev, j) => {
                  let dot = 'rgba(184,152,72,0.35)'
                  let label = ''
                  let extra = null
                  if (ev.type === 'page_view') {
                    label = pageLabel(ev.page)
                    extra = formatDuration(ev.duration_ms)
                  } else if (ev.type === 'section_view') {
                    const names = { obra: 'Sección: OBRA', entorno: 'Sección: ENTORNO', amenities: 'Sección: AMENITIES',
                                    build: 'Section: BUILD', location: 'Section: LOCATION' }
                    label = names[ev.section] ?? `Sección: ${ev.section}`
                    dot = 'rgba(184,152,72,0.55)'
                  } else if (ev.type === 'amenity_open') {
                    const lbl = typeof ev.label === 'object' ? (ev.label?.es ?? ev.label?.en ?? '') : (ev.label ?? ev.id ?? '')
                    label = `Amenity: ${lbl.toUpperCase()}`
                    dot = 'rgba(184,152,72,0.7)'
                  } else if (ev.type === 'nearby_view') {
                    const lbl = typeof ev.label === 'object' ? (ev.label?.es ?? ev.label?.en ?? '') : (ev.label ?? ev.id ?? '')
                    label = `Entorno: ${lbl.toUpperCase()}`
                    dot = 'rgba(140,200,255,0.55)'
                  } else if (ev.type === 'compare_add') {
                    label = `Comparó: vivienda ${ev.unit_id ?? ''}`
                    dot = 'rgba(244,200,80,0.5)'
                  }
                  return (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.65rem', color: 'rgba(244,241,234,0.78)' }}>{label}</span>
                      {extra && <span style={{ fontSize: '0.58rem', color: 'rgba(184,152,72,0.75)' }}>{extra}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Session item (dentro de un grupo de visitante) ─────── */
function SessionItem({ sess, visitNum, mob, isLast }) {
  const [open, setOpen] = useState(false)
  const trail  = Array.isArray(sess.trail) ? sess.trail : []
  const views  = trail.filter(e => e.type === 'page_view')
  const totalMs = views.reduce((acc, e) => acc + (e.duration_ms ?? 0), 0)

  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid rgba(184,152,72,0.05)' }}>
      <div
        onClick={() => views.length > 0 && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: mob ? '10px 14px 10px 20px' : '10px 16px 10px 32px',
          cursor: views.length > 0 ? 'pointer' : 'default',
        }}>
        {mob ? (
          /* Mobile: número arriba, fecha + stats abajo */
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: '0.46rem', letterSpacing: '0.1em', color: 'rgba(184,152,72,0.4)' }}>
                VISITA {visitNum}
              </span>
              {sess.converted && <span style={{ fontSize: '0.46rem', color: 'rgba(255,140,0,0.7)', letterSpacing: '0.06em' }}>✓</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: '0.55rem', color: 'rgba(244,241,234,0.4)', flexWrap: 'wrap' }}>
              <span>{formatDate(sess.started_at ?? sess.updated_at).split(' · ')[0]}</span>
              <span>{views.length} págs</span>
              {formatDuration(totalMs) && <span style={{ color: 'rgba(184,152,72,0.5)' }}>{formatDuration(totalMs)}</span>}
            </div>
          </div>
        ) : (
          /* Desktop: en línea */
          <>
            <div style={{ fontSize: '0.46rem', letterSpacing: '0.1em', color: 'rgba(184,152,72,0.4)', flexShrink: 0, minWidth: 52 }}>
              VISITA {visitNum}
            </div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(244,241,234,0.45)', flexShrink: 0, minWidth: 150 }}>
              {formatDate(sess.started_at ?? sess.updated_at)}
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 10, fontSize: '0.55rem', color: 'rgba(244,241,234,0.35)' }}>
              <span>{views.length} págs</span>
              {formatDuration(totalMs) && <span style={{ color: 'rgba(184,152,72,0.55)' }}>{formatDuration(totalMs)}</span>}
              {sess.converted && <span style={{ color: 'rgba(255,140,0,0.7)', letterSpacing: '0.06em' }}>✓ FORMULARIO</span>}
            </div>
          </>
        )}
        {views.length > 0 && (
          <ChevronRight size={10} style={{ color: 'rgba(184,152,72,0.3)', flexShrink: 0, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: mob ? '0 12px 12px 20px' : '0 16px 12px 56px', borderTop: '1px solid rgba(184,152,72,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 10 }}>
                {trail.filter(ev => ['page_view','section_view','amenity_open','nearby_view','compare_add'].includes(ev.type)).map((ev, j) => {
                  let dot = 'rgba(184,152,72,0.35)', label = '', extra = null
                  if (ev.type === 'page_view') {
                    label = pageLabel(ev.page); extra = formatDuration(ev.duration_ms)
                  } else if (ev.type === 'section_view') {
                    const n = { obra: 'Sección: OBRA', entorno: 'Sección: ENTORNO', amenities: 'Sección: AMENITIES' }
                    label = n[ev.section] ?? `Sección: ${ev.section}`; dot = 'rgba(184,152,72,0.55)'
                  } else if (ev.type === 'amenity_open') {
                    const l = typeof ev.label === 'object' ? (ev.label?.es ?? '') : (ev.label ?? ev.id ?? '')
                    label = `Amenity: ${l.toUpperCase()}`; dot = 'rgba(184,152,72,0.7)'
                  } else if (ev.type === 'nearby_view') {
                    const l = typeof ev.label === 'object' ? (ev.label?.es ?? '') : (ev.label ?? ev.id ?? '')
                    label = `Entorno: ${l.toUpperCase()}`; dot = 'rgba(140,200,255,0.55)'
                  } else if (ev.type === 'compare_add') {
                    label = `Comparó: vivienda ${ev.unit_id ?? ''}`; dot = 'rgba(244,200,80,0.5)'
                  }
                  return (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.7)' }}>{label}</span>
                      {extra && <span style={{ fontSize: '0.55rem', color: 'rgba(184,152,72,0.7)' }}>{extra}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Visitor group (agrupa todas las sesiones de un mismo visitante) */
function VisitorGroup({ visitorId, sessions, index, mob }) {
  const [expanded, setExpanded] = useState(false)

  const sorted = [...sessions].sort((a, b) =>
    new Date(a.started_at ?? a.updated_at) - new Date(b.started_at ?? b.updated_at)
  )
  const latest     = sorted[sorted.length - 1]
  const latestTrail = Array.isArray(latest.trail) ? latest.trail : []
  const allTrails  = sessions.flatMap(s => Array.isArray(s.trail) ? s.trail : [])

  const hasUnit      = allTrails.some(e => e.type === 'page_view' && e.page?.startsWith('/availability/'))
  const hasImm       = allTrails.some(e => e.type === 'page_view' && e.page?.startsWith('/inmersion/'))
  const hasCmp       = allTrails.some(e => e.page === '/compare' || e.type === 'compare_add')
  const hasDec       = allTrails.some(e => e.type === 'page_view' && e.page === '/decision')
  const isConverted  = sessions.some(s => s.converted)
  const isMulti      = sessions.length > 1

  const referrer  = latest.referrer || latestTrail.find(e => e.type === 'device_info')?.referrer || 'directo'
  const device    = latestTrail.find(e => e.type === 'device_info')?.device ?? 'desktop'
  const DevIcon   = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor
  const shortId   = visitorId ? visitorId.slice(-6).toUpperCase() : '———'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      style={{
        border: `1px solid ${isConverted ? 'rgba(255,140,0,0.15)' : 'rgba(184,152,72,0.07)'}`,
        marginBottom: 6,
        background: isConverted ? 'rgba(255,140,0,0.02)' : 'rgba(184,152,72,0.01)',
        overflow: 'hidden', width: '100%',
      }}>

      {/* Header */}
      <div onClick={() => setExpanded(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: mob ? '12px 14px' : '12px 16px', cursor: 'pointer',
      }}>

        {/* ID + visitas */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '0.44rem', letterSpacing: '0.12em', color: 'rgba(184,152,72,0.4)', marginBottom: 4 }}>
            #{shortId}
          </div>
          {isMulti && (
            <span style={{
              padding: '2px 7px', fontSize: '0.5rem', letterSpacing: '0.1em',
              border: '1px solid rgba(255,180,60,0.4)', color: 'rgba(255,180,60,0.85)',
              background: 'rgba(255,180,60,0.08)',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <RotateCcw size={8} /> {sessions.length} VISITAS
            </span>
          )}
        </div>

        {/* Badges */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', overflow: 'hidden' }}>
          {referrer !== 'directo' && (
            <span style={{ padding: '2px 7px', fontSize: '0.5rem', letterSpacing: '0.1em', border: '1px solid rgba(140,180,255,0.3)', color: 'rgba(140,180,255,0.7)' }}>
              {referrer.toUpperCase()}
            </span>
          )}
          {[
            { show: hasUnit,     label: 'VIVIENDA' },
            { show: hasCmp,      label: 'COMPARÓ' },
            { show: hasImm,      label: 'INMERSIÓN' },
            { show: hasDec,      label: 'DECISIÓN' },
            { show: isConverted, label: 'FORMULARIO', color: 'rgba(255,140,0,0.85)', border: 'rgba(255,140,0,0.3)' },
          ].filter(m => m.show).map(m => (
            <span key={m.label} style={{
              padding: '2px 7px', fontSize: '0.5rem', letterSpacing: '0.1em',
              border: `1px solid ${m.border ?? 'rgba(184,152,72,0.25)'}`,
              color: m.color ?? 'rgba(184,152,72,0.7)',
            }}>{m.label}</span>
          ))}
          {!isMulti && !hasUnit && !hasCmp && !hasImm && !hasDec && !isConverted && referrer === 'directo' && (
            <span style={{ fontSize: '0.5rem', color: 'rgba(244,241,234,0.2)' }}>Solo exploró</span>
          )}
        </div>

        {/* Device + fecha + chevron */}
        {!mob && <DevIcon size={11} style={{ color: 'rgba(184,152,72,0.35)', flexShrink: 0 }} />}
        <span style={{ fontSize: '0.55rem', color: 'rgba(244,241,234,0.4)', flexShrink: 0, ...(mob ? {} : { minWidth: 110, textAlign: 'right' }) }}>
          {mob
            ? formatDate(latest.updated_at).split(' · ')[0]
            : formatDate(latest.updated_at)
          }
        </span>
        <ChevronRight size={12} style={{ color: 'rgba(184,152,72,0.4)', flexShrink: 0, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {/* Sesiones expandidas */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
            <div style={{ borderTop: '1px solid rgba(184,152,72,0.08)' }}>
              {sorted.map((s, i) => (
                <SessionItem key={s.id} sess={s} visitNum={i + 1} mob={mob} isLast={i === sorted.length - 1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Password screen ─────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [pwd, setPwd]     = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  function submit(e) {
    e.preventDefault()
    if (pwd === ADMIN_PASSWORD) { onLogin() }
    else { setError(true); setShake(true); setTimeout(() => setShake(false), 400) }
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <AdminPasswordModal password={ADMIN_PASSWORD} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 360, padding: '0 24px' }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontSize: '0.5rem', letterSpacing: '0.25em', color: 'rgba(184,152,72,0.5)', marginBottom: 8 }}>
            THE VISUALS BOUTIQUE STUDIO
          </div>
          <div style={{ fontSize: '1rem', letterSpacing: '0.18em', color: 'var(--color-text)', fontWeight: 300 }}>
            PANEL DE VENTAS
          </div>
        </div>
        <form onSubmit={submit}>
          <motion.div animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.35 }}
            style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.5rem', letterSpacing: '0.15em', color: 'rgba(184,152,72,0.5)', marginBottom: 8 }}>
              CONTRASEÑA
            </label>
            <input type="password" value={pwd} onChange={e => { setPwd(e.target.value); setError(false) }} autoFocus
              style={{
                width: '100%', padding: '10px 0', background: 'transparent', border: 'none',
                borderBottom: `1px solid ${error ? 'rgba(255,80,80,0.6)' : 'rgba(184,152,72,0.25)'}`,
                color: 'var(--color-text)', fontSize: '0.85rem', letterSpacing: '0.15em',
                fontFamily: 'inherit', outline: 'none',
              }} />
            {error && <div style={{ marginTop: 6, fontSize: '0.5rem', letterSpacing: '0.1em', color: 'rgba(255,80,80,0.7)' }}>CONTRASEÑA INCORRECTA</div>}
          </motion.div>
          <button type="submit" style={{
            width: '100%', padding: '12px', border: '1px solid rgba(184,152,72,0.35)',
            background: 'rgba(184,152,72,0.06)', color: 'var(--color-accent)',
            fontSize: '0.65rem', letterSpacing: '0.2em', fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,152,72,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(184,152,72,0.06)'}>
            ENTRAR
          </button>
        </form>
      </motion.div>
    </div>
  )
}

/* ─── Admin panel ─────────────────────────────────────────── */
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

export default function AdminPage() {
  const mob = useIsMobile()
  const [authed,      setAuthed]      = useState(() => localStorage.getItem('tvbs_admin') === ADMIN_PASSWORD)
  const [tab,         setTab]         = useState('overview')
  const [units,       setUnits]       = useState([])
  const [leads,       setLeads]       = useState([])
  const [sessions,    setSessions]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [refreshing,  setRefreshing]  = useState(false)
  const [saving,      setSaving]      = useState(null)
  const [toast,       setToast]       = useState(null)

  function handleLogin()  { localStorage.setItem('tvbs_admin', ADMIN_PASSWORD); setAuthed(true) }
  function handleLogout() { localStorage.removeItem('tvbs_admin'); setAuthed(false) }

  async function refreshActivity() {
    setRefreshing(true)
    const [{ data: l }, { data: s }] = await Promise.all([
      supabase.from('leads').select('*').eq('project_slug', PROJECT_SLUG).order('created_at', { ascending: false }),
      supabase.from('page_sessions').select('*').eq('project_slug', PROJECT_SLUG).order('updated_at', { ascending: false }).limit(2000),
    ])
    if (l) setLeads(l)
    if (s) setSessions(s)
    setRefreshing(false)
    showToast('Actividad actualizada')
  }

  useEffect(() => {
    if (!authed) return
    Promise.all([
      supabase.from('units').select('id,typology,floor,bedrooms,surface,price,status').eq('project_slug', PROJECT_SLUG).order('id'),
      supabase.from('leads').select('*').eq('project_slug', PROJECT_SLUG).order('created_at', { ascending: false }),
      supabase.from('page_sessions').select('*').eq('project_slug', PROJECT_SLUG).order('updated_at', { ascending: false }).limit(2000),
    ]).then(([{ data: u }, { data: l }, { data: s }]) => {
      if (u) setUnits(u)
      if (l) setLeads(l)
      if (s) setSessions(s)
      setLoading(false)
    })
  }, [authed])

  async function updateStatus(unitId, newStatus) {
    setSaving(unitId)
    const { error } = await supabase.from('units').update({ status: newStatus })
      .eq('id', unitId).eq('project_slug', PROJECT_SLUG)
    setSaving(null)
    if (!error) {
      setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status: newStatus } : u))
      showToast(`${unitId} → ${STATUS[newStatus]?.es ?? newStatus}`)
    }
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  if (!authed) return <LoginScreen onLogin={handleLogin} />

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Loader2 size={20} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const hotLeads  = leads.filter(l => l.lead_temperature === 'hot')
  const todayLeads = leads.filter(l => {
    const d = new Date(l.created_at)
    const t = new Date()
    return d.toDateString() === t.toDateString()
  })

  // ─── Leads tab extras: conversion rate + hot-lead pipeline value
  const convRateLeads = sessions.length > 0
    ? ((leads.length / sessions.length) * 100).toFixed(1) + '%'
    : '0%'
  const pipelineHot = (() => {
    let total = 0
    hotLeads.forEach(l => {
      const id = l.primary_unit_id ?? l.unit_ids?.[0]
      const u  = id ? units.find(x => x.id === id) : null
      if (u?.price) total += u.price
    })
    if (total === 0) return '—'
    if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M€`
    if (total >= 1_000)     return `${Math.round(total / 1_000)}k€`
    return `${total}€`
  })()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', padding: '0 0 80px', overflowX: 'hidden' }}>
      <AdminEnterModal />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: mob ? '16px 16px' : '24px 40px', borderBottom: '1px solid rgba(184,152,72,0.1)',
      }}>
        <div>
          {!mob && <div style={{ fontSize: '0.45rem', letterSpacing: '0.25em', color: 'rgba(184,152,72,0.45)', marginBottom: 4 }}>
            THE VISUALS BOUTIQUE STUDIO
          </div>}
          <div style={{ fontSize: mob ? '0.75rem' : '0.85rem', letterSpacing: '0.15em', color: 'var(--color-text)', fontWeight: 300 }}>
            PANEL DE VENTAS
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none',
          cursor: 'pointer', color: 'rgba(244,241,234,0.3)', fontSize: '0.5rem',
          letterSpacing: '0.12em', fontFamily: 'inherit', transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(244,241,234,0.6)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,241,234,0.3)'}>
          <LogOut size={13} /> {!mob && 'SALIR'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: mob ? '0 16px' : '0 40px', borderBottom: '1px solid rgba(184,152,72,0.1)', overflowX: 'auto' }}>
        {[
          { key: 'overview', label: mob ? 'RESUMEN' : 'RESUMEN',       count: null, icon: BarChart3 },
          { key: 'units',    label: mob ? 'UDS'     : 'DISPONIBILIDAD', count: units.length },
          { key: 'leads',    label: 'LEADS',          count: leads.length, hot: hotLeads.length },
          { key: 'activity', label: mob ? 'ACTIVIDAD' : 'ACTIVIDAD', count: sessions.filter(s => !s.converted).length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '14px 0', marginRight: mob ? 16 : 32, background: 'none', border: 'none',
            borderBottom: `1px solid ${tab === t.key ? 'var(--color-accent)' : 'transparent'}`,
            color: tab === t.key ? 'var(--color-accent)' : 'rgba(244,241,234,0.3)',
            fontSize: mob ? '0.55rem' : '0.62rem', letterSpacing: '0.18em', fontFamily: 'inherit',
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {t.icon && <t.icon size={11} style={{ opacity: 0.8 }} />}
            {t.label}
            {t.count != null && (
              <span style={{
                padding: '1px 6px', background: 'rgba(184,152,72,0.1)',
                border: '1px solid rgba(184,152,72,0.2)',
                fontSize: '0.55rem', color: 'rgba(184,152,72,0.75)',
              }}>{t.count}</span>
            )}
            {t.hot > 0 && (
              <span style={{
                padding: '1px 6px', background: 'rgba(255,140,0,0.1)',
                border: '1px solid rgba(255,140,0,0.3)',
                fontSize: '0.55rem', color: 'rgba(255,140,0,0.9)',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <Flame size={8} /> {t.hot}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <OverviewTab leads={leads} sessions={sessions} units={units} mob={mob} />
      )}

      {/* ── UNITS TAB ── */}
      {tab === 'units' && (
        <div style={{ padding: mob ? '16px 16px 0' : '24px 40px 0' }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.06em', color: 'rgba(244,241,234,0.65)', marginBottom: mob ? 12 : 20 }}>
            {units.length} viviendas · toca el estado para cambiarlo
          </div>

          {/* Desktop header */}
          {!mob && (
            <div style={{
              display: 'grid', gridTemplateColumns: '72px 1fr 64px 72px 80px 1fr 130px',
              gap: 16, padding: '8px 16px 12px', borderBottom: '1px solid rgba(184,152,72,0.12)',
              fontSize: '0.55rem', letterSpacing: '0.18em', color: 'rgba(184,152,72,0.65)',
            }}>
              <span>VIVIENDA</span><span>TIPOLOGÍA</span><span>PLANTA</span>
              <span>DORM.</span><span>SUP. M²</span><span>PRECIO</span>
              <span style={{ textAlign: 'right' }}>ESTADO</span>
            </div>
          )}

          {units.map((unit, i) => (
            <motion.div key={unit.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={mob ? {
                padding: '14px 14px', marginBottom: 8,
                border: '1px solid rgba(184,152,72,0.08)',
                background: 'rgba(184,152,72,0.02)',
              } : {
                display: 'grid', gridTemplateColumns: '72px 1fr 64px 72px 80px 1fr 130px',
                gap: 16, padding: '13px 16px', borderBottom: '1px solid rgba(184,152,72,0.06)',
                alignItems: 'center', background: i % 2 === 0 ? 'rgba(184,152,72,0.025)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={!mob ? (e => e.currentTarget.style.background = 'rgba(184,152,72,0.055)') : undefined}
              onMouseLeave={!mob ? (e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(184,152,72,0.025)' : 'transparent') : undefined}>

              {mob ? (
                /* ── Mobile card ── */
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.9rem', letterSpacing: '0.06em', color: 'rgba(244,241,234,0.85)', fontWeight: 300 }}>{unit.id}</span>
                    <StatusSelect value={unit.status} onChange={ns => updateStatus(unit.id, ns)} disabled={saving === unit.id} />
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.72)', textTransform: 'uppercase', marginBottom: 6 }}>
                    {unit.typology}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.58rem', color: 'rgba(244,241,234,0.6)' }}>
                    <span>{unit.floor}ª planta</span>
                    <span>{unit.bedrooms} dorm</span>
                    <span>{unit.surface} m²</span>
                  </div>
                  {unit.price && (
                    <div style={{ fontSize: '0.72rem', color: 'rgba(244,241,234,0.65)', marginTop: 6 }}>
                      {unit.price.toLocaleString('es-ES')} €
                    </div>
                  )}
                </>
              ) : (
                /* ── Desktop row ── */
                <>
                  <span style={{ fontSize: '0.85rem', letterSpacing: '0.06em', color: 'rgba(244,241,234,0.85)', fontWeight: 300 }}>{unit.id}</span>
                  <span style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: 'rgba(244,241,234,0.72)', textTransform: 'uppercase' }}>{unit.typology}</span>
                  <span style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.72)' }}>{unit.floor}ª</span>
                  <span style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.72)' }}>{unit.bedrooms}</span>
                  <span style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.72)' }}>{unit.surface}</span>
                  <span style={{ fontSize: '0.72rem', letterSpacing: '0.04em', color: unit.price ? 'rgba(244,241,234,0.65)' : 'rgba(244,241,234,0.2)' }}>
                    {unit.price ? unit.price.toLocaleString('es-ES') + ' €' : '—'}
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <StatusSelect value={unit.status} onChange={ns => updateStatus(unit.id, ns)} disabled={saving === unit.id} />
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── LEADS TAB ── */}
      {tab === 'leads' && (
        <div style={{ padding: mob ? '16px 16px 0' : '24px 40px 0' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(6, auto)', gap: mob ? 8 : 14, marginBottom: mob ? 16 : 28 }}>
            {[
              { label: 'TOTAL',       value: leads.length,                    color: 'rgba(244,241,234,0.92)' },
              { label: 'HOY',         value: todayLeads.length,               color: 'rgba(244,241,234,0.92)' },
              { label: 'CALIENTES',   value: hotLeads.length,                 color: 'rgba(255,140,0,0.85)'   },
              { label: 'FRÍOS',       value: leads.length - hotLeads.length,  color: 'rgba(140,180,255,0.7)'  },
              { label: 'CONVERSIÓN',  value: convRateLeads,                   color: 'rgba(244,241,234,0.92)' },
              { label: 'PIPELINE',    value: pipelineHot,                     color: 'rgba(255,140,0,0.85)'   },
            ].map(s => (
              <div key={s.label} style={{
                padding: mob ? '10px 14px' : '14px 20px', border: '1px solid rgba(184,152,72,0.1)',
                background: 'rgba(184,152,72,0.02)',
              }}>
                <div style={{ fontSize: '0.48rem', letterSpacing: '0.18em', color: 'rgba(184,152,72,0.6)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: mob ? '1.1rem' : '1.3rem', color: s.color, fontWeight: 400, letterSpacing: '-0.005em' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <LeadsCharts leads={leads} mob={mob} />

          {/* Column headers — desktop only */}
          {!mob && leads.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: '28px 1fr 1fr 120px 160px 32px',
              gap: 16, padding: '0 16px 10px',
              borderBottom: '1px solid rgba(184,152,72,0.12)',
              fontSize: '0.55rem', letterSpacing: '0.18em', color: 'rgba(184,152,72,0.65)',
            }}>
              <span></span><span>CONTACTO</span><span>TELÉFONO / VIVIENDA</span>
              <span>ORIGEN</span><span>FECHA</span><span></span>
            </div>
          )}

          {/* Lead cards */}
          {leads.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'rgba(244,241,234,0.2)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
              AÚN NO HAY LEADS
            </div>
          ) : (
            <div style={{ paddingTop: 8 }}>
              {leads.map((lead, i) => <LeadCard key={lead.id} lead={lead} index={i} mob={mob} />)}
            </div>
          )}
        </div>
      )}

      {/* ── ACTIVIDAD TAB ── */}
      {tab === 'activity' && (() => {
        const anon       = sessions.filter(s => !s.converted)
        const today      = new Date().toDateString()
        const todaySess  = sessions.filter(s => new Date(s.updated_at).toDateString() === today)
        const converted  = sessions.filter(s => s.converted).length
        const convRate   = sessions.length > 0 ? Math.round((converted / sessions.length) * 100) : 0
        const uniqueVids = new Set(sessions.map(s => s.visitor_id).filter(Boolean))
        const returning  = sessions.filter(s => s.visitor_id && sessions.filter(s2 => s2.visitor_id === s.visitor_id).length > 1)
        const uniqueReturning = new Set(returning.map(s => s.visitor_id)).size

        return (
          <div style={{ padding: mob ? '16px 16px 0' : '24px 40px 0' }}>
            {/* Stats + refresh */}
            <div style={{ display: 'flex', alignItems: mob ? 'stretch' : 'flex-start', justifyContent: 'space-between', marginBottom: mob ? 16 : 28, flexDirection: mob ? 'column' : 'row', gap: mob ? 10 : 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4, auto)', gap: mob ? 8 : 16 }}>
              {[
                { label: 'VISITAS',        value: sessions.length },
                { label: 'HOY',             value: todaySess.length },
                { label: 'ÚNICOS',          value: uniqueVids.size || sessions.length },
                { label: 'RECURRENTES',     value: uniqueReturning },
              ].map(s => (
                <div key={s.label} style={{
                  padding: mob ? '10px 14px' : '14px 20px', border: '1px solid rgba(184,152,72,0.1)',
                  background: 'rgba(184,152,72,0.02)',
                }}>
                  <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: 'rgba(184,152,72,0.65)', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: mob ? '1.1rem' : '1.4rem', color: 'var(--color-accent)', fontWeight: 300 }}>{s.value}</div>
                </div>
              ))}
            </div>
            {/* Refresh button */}
            <button onClick={refreshActivity} disabled={refreshing} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 14px', border: '1px solid rgba(184,152,72,0.25)',
              background: 'rgba(184,152,72,0.05)', color: 'rgba(184,152,72,0.7)',
              fontSize: '0.55rem', letterSpacing: '0.14em', fontFamily: 'inherit',
              cursor: refreshing ? 'default' : 'pointer', opacity: refreshing ? 0.5 : 1,
              transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.25)'; e.currentTarget.style.color = 'rgba(184,152,72,0.7)' }}>
              {refreshing
                ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />
                : <span style={{ fontSize: '0.7rem' }}>↻</span>}
              ACTUALIZAR
            </button>
            </div>

            {/* Charts */}
            <ActivityCharts sessions={sessions} mob={mob} />

            {/* Column headers — desktop only */}
            {!mob && anon.length > 0 && (
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '0 16px 10px',
                borderBottom: '1px solid rgba(184,152,72,0.12)',
                fontSize: '0.55rem', letterSpacing: '0.18em', color: 'rgba(184,152,72,0.65)',
              }}>
                <span>VISITANTE · ACCIONES</span><span>ÚLTIMA VEZ</span>
              </div>
            )}

            {anon.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'rgba(244,241,234,0.2)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
                AÚN NO HAY ACTIVIDAD ANÓNIMA
              </div>
            ) : (
              <div style={{ paddingTop: 8 }}>
                {(() => {
                  const groups = []
                  const seen = new Set()
                  anon.forEach(s => {
                    if (s.visitor_id) {
                      if (seen.has(s.visitor_id)) return
                      seen.add(s.visitor_id)
                      groups.push({ visitorId: s.visitor_id, sessions: anon.filter(x => x.visitor_id === s.visitor_id) })
                    } else {
                      groups.push({ visitorId: null, sessions: [s] })
                    }
                  })
                  groups.sort((a, b) => {
                    const t = g => Math.max(...g.sessions.map(s => new Date(s.updated_at ?? s.started_at).getTime()))
                    return t(b) - t(a)
                  })
                  return groups.map((g, i) => (
                    <VisitorGroup key={g.visitorId ?? g.sessions[0].id} visitorId={g.visitorId} sessions={g.sessions} index={i} mob={mob} />
                  ))
                })()}
              </div>
            )}
          </div>
        )
      })()}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            style={{
              position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              border: '1px solid rgba(184,152,72,0.3)', background: 'rgba(18,16,12,0.95)',
              fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--color-accent)',
              backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
            }}>
            <Check size={12} />{toast.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
