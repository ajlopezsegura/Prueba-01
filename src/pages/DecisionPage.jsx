import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Download, Mail, Phone, CalendarDays, Check, ArrowRight, LayoutDashboard } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import DecisionChapterModal from '../components/ui/DecisionChapterModal'
import { useProject } from '../context/ProjectContext'
import { useLang } from '../context/LangContext'
import { tc } from '../i18n/content'

export default function DecisionPage() {
  const navigate = useNavigate()
  const { project, units, materials } = useProject()
  const { lang, toggle } = useLang()

  const saved   = JSON.parse(localStorage.getItem('tvbs_selection') ?? '{}')
  const unit    = units?.find(u => u.id === saved.unitId) ?? null
  const selMats = saved.materials ?? {}

  const [mode, setMode]   = useState(null)
  const [sent, setSent]   = useState(false)
  const [form, setForm]   = useState({ name: '', email: '', phone: '', date: '', notes: '' })

  const name = lang === 'es' ? project.name : project.nameEN

  const handleSubmit = (e) => { e.preventDefault(); setSent(true) }

  const Field = ({ id, label, type = 'text', required = true }) => (
    <div className="flex flex-col gap-1.5">
      <label className="label-luxury" style={{ fontSize: '0.52rem', color: 'rgba(184,152,72,0.6)', letterSpacing: '0.15em' }}>
        {label}
      </label>
      <input type={type} value={form[id]} onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        required={required}
        className="font-sans font-light bg-transparent outline-none w-full"
        style={{ fontSize: '0.85rem', color: 'var(--color-text)', borderBottom: '1px solid rgba(184,152,72,0.25)', paddingBottom: '0.4rem' }}
        onFocus={e => e.target.style.borderBottomColor = 'var(--color-accent)'}
        onBlur={e => e.target.style.borderBottomColor = 'rgba(184,152,72,0.25)'}
      />
    </div>
  )

  return (
    <PageTransition>
      <DecisionChapterModal />
      <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 sm:px-10 py-4"
          style={{ borderBottom: '1px solid rgba(184,152,72,0.12)' }}>
          <button onClick={() => navigate(unit ? `/availability/${unit.slug}` : '/availability')} data-cursor="hover"
            className="flex items-center gap-1.5 label-luxury transition-all duration-300"
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

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto pb-14">
          <div className="max-w-2xl mx-auto px-6 sm:px-10 py-8 flex flex-col gap-8">

            {/* Title */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="label-luxury mb-2" style={{ color: 'var(--color-accent)', opacity: 0.7, fontSize: '0.52rem', letterSpacing: '0.2em' }}>
                {lang === 'es' ? 'TU SELECCIÓN' : 'YOUR SELECTION'}
              </p>
              <h2 className="display-heading text-text" style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', letterSpacing: '0.1em' }}>
                {lang === 'es' ? 'RESUMEN' : 'SUMMARY'}
              </h2>
            </motion.div>

            {/* Unit card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              style={{ border: '1px solid rgba(184,152,72,0.2)', backgroundColor: 'rgba(184,152,72,0.03)' }}>
              <div className="flex gap-4 p-4 sm:p-5">
                {unit?.thumbnail && (
                  <img src={unit.thumbnail} alt="" className="w-24 h-20 sm:w-32 sm:h-24 object-contain flex-shrink-0 bg-[#0d1117]" style={{ opacity: 0.9 }} />
                )}
                <div className="flex flex-col justify-center gap-2 flex-1 min-w-0">
                  {unit ? (
                    <>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="display-heading text-text" style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)', letterSpacing: '0.1em' }}>
                          {lang === 'es' ? 'Vivienda' : 'Unit'} {unit.id}
                        </span>
                        <span className="label-luxury" style={{ fontSize: '0.5rem', color: 'rgba(184,152,72,0.6)' }}>
                          {project.name} · Marbella
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {[
                          [lang === 'es' ? 'Planta'      : 'Floor',       `${unit.floor}ª`],
                          [lang === 'es' ? 'Dormitorios' : 'Bedrooms',    unit.bedrooms],
                          [lang === 'es' ? 'Superficie'  : 'Surface',     `${unit.surface} m²`],
                          [lang === 'es' ? 'Orientación' : 'Orientation', tc(unit.orientation, lang)],
                        ].map(([l, v]) => (
                          <div key={l} className="flex items-baseline gap-1.5">
                            <span className="label-luxury" style={{ fontSize: '0.48rem', color: 'rgba(184,152,72,0.5)' }}>{l}</span>
                            <span className="label-luxury text-text/70" style={{ fontSize: '0.56rem' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      <span className="label-luxury" style={{ fontSize: '0.72rem', color: 'var(--color-accent)' }}>
                        {unit.price.toLocaleString('es-ES')} €
                      </span>
                    </>
                  ) : (
                    <p className="label-luxury" style={{ fontSize: '0.6rem', color: 'rgba(184,152,72,0.35)' }}>
                      {lang === 'es' ? 'Sin vivienda seleccionada' : 'No unit selected'}
                    </p>
                  )}
                </div>
              </div>

              {/* Chosen materials */}
              {Object.keys(selMats).length > 0 && (
                <div className="px-4 sm:px-5 pb-4 pt-3 flex flex-wrap gap-3"
                  style={{ borderTop: '1px solid rgba(184,152,72,0.1)' }}>
                  <span className="label-luxury w-full" style={{ fontSize: '0.48rem', color: 'rgba(184,152,72,0.5)', letterSpacing: '0.18em' }}>
                    {lang === 'es' ? 'MATERIALES ELEGIDOS' : 'CHOSEN MATERIALS'}
                  </span>
                  {Object.entries(selMats).map(([cat, id]) => {
                    const item = materials?.[cat]?.find(m => m.id === id)
                    if (!item) return null
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <div className="w-4 h-4 flex-shrink-0" style={{ backgroundColor: item.swatch, border: '1px solid rgba(244,241,234,0.15)' }} />
                        <span className="label-luxury text-text/60" style={{ fontSize: '0.55rem' }}>
                          {lang === 'es' ? item.label : item.labelEN}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* Actions */}
            <AnimatePresence mode="wait">
              {!mode && !sent && (
                <motion.div key="ctas"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex flex-col gap-3">

                  <button onClick={() => setMode('reserve')} data-cursor="hover"
                    className="w-full label-luxury py-4 flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: '0.65rem', letterSpacing: '0.18em' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    {lang === 'es' ? 'RESERVAR AHORA' : 'RESERVE NOW'} <ArrowRight size={14} />
                  </button>

                  <button onClick={() => setMode('call')} data-cursor="hover"
                    className="w-full label-luxury py-4 flex items-center justify-center gap-2 transition-all duration-300"
                    style={{ border: '1px solid rgba(184,152,72,0.4)', color: 'var(--color-text)', fontSize: '0.65rem', letterSpacing: '0.18em' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.06)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.4)'; e.currentTarget.style.backgroundColor = 'transparent' }}>
                    <CalendarDays size={14} /> {lang === 'es' ? 'AGENDAR LLAMADA' : 'SCHEDULE A CALL'}
                  </button>

                  <div className="flex gap-3">
                    <button onClick={() => unit && navigate(`/summary/${unit.slug}`)} data-cursor="hover"
                      className="flex-1 label-luxury py-3 flex items-center justify-center gap-2 transition-all duration-300"
                      style={{ border: '1px solid rgba(184,152,72,0.18)', color: 'rgba(244,241,234,0.45)', fontSize: '0.58rem', opacity: unit ? 1 : 0.35 }}
                      onMouseEnter={e => { if (unit) { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.4)'; e.currentTarget.style.color = 'var(--color-text)' } }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.18)'; e.currentTarget.style.color = 'rgba(244,241,234,0.45)' }}>
                      <Download size={13} /> {lang === 'es' ? 'Dossier PDF' : 'PDF Dossier'}
                    </button>
                    <button data-cursor="hover"
                      className="flex-1 label-luxury py-3 flex items-center justify-center gap-2 transition-all duration-300"
                      style={{ border: '1px solid rgba(184,152,72,0.18)', color: 'rgba(244,241,234,0.45)', fontSize: '0.58rem' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.4)'; e.currentTarget.style.color = 'var(--color-text)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.18)'; e.currentTarget.style.color = 'rgba(244,241,234,0.45)' }}>
                      <Mail size={13} /> {lang === 'es' ? 'Enviar por email' : 'Send by email'}
                    </button>
                  </div>

                  {/* 24h advisor note */}
                  <div className="flex items-start gap-3 px-4 py-3"
                    style={{ backgroundColor: 'rgba(184,152,72,0.04)', border: '1px solid rgba(184,152,72,0.12)' }}>
                    <Phone size={12} color="rgba(184,152,72,0.5)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p className="label-luxury leading-relaxed" style={{ fontSize: '0.56rem', color: 'rgba(244,241,234,0.5)' }}>
                      {lang === 'es'
                        ? 'Un asesor se pondrá en contacto contigo en menos de 24 horas.'
                        : 'An advisor will contact you within 24 hours.'}
                    </p>
                  </div>

                  {/* Demo handoff to the management panel */}
                  <div className="flex flex-col gap-2 mt-2 pt-4" style={{ borderTop: '1px dashed rgba(184,152,72,0.2)' }}>
                    <p className="label-luxury" style={{ fontSize: '0.45rem', letterSpacing: '0.22em', color: 'rgba(184,152,72,0.45)' }}>
                      {lang === 'es' ? 'DEMO · INTELIGENCIA COMERCIAL · PANEL DE VENTAS' : 'DEMO · COMMERCIAL INTELLIGENCE · SALES PANEL'}
                    </p>
                    <button onClick={() => navigate('/admin')} data-cursor="hover"
                      className="w-full label-luxury py-4 flex items-center justify-center gap-2 transition-all duration-300"
                      style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: '0.65rem', letterSpacing: '0.18em' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                      <LayoutDashboard size={14} />
                      {lang === 'es' ? 'ACCEDER AL PANEL DE VENTAS' : 'ENTER THE SALES PANEL'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Reserve form */}
              {mode === 'reserve' && !sent && (
                <motion.form key="reserve"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }} onSubmit={handleSubmit}
                  className="flex flex-col gap-5">
                  <button type="button" onClick={() => setMode(null)}
                    className="label-luxury flex items-center gap-1 self-start"
                    style={{ color: 'rgba(184,152,72,0.5)', fontSize: '0.56rem' }}>
                    <ChevronLeft size={11} /> {lang === 'es' ? 'Volver' : 'Back'}
                  </button>
                  <p className="display-heading text-text" style={{ fontSize: '0.8rem', letterSpacing: '0.12em' }}>
                    {lang === 'es' ? 'DATOS DE RESERVA' : 'RESERVATION DETAILS'}
                  </p>
                  <Field id="name"  label={lang === 'es' ? 'NOMBRE COMPLETO'        : 'FULL NAME'} />
                  <Field id="email" label="EMAIL" type="email" />
                  <Field id="phone" label={lang === 'es' ? 'TELÉFONO'               : 'PHONE'} type="tel" />
                  <Field id="notes" label={lang === 'es' ? 'COMENTARIOS (OPCIONAL)' : 'NOTES (OPTIONAL)'} required={false} />
                  <button type="submit" data-cursor="hover"
                    className="w-full label-luxury py-4 mt-2 transition-opacity duration-200"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: '0.65rem', letterSpacing: '0.18em' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    {lang === 'es' ? 'ENVIAR RESERVA' : 'SUBMIT RESERVATION'}
                  </button>
                </motion.form>
              )}

              {/* Call form */}
              {mode === 'call' && !sent && (
                <motion.form key="call"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }} onSubmit={handleSubmit}
                  className="flex flex-col gap-5">
                  <button type="button" onClick={() => setMode(null)}
                    className="label-luxury flex items-center gap-1 self-start"
                    style={{ color: 'rgba(184,152,72,0.5)', fontSize: '0.56rem' }}>
                    <ChevronLeft size={11} /> {lang === 'es' ? 'Volver' : 'Back'}
                  </button>
                  <p className="display-heading text-text" style={{ fontSize: '0.8rem', letterSpacing: '0.12em' }}>
                    {lang === 'es' ? 'AGENDAR LLAMADA' : 'SCHEDULE A CALL'}
                  </p>
                  <Field id="name"  label={lang === 'es' ? 'NOMBRE COMPLETO' : 'FULL NAME'} />
                  <Field id="email" label="EMAIL" type="email" />
                  <Field id="phone" label={lang === 'es' ? 'TELÉFONO'        : 'PHONE'} type="tel" />
                  <Field id="date"  label={lang === 'es' ? 'FECHA PREFERIDA' : 'PREFERRED DATE'} type="date" />
                  <button type="submit" data-cursor="hover"
                    className="w-full label-luxury py-4 mt-2 transition-opacity duration-200"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)', fontSize: '0.65rem', letterSpacing: '0.18em' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    {lang === 'es' ? 'CONFIRMAR LLAMADA' : 'CONFIRM CALL'}
                  </button>
                </motion.form>
              )}

              {/* Success */}
              {sent && (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-5 py-10 text-center">
                  <div className="w-12 h-12 flex items-center justify-center"
                    style={{ border: '1px solid var(--color-accent)', borderRadius: '50%' }}>
                    <Check size={22} color="var(--color-accent)" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="display-heading text-text" style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)', letterSpacing: '0.1em' }}>
                      {lang === 'es' ? 'RECIBIDO' : 'RECEIVED'}
                    </p>
                    <p className="label-luxury" style={{ fontSize: '0.6rem', color: 'rgba(244,241,234,0.5)', lineHeight: 1.8, maxWidth: 300 }}>
                      {lang === 'es'
                        ? 'Hemos recibido tu solicitud. Un asesor se pondrá en contacto contigo en menos de 24 horas.'
                        : 'We have received your request. An advisor will contact you within 24 hours.'}
                    </p>
                  </div>
                  <button onClick={() => navigate('/')} data-cursor="hover"
                    className="label-luxury px-8 py-3 transition-all duration-300 mt-2"
                    style={{ border: '1px solid rgba(184,152,72,0.35)', color: 'rgba(244,241,234,0.55)', fontSize: '0.58rem' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-text)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,152,72,0.35)'; e.currentTarget.style.color = 'rgba(244,241,234,0.55)' }}>
                    {lang === 'es' ? 'Volver al inicio' : 'Back to home'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
