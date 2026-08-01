import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const ACCENT    = '#B89848'
const HOT_COLOR = 'rgba(255,140,0,0.85)'
const COLD_COLOR= 'rgba(140,180,255,0.65)'
const GRID      = 'rgba(184,152,72,0.06)'
const TEXT_DIM  = 'rgba(244,241,234,0.4)'
const ACCENT_LOW= 'rgba(184,152,72,0.08)'

function shortDate(d) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
function lastNDays(n) {
  const arr = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0,0,0,0)
    arr.push(d)
  }
  return arr
}

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
      ...style,
    }}>
      <div style={{
        fontSize: '0.48rem', letterSpacing: '0.2em',
        color: 'rgba(184,152,72,0.6)', marginBottom: 14,
      }}>{title}</div>
      {children}
    </div>
  )
}

/* ── 1. Donut hot/cold ──────────────────────────────────── */
function HotColdDonut({ hot, cold }) {
  const total = hot + cold
  const data = [
    { name: 'CALIENTES', value: hot,  color: HOT_COLOR  },
    { name: 'FRÍOS',     value: cold, color: COLD_COLOR },
  ]

  return (
    <ChartCard title="TEMPERATURA DE LEADS">
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={total > 0 ? data : [{ name: '—', value: 1, color: 'rgba(184,152,72,0.1)' }]}
                cx="50%" cy="50%"
                innerRadius={36} outerRadius={52}
                strokeWidth={0} paddingAngle={total > 0 ? 2 : 0}
                dataKey="value"
              >
                {(total > 0 ? data : [{ color: 'rgba(184,152,72,0.1)' }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipProps.contentStyle}
                labelStyle={tooltipProps.labelStyle}
                itemStyle={tooltipProps.itemStyle}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: '1.3rem', color: 'rgba(244,241,234,0.95)', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.01em' }}>{total}</span>
            <span style={{ fontSize: '0.45rem', letterSpacing: '0.14em', color: 'rgba(184,152,72,0.55)', marginTop: 3 }}>TOTAL</span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { color: HOT_COLOR,  label: 'CALIENTES', value: hot,  pct: total > 0 ? Math.round(hot/total*100) : 0 },
            { color: COLD_COLOR, label: 'FRÍOS',     value: cold, pct: total > 0 ? Math.round(cold/total*100): 0 },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.55rem', color: item.color, letterSpacing: '0.1em' }}>{item.label}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.1rem', color: 'rgba(244,241,234,0.92)', fontWeight: 400, letterSpacing: '-0.005em' }}>{item.value}</span>
                  <span style={{ fontSize: '0.5rem', color: 'rgba(244,241,234,0.4)', letterSpacing: '0.06em' }}>{item.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  )
}

/* ── 2. Leads últimos 14 días ───────────────────────────── */
function LeadsTrend({ leads }) {
  const data = useMemo(() => {
    const dates = lastNDays(14)
    return dates.map(d => {
      const dayStart = d.getTime()
      const dayEnd   = dayStart + 86400000
      const count = leads.filter(l => {
        const t = new Date(l.created_at).getTime()
        return t >= dayStart && t < dayEnd
      }).length
      return { date: shortDate(d), count }
    })
  }, [leads])

  return (
    <ChartCard title="LEADS · ÚLTIMOS 14 DÍAS">
      <ResponsiveContainer width="100%" height={156}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="date"
            stroke={TEXT_DIM}
            tick={{ fontSize: 10, fill: TEXT_DIM }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            interval={3}
          />
          <YAxis
            stroke={TEXT_DIM}
            tick={{ fontSize: 10, fill: TEXT_DIM }}
            tickLine={false}
            axisLine={false}
            width={20}
            allowDecimals={false}
          />
          <Tooltip
            {...tooltipProps}
            cursor={{ fill: ACCENT_LOW }}
            formatter={v => [v, 'LEADS']}
          />
          <Bar dataKey="count" fill={ACCENT} radius={[1,1,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* ── 3. Fuente + unidad de interés ─────────────────────── */
function LeadsBreakdown({ leads }) {
  const sources = useMemo(() => {
    const counts = {}
    leads.forEach(l => {
      // Get referrer from trail device_info, or fall back to source_page
      const trail = Array.isArray(l.session_trail) ? l.session_trail : []
      const deviceInfo = trail.find(e => e.type === 'device_info')
      const src = (deviceInfo?.referrer ?? l.source_page ?? 'directo').toUpperCase()
      counts[src] = (counts[src] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [leads])

  const unitInterest = useMemo(() => {
    const counts = {}
    leads.forEach(l => {
      const trail = Array.isArray(l.session_trail) ? l.session_trail : []
      // Find visited unit pages in trail
      const unitViews = trail
        .filter(e => e.type === 'page_view' && e.page?.startsWith('/availability/'))
        .map(e => e.page.replace('/availability/', '').toUpperCase())
      const visited = [...new Set(unitViews)]
      // Also include primary_unit_id
      const direct = l.primary_unit_id ?? l.unit_ids?.[0]
      if (direct) visited.push(String(direct).toUpperCase())
      const deduped = [...new Set(visited)]
      deduped.forEach(u => { counts[u] = (counts[u] || 0) + 1 })
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [leads])

  const hasUnits = unitInterest.length > 0
  const displayData  = hasUnits ? unitInterest : sources
  const displayTitle = hasUnits ? 'VIVIENDAS MÁS VISTAS' : 'LEADS POR FUENTE'
  const fillColor    = hasUnits ? ACCENT : 'rgba(140,180,255,0.65)'

  return (
    <ChartCard title={displayTitle}>
      {displayData.length === 0 ? (
        <div style={{
          height: 156, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(244,241,234,0.2)', fontSize: '0.6rem', letterSpacing: '0.1em',
        }}>SIN DATOS AÚN</div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(156, displayData.length * 32)}>
          <BarChart
            data={displayData}
            layout="vertical"
            margin={{ top: 4, right: 24, bottom: 4, left: 0 }}
          >
            <CartesianGrid stroke={GRID} horizontal={false} />
            <XAxis type="number" stroke={TEXT_DIM} tick={{ fontSize: 10, fill: TEXT_DIM }} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="name" stroke={TEXT_DIM} tick={{ fontSize: 10, fill: TEXT_DIM }} tickLine={false} axisLine={false} width={80} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="count" fill={fillColor} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

/* ── Export ─────────────────────────────────────────────── */
export default function LeadsCharts({ leads, mob }) {
  const hot  = leads.filter(l => l.lead_temperature === 'hot').length
  const cold = leads.length - hot

  if (leads.length === 0) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: mob ? '1fr' : '1fr 1fr 1fr',
      gap: 14,
      marginBottom: 24,
    }}>
      <HotColdDonut hot={hot} cold={cold} />
      <LeadsTrend leads={leads} />
      <LeadsBreakdown leads={leads} />
    </div>
  )
}
