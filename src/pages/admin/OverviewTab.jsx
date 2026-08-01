import { useMemo } from 'react'
import {
  computeFunnel, computeUnitScores, computeSourceDepth,
  runRules, generateReading, unitReasonText,
  computeOpportunitySignal, computeBestSource,
  computeBiggestDropoff, computeRecommendedAction,
} from './insights'

// ─── Design tokens ───────────────────────────────────────────
const ACCENT     = '#B89848'
const COLD       = 'rgba(140,180,255,0.65)'
const GREEN      = 'rgba(91,168,120,0.85)'
const RED        = 'rgba(210,90,90,0.85)'
const AMBER      = 'rgba(255,180,60,0.8)'

// ─── Base card wrappers ──────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      padding: '16px 18px',
      border: '1px solid rgba(184,152,72,0.1)',
      background: 'rgba(184,152,72,0.02)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '0.48rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.6)', marginBottom: 14 }}>
      {children}
    </div>
  )
}

// ─── Executive highlight card ────────────────────────────────
function HighlightCard({ label, value, sub, accent, emptyText, prominent }) {
  const isEmpty = !value && !sub
  const borderAlpha  = prominent ? '55' : '33'
  const bgAlpha      = prominent ? '14' : '0D'
  return (
    <Card style={{
      borderColor: accent ? `${accent}${borderAlpha}` : 'rgba(184,152,72,0.1)',
      background: accent ? `${accent}${bgAlpha}` : 'rgba(184,152,72,0.02)',
      display: 'flex', flexDirection: 'column', gap: 8,
      ...(prominent ? { borderWidth: '1px', outline: `1px solid ${accent}22`, outlineOffset: -4 } : {}),
    }}>
      <div style={{ fontSize: '0.48rem', letterSpacing: '0.18em', color: accent ?? 'rgba(184,152,72,0.6)' }}>
        {label}
      </div>
      {isEmpty ? (
        <div style={{ fontSize: '0.62rem', color: 'rgba(244,241,234,0.3)', lineHeight: 1.55 }}>
          {emptyText ?? 'Sin datos suficientes aún.'}
        </div>
      ) : (
        <>
          {value && (
            <div style={{
              fontSize: prominent ? '0.82rem' : '1.2rem',
              fontWeight: 400,
              color: 'rgba(244,241,234,0.95)',
              letterSpacing: '-0.005em',
              lineHeight: prominent ? 1.45 : 1.15,
            }}>
              {value}
            </div>
          )}
          {sub && (
            <div style={{
              fontSize: value ? '0.58rem' : '0.82rem',
              color: value ? 'rgba(244,241,234,0.6)' : 'rgba(244,241,234,0.95)',
              lineHeight: value ? 1.55 : 1.5,
              fontWeight: value ? 400 : 400,
              letterSpacing: value ? '0.01em' : '-0.005em',
            }}>
              {sub}
            </div>
          )}
        </>
      )}
    </Card>
  )
}

// ─── Biggest drop card value (transition + pct secondary) ───
function DropoffValue({ transition, pct }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        fontSize: '0.95rem', fontWeight: 400,
        color: 'rgba(244,241,234,0.95)',
        letterSpacing: '-0.005em', lineHeight: 1.2,
      }}>
        {transition}
      </div>
      <div style={{ fontSize: '0.55rem', letterSpacing: '0.08em', color: RED }}>
        −{pct}% de pérdida
      </div>
    </div>
  )
}

// ─── Reading of the week ─────────────────────────────────────
function ReadingPanel({ reading }) {
  const blocks = [
    { label: 'Qué está pasando',  text: reading.quePasa,      color: 'rgba(244,241,234,0.82)' },
    { label: 'Qué significa',     text: reading.queSignifica, color: 'rgba(184,152,72,0.9)'   },
    { label: 'Qué harías ahora',  text: reading.queHarias,    color: GREEN                    },
  ]
  return (
    <Card>
      <SectionLabel>LECTURA DE LA SEMANA</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
        {blocks.map((b, i) => (
          <div key={b.label} style={{
            paddingLeft: i > 0 ? 20 : 0,
            paddingRight: i < blocks.length - 1 ? 20 : 0,
            borderLeft: i > 0 ? '1px solid rgba(184,152,72,0.12)' : 'none',
          }}>
            <div style={{ fontSize: '0.48rem', letterSpacing: '0.16em', color: 'rgba(184,152,72,0.6)', marginBottom: 10 }}>
              {b.label.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.7rem', color: b.color, lineHeight: 1.7 }}>
              {b.text}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Unit interest ranking ───────────────────────────────────
function UnitRanking({ unitScores }) {
  const top = unitScores.slice(0, 5)
  const maxScore = top[0]?.score ?? 1
  return (
    <Card>
      <SectionLabel>RANKING DE INTERÉS POR VIVIENDA</SectionLabel>
      {top.length === 0 ? (
        <div style={{ fontSize: '0.62rem', color: 'rgba(244,241,234,0.3)', padding: '14px 0' }}>
          Sin datos de navegación por vivienda todavía.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {top.map((u, i) => (
            <div key={u.unitId} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                fontSize: '0.52rem', color: 'rgba(184,152,72,0.45)',
                width: 14, flexShrink: 0, textAlign: 'right',
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontSize: '0.78rem', fontWeight: i === 0 ? 500 : 400,
                    color: i === 0 ? 'rgba(244,241,234,0.95)' : 'rgba(244,241,234,0.8)',
                    letterSpacing: '0.02em',
                  }}>
                    Vivienda {u.unitId}
                  </span>
                  <span style={{
                    fontSize: '0.58rem', color: 'rgba(244,241,234,0.5)',
                    letterSpacing: '0.02em', lineHeight: 1.45,
                  }}>
                    {unitReasonText(u)}
                  </span>
                </div>
                <div style={{ height: 3, background: 'rgba(184,152,72,0.08)' }}>
                  <div style={{
                    height: '100%',
                    width: `${(u.score / maxScore) * 100}%`,
                    background: i === 0 ? ACCENT : `rgba(184,152,72,${0.55 - i * 0.08})`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
              <div style={{
                fontSize: '0.72rem', fontWeight: 400,
                color: i === 0 ? ACCENT : 'rgba(184,152,72,0.7)',
                letterSpacing: '-0.005em',
                flexShrink: 0, width: 28, textAlign: 'right',
              }}>
                {u.score}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ─── Compact funnel ───────────────────────────────────────────
function CompactFunnel({ funnel, dropoff }) {
  const biggestDropIdx = dropoff
    ? funnel.findIndex(f => f.label === dropoff.label)
    : -1
  const max = funnel[0]?.count ?? 1

  return (
    <Card>
      <SectionLabel>EMBUDO EJECUTIVO</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {funnel.map((step, i) => {
          const isWeak = i === biggestDropIdx
          const isGood = step.drop != null && step.drop < 20
          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                fontSize: '0.52rem', color: isWeak ? RED : 'rgba(244,241,234,0.45)',
                width: 124, flexShrink: 0, letterSpacing: '0.04em',
              }}>
                {step.label}
              </div>
              <div style={{ flex: 1, height: 14, background: 'rgba(184,152,72,0.06)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: max > 0 ? `${(step.count / max) * 100}%` : '0%',
                  background: isWeak
                    ? 'rgba(210,90,90,0.4)'
                    : i === 0 ? ACCENT : `rgba(184,152,72,${0.6 - i * 0.07})`,
                  transition: 'width 0.5s ease',
                }} />
                <span style={{
                  position: 'absolute', left: 8, top: 0, bottom: 0,
                  display: 'flex', alignItems: 'center',
                  fontSize: '0.52rem', color: 'rgba(244,241,234,0.85)',
                }}>
                  {step.count} · {step.pct}%
                </span>
              </div>
              {step.drop != null && (
                <div style={{
                  width: 38, textAlign: 'right', flexShrink: 0,
                  fontSize: '0.5rem',
                  color: isWeak ? RED : isGood ? GREEN : 'rgba(244,241,234,0.3)',
                }}>
                  {step.drop > 0 ? `−${step.drop}%` : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {dropoff && (
        <div style={{
          marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(184,152,72,0.12)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ fontSize: '0.46rem', letterSpacing: '0.16em', color: RED }}>
            PRINCIPAL FUGA
          </div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(244,241,234,0.85)', letterSpacing: '0.02em', lineHeight: 1.5 }}>
            {dropoff.transition} · {dropoff.sub}
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── Main component ───────────────────────────────────────────
export default function OverviewTab({ leads, sessions, mob }) {

  const funnel       = useMemo(() => computeFunnel(sessions, leads),                                    [sessions, leads])
  const unitScores   = useMemo(() => computeUnitScores(sessions, leads),                                 [sessions, leads])
  const sourceDepth  = useMemo(() => computeSourceDepth(sessions),                                       [sessions])
  const rules        = useMemo(() => runRules({ sessions, leads, funnel, unitScores, sourceDepth }),     [sessions, leads, funnel, unitScores, sourceDepth])
  const reading      = useMemo(() => generateReading({ sessions, leads, funnel }),                       [sessions, leads, funnel])
  const opportunity  = useMemo(() => computeOpportunitySignal(sessions, leads, funnel),                  [sessions, leads, funnel])
  const bestSource   = useMemo(() => computeBestSource(sourceDepth),                                     [sourceDepth])
  const dropoff      = useMemo(() => computeBiggestDropoff(funnel),                                      [funnel])
  const action       = useMemo(() => computeRecommendedAction(rules),                                    [rules])

  const topUnit = unitScores[0]

  const pad = mob ? '16px 16px 0' : '24px 40px 0'

  return (
    <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── 5 executive cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: mob ? '1fr' : 'repeat(5, 1fr)',
        gap: 10,
      }}>
        <HighlightCard
          label="UNIDAD MÁS CALIENTE"
          value={topUnit ? `Vivienda ${topUnit.unitId}` : null}
          sub={topUnit ? unitReasonText(topUnit) : null}
          accent={ACCENT}
          emptyText="Sin datos de navegación por viviendas todavía."
        />
        <HighlightCard
          label="MAYOR FUGA"
          value={dropoff ? <DropoffValue transition={dropoff.transition} pct={dropoff.pct} /> : null}
          sub={dropoff?.sub ?? null}
          accent={RED}
          emptyText="Sin suficiente tráfico para detectar fugas."
        />
        <HighlightCard
          label="SEÑAL DE OPORTUNIDAD"
          value={opportunity?.value ?? null}
          sub={opportunity?.sub ?? null}
          accent={AMBER}
          emptyText="Aún no hay suficiente actividad para detectar señales."
        />
        <HighlightCard
          label="FUENTE MÁS VALIOSA"
          value={bestSource?.value ?? null}
          sub={bestSource?.sub ?? null}
          accent={COLD}
          emptyText="Aún no hay datos de fuentes de tráfico."
        />
        <HighlightCard
          label="ACCIÓN RECOMENDADA"
          sub={action?.action ?? null}
          accent={GREEN}
          prominent
          emptyText="Sin actividad suficiente para recomendar una acción concreta."
        />
      </div>

      {/* ── Reading of the week ── */}
      {mob ? (
        <Card>
          <SectionLabel>LECTURA DE LA SEMANA</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'QUÉ ESTÁ PASANDO', text: reading.quePasa,      color: 'rgba(244,241,234,0.82)' },
              { label: 'QUÉ SIGNIFICA',    text: reading.queSignifica, color: 'rgba(184,152,72,0.9)'   },
              { label: 'QUÉ HARÍAS AHORA', text: reading.queHarias,    color: GREEN                    },
            ].map(b => (
              <div key={b.label}>
                <div style={{ fontSize: '0.46rem', letterSpacing: '0.14em', color: 'rgba(184,152,72,0.6)', marginBottom: 6 }}>{b.label}</div>
                <div style={{ fontSize: '0.68rem', color: b.color, lineHeight: 1.65 }}>{b.text}</div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <ReadingPanel reading={reading} />
      )}

      {/* ── Ranking + Funnel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 14 }}>
        <UnitRanking unitScores={unitScores} />
        <CompactFunnel funnel={funnel} dropoff={dropoff} />
      </div>

    </div>
  )
}
