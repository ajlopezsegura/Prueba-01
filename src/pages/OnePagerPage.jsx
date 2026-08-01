import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageCircle, ArrowRight } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'

const ACCENT = 'var(--color-accent)'
const EASE   = [0.32, 0.72, 0.24, 1]

// TODO replace whatsapp number once you confirm it
const CONTACT = {
  email:        'info@thevisualsboutique.com',
  whatsappHref: 'https://wa.me/34600000000',
  demoUrl:      'https://demo.thevisualsboutique.com',
}

function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.innerWidth < bp)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`)
    const h  = e => setM(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [bp])
  return m
}

// ─── Atoms ────────────────────────────────────────────────────────────────
function Eyebrow({ children, color = 'rgba(184,152,72,0.7)' }) {
  return (
    <div className="label-luxury" style={{
      fontSize: '0.52rem', letterSpacing: '0.32em',
      color, marginBottom: 18,
    }}>
      {children}
    </div>
  )
}

function Title({ children, size = 'lg' }) {
  const fs = size === 'xl'
    ? 'clamp(1.6rem, 5vw, 2.8rem)'
    : size === 'md'
      ? 'clamp(1.1rem, 3vw, 1.5rem)'
      : 'clamp(1.3rem, 4vw, 2rem)'
  return (
    <h2 className="display-heading" style={{
      fontSize: fs,
      letterSpacing: '0.06em',
      lineHeight: 1.15,
      color: '#ffffff',
      whiteSpace: 'pre-line',
    }}>
      {children}
    </h2>
  )
}

function Rule({ width = 36, top = 24, bottom = 24 }) {
  return (
    <div style={{
      height: 1, width, backgroundColor: ACCENT,
      margin: `${top}px 0 ${bottom}px`,
    }} />
  )
}

function Body({ children, muted = false, max = 720 }) {
  return (
    <p style={{
      fontSize: 'clamp(0.76rem, 2vw, 0.88rem)',
      lineHeight: 1.75,
      color: muted ? 'rgba(244,241,234,0.6)' : 'rgba(244,241,234,0.82)',
      letterSpacing: '0.01em',
      maxWidth: max,
    }}>
      {children}
    </p>
  )
}

function Highlight({ children }) {
  return (
    <p style={{
      fontSize: 'clamp(0.78rem, 2vw, 0.92rem)',
      lineHeight: 1.5,
      color: '#ffffff',
      fontWeight: 500,
      letterSpacing: '0.01em',
      maxWidth: 720,
    }}>
      {children}
    </p>
  )
}

function Section({ children, divider = true, mob }) {
  return (
    <section style={{
      padding: mob ? '64px 24px' : '120px 64px',
      maxWidth: 1180,
      margin: '0 auto',
      width: '100%',
      borderTop: divider ? '1px solid rgba(184,152,72,0.12)' : 'none',
    }}>
      {children}
    </section>
  )
}

// ─── Phase block ──────────────────────────────────────────────────────────
function Phase({ n, code, name, body, highlight, duration, mob, last }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: mob ? '1fr' : '260px 1fr',
      gap: mob ? 18 : 60,
      padding: mob ? '32px 0' : '40px 0',
      borderBottom: last ? 'none' : '1px solid rgba(184,152,72,0.12)',
      alignItems: 'baseline',
    }}>
      <div>
        <div className="label-luxury" style={{
          fontSize: '0.48rem', letterSpacing: '0.28em',
          color: 'rgba(184,152,72,0.5)', marginBottom: 8,
        }}>
          {n}
        </div>
        <h3 className="display-heading" style={{
          fontSize: 'clamp(0.95rem, 2.2vw, 1.2rem)',
          letterSpacing: '0.16em',
          color: '#ffffff',
          marginBottom: duration ? 10 : 0,
        }}>
          {name}
        </h3>
        {duration && (
          <span className="label-luxury" style={{
            display: 'inline-block', padding: '3px 10px',
            border: '1px solid rgba(184,152,72,0.45)',
            background: 'rgba(184,152,72,0.06)',
            color: ACCENT,
            fontSize: '0.5rem', letterSpacing: '0.2em',
          }}>
            {duration}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Body>{body}</Body>
        {highlight && <Highlight>{highlight}</Highlight>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function OnePagerPage() {
  const mob = useIsMobile()

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>

        {/* ── Top brandmark ─────────────────────────────────────────── */}
        <header style={{
          padding: mob ? '20px 24px' : '24px 64px',
          maxWidth: 1180, margin: '0 auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className="display-heading" style={{
              fontSize: mob ? '1.05rem' : '1.25rem',
              letterSpacing: '0.18em', color: '#ffffff',
              lineHeight: 1,
            }}>
              THE VISUALS
            </span>
            <span className="label-luxury" style={{
              fontSize: '0.46rem', letterSpacing: '0.32em',
              color: 'rgba(184,152,72,0.6)',
            }}>
              BOUTIQUE·STUDIO
            </span>
          </div>
        </header>

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section style={{
          minHeight: mob ? '78vh' : '88vh',
          padding: mob ? '40px 24px 64px' : '80px 64px 100px',
          maxWidth: 1180, margin: '0 auto',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, ease: EASE }}>
            <Eyebrow>THE SYSTEM</Eyebrow>
            <Title size="xl">{'LA FORMA VISIBLE\nDEL VALOR'}</Title>
            <Rule width={48} top={28} bottom={28} />
            <Body max={780}>
              The System convierte el proyecto en herramienta de decisión y
              venta: alinea criterio, dirección y producción para defender
              valor y acelerar decisiones.
            </Body>
            <div style={{ height: 36 }} />
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: mob ? 8 : 14,
              fontSize: '0.55rem', letterSpacing: '0.18em',
              color: ACCENT,
            }}
              className="label-luxury">
              {['VISUAL DUE DILIGENCE', 'VISUAL DIRECTION DECK', 'ASSET ROOM', 'LAUNCH SEQUENCE', 'CONTINUITY'].map((t, i, a) => (
                <span key={t} style={{ opacity: 0.85 }}>
                  {t}{i < a.length - 1 && <span style={{ marginLeft: mob ? 8 : 14, color: 'rgba(184,152,72,0.4)' }}>·</span>}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── Manifesto ────────────────────────────────────────────── */}
        <Section mob={mob}>
          <Eyebrow>PRINCIPIO</Eyebrow>
          <Title>{'NO ES UNA LISTA\nDE ENTREGABLES'}</Title>
          <Rule />
          <Body max={820}>
            Es una secuencia diseñada para reducir incertidumbre, acortar
            ciclos y evitar iteraciones caras. Cada fase prepara la
            siguiente. Cada decisión se toma una sola vez.
          </Body>
        </Section>

        {/* ── The 5 phases ─────────────────────────────────────────── */}
        <Section mob={mob}>
          <Eyebrow>THE SYSTEM</Eyebrow>
          <Title>{'CINCO FASES\nUNA SECUENCIA'}</Title>
          <Rule bottom={8} />

          <div style={{ marginTop: 24 }}>
            <Phase mob={mob}
              n="01"
              name="VISUAL DUE DILIGENCE"
              duration="48–72H"
              body="Diagnóstico del activo para decidir qué vender, a quién y con qué prioridad. Identifica highlights, riesgos y define el plan de piezas recomendado para arrancar con criterio." />
            <Phase mob={mob}
              n="02"
              name="VISUAL DIRECTION DECK"
              body="Guía de dirección del proyecto: mensaje, tono, narrativa y reglas visuales para que todo el material sea coherente, aprobable y defendible."
              highlight="Un lenguaje común para arquitectura, marketing y ventas." />
            <Phase mob={mob}
              n="03"
              name="ASSET ROOM"
              body="La caja de herramientas del proyecto. Seleccionamos y priorizamos los activos necesarios (imágenes, films, microsite, branding, VR…) y definimos orden de producción y entregas según objetivo."
              highlight="Un plan ejecutable, no una lista." />
            <Phase mob={mob}
              n="04"
              name="LAUNCH SEQUENCE"
              body="Secuencia de salida al mercado: qué sale primero, por qué canal y con qué versiones. Pre-lanzamiento, lanzamiento y sostenimiento con una lógica de decisión clara."
              highlight="Calendario y guía de uso por fases." />
            <Phase mob={mob}
              n="05"
              name="CONTINUITY"
              body="Mantenimiento e iteración cuando aporta valor: ajustes, refuerzos y nuevas piezas según respuesta real del mercado."
              highlight="Optimización sin ruido, centrada en decisión."
              last />
          </div>
        </Section>

        {/* ── Case ─────────────────────────────────────────────────── */}
        <Section mob={mob}>
          <Eyebrow>CASO DESTACADO</Eyebrow>
          <Title>{'LAS CONCHAS\nMARBELLA'}</Title>
          <Rule />
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: mob ? 24 : 60 }}>
            <Body>
              Promoción residencial de 24 unidades en primera línea de playa.
              El System aplicado de extremo a extremo: diagnóstico,
              dirección visual, producción de assets, lanzamiento por fases
              y panel comercial con lectura de decisión en tiempo real.
            </Body>
            <Body muted>
              La demo recoge el recorrido completo del comprador y el otro
              lado de la experiencia: cómo cada interacción deja contexto,
              intención y señales de decisión para el equipo comercial.
            </Body>
          </div>

          <a href={CONTACT.demoUrl} target="_blank" rel="noopener noreferrer"
            data-cursor="hover"
            className="label-luxury"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              marginTop: 36, padding: '14px 30px',
              border: '1px solid rgba(184,152,72,0.7)',
              background: 'rgba(184,152,72,0.08)',
              color: ACCENT,
              fontSize: '0.6rem', letterSpacing: '0.22em',
              textDecoration: 'none',
              transition: 'all 0.4s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background  = 'rgba(184,152,72,0.18)'
              e.currentTarget.style.borderColor = ACCENT
              e.currentTarget.style.color       = '#ffffff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = 'rgba(184,152,72,0.08)'
              e.currentTarget.style.borderColor = 'rgba(184,152,72,0.7)'
              e.currentTarget.style.color       = ACCENT
            }}>
            VER DEMO COMPLETA
            <ArrowRight size={13} />
          </a>
        </Section>

        {/* ── Who ──────────────────────────────────────────────────── */}
        <Section mob={mob}>
          <Eyebrow>PARA QUIÉN</Eyebrow>
          <Title>{'PROYECTOS\nCON ALGO QUE DEFENDER'}</Title>
          <Rule />
          <div style={{
            display: 'grid',
            gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: mob ? 14 : 28,
            marginTop: 8,
          }}>
            {[
              'Promotores residenciales',
              'Desarrolladores y fondos',
              'Hoteles y resorts',
              'Marcas premium',
            ].map(t => (
              <div key={t} style={{
                padding: '20px 0',
                borderTop: '1px solid rgba(184,152,72,0.22)',
              }}>
                <span className="label-luxury" style={{
                  fontSize: '0.6rem', letterSpacing: '0.14em',
                  color: 'rgba(244,241,234,0.78)',
                }}>{t}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <section style={{
          padding: mob ? '80px 24px 96px' : '140px 64px',
          maxWidth: 1180, margin: '0 auto',
          borderTop: '1px solid rgba(184,152,72,0.12)',
          textAlign: 'center',
        }}>
          <Eyebrow>SIGUIENTE PASO</Eyebrow>
          <Title size="xl">{'HÁBLANOS\nDE TU PROYECTO'}</Title>
          <div style={{ height: 1, width: 48, backgroundColor: ACCENT, margin: '36px auto' }} />

          <div style={{
            display: 'flex',
            flexDirection: mob ? 'column' : 'row',
            gap: mob ? 12 : 18,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 8,
          }}>
            <a href={`mailto:${CONTACT.email}`} data-cursor="hover"
              className="label-luxury"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '15px 32px',
                background: ACCENT,
                color: 'var(--color-bg)',
                fontSize: '0.62rem', letterSpacing: '0.22em',
                textDecoration: 'none',
                transition: 'opacity 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <Mail size={14} />
              {CONTACT.email.toUpperCase()}
            </a>

            <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer"
              data-cursor="hover"
              className="label-luxury"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '15px 32px',
                border: '1px solid rgba(184,152,72,0.5)',
                background: 'transparent',
                color: ACCENT,
                fontSize: '0.62rem', letterSpacing: '0.22em',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(184,152,72,0.1)'
                e.currentTarget.style.borderColor = ACCENT
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(184,152,72,0.5)'
              }}>
              <MessageCircle size={14} />
              WHATSAPP DIRECTO
            </a>
          </div>

          <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            <span className="display-heading" style={{
              fontSize: '0.9rem',
              letterSpacing: '0.18em', color: '#ffffff',
            }}>
              THE VISUALS
            </span>
            <span className="label-luxury" style={{
              fontSize: '0.42rem', letterSpacing: '0.32em',
              color: 'rgba(184,152,72,0.5)',
            }}>
              BOUTIQUE·STUDIO
            </span>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
