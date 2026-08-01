import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import { useProject } from '../context/ProjectContext'
import { useLang } from '../context/LangContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { project } = useProject()
  const { lang, t } = useLang()

  const name        = lang === 'es' ? project.name        : project.nameEN
  const description = lang === 'es' ? project.description : project.descriptionEN

  return (
    <PageTransition>
      <div className="absolute inset-0 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${project.heroImage})`, backgroundColor: 'var(--color-bg-deep)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(26,33,48,0.92) 0%, rgba(26,33,48,0.3) 50%, rgba(26,33,48,0.5) 100%)' }}
        />

        {/* Content — bottom left */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 md:p-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.43,0.13,0.23,0.96] }}
              className="label-luxury mb-3" style={{ color: 'var(--color-accent)' }}
            >
              {project.architect} — {project.subtitle}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.25, ease: [0.43,0.13,0.96] }}
              className="display-heading text-text mb-5"
              style={{ fontSize: 'clamp(2rem, 7vw, 5.5rem)', letterSpacing: 'clamp(0.02em, 1vw, 0.06em)' }}
            >
              {name?.toUpperCase()}
            </motion.h1>

            <motion.div
              initial={{ width: 0 }} animate={{ width: 36 }}
              transition={{ duration: 0.7, delay: 0.8, ease: [0.43,0.13,0.23,0.96] }}
              className="h-px mb-5" style={{ backgroundColor: 'var(--color-accent)' }}
            />

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="font-sans font-light text-text/60 hidden md:block"
              style={{ fontSize: '0.9rem', lineHeight: 1.8, maxWidth: '38ch' }}
            >
              {description}
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            onClick={() => navigate('/map')}
            data-cursor="hover"
            className="label-luxury border transition-all duration-700 min-h-[44px] px-8 flex items-center self-start md:self-auto whitespace-nowrap"
            style={{ borderColor: 'rgba(184,152,72,0.5)', color: 'var(--color-text)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--color-accent)'; e.currentTarget.style.backgroundColor='rgba(184,152,72,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(184,152,72,0.5)'; e.currentTarget.style.backgroundColor='transparent' }}
          >
            {t('cta_explore')}
          </motion.button>
        </div>
      </div>
    </PageTransition>
  )
}
