import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Check, MessageCircle, LayoutDashboard } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import { useLang } from '../context/LangContext'
import { useSession } from '../context/SessionContext'
import { supabase } from '../lib/supabase'
import { useProject } from '../context/ProjectContext'

const PROJECT_SLUG  = (import.meta.env.VITE_PROJECT_SLUG ?? 'las-conchas').trim()
const WA_NUMBER     = '34665263089'

const HOT_SOURCES   = ['decision', 'summary']
const getTemperature = source => HOT_SOURCES.includes(source) ? 'hot' : 'cold'

const INTENTS = [
  { id: 'info',  es: 'Solicitar información', en: 'Request information' },
  { id: 'visit', es: 'Solicitar visita',       en: 'Request a visit'     },
  { id: 'call',  es: 'Agendar llamada',        en: 'Schedule a call'     },
]

const SUBMIT_LABEL = {
  info:  { es: 'ENVIAR SOLICITUD', en: 'SEND REQUEST'  },
  visit: { es: 'SOLICITAR VISITA', en: 'REQUEST VISIT' },
  call:  { es: 'AGENDAR LLAMADA',  en: 'SCHEDULE CALL' },
}

function fieldStyle(hasError) {
  return {
    width: '100%', backgroundColor: 'transparent', border: 'none',
    borderBottom: `1px solid ${hasError ? 'rgba(220,70,70,0.6)' : 'rgba(184,152,72,0.25)'}`,
    color: 'var(--color-text)', fontSize: '0.78rem', padding: '8px 0 6px',
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
  }
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="label-luxury" style={{ fontSize: '0.5rem', letterSpacing: '0.15em', color: 'rgba(184,152,72,0.5)' }}>
        {label}
      </span>
      {children}
      {error && (
        <span style={{ fontSize: '0.44rem', color: 'rgba(220,70,70,0.75)', fontFamily: 'inherit' }}>
          {error}
        </span>
      )}
    </div>
  )
}

export default function ContactPage() {
  const navigate            = useNavigate()
  const { units: allUnits, project } = useProject()
  const { lang, toggle }    = useLang()
  const { sessionId, trail, markConverted } = useSession()

  const ctx = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('tvbs_lead_context') ?? 'null') }
    catch { return null }
  }, [])

  const units = useMemo(() => {
    if (!ctx?.unit_ids || !allUnits) return []
    return ctx.unit_ids.map(id => allUnits.find(u => u.id === id)).filter(Boolean)
  }, [ctx, allUnits])

  const [intent,     setIntent]     = useState('info')
  const [fields,     setFields]     = useState({ name: '', email: '', phone: '', message: '', preferred_date: '' })
  const [consent,    setConsent]    = useState(false)
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)

  const setField = (k, v) => {
    setFields(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }))
  }

  const showDate = intent === 'visit' || intent === 'call'

  function validate() {
    const errs = {}
    const t = (es, en) => lang === 'es' ? es : en
    if (!fields.name.trim())  errs.name  = t('Campo obligatorio', 'Required field')
    if (!fields.email.trim()) errs.email = t('Campo obligatorio', 'Required field')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = t('Email no válido', 'Invalid email')
    if (!fields.phone.trim()) errs.phone = t('Campo obligatorio', 'Required field')
    else if (fields.phone.replace(/\D/g, '').length < 7) errs.phone = t('Teléfono no válido', 'Invalid phone number')
    if (!consent) errs.consent = t('Debes aceptar la política de privacidad', 'You must accept the privacy policy')
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSubmitting(true)

    const sourcePage  = ctx?.source ?? 'unknown'
    const temperature = getTemperature(sourcePage)

    // Pull materials selected in configurator (if any) from localStorage
    let selectedMaterials = null
    let configuredUnitId  = null
    try {
      const raw = localStorage.getItem('tvbs_selection')
      if (raw) {
        const sel = JSON.parse(raw)
        selectedMaterials = sel?.materials ?? null
        configuredUnitId  = sel?.unitId   ?? null
      }
    } catch {}

    const payload = {
      project_slug:    PROJECT_SLUG,
      source_page:     sourcePage,
      intent,
      unit_ids:        ctx?.unit_ids ?? [],
      primary_unit_id: ctx?.primary_unit_id ?? null,
      unit_snapshot:   units.map(u => ({
        unit_id: u.id, typology: u.typology, floor: u.floor,
        bedrooms: u.bedrooms, surface: u.surface,
        price: u.price, status: u.status,
      })),
      contact: {
        name:           fields.name.trim(),
        email:          fields.email.trim(),
        phone:          fields.phone.trim(),
        preferred_date: showDate && fields.preferred_date ? fields.preferred_date : null,
        message:        fields.message.trim() || null,
        materials:      selectedMaterials,
        configured_unit: configuredUnitId,
      },
      session_trail:    trail,
      lead_score:       temperature === 'hot' ? 15 : 3,
      lead_temperature: temperature,
      status:           'new',
    }

    try {
      const { error } = await supabase.from('leads').insert(payload)
      if (error) console.error('[TVBS] Lead insert error:', error.message)
      else markConverted()
    } catch (err) {
      console.warn('[TVBS] Could not save lead to Supabase:', err.message)
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  if (!ctx) {
    localStorage.setItem('tvbs_lead_context', JSON.stringify({
      source: 'general', unit_ids: [], primary_unit_id: null, back_path: '/',
    }))
  }

  const backPath = ctx?.back_path ?? '/availability'

  // WhatsApp message pre-filled
  const projectName = lang === 'es' ? project?.name : (project?.nameEN ?? project?.name)
  const waText = encodeURIComponent(
    lang === 'es'
      ? `Hola, me gustaría obtener más información sobre ${projectName}.`
      : `Hello, I would like to get more information about ${projectName}.`
  )
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${waText}`

  return (
    <PageTransition>
      <div className="absolute inset-0 flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 sm:px-10 py-4"
          style={{ borderBottom: '1px solid rgba(184,152,72,0.12)' }}>
          <button onClick={() => navigate(backPath)} data-cursor="hover"
            className="flex items-center gap-2 label-luxury transition-colors duration-300"
            style={{ color: 'rgba(244,241,234,0.45)', fontSize: '0.6rem' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,241,234,0.45)'}>
            <ChevronLeft size={14} />
            {lang === 'es' ? 'Volver' : 'Back'}
          </button>
          <span className="label-luxury text-text/40 hidden sm:block" style={{ fontSize: '0.55rem' }}>
            {lang === 'es' ? 'CONTACTAR' : 'CONTACT'}
          </span>
          <button onClick={toggle} data-cursor="hover"
            className="flex items-center gap-2 label-luxury" style={{ fontSize: '0.6rem' }}>
            <span style={{ color: lang === 'es' ? 'var(--color-text)' : 'rgba(244,241,234,0.35)' }}>ES</span>
            <span style={{ color: 'var(--color-accent)' }}>|</span>
            <span style={{ color: lang === 'en' ? 'var(--color-text)' : 'rgba(244,241,234,0.35)' }}>EN</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 sm:px-10 py-8 max-w-xl mx-auto w-full">

            <AnimatePresence mode="wait">
              {submitted ? (

                /* Success */
                <motion.div key="success"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                  className="flex flex-col gap-6 pt-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center flex-shrink-0"
                      style={{ width: 38, height: 38, border: '1px solid var(--color-accent)' }}>
                      <Check size={16} style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <div>
                      <p className="display-heading text-text"
                        style={{ fontSize: 'clamp(0.9rem, 2vw, 1.2rem)', letterSpacing: '0.1em' }}>
                        {lang === 'es' ? 'SOLICITUD ENVIADA' : 'REQUEST SENT'}
                      </p>
                      <p className="label-luxury mt-1" style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.5)' }}>
                        {lang === 'es' ? 'Te contactaremos en breve' : "We'll be in touch shortly"}
                      </p>
                    </div>
                  </div>
                  <p className="font-sans font-light text-text/50" style={{ fontSize: '0.8rem', lineHeight: 1.85 }}>
                    {lang === 'es'
                      ? 'Hemos recibido tu solicitud. Nuestro equipo se pondrá en contacto en un máximo de 24 horas.'
                      : 'We have received your request. Our team will contact you within 24 hours.'
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button onClick={() => navigate(backPath)} data-cursor="hover"
                      className="flex-1 label-luxury py-3.5 flex items-center justify-center transition-all duration-300"
                      style={{ border: '1px solid rgba(184,152,72,0.3)', color: 'rgba(184,152,72,0.6)', fontSize: '0.55rem' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.3)'; e.currentTarget.style.color = 'rgba(184,152,72,0.6)' }}>
                      ← {lang === 'es' ? 'Volver' : 'Go back'}
                    </button>
                    <button onClick={() => navigate('/availability')} data-cursor="hover"
                      className="flex-1 label-luxury py-3.5 flex items-center justify-center transition-all duration-300"
                      style={{ border: '1px solid rgba(184,152,72,0.12)', color: 'rgba(244,241,234,0.3)', fontSize: '0.55rem' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.3)'; e.currentTarget.style.color = 'rgba(244,241,234,0.6)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.12)'; e.currentTarget.style.color = 'rgba(244,241,234,0.3)' }}>
                      {lang === 'es' ? 'Ver más viviendas →' : 'Browse more units →'}
                    </button>
                  </div>

                  {/* Demo handoff to the management panel */}
                  <div className="flex flex-col gap-2 mt-2 pt-4" style={{ borderTop: '1px dashed rgba(184,152,72,0.2)' }}>
                    <p className="label-luxury" style={{ fontSize: '0.45rem', letterSpacing: '0.22em', color: 'rgba(184,152,72,0.45)' }}>
                      {lang === 'es' ? 'DEMO · INTELIGENCIA COMERCIAL · PANEL DE VENTAS' : 'DEMO · COMMERCIAL INTELLIGENCE · SALES PANEL'}
                    </p>
                    <button onClick={() => navigate('/admin')} data-cursor="hover"
                      className="w-full label-luxury py-4 flex items-center justify-center gap-2 transition-opacity duration-200"
                      style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: '0.6rem', letterSpacing: '0.18em' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                      <LayoutDashboard size={14} />
                      {lang === 'es' ? 'ACCEDER AL PANEL DE VENTAS' : 'ENTER THE SALES PANEL'}
                    </button>
                  </div>
                </motion.div>

              ) : (

                /* Form */
                <motion.div key="form" className="flex flex-col gap-7 pt-4">

                  {/* Intent */}
                  <div>
                    <p className="label-luxury mb-3"
                      style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(184,152,72,0.5)' }}>
                      {lang === 'es' ? 'TIPO DE CONSULTA' : 'ENQUIRY TYPE'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {INTENTS.map(i => (
                        <button key={i.id} onClick={() => setIntent(i.id)} data-cursor="hover"
                          className="label-luxury px-3 py-3 text-left sm:text-center transition-all duration-200"
                          style={{
                            border: `1px solid ${intent === i.id ? 'var(--color-accent)' : 'rgba(184,152,72,0.2)'}`,
                            backgroundColor: intent === i.id ? 'rgba(184,152,72,0.07)' : 'transparent',
                            color: intent === i.id ? 'var(--color-accent)' : 'rgba(244,241,234,0.45)',
                            fontSize: '0.52rem',
                          }}>
                          {lang === 'es' ? i.es : i.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fields */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

                    <Field label={lang === 'es' ? 'NOMBRE *' : 'NAME *'} error={errors.name}>
                      <input type="text" value={fields.name}
                        onChange={e => setField('name', e.target.value)}
                        placeholder={lang === 'es' ? 'Tu nombre completo' : 'Your full name'}
                        style={fieldStyle(!!errors.name)} />
                    </Field>

                    <Field label="EMAIL *" error={errors.email}>
                      <input type="email" value={fields.email}
                        onChange={e => setField('email', e.target.value)}
                        placeholder={lang === 'es' ? 'tu@email.com' : 'your@email.com'}
                        style={fieldStyle(!!errors.email)} />
                    </Field>

                    <Field label={lang === 'es' ? 'TELÉFONO *' : 'PHONE *'} error={errors.phone}>
                      <input type="tel" value={fields.phone}
                        onChange={e => setField('phone', e.target.value)}
                        placeholder={lang === 'es' ? '+34 600 000 000' : '+1 000 000 0000'}
                        style={fieldStyle(!!errors.phone)} />
                    </Field>

                    <AnimatePresence>
                      {showDate && (
                        <motion.div key="date"
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                          style={{ overflow: 'hidden' }}>
                          <Field label={lang === 'es' ? 'FECHA PREFERIDA' : 'PREFERRED DATE'} error={null}>
                            <input type="date" value={fields.preferred_date}
                              onChange={e => setField('preferred_date', e.target.value)}
                              style={{ ...fieldStyle(false), colorScheme: 'dark' }} />
                          </Field>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Field label={lang === 'es' ? 'MENSAJE (OPCIONAL)' : 'MESSAGE (OPTIONAL)'} error={null}>
                      <textarea value={fields.message}
                        onChange={e => setField('message', e.target.value)}
                        placeholder={lang === 'es' ? 'Cualquier detalle relevante...' : 'Any relevant details...'}
                        rows={3}
                        style={{
                          width: '100%', backgroundColor: 'transparent', resize: 'none', outline: 'none',
                          border: '1px solid rgba(184,152,72,0.15)', color: 'var(--color-text)',
                          fontSize: '0.72rem', padding: '10px', lineHeight: 1.7, fontFamily: 'inherit',
                        }} />
                    </Field>

                    {/* Consent */}
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-start gap-3 cursor-pointer" style={{ userSelect: 'none' }}>
                        <input type="checkbox" checked={consent}
                          onChange={e => {
                            setConsent(e.target.checked)
                            if (errors.consent) setErrors(er => ({ ...er, consent: null }))
                          }}
                          style={{ flexShrink: 0, marginTop: 2, width: 14, height: 14, accentColor: 'var(--color-accent)', cursor: 'pointer' }} />
                        <span className="font-sans font-light"
                          style={{ fontSize: '0.72rem', color: 'rgba(244,241,234,0.45)', lineHeight: 1.6 }}>
                          {lang === 'es'
                            ? <>He leído y acepto la{' '}<Link to="/privacy" className="underline" style={{ color: 'rgba(184,152,72,0.7)' }}>política de privacidad</Link></>
                            : <>I have read and accept the{' '}<Link to="/privacy" className="underline" style={{ color: 'rgba(184,152,72,0.7)' }}>privacy policy</Link></>
                          }
                        </span>
                      </label>
                      {errors.consent && (
                        <span style={{ fontSize: '0.44rem', color: 'rgba(220,70,70,0.75)' }}>{errors.consent}</span>
                      )}
                    </div>

                    <button type="submit" data-cursor="hover" disabled={submitting}
                      className="w-full label-luxury py-4 flex items-center justify-center gap-2 transition-opacity duration-200"
                      style={{
                        backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)',
                        fontSize: '0.6rem', letterSpacing: '0.18em',
                        opacity: submitting ? 0.6 : 1,
                      }}
                      onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.88' }}
                      onMouseLeave={e => e.currentTarget.style.opacity = submitting ? '0.6' : '1'}>
                      {submitting
                        ? (lang === 'es' ? 'ENVIANDO...' : 'SENDING...')
                        : (lang === 'es' ? SUBMIT_LABEL[intent].es : SUBMIT_LABEL[intent].en)
                      }
                    </button>
                  </form>

                  {/* WhatsApp divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(184,152,72,0.12)' }} />
                    <span className="label-luxury" style={{ fontSize: '0.44rem', color: 'rgba(184,152,72,0.35)', letterSpacing: '0.15em' }}>
                      {lang === 'es' ? 'O CONTACTA DIRECTAMENTE' : 'OR CONTACT DIRECTLY'}
                    </span>
                    <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(184,152,72,0.12)' }} />
                  </div>

                  {/* WhatsApp button */}
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" data-cursor="hover"
                    className="w-full label-luxury py-4 flex items-center justify-center gap-3 transition-all duration-300"
                    style={{
                      border: '1px solid rgba(37,211,102,0.35)',
                      color: 'rgba(37,211,102,0.8)',
                      fontSize: '0.6rem', letterSpacing: '0.15em',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(37,211,102,0.7)'; e.currentTarget.style.backgroundColor = 'rgba(37,211,102,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(37,211,102,0.35)'; e.currentTarget.style.backgroundColor = 'transparent' }}>
                    <MessageCircle size={14} />
                    {lang === 'es' ? 'ABRIR WHATSAPP' : 'OPEN WHATSAPP'}
                  </a>

                  <p className="label-luxury pb-6" style={{ fontSize: '0.45rem', color: 'rgba(184,152,72,0.32)', lineHeight: 1.95, textAlign: 'center' }}>
                    {lang === 'es'
                      ? 'Nuestro equipo se pondrá en contacto en un máximo de 24 horas.'
                      : 'Our team will contact you within 24 hours.'
                    }
                  </p>

                  {/* Demo handoff to the management panel */}
                  <div className="flex flex-col gap-2 pt-4 pb-2" style={{ borderTop: '1px dashed rgba(184,152,72,0.2)' }}>
                    <p className="label-luxury" style={{ fontSize: '0.45rem', letterSpacing: '0.22em', color: 'rgba(184,152,72,0.45)' }}>
                      {lang === 'es' ? 'DEMO · INTELIGENCIA COMERCIAL · PANEL DE VENTAS' : 'DEMO · COMMERCIAL INTELLIGENCE · SALES PANEL'}
                    </p>
                    <button onClick={() => navigate('/admin')} data-cursor="hover"
                      className="w-full label-luxury py-4 flex items-center justify-center gap-2 transition-opacity duration-200"
                      style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: '0.6rem', letterSpacing: '0.18em' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                      <LayoutDashboard size={14} />
                      {lang === 'es' ? 'ACCEDER AL PANEL DE VENTAS' : 'ENTER THE SALES PANEL'}
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
