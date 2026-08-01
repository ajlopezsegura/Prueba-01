import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
} from 'recharts'
import {
  FUNNEL_STEPS,
  computeSegments,
  computeFrictionPoints,
  computeExplorationActions,
  computeExplorationDeadEnds,
} from './insights'

const ACCENT    = '#B89848'
const ACCENT_DIM= 'rgba(184,152,72,0.35)'
const COLD      = 'rgba(140,180,255,0.65)'
const GREEN     = 'rgba(91,168,120,0.8)'
const RED       = 'rgba(210,90,90,0.85)'
const GRID      = 'rgba(184,152,72,0.06)'
const TEXT_DIM  = 'rgba(244,241,234,0.4)'
const ACCENT_LOW= 'rgba(184,152,72,0.08)'

const tooltipProps = {
  contentStyle: {
    background: 'rgba(18,16,12,0.96)',
    border: '1px solid rgba(184,152,72,0.3)',
    fontSize: '0.65rem', letterSpacing: '0.06em',
    color: '#F4F1EA', padding: '6px 10px', borderRadius: 0,
  },
  labelStyle: { color: 'rgba(184,152,72,0.85)', fontSize: '0.55rem', letterSpacing: '0.1em', marginBottom: 2 },
  itemStyle: { color: '#F4F1EA', padding: 0 },
  cursor: { fill: ACCENT_LOW },
}

function ChartCard({ title, children, style }) {
  return (
    <div style={{
      padding: '16px 18px',
      border: '1px solid rgba(184,152,72,0.1)',
      background: 'rgba(184,152,72,0.02)',
      minWidth: 0, overflow: 'hidden',
      ...style,
    }}>
      <div style={{ fontSize: '0.48rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.6)', marginBottom: 14 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Empty() {
  return (
    <div style={{
      height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(244,241,234,0.2)', fontSize: '0.58rem', letterSpacing: '0.1em',
    }}>
      AÚN NO HAY DATOS
    </div>
  )
}

/* ── 1. FUNNEL COMERCIAL (lineal, desde insights.js) ─────── */
function FunnelChart({ sessions }) {
  const total = sessions.length
  const data = useMemo(() => {
    return FUNNEL_STEPS.map(step => {
      const count = sessions.filter(s => {
        const trail = Array.isArray(s.trail) ? s.trail : []
        return step.check(trail, s)
      }).length
      return {
        label:   step.label.toUpperCase(),
        count,
        pct:     total > 0 ? Math.round((count / total) * 100) : 0,
        drop:    null,
      }
    }).map((item, i, arr) => ({
      ...item,
      drop: i > 0 && arr[i-1].count > 0
        ? Math.round((1 - item.count / arr[i-1].count) * 100)
        : null,
    }))
  }, [sessions, total])

  if (total === 0) return <Empty />

  const max = data[0]?.count ?? 1

  const biggestDrop = data
    .map((step, i) => ({ ...step, prev: i > 0 ? data[i - 1] : null }))
    .filter(step => step.prev && step.drop != null && step.drop > 0)
    .sort((a, b) => b.drop - a.drop)[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((step, i) => {
        const barWidth = max > 0 ? `${(step.count / max) * 100}%` : '0%'
        const isLast   = i === data.length - 1
        return (
          <div key={step.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                fontSize: '0.5rem', letterSpacing: '0.12em',
                color: isLast ? GREEN : 'rgba(244,241,234,0.45)',
                width: 130, flexShrink: 0,
              }}>
                {step.label}
              </div>
              <div style={{
                flex: 1, height: 18, background: 'rgba(184,152,72,0.06)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0, right: 'auto',
                  width: barWidth,
                  background: isLast
                    ? 'rgba(91,168,120,0.45)'
                    : i === 0
                      ? ACCENT
                      : `rgba(184,152,72,${0.65 - i * 0.08})`,
                  transition: 'width 0.6s ease',
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center',
                  paddingLeft: 8,
                }}>
                  <span style={{
                    fontSize: '0.55rem', color: 'rgba(244,241,234,0.85)',
                    fontWeight: 500, letterSpacing: '0.04em',
                  }}>
                    {step.count}
                  </span>
                  <span style={{
                    fontSize: '0.48rem', color: 'rgba(244,241,234,0.4)',
                    marginLeft: 6, letterSpacing: '0.06em',
                  }}>
                    {step.pct}%
                  </span>
                </div>
              </div>
              {step.drop != null && step.drop > 0 && (
                <div style={{
                  fontSize: '0.48rem', color: 'rgba(220,100,100,0.7)',
                  letterSpacing: '0.08em', width: 36, textAlign: 'right', flexShrink: 0,
                }}>
                  −{step.drop}%
                </div>
              )}
            </div>
          </div>
        )
      })}

      {biggestDrop && (
        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: '1px solid rgba(184,152,72,0.08)',
          fontSize: '0.55rem', letterSpacing: '0.04em',
          color: 'rgba(244,241,234,0.55)', lineHeight: 1.5,
        }}>
          La mayor pérdida está entre{' '}
          <span style={{ color: 'rgba(244,241,234,0.85)' }}>{biggestDrop.prev.label.toLowerCase()}</span>
          {' '}y{' '}
          <span style={{ color: 'rgba(244,241,234,0.85)' }}>{biggestDrop.label.toLowerCase()}</span>
          {' '}(<span style={{ color: RED }}>−{biggestDrop.drop}%</span>).
        </div>
      )}
    </div>
  )
}

/* ── 2. TIEMPO MEDIO POR PÁGINA ────────────────────────────── */
const PAGE_LABELS = {
  '/':              'Portada',
  '/proyecto':      'El Proyecto',
  '/availability':  'Disponibilidad',
  '/decision':      'Decisión',
  '/compare':       'Comparador',
  '/contact':       'Formulario',
}
function pageShortLabel(page) {
  if (!page) return '—'
  if (page.startsWith('/availability/')) return `Vivienda ${page.split('/').pop()}`
  if (page.startsWith('/inmersion/'))    return `Config. ${page.split('/').pop()}`
  if (page.startsWith('/summary/'))      return `Dossier ${page.split('/').pop()}`
  return PAGE_LABELS[page] ?? page
}

function TimePerPage({ sessions }) {
  const data = useMemo(() => {
    const totals = {}, counts = {}
    sessions.forEach(s => {
      const trail = Array.isArray(s.trail) ? s.trail : []
      trail.filter(e => e.type === 'page_view' && e.duration_ms > 2000).forEach(e => {
        const key    = e.page
        const capped = Math.min(e.duration_ms, 300000)
        totals[key] = (totals[key] ?? 0) + capped
        counts[key] = (counts[key] ?? 0) + 1
      })
    })
    return Object.entries(totals)
      .map(([page, total]) => ({
        name:  pageShortLabel(page),
        avg:   Math.round(total / counts[page] / 1000),
      }))
      .filter(d => d.avg >= 3)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8)
  }, [sessions])

  if (data.length === 0) return <Empty />

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 0 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis
          type="number" stroke={TEXT_DIM}
          tick={{ fontSize: 10, fill: TEXT_DIM }} tickLine={false} axisLine={false}
          tickFormatter={v => `${v}s`}
        />
        <YAxis
          type="category" dataKey="name" stroke={TEXT_DIM}
          tick={{ fontSize: 10, fill: TEXT_DIM }} tickLine={false} axisLine={false}
          width={110}
        />
        <Tooltip
          {...tooltipProps}
          formatter={v => [`${v}s`, 'TIEMPO MEDIO']}
          cursor={{ fill: ACCENT_LOW }}
        />
        <Bar dataKey="avg" radius={[0,1,1,0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={`rgba(184,152,72,${0.8 - i * 0.07})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── 3. MATERIALES ELEGIDOS ────────────────────────────────── */
const MAT_CATS = {
  floor:   { label: 'SUELO',    color: ACCENT },
  walls:   { label: 'PAREDES',  color: COLD   },
  kitchen: { label: 'COCINA',   color: 'rgba(255,180,80,0.75)' },
}

function MaterialsChart({ sessions }) {
  const data = useMemo(() => {
    const counts = { floor: {}, walls: {}, kitchen: {} }
    sessions.forEach(s => {
      const trail = Array.isArray(s.trail) ? s.trail : []
      trail.filter(e => e.type === 'material_select').forEach(e => {
        const cat = e.category
        if (!counts[cat]) return
        const key = e.label ?? e.material ?? 'Desconocido'
        counts[cat][key] = (counts[cat][key] ?? 0) + 1
      })
    })
    return counts
  }, [sessions])

  const hasAny = Object.values(data).some(c => Object.keys(c).length > 0)
  if (!hasAny) return (
    <div style={{
      padding: '4px 0 0', fontSize: '0.58rem', letterSpacing: '0.04em',
      color: 'rgba(244,241,234,0.45)', lineHeight: 1.5,
    }}>
      Sin selecciones todavía.
      <span style={{
        display: 'block', marginTop: 3,
        fontSize: '0.5rem', color: 'rgba(244,241,234,0.3)',
        letterSpacing: '0.06em',
      }}>
        Aparecerán cuando los visitantes usen el configurador.
      </span>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {Object.entries(MAT_CATS).map(([cat, cfg]) => {
        const items = Object.entries(data[cat])
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)

        return (
          <div key={cat}>
            <div style={{
              fontSize: '0.48rem', letterSpacing: '0.16em',
              color: cfg.color, marginBottom: 10,
              opacity: 0.85,
            }}>
              {cfg.label}
            </div>
            {items.length === 0 ? (
              <div style={{ fontSize: '0.55rem', color: 'rgba(244,241,234,0.2)' }}>—</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map((item, i) => {
                  const maxCount = items[0].count
                  return (
                    <div key={item.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: '0.55rem', color: 'rgba(244,241,234,0.65)' }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: '0.55rem', color: cfg.color, opacity: 0.85 }}>
                          {item.count}
                        </span>
                      </div>
                      <div style={{ height: 3, background: 'rgba(184,152,72,0.08)' }}>
                        <div style={{
                          height: '100%',
                          width: `${(item.count / maxCount) * 100}%`,
                          background: cfg.color,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── 4. SALAS E IMÁGENES MÁS VISTAS ──────────────────────── */
const ROOM_LABELS = {
  salon:      'Salón',
  cocina:     'Cocina',
  dormitorio: 'Dormitorio',
  bano:       'Baño',
  terraza:    'Terraza',
}

function RoomsAndGallery({ sessions }) {
  const rooms = useMemo(() => {
    const counts = {}
    sessions.forEach(s => {
      const trail = Array.isArray(s.trail) ? s.trail : []
      trail.filter(e => e.type === 'room_view').forEach(e => {
        const key = ROOM_LABELS[e.room] ?? e.room ?? 'Desconocida'
        counts[key] = (counts[key] ?? 0) + 1
      })
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [sessions])

  const images = useMemo(() => {
    const counts = {}
    sessions.forEach(s => {
      const trail = Array.isArray(s.trail) ? s.trail : []
      trail.filter(e => e.type === 'gallery_open').forEach(e => {
        const key = e.image ?? `Imagen ${e.index ?? 0}`
        counts[key] = (counts[key] ?? 0) + 1
      })
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [sessions])

  const hasRooms  = rooms.length > 0
  const hasImages = images.length > 0

  if (!hasRooms && !hasImages) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: hasRooms && hasImages ? '1fr 1fr' : '1fr', gap: 14 }}>
      {hasRooms && (
        <ChartCard title="SALAS MÁS VISTAS EN CONFIGURADOR">
          <ResponsiveContainer width="100%" height={Math.max(120, rooms.length * 30)}>
            <BarChart data={rooms} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" stroke={TEXT_DIM} tick={{ fontSize: 10, fill: TEXT_DIM }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke={TEXT_DIM} tick={{ fontSize: 10, fill: TEXT_DIM }} tickLine={false} axisLine={false} width={80} />
              <Tooltip {...tooltipProps} cursor={{ fill: ACCENT_LOW }} />
              <Bar dataKey="count">
                {rooms.map((_, i) => (
                  <Cell key={i} fill={`rgba(184,152,72,${0.85 - i * 0.12})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {hasImages && (
        <ChartCard title="IMÁGENES MÁS ABIERTAS EN GALERÍA">
          <ResponsiveContainer width="100%" height={Math.max(120, images.length * 28)}>
            <BarChart data={images} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" stroke={TEXT_DIM} tick={{ fontSize: 10, fill: TEXT_DIM }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke={TEXT_DIM} tick={{ fontSize: 10, fill: TEXT_DIM }} tickLine={false} axisLine={false} width={110} />
              <Tooltip {...tooltipProps} cursor={{ fill: ACCENT_LOW }} />
              <Bar dataKey="count">
                {images.map((_, i) => (
                  <Cell key={i} fill={`rgba(140,180,255,${0.75 - i * 0.06})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}

/* ── 5. SEGMENTOS DE SESIÓN ──────────────────────────────── */
// Cada sesión es una visita, no un usuario. Un mismo usuario
// puede sumar varias sesiones a lo largo de distintas visitas.
const SEGMENT_META = [
  {
    key:   'curiosos',
    label: 'CURIOSAS',
    color: 'rgba(244,241,234,0.55)',
    copy:  'Llegaron, miraron algo y se fueron.',
  },
  {
    key:   'exploradores',
    label: 'EXPLORATORIAS',
    color: COLD,
    copy:  'Abrieron fichas de vivienda y dedicaron tiempo.',
  },
  {
    key:   'calientes',
    label: 'CALIENTES',
    color: ACCENT,
    copy:  'Compararon, configuraron o llegaron a decisión.',
  },
]

function BehaviorSegments({ sessions }) {
  const seg = useMemo(() => computeSegments(sessions), [sessions])
  if (seg.total === 0) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 12,
    }}>
      {SEGMENT_META.map(s => {
        const count = seg[s.key]
        const pct   = seg.total > 0 ? Math.round((count / seg.total) * 100) : 0
        return (
          <div key={s.key} style={{
            padding: '14px 16px',
            border: '1px solid rgba(184,152,72,0.1)',
            background: 'rgba(184,152,72,0.02)',
          }}>
            <div style={{
              fontSize: '0.5rem', letterSpacing: '0.18em',
              color: s.color, marginBottom: 10, opacity: 0.9,
            }}>
              {s.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
              <span style={{
                fontSize: '1.4rem', fontWeight: 300,
                color: 'rgba(244,241,234,0.9)', letterSpacing: '-0.01em',
              }}>
                {count}
              </span>
              <span style={{
                fontSize: '0.58rem', letterSpacing: '0.08em',
                color: 'rgba(244,241,234,0.4)',
              }}>
                {pct}%
              </span>
            </div>
            <div style={{
              fontSize: '0.55rem', letterSpacing: '0.04em',
              color: 'rgba(244,241,234,0.5)', lineHeight: 1.5,
            }}>
              {s.copy}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── 6. PUNTOS DE FRICCIÓN ─────────────────────────────────── */
function FrictionPoints({ sessions }) {
  const funnel = useMemo(() => {
    const total = sessions.length
    return FUNNEL_STEPS.map(step => {
      const count = sessions.filter(s => {
        const t = Array.isArray(s.trail) ? s.trail : []
        return step.check(t, s)
      }).length
      return { label: step.label.toUpperCase(), count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }
    }).map((item, i, arr) => ({
      ...item,
      drop: i > 0 && arr[i - 1].count > 0
        ? Math.round((1 - item.count / arr[i - 1].count) * 100)
        : null,
    }))
  }, [sessions])

  const points    = useMemo(() => computeFrictionPoints(funnel), [funnel])
  const deadEnds  = useMemo(() => computeExplorationDeadEnds(sessions), [sessions])

  const hasPoints    = points.length > 0
  const hasDeadEnds  = deadEnds.length > 0

  if (!hasPoints && !hasDeadEnds) {
    return (
      <div style={{
        padding: '14px 4px', fontSize: '0.6rem', letterSpacing: '0.04em',
        color: 'rgba(244,241,234,0.4)', lineHeight: 1.6,
      }}>
        Aún no hay caídas relevantes en el recorrido.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {hasPoints && (
        <div>
          <div style={{
            fontSize: '0.46rem', letterSpacing: '0.2em',
            color: 'rgba(210,90,90,0.7)', marginBottom: 8,
          }}>
            FUGAS DEL RECORRIDO
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {points.map((p, i) => (
              <div key={`${p.from}-${p.to}`} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                background: i === 0 ? 'rgba(210,90,90,0.05)' : 'rgba(184,152,72,0.02)',
                border: `1px solid ${i === 0 ? 'rgba(210,90,90,0.2)' : 'rgba(184,152,72,0.08)'}`,
              }}>
                <div style={{
                  width: 22, height: 22, flexShrink: 0,
                  border: `1px solid ${i === 0 ? RED : 'rgba(184,152,72,0.25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.55rem', letterSpacing: '0.04em',
                  color: i === 0 ? RED : 'rgba(244,241,234,0.55)',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.58rem', letterSpacing: '0.04em',
                    color: 'rgba(244,241,234,0.75)', lineHeight: 1.5,
                  }}>
                    <span style={{ color: 'rgba(244,241,234,0.5)' }}>{p.from.toLowerCase()}</span>
                    {' → '}
                    <span>{p.to.toLowerCase()}</span>
                  </div>
                  <div style={{
                    fontSize: '0.5rem', letterSpacing: '0.08em',
                    color: 'rgba(244,241,234,0.35)', marginTop: 3,
                  }}>
                    {p.fromCount} → {p.toCount}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.72rem', fontWeight: 400,
                  color: i === 0 ? RED : 'rgba(210,90,90,0.6)',
                  letterSpacing: '-0.01em', flexShrink: 0,
                }}>
                  −{p.drop}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasDeadEnds && (
        <div>
          <div style={{
            fontSize: '0.46rem', letterSpacing: '0.2em',
            color: 'rgba(255,180,60,0.75)', marginBottom: 8,
          }}>
            INTERÉS SIN CIERRE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {deadEnds.map(d => (
              <div key={d.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                background: 'rgba(255,180,60,0.04)',
                border: '1px solid rgba(255,180,60,0.18)',
              }}>
                <div style={{
                  flex: 1,
                  fontSize: '0.58rem', letterSpacing: '0.04em',
                  color: 'rgba(244,241,234,0.75)', lineHeight: 1.5,
                }}>
                  {d.label}
                </div>
                <div style={{
                  fontSize: '0.72rem', fontWeight: 400,
                  color: 'rgba(255,180,60,0.85)',
                  letterSpacing: '-0.01em', flexShrink: 0,
                }}>
                  {d.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 7. SESIONES · 30 DÍAS ────────────────────────────────── */
function shortDate(d) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
function SessionsTrend({ sessions }) {
  const data = useMemo(() => {
    const now = new Date()
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
      days.push(d)
    }
    return days.map(d => {
      const s = d.getTime(), e = s + 86400000
      const count = sessions.filter(x => {
        const t = new Date(x.started_at ?? x.updated_at).getTime()
        return t >= s && t < e
      }).length
      return { date: shortDate(d), count }
    })
  }, [sessions])

  const hasAny = data.some(d => d.count > 0)
  if (!hasAny) return null

  return (
    <ChartCard title="SESIONES · 30 DÍAS">
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" stroke={TEXT_DIM} tick={{ fontSize: 10, fill: TEXT_DIM }} tickLine={false}
            axisLine={{ stroke: GRID }} interval={Math.max(0, Math.floor(data.length / 6) - 1)} />
          <YAxis stroke={TEXT_DIM} tick={{ fontSize: 10, fill: TEXT_DIM }} tickLine={false}
            axisLine={false} width={22} allowDecimals={false} />
          <Tooltip {...tooltipProps} cursor={{ stroke: 'rgba(184,152,72,0.3)', strokeDasharray: '3 3' }} />
          <Line type="monotone" dataKey="count" stroke={COLD} strokeWidth={1.5}
            dot={false} activeDot={{ r: 3, fill: COLD, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* ── 8. ACCIONES DE EXPLORACIÓN (laterales, no lineales) ─── */
const EXPLORATION_META = [
  {
    key:   'compared',
    label: 'COMPARARON',
    color: COLD,
    copy:  'Sesiones que usaron el comparador.',
  },
  {
    key:   'configured',
    label: 'ENTRARON AL CONFIGURADOR',
    color: ACCENT,
    copy:  'Sesiones que abrieron el configurador 3D.',
  },
  {
    key:   'returning',
    label: 'SESIONES RECURRENTES',
    color: 'rgba(255,180,60,0.8)',
    copy:  'Sesiones de visitantes que han vuelto.',
  },
]

function ExplorationActions({ sessions }) {
  const data = useMemo(() => computeExplorationActions(sessions), [sessions])
  if (data.total === 0) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
      {EXPLORATION_META.map(s => {
        const count = data[s.key]
        const pct   = data.total > 0 ? Math.round((count / data.total) * 100) : 0
        return (
          <div key={s.key} style={{
            padding: '14px 16px',
            border: '1px solid rgba(184,152,72,0.1)',
            background: 'rgba(184,152,72,0.02)',
          }}>
            <div style={{
              fontSize: '0.5rem', letterSpacing: '0.18em',
              color: s.color, marginBottom: 10, opacity: 0.9,
            }}>
              {s.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
              <span style={{
                fontSize: '1.4rem', fontWeight: 300,
                color: 'rgba(244,241,234,0.9)', letterSpacing: '-0.01em',
              }}>
                {count}
              </span>
              <span style={{
                fontSize: '0.58rem', letterSpacing: '0.08em',
                color: 'rgba(244,241,234,0.4)',
              }}>
                {pct}%
              </span>
            </div>
            <div style={{
              fontSize: '0.55rem', letterSpacing: '0.04em',
              color: 'rgba(244,241,234,0.5)', lineHeight: 1.5,
            }}>
              {s.copy}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Export ─────────────────────────────────────────────────── */
export default function ActivityCharts({ sessions, mob }) {
  if (sessions.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24, minWidth: 0, overflow: 'hidden' }}>

      {/* Tendencia 30 días */}
      <SessionsTrend sessions={sessions} />

      {/* Funnel + Tiempo */}
      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 14 }}>
        <ChartCard title="EMBUDO COMERCIAL">
          <FunnelChart sessions={sessions} />
        </ChartCard>
        <ChartCard title="ATENCIÓN MEDIA POR PÁGINA">
          <TimePerPage sessions={sessions} />
        </ChartCard>
      </div>

      {/* Segmentos + Fricción */}
      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1.2fr 1fr', gap: 14 }}>
        <ChartCard title="SEGMENTOS DE SESIÓN">
          <BehaviorSegments sessions={sessions} />
        </ChartCard>
        <ChartCard title="PUNTOS DE FRICCIÓN">
          <FrictionPoints sessions={sessions} />
        </ChartCard>
      </div>

      {/* Exploración + Materiales */}
      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1.2fr 1fr', gap: 14 }}>
        <ChartCard title="ACCIONES DE EXPLORACIÓN">
          <ExplorationActions sessions={sessions} />
        </ChartCard>
        <ChartCard title="MATERIALES ELEGIDOS EN CONFIGURADOR">
          <MaterialsChart sessions={sessions} />
        </ChartCard>
      </div>

      {/* Salas + Galería */}
      <RoomsAndGallery sessions={sessions} />

    </div>
  )
}
