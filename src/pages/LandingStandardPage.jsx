import { useState, useEffect } from 'react'
import { useProject } from '../context/ProjectContext'

// ─── "Standard premium" real-estate landing for Las Conchas ──────────────────
// Inspired by Higuerón West, Sierra Blanca Estates and similar premium Costa
// del Sol developments. Editorial typography (Cormorant Garamond + Inter),
// warm beige palette, big lifestyle imagery, magazine-style flow. Deliberately
// passive: catalog + lifestyle + form. No guided journey, no comparator, no
// commercial intelligence — used side by side with the TVBS version to make
// the difference legible.

const CREAM   = '#f5efe4'   // background
const SAND    = '#ede4d2'   // section alternate
const INK     = '#2a2622'   // headings
const TEXT    = '#4a4338'   // body
const MUTED   = '#8a7f70'   // captions
const GOLD    = '#a98850'   // accent
const GOLD_HI = '#8c6e3d'   // accent hover

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif'
const SANS  = '"Inter", "Helvetica Neue", Arial, sans-serif'

function useFadeIn() {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])
  return vis
}

function Label({ children, color = GOLD }) {
  return (
    <div style={{
      fontFamily: SANS, fontSize: '0.62rem', letterSpacing: '0.36em',
      textTransform: 'uppercase', color, fontWeight: 500,
      marginBottom: 24,
    }}>
      {children}
    </div>
  )
}

function H({ children, size = 'lg', italic, color = INK }) {
  const fs = size === 'xl' ? 'clamp(2.8rem, 6.5vw, 5rem)'
           : size === 'lg' ? 'clamp(2rem, 4.5vw, 3.4rem)'
           : 'clamp(1.4rem, 3vw, 2rem)'
  return (
    <h2 style={{
      fontFamily: SERIF, fontSize: fs, fontWeight: 400,
      lineHeight: 1.1, color, letterSpacing: '-0.005em',
      fontStyle: italic ? 'italic' : 'normal',
      maxWidth: '100%',
    }}>
      {children}
    </h2>
  )
}

function Body({ children, muted, max = 580 }) {
  return (
    <p style={{
      fontFamily: SANS, fontSize: '1rem', lineHeight: 1.85,
      color: muted ? MUTED : TEXT, fontWeight: 300,
      maxWidth: max, letterSpacing: '0.005em',
    }}>
      {children}
    </p>
  )
}

function Pull({ children }) {
  return (
    <p style={{
      fontFamily: SERIF, fontSize: 'clamp(1.4rem, 3vw, 2rem)',
      lineHeight: 1.3, color: INK, fontStyle: 'italic', fontWeight: 400,
      maxWidth: 720, letterSpacing: '-0.005em',
    }}>
      {children}
    </p>
  )
}

function Btn({ children, primary, dark, ...rest }) {
  return (
    <button {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 12,
        padding: '14px 36px',
        fontFamily: SANS, fontSize: '0.66rem',
        letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500,
        border: `1px solid ${primary ? GOLD : dark ? INK : 'currentColor'}`,
        background: primary ? GOLD : dark ? INK : 'transparent',
        color: primary || dark ? '#fff' : 'currentColor',
        cursor: 'pointer', transition: 'all 0.4s ease',
        ...rest.style,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = primary ? GOLD_HI : dark ? '#000' : 'rgba(169,136,80,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.background = primary ? GOLD : dark ? INK : 'transparent' }}>
      {children}
    </button>
  )
}

function Section({ children, bg = CREAM, pad = '120px 32px', id }) {
  return (
    <section id={id} style={{ background: bg, padding: pad }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        {children}
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function LandingStandardPage() {
  const { project, units = [] } = useProject() || {}
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [sent, setSent] = useState(false)
  const vis = useFadeIn()

  const available = (units || []).filter(u => u.status === 'available').slice(0, 6)

  return (
    <div style={{
      minHeight: '100vh', background: CREAM,
      fontFamily: SANS, color: TEXT,
    }}>
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(245,239,228,0.92)', backdropFilter: 'blur(12px)',
        padding: '18px 32px',
        borderBottom: '1px solid rgba(169,136,80,0.12)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            fontFamily: SERIF, fontSize: '1.15rem', fontWeight: 500,
            color: INK, letterSpacing: '0.12em',
          }}>
            LAS CONCHAS
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {[
              ['Filosofía', '#filosofia'],
              ['Diseño', '#diseno'],
              ['Lifestyle', '#lifestyle'],
              ['Residencias', '#residencias'],
              ['Ubicación', '#ubicacion'],
              ['Contacto', '#contacto'],
            ].map(([t, h]) => (
              <a key={h} href={h}
                style={{
                  fontFamily: SANS, fontSize: '0.62rem',
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: TEXT, textDecoration: 'none', fontWeight: 500,
                }}>
                {t}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        background: `linear-gradient(180deg, rgba(20,16,12,0.35) 0%, rgba(20,16,12,0.55) 100%), url(/assets/images/las-conchas-aerea.webp) center/cover`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '120px 32px 64px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          <div style={{
            opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 1.4s ease 0.3s',
          }}>
            <Label color="rgba(255,255,255,0.7)">Marbella · Costa del Sol</Label>
            <h1 style={{
              fontFamily: SERIF, fontSize: 'clamp(3rem, 8vw, 6.5rem)',
              fontWeight: 400, lineHeight: 1, color: '#fff',
              letterSpacing: '-0.01em', maxWidth: 900, marginBottom: 40,
            }}>
              Vivir <em style={{ fontStyle: 'italic' }}>frente al mar</em><br />
              empieza aquí.
            </h1>
            <p style={{
              fontFamily: SANS, fontSize: '1.05rem', lineHeight: 1.7,
              color: 'rgba(255,255,255,0.85)', fontWeight: 300,
              maxWidth: 520, marginBottom: 48,
            }}>
              24 residencias exclusivas en primera línea de playa.
              Una pieza singular del litoral marbellí.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Btn primary>Solicitar dossier</Btn>
              <Btn style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}>
                Descubrir el proyecto
              </Btn>
            </div>
          </div>
        </div>

        {/* Bottom data strip */}
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32,
          borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 32,
        }}>
          {[
            ['24', 'Residencias'],
            ['65 – 320 m²', 'Superficies'],
            ['Q4 2026', 'Entrega'],
            ['50 m', 'De la orilla'],
          ].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: SERIF, fontSize: '1.6rem', color: '#fff', marginBottom: 6 }}>{v}</div>
              <div style={{ fontFamily: SANS, fontSize: '0.62rem', letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Filosofía ───────────────────────────────────────────── */}
      <Section id="filosofia">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 80, alignItems: 'center' }}>
          <div>
            <Label>Filosofía</Label>
            <H size="lg">El privilegio<br /><em style={{ fontStyle: 'italic' }}>de habitar</em><br />la luz mediterránea.</H>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <Body>
              Las Conchas nace del encuentro entre la arquitectura contemporánea
              y la herencia mediterránea. Una promoción concebida para quienes
              buscan algo más que una vivienda: un modo de vida.
            </Body>
            <Body muted>
              Cada residencia está pensada como un refugio orientado al horizonte,
              donde el mar se convierte en cuarta pared. Materiales nobles,
              dimensiones generosas y una atención meticulosa a la luz natural
              definen un proyecto sin precedentes en la costa marbellí.
            </Body>
            <Btn dark>Conocer el proyecto</Btn>
          </div>
        </div>
      </Section>

      {/* ── Pull quote ──────────────────────────────────────────── */}
      <Section bg={SAND} pad="100px 32px">
        <div style={{ textAlign: 'center', maxWidth: 880, margin: '0 auto' }}>
          <div style={{ fontSize: '2rem', color: GOLD, marginBottom: 24 }}>—</div>
          <Pull>
            "El lujo verdadero no se exhibe. Se vive en los detalles, en la
            calidad de la luz al amanecer, en el silencio del mar de fondo."
          </Pull>
          <div style={{
            fontFamily: SANS, fontSize: '0.65rem', letterSpacing: '0.28em',
            textTransform: 'uppercase', color: MUTED, marginTop: 32, fontWeight: 500,
          }}>
            Estudio de Arquitectura — Marbella
          </div>
        </div>
      </Section>

      {/* ── Diseño / Big image ──────────────────────────────────── */}
      <Section id="diseno" pad="0">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 0 }}>
          <div style={{
            minHeight: 560,
            background: 'url(/assets/images/salon/salon-day.webp) center/cover',
          }} />
          <div style={{ padding: '80px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Label>Diseño & Arquitectura</Label>
            <H size="lg">Espacios pensados <em style={{ fontStyle: 'italic' }}>para la calma</em>.</H>
            <div style={{ height: 32 }} />
            <Body>
              Interiores diseñados con materiales seleccionados: maderas nobles,
              piedra natural, latón cepillado. Cada elemento responde a un
              criterio estético definido: continuidad visual, sobriedad,
              durabilidad.
            </Body>
            <div style={{ height: 16 }} />
            <Body muted>
              Las viviendas se entregan con cocina equipada, climatización por
              conductos, suelo radiante, domótica integrada y armarios
              vestidos.
            </Body>
          </div>
        </div>
      </Section>

      {/* ── Lifestyle gallery ───────────────────────────────────── */}
      <Section id="lifestyle">
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 64px' }}>
          <Label>Lifestyle</Label>
          <H size="lg">Una vida<br /><em style={{ fontStyle: 'italic' }}>sin compromisos</em>.</H>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            ['/assets/images/salon/salon-day.webp', 'Salones', 'Espacios abiertos al horizonte'],
            ['/assets/images/cocina/cocina-day.webp', 'Cocinas', 'Cocinas con materiales premium'],
            ['/assets/images/terraza/terraza-day.webp', 'Terrazas', 'Terrazas con vistas al mar'],
            ['/assets/images/piscina-01.webp', 'Piscina', 'Piscina infinity en zona común'],
            ['/assets/images/dormitorio/dormitorio-day.webp', 'Dormitorios', 'Dormitorios principales'],
            ['/assets/images/bano/bano-day.webp', 'Baños', 'Baños con acabados de autor'],
          ].map(([src, t, d], i) => (
            <div key={i} style={{ cursor: 'pointer' }}>
              <div style={{
                aspectRatio: '4/3', background: `url(${src}) center/cover`,
                marginBottom: 16,
              }} />
              <div style={{
                fontFamily: SANS, fontSize: '0.6rem', letterSpacing: '0.28em',
                textTransform: 'uppercase', color: GOLD, fontWeight: 500, marginBottom: 6,
              }}>{t}</div>
              <div style={{ fontFamily: SERIF, fontSize: '1.05rem', color: INK }}>{d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Residencias ─────────────────────────────────────────── */}
      <Section id="residencias" bg={SAND}>
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 64px' }}>
          <Label>Residencias</Label>
          <H size="lg">Una selección de<br /><em style={{ fontStyle: 'italic' }}>viviendas únicas</em>.</H>
          <div style={{ height: 24 }} />
          <Body muted max={520}>
            24 residencias de entre 65 y 320 m². Una a una, todas pensadas
            con la misma dedicación.
          </Body>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
          {available.length > 0 ? available.map(u => (
            <div key={u.id} style={{ background: CREAM }}>
              <div style={{
                aspectRatio: '4/3',
                background: u.hero_image ? `url(${u.hero_image}) center/cover` : '#ddd',
              }} />
              <div style={{ padding: '28px 28px 32px' }}>
                <div style={{
                  fontFamily: SANS, fontSize: '0.6rem', letterSpacing: '0.28em',
                  textTransform: 'uppercase', color: GOLD, fontWeight: 500, marginBottom: 10,
                }}>
                  Vivienda {u.id}
                </div>
                <div style={{ fontFamily: SERIF, fontSize: '1.6rem', color: INK, marginBottom: 18, lineHeight: 1.2 }}>
                  {u.bedrooms} dormitorios · {u.surface || u.built_area_m2} m²
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  borderTop: `1px solid rgba(169,136,80,0.2)`, paddingTop: 18 }}>
                  <span style={{ fontFamily: SERIF, fontSize: '1.3rem', color: GOLD }}>
                    {u.price ? `${u.price.toLocaleString('es-ES')} €` : 'Consultar'}
                  </span>
                  <a href="#contacto" style={{
                    fontFamily: SANS, fontSize: '0.6rem', letterSpacing: '0.28em',
                    textTransform: 'uppercase', color: INK, textDecoration: 'none', fontWeight: 500,
                    borderBottom: `1px solid ${INK}`, paddingBottom: 3,
                  }}>
                    Información →
                  </a>
                </div>
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 80, color: MUTED }}>
              Cargando residencias…
            </div>
          )}
        </div>
      </Section>

      {/* ── Ubicación ───────────────────────────────────────────── */}
      <Section id="ubicacion">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 80 }}>
          <div>
            <Label>Ubicación</Label>
            <H size="lg">Marbella.<br /><em style={{ fontStyle: 'italic' }}>El epicentro</em><br />de la Costa del Sol.</H>
            <div style={{ height: 32 }} />
            <Body>
              Un emplazamiento único frente al Mediterráneo, a pocos minutos
              del centro de Marbella y del Puerto Banús. Conexión directa con
              el aeropuerto de Málaga y los principales campos de golf de
              Europa.
            </Body>
            <div style={{ height: 40 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              {[
                ['50 m', 'Playa'],
                ['3 km', 'Puerto Banús'],
                ['1.2 km', 'Campos de golf'],
                ['45 min', 'Aeropuerto'],
              ].map(([d, t]) => (
                <div key={t} style={{ borderTop: `1px solid rgba(169,136,80,0.3)`, paddingTop: 18 }}>
                  <div style={{ fontFamily: SERIF, fontSize: '1.6rem', color: GOLD, marginBottom: 4 }}>{d}</div>
                  <div style={{
                    fontFamily: SANS, fontSize: '0.6rem', letterSpacing: '0.28em',
                    textTransform: 'uppercase', color: MUTED, fontWeight: 500,
                  }}>{t}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            minHeight: 520, background: '#dcd5c6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: SANS, color: MUTED, fontSize: '0.9rem',
            letterSpacing: '0.1em',
          }}>
            📍 Mapa Marbella
          </div>
        </div>
      </Section>

      {/* ── Contacto ────────────────────────────────────────────── */}
      <Section id="contacto" bg={INK} pad="120px 32px">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 80 }}>
          <div>
            <Label color="rgba(169,136,80,0.85)">Contacto</Label>
            <H size="lg" color="#fff">Solicite información<br /><em style={{ fontStyle: 'italic' }}>privilegiada</em>.</H>
            <div style={{ height: 32 }} />
            <p style={{ fontFamily: SANS, fontSize: '1rem', lineHeight: 1.85,
              color: 'rgba(255,255,255,0.7)', fontWeight: 300, maxWidth: 460,
            }}>
              Un asesor especializado se pondrá en contacto con usted para
              presentarle el proyecto en detalle y atender cualquier consulta.
            </p>
            <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 18,
              color: 'rgba(255,255,255,0.8)', fontFamily: SANS, fontSize: '0.95rem',
            }}>
              <div>+34 600 000 000</div>
              <div>info@lasconchas.com</div>
              <div style={{ color: 'rgba(255,255,255,0.5)' }}>Av. del Mediterráneo, Marbella</div>
            </div>
          </div>

          <form onSubmit={e => { e.preventDefault(); setSent(true) }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#fff' }}>
                <div style={{ fontSize: '2rem', color: GOLD, marginBottom: 16 }}>—</div>
                <h3 style={{ fontFamily: SERIF, fontSize: '1.8rem', fontStyle: 'italic', marginBottom: 16 }}>
                  Gracias.
                </h3>
                <p style={{ fontFamily: SANS, fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)' }}>
                  Le contactaremos en las próximas 24 horas.
                </p>
              </div>
            ) : (
              <>
                {[
                  ['name', 'Nombre completo'],
                  ['email', 'Email'],
                  ['phone', 'Teléfono'],
                ].map(([f, l]) => (
                  <div key={f}>
                    <label style={{
                      display: 'block', fontFamily: SANS, fontSize: '0.55rem',
                      letterSpacing: '0.28em', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontWeight: 500,
                    }}>{l}</label>
                    <input required value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })}
                      type={f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text'}
                      style={{
                        width: '100%', padding: '10px 0',
                        background: 'transparent',
                        border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)',
                        fontFamily: SANS, fontSize: '1rem', color: '#fff',
                        outline: 'none',
                      }} />
                  </div>
                ))}
                <div>
                  <label style={{
                    display: 'block', fontFamily: SANS, fontSize: '0.55rem',
                    letterSpacing: '0.28em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontWeight: 500,
                  }}>Mensaje</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    rows={3} style={{
                      width: '100%', padding: '10px 0',
                      background: 'transparent',
                      border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)',
                      fontFamily: SANS, fontSize: '1rem', color: '#fff',
                      outline: 'none', resize: 'vertical',
                    }} />
                </div>
                <div style={{ height: 12 }} />
                <Btn primary type="submit" style={{ alignSelf: 'flex-start' }}>
                  Enviar solicitud
                </Btn>
              </>
            )}
          </form>
        </div>
      </Section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{
        background: INK, color: 'rgba(255,255,255,0.5)',
        padding: '36px 32px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)',
        fontFamily: SANS, fontSize: '0.7rem', letterSpacing: '0.14em',
      }}>
        © 2026 LAS CONCHAS MARBELLA · PROMOTORA ABC · TODOS LOS DERECHOS RESERVADOS
      </footer>

      {/* ── Compare toggle ──────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 100,
        maxWidth: 320, padding: '20px 22px',
        background: 'rgba(20,16,12,0.94)', color: '#fff',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
        border: '1px solid rgba(169,136,80,0.3)',
      }}>
        <div style={{
          fontFamily: SANS, fontSize: '0.5rem', letterSpacing: '0.3em',
          textTransform: 'uppercase', color: GOLD, marginBottom: 14, fontWeight: 600,
        }}>
          Lo que esta versión NO hace
        </div>
        <ul style={{
          listStyle: 'none', margin: 0, padding: 0,
          fontFamily: SANS, fontSize: '0.78rem', lineHeight: 1.55,
          color: 'rgba(255,255,255,0.78)', fontWeight: 300,
        }}>
          {[
            'Ordenar la decisión del comprador',
            'Comparar viviendas con lectura comercial',
            'Devolver inteligencia al equipo de ventas',
          ].map(t => (
            <li key={t} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <span style={{ color: 'rgba(169,136,80,0.55)', flexShrink: 0 }}>✕</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <a href="/#/" style={{
          display: 'inline-block', marginTop: 16,
          padding: '10px 18px', background: GOLD, color: '#fff',
          textDecoration: 'none', fontFamily: SANS, fontSize: '0.58rem',
          letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 600,
          transition: 'background 0.3s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = GOLD_HI}
        onMouseLeave={e => e.currentTarget.style.background = GOLD}>
          Ver versión TVBS →
        </a>
      </div>
    </div>
  )
}
