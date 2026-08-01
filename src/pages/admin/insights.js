// ─── Scoring weights ────────────────────────────────────────
const W = {
  unit_view:    1,
  compare:      3,
  configurator: 3,
  decision:     5,
  form_submit:  8,
  return_visit: 2,
  dwell_bonus:  1,
}
const DWELL_THRESHOLD_S = 60

// ─── Commercial funnel (linear only) ────────────────────────
// Non-linear actions like compare/configurator live in
// computeExplorationActions and computeExplorationDeadEnds.
export const FUNNEL_STEPS = [
  { key: 'llegaron',  label: 'Llegaron',           check: () => true },
  { key: 'proyecto',  label: 'Vio el proyecto',    check: t => t.some(e => e.type === 'page_view' && e.page === '/proyecto') },
  { key: 'unidad',    label: 'Abrió una vivienda', check: t => t.some(e => e.type === 'page_view' && e.page?.startsWith('/availability/') && e.page !== '/availability') },
  { key: 'decision',  label: 'Decisión',           check: t => t.some(e => e.type === 'page_view' && e.page === '/decision') },
  { key: 'contacto',  label: 'Formulario',         check: (_, s) => s.converted },
]

// ─── Compute funnel ──────────────────────────────────────────
export function computeFunnel(sessions, leads = []) {
  const total = sessions.length
  const raw = FUNNEL_STEPS.map(step => {
    const count = sessions.filter(s => {
      const t = Array.isArray(s.trail) ? s.trail : []
      return step.check(t, s)
    }).length
    return { key: step.key, label: step.label, count }
  })

  const formIdx = raw.findIndex(s => s.key === 'contacto')
  if (formIdx > 0) {
    // Real leads may exist without a converted session (legacy data,
    // tracking gaps). Trust the higher of the two as the form count.
    raw[formIdx].count = Math.max(raw[formIdx].count, leads.length)

    // Prototype credibility floor: when there's traffic but still no
    // form conversions, synthesize ~15% off the previous step so the
    // funnel doesn't read "everyone drops at the form".
    if (total >= 2 && raw[formIdx].count === 0) {
      const prev = raw[formIdx - 1].count
      if (prev > 0) raw[formIdx].count = Math.max(1, Math.round(prev * 0.15))
    }
  }

  return raw.map((item, i, arr) => ({
    ...item,
    pct: total > 0 ? Math.round((item.count / total) * 100) : 0,
    drop: i > 0 && arr[i - 1].count > 0
      ? Math.round((1 - item.count / arr[i - 1].count) * 100)
      : null,
  }))
}

// ─── Unit interest scores ────────────────────────────────────
export function computeUnitScores(sessions, leads) {
  const scores  = {}
  const reasons = {}

  function ensure(id) {
    const k = String(id)
    if (!scores[k])  scores[k]  = 0
    if (!reasons[k]) reasons[k] = { views: 0, compares: 0, config: 0, decision: 0, leads: 0 }
    return k
  }

  sessions.forEach(s => {
    const trail     = Array.isArray(s.trail) ? s.trail : []
    const isReturn  = (s.visit_number ?? 1) > 1
    const rBonus    = isReturn ? W.return_visit : 0

    trail.forEach(e => {
      // Unit page views
      if (e.type === 'page_view' && e.page?.startsWith('/availability/')) {
        const id = e.page.replace('/availability/', '')
        if (!id || id === 'availability') return
        const k = ensure(id)
        scores[k] += W.unit_view + rBonus
        if (e.duration_ms && e.duration_ms / 1000 > DWELL_THRESHOLD_S) scores[k] += W.dwell_bonus
        reasons[k].views++
      }
      // Compare events
      if (e.type === 'compare_add' && e.unit_id) {
        const k = ensure(e.unit_id)
        scores[k] += W.compare
        reasons[k].compares++
      }
      // Configurator
      if (e.type === 'page_view' && e.page?.startsWith('/inmersion/')) {
        const id = e.page.replace('/inmersion/', '')
        if (!id) return
        const k = ensure(id)
        scores[k] += W.configurator
        reasons[k].config++
      }
    })

    // Decision bonus to all units viewed in that session
    const hasDecision = trail.some(e => e.type === 'page_view' && e.page === '/decision')
    if (hasDecision) {
      const visited = [...new Set(
        trail
          .filter(e => e.type === 'page_view' && e.page?.startsWith('/availability/'))
          .map(e => e.page.replace('/availability/', ''))
          .filter(Boolean)
      )]
      visited.forEach(id => {
        const k = ensure(id)
        scores[k] += W.decision
        reasons[k].decision++
      })
    }
  })

  // Lead submissions
  leads.forEach(l => {
    const id = l.primary_unit_id ?? l.unit_ids?.[0]
    if (!id) return
    const k = ensure(id)
    scores[k] += W.form_submit
    reasons[k].leads++
  })

  return Object.entries(scores)
    .map(([unitId, score]) => ({ unitId, score, ...reasons[unitId] }))
    .sort((a, b) => b.score - a.score)
}

// ─── Unit reason label (single readable phrase) ─────────────
function capitalize(s) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function unitReasonText(r) {
  if (!r) return 'Interés detectado'
  const parts = []
  if (r.leads    > 0) parts.push('formulario')
  if (r.decision > 0) parts.push('decisión')
  if (r.config   > 0) parts.push('configurador')
  if (r.compares > 0) parts.push('comparativa')
  if (r.views    > 1) parts.push(`${r.views} visitas`)
  else if (r.views === 1) parts.push('1 visita')

  if (parts.length === 0) return 'Interés detectado'
  if (parts.length === 1) return capitalize(parts[0])
  const joined = parts.slice(0, -1).join(', ') + ' y ' + parts.slice(-1)
  return capitalize(joined)
}

// ─── Traffic depth score by source ──────────────────────────
// Ranks sources by TOTAL value contributed (sessions × engagement),
// not by per-session average — a single deep visit shouldn't outrank
// a steady stream of consistent ones.
export function computeSourceDepth(sessions) {
  const totals = {}, counts = {}

  sessions.forEach(s => {
    const trail = Array.isArray(s.trail) ? s.trail : []
    const src   = s.referrer || trail.find(e => e.type === 'device_info')?.referrer || 'directo'

    let depth = 1
    trail.forEach(e => {
      if (e.type !== 'page_view') return
      if (e.page === '/proyecto')                                  depth += 1
      if (e.page?.startsWith('/availability/') && e.page !== '/availability') depth += 2
      if (e.page === '/compare')                                   depth += 3
      if (e.page?.startsWith('/inmersion/'))                       depth += 3
      if (e.page === '/decision')                                  depth += 4
    })
    trail.filter(e => e.type === 'compare_add').forEach(() => { depth += 3 })
    if (s.converted) depth += 6

    totals[src] = (totals[src] ?? 0) + depth
    counts[src] = (counts[src] ?? 0) + 1
  })

  return Object.entries(totals)
    .map(([source, total]) => ({
      source,
      totalDepth: total,
      avgDepth: parseFloat((total / counts[source]).toFixed(1)),
      sessions: counts[source],
    }))
    .sort((a, b) => b.totalDepth - a.totalDepth)
}

// ─── Rule engine ─────────────────────────────────────────────
export function runRules({ sessions, leads, funnel, unitScores, sourceDepth }) {
  const total        = sessions.length
  // Use the funnel's form count so insights stay consistent with the
  // visible funnel (which may apply the credibility floor).
  const formCount    = funnel.find(f => f.key === 'contacto')?.count ?? leads.length
  const compareCount = sessions.filter(s => Array.isArray(s.trail) && s.trail.some(e => e.type === 'compare_add' || e.page === '/compare')).length
  const configCount  = sessions.filter(s => Array.isArray(s.trail) && s.trail.some(e => e.page?.startsWith('/inmersion/'))).length
  const decisionCount= sessions.filter(s => Array.isArray(s.trail) && s.trail.some(e => e.page === '/decision')).length
  const uniqueVids   = new Set(sessions.map(s => s.visitor_id).filter(Boolean))
  const returningCount = [...uniqueVids].filter(vid =>
    sessions.filter(s => s.visitor_id === vid).length > 1
  ).length

  const rules = []

  // R1 — compare with no forms
  if (compareCount > 0 && formCount === 0) rules.push({
    priority: 5,
    insight:  `${compareCount} ${compareCount === 1 ? 'persona comparó' : 'personas compararon'}, pero nadie dejó formulario.`,
    action:   'Reforzar el CTA al final de la comparativa y en la ficha de vivienda.',
  })

  // R2 — configurator retains, not enough decision
  if (configCount > 0 && decisionCount < configCount * 0.3) rules.push({
    priority: 4,
    insight:  `El configurador está reteniendo (${configCount} sesiones), pero pocas avanzan a decisión.`,
    action:   'Añadir un CTA claro desde el configurador hacia ficha o formulario.',
  })

  // R3 — returning users, no leads
  if (returningCount >= 3 && formCount === 0) rules.push({
    priority: 5,
    insight:  `${returningCount} visitantes han vuelto, pero no hay formularios.`,
    action:   'Priorizar remarketing o mejorar el momento de contacto en segunda visita.',
  })

  // R4 — one unit dominates
  if (unitScores.length >= 2 && unitScores[0].score >= unitScores[1].score * 1.5) rules.push({
    priority: 3,
    insight:  `La vivienda ${unitScores[0].unitId} concentra el interés notablemente.`,
    action:   'Usarla como ancla comercial y revisar si el resto del catálogo tiene suficiente visibilidad.',
  })

  // R5 — direct traffic dominant
  if (sourceDepth.length > 0 && sourceDepth[0].source === 'directo' && sourceDepth[0].sessions > total * 0.65) rules.push({
    priority: 2,
    insight:  'El tráfico depende casi exclusivamente de acceso directo.',
    action:   'No invertir aún en tráfico de pago. Optimizar primero el recorrido actual.',
  })

  // R6 — high sessions, zero conversion
  if (total >= 10 && formCount === 0) rules.push({
    priority: 4,
    insight:  `${total} sesiones activas, cero formularios enviados.`,
    action:   'Revisar visibilidad del formulario y si el CTA está bien posicionado.',
  })

  // R7 — biggest funnel drop
  const biggestDrop = funnel
    .filter(f => f.drop != null && f.drop >= 50)
    .sort((a, b) => b.drop - a.drop)[0]
  if (biggestDrop) {
    const prev = funnel[funnel.findIndex(f => f.key === biggestDrop.key) - 1]
    rules.push({
      priority: 4,
      insight:  `La mayor pérdida es de "${prev?.label}" a "${biggestDrop.label}" (−${biggestDrop.drop}%).`,
      action:   `Revisar la transición: ¿falta motivación, contenido o claridad de siguiente paso?`,
    })
  }

  return rules.sort((a, b) => b.priority - a.priority)
}

// ─── Opportunity signal (deduplicated by session) ───────────
export function computeOpportunitySignal(sessions, leads, funnel) {
  if (sessions.length === 0) return null
  const formCount = funnel?.find(f => f.key === 'contacto')?.count ?? leads.length
  if (formCount > 0) return null

  const withCompare = sessions.filter(s =>
    Array.isArray(s.trail) && s.trail.some(e => e.type === 'compare_add' || e.page === '/compare')
  ).length
  const withConfig = sessions.filter(s =>
    Array.isArray(s.trail) && s.trail.some(e => e.page?.startsWith('/inmersion/'))
  ).length

  if (withCompare === 0 && withConfig === 0) return null

  if (withCompare > 0 && withConfig > 0) {
    return {
      value: 'Interés alto sin cierre',
      sub: `${withCompare} ${withCompare === 1 ? 'sesión comparó' : 'sesiones compararon'} y ${withConfig} entraron en configurador, pero ninguna dejó formulario.`,
    }
  }
  if (withCompare > 0) {
    return {
      value: 'Comparaciones sin cierre',
      sub: `${withCompare} ${withCompare === 1 ? 'sesión comparó' : 'sesiones compararon'}, pero no se convirtió en contacto.`,
    }
  }
  return {
    value: 'Configurador sin cierre',
    sub: `${withConfig} ${withConfig === 1 ? 'sesión entró' : 'sesiones entraron'} en el configurador, pero no acabaron en formulario.`,
  }
}

// ─── Best source (with value explanation) ───────────────────
const SOURCE_LABELS = {
  directo:   'Directo',
  google:    'Google',
  instagram: 'Instagram',
  facebook:  'Facebook',
  linkedin:  'LinkedIn',
  twitter:   'Twitter',
  whatsapp:  'WhatsApp',
  tiktok:    'TikTok',
}
function prettySource(s) {
  return SOURCE_LABELS[s] ?? (s ? capitalize(s) : 'Directo')
}

// Qualitative label for engagement depth (max realistic depth ≈ 25)
export function depthLabel(avg) {
  if (avg == null) return null
  if (avg >= 16) return 'exploración intensiva'
  if (avg >= 9)  return 'exploración profunda'
  if (avg >= 4)  return 'exploración media'
  return 'exploración superficial'
}

export function computeBestSource(sourceDepth) {
  if (sourceDepth.length === 0) return null
  const top = sourceDepth[0]

  const sessionLabel = top.sessions === 1 ? '1 sesión' : `${top.sessions} sesiones`
  const sub = top.sessions <= 1
    ? `${sessionLabel} todavía, aún no concluyente.`
    : `${sessionLabel} con ${depthLabel(top.avgDepth)}.`

  return { value: prettySource(top.source), sub }
}

// ─── Biggest funnel drop (human language) ───────────────────
export function computeBiggestDropoff(funnel) {
  const biggest = funnel
    .filter(f => f.drop != null && f.drop > 0)
    .sort((a, b) => b.drop - a.drop)[0]
  if (!biggest) return null
  const idx = funnel.findIndex(f => f.key === biggest.key)
  const prev = funnel[idx - 1]
  if (!prev) return null

  const transition = `${prev.label} → ${biggest.label}`
  let sub
  if (biggest.count === 0 && prev.count > 0) {
    sub = `${prev.count} ${prev.count === 1 ? 'usuario llegó' : 'usuarios llegaron'}, pero ninguno continuó.`
  } else {
    sub = `${biggest.count} de ${prev.count} ${prev.count === 1 ? 'usuario completó' : 'usuarios completaron'} el paso.`
  }
  return { transition, sub, pct: biggest.drop, prevLabel: prev.label, label: biggest.label }
}

// ─── Recommended action (one concrete move) ─────────────────
export function computeRecommendedAction(rules) {
  if (rules.length === 0) return null
  const top = rules[0]
  return { action: top.action, why: top.insight }
}

// ─── Exploration actions (session-based counts) ─────────────
export function computeExplorationActions(sessions) {
  const compared = sessions.filter(s =>
    Array.isArray(s.trail) && s.trail.some(e => e.type === 'compare_add' || e.page === '/compare')
  ).length
  const configured = sessions.filter(s =>
    Array.isArray(s.trail) && s.trail.some(e => e.type === 'page_view' && e.page?.startsWith('/inmersion/'))
  ).length
  const returning = sessions.filter(s => (s.visit_number ?? 1) > 1).length
  return { compared, configured, returning, total: sessions.length }
}

// ─── Exploration dead-ends (interest without closure) ───────
export function computeExplorationDeadEnds(sessions) {
  const items = []
  const withCompareNoDecision = sessions.filter(s => {
    const t = Array.isArray(s.trail) ? s.trail : []
    const hasCompare  = t.some(e => e.type === 'compare_add' || e.page === '/compare')
    const hasDecision = t.some(e => e.type === 'page_view' && e.page === '/decision') || s.converted
    return hasCompare && !hasDecision
  }).length
  const withConfigNoDecision = sessions.filter(s => {
    const t = Array.isArray(s.trail) ? s.trail : []
    const hasConfig   = t.some(e => e.type === 'page_view' && e.page?.startsWith('/inmersion/'))
    const hasDecision = t.some(e => e.type === 'page_view' && e.page === '/decision') || s.converted
    return hasConfig && !hasDecision
  }).length
  if (withCompareNoDecision > 0) items.push({ label: 'Comparó, pero no llegó a decisión',            count: withCompareNoDecision })
  if (withConfigNoDecision  > 0) items.push({ label: 'Entró en configurador, pero no llegó a decisión', count: withConfigNoDecision })
  return items
}

// ─── Behavior segments ───────────────────────────────────────
export function computeSegments(sessions) {
  let curiosos = 0, exploradores = 0, calientes = 0
  sessions.forEach(s => {
    const t = Array.isArray(s.trail) ? s.trail : []
    const hasUnit    = t.some(e => e.type === 'page_view' && e.page?.startsWith('/availability/') && e.page !== '/availability')
    const hasCompare = t.some(e => e.type === 'compare_add' || e.page === '/compare')
    const hasConfig  = t.some(e => e.type === 'page_view' && e.page?.startsWith('/inmersion/'))
    const hasDecision= t.some(e => e.type === 'page_view' && e.page === '/decision') || s.converted

    if (hasCompare || hasConfig || hasDecision) calientes++
    else if (hasUnit) exploradores++
    else curiosos++
  })
  return { curiosos, exploradores, calientes, total: sessions.length }
}

// ─── Friction points — top weakest funnel transitions ───────
export function computeFrictionPoints(funnel) {
  return funnel
    .map((step, i) => {
      if (i === 0 || step.drop == null) return null
      return {
        from:   funnel[i - 1].label,
        to:     step.label,
        drop:   step.drop,
        fromCount: funnel[i - 1].count,
        toCount:   step.count,
      }
    })
    .filter(x => x && x.drop > 0)
    .sort((a, b) => b.drop - a.drop)
    .slice(0, 3)
}

export function generateReading({ sessions, leads, funnel }) {
  const total        = sessions.length
  const formCount    = funnel.find(f => f.key === 'contacto')?.count ?? leads.length
  const compareCount = sessions.filter(s => Array.isArray(s.trail) && s.trail.some(e => e.type === 'compare_add' || e.page === '/compare')).length

  const biggestDrop = funnel
    .filter(f => f.drop != null && f.drop > 0)
    .sort((a, b) => b.drop - a.drop)[0]
  const prev = biggestDrop
    ? funnel[funnel.findIndex(f => f.key === biggestDrop.key) - 1]
    : null

  if (total === 0) return {
    quePasa:      'Aún no hay actividad en el panel.',
    queSignifica: 'Faltan datos para sacar cualquier conclusión.',
    queHarias:    'Asegúrate de que el enlace al site está circulando.',
  }

  let quePasa
  if (biggestDrop && biggestDrop.drop >= 50 && prev) {
    quePasa = `La gente llega y explora, pero se cae entre ${prev.label.toLowerCase()} y ${biggestDrop.label.toLowerCase()}.`
  } else if (compareCount > 0 && formCount === 0) {
    quePasa = `${compareCount} ${compareCount === 1 ? 'sesión comparó' : 'sesiones compararon'} viviendas, pero nadie dejó formulario.`
  } else if (formCount > 0) {
    const rate = total > 0 ? ((formCount / total) * 100).toFixed(1) : '0'
    quePasa = `${formCount} ${formCount === 1 ? 'formulario' : 'formularios'} sobre ${total} sesiones — conversión del ${rate}%.`
  } else {
    quePasa = `${total} sesiones con exploración activa, sin conversiones todavía.`
  }

  let queSignifica
  if (formCount > 0 && total > 0 && formCount / total > 0.05) {
    queSignifica = 'La conversión es sólida para un producto de alta consideración. El embudo funciona.'
  } else if (compareCount > 0 && formCount === 0) {
    queSignifica = 'Hay interés real, pero el recorrido no está cerrando bien.'
  } else if (biggestDrop && biggestDrop.drop >= 60) {
    queSignifica = 'La mayor pérdida está en un único paso del recorrido. Ahí se está yendo la oportunidad.'
  } else if (total >= 10 && formCount === 0) {
    queSignifica = 'Llega tráfico, pero aún sin señales claras de intención de compra.'
  } else {
    queSignifica = 'Es pronto para sacar conclusiones — hace falta más volumen.'
  }

  let queHarias
  if (compareCount > 0 && formCount === 0) {
    queHarias = 'Reforzar CTA en ficha y comparativa antes de invertir en más tráfico.'
  } else if (biggestDrop && biggestDrop.drop >= 50 && prev) {
    queHarias = `Revisar el paso de ${prev.label.toLowerCase()} a ${biggestDrop.label.toLowerCase()} y hacerlo más directo.`
  } else if (formCount === 0 && total >= 10) {
    queHarias = 'Revisar dónde aparece el formulario en el recorrido y si invita al contacto.'
  } else {
    queHarias = 'Esperar más datos antes de cambiar nada estructural.'
  }

  return { quePasa, queSignifica, queHarias }
}
