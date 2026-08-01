import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageTransition from '../components/layout/PageTransition'
import IntroModal from '../components/ui/IntroModal'
import { useProject } from '../context/ProjectContext'
import { useLang } from '../context/LangContext'


export default function CoverPage() {
  const navigate = useNavigate()
  const { project } = useProject()
  const { lang } = useLang()
  const [videoFailed, setVideoFailed] = useState(false)

  const name    = lang === 'es' ? project.name    : project.nameEN
  const tagline = lang === 'es'
    ? (project.tagline    ?? '24 residencias · Primera línea de playa')
    : (project.taglineEN  ?? project.tagline ?? '24 residences · Beachfront')
  const showVideo = project.heroVideo && !videoFailed

  return (
    <PageTransition>
      <IntroModal />
      <div className="absolute inset-0 overflow-hidden">

        {/* Background — video or image */}
        {showVideo ? (
          <video
            src={project.heroVideo}
            poster={project.heroImage}
            autoPlay muted loop playsInline preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ backgroundImage: `url(${project.heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${project.heroImage})` }}
          />
        )}

        {/* Base darkening layer — always on, uniform */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(10,12,18,0.35)' }} />

        {/* Gradient overlay — stronger than before */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(10,12,18,0.30) 0%, rgba(10,12,18,0.60) 55%, rgba(10,12,18,0.90) 100%)' }}
        />

        {/* Content — centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">

          {/* Studio name */}
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="label-luxury mb-8 sm:mb-12"
            style={{ color: 'var(--color-accent)', fontSize: '0.6rem', letterSpacing: '0.28em' }}
          >
            THE VISUALS BOUTIQUE·STUDIO
          </motion.p>

          {/* Project name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="display-heading"
            style={{
              fontSize: 'clamp(2.5rem, 9vw, 7rem)',
              letterSpacing: 'clamp(0.06em, 2vw, 0.14em)',
              lineHeight: 1,
              color: '#ffffff',
              textShadow: '0 2px 32px rgba(0,0,0,0.5)',
            }}
          >
            {name?.toUpperCase()}
          </motion.h1>

          {/* Decorative rule */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ duration: 0.9, delay: 1.3, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="h-px my-6 sm:my-7"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />

          {/* Tagline — product descriptor */}
          {tagline && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.5 }}
              className="label-luxury"
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.2em',
                color: 'rgba(244,241,234,0.82)',
              }}
            >
              {tagline}
            </motion.p>
          )}

          {/* Address */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="label-luxury mt-3"
            style={{ fontSize: '0.58rem', letterSpacing: '0.22em', color: 'rgba(184,152,72,0.75)', fontWeight: 500 }}
          >
            {project.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.2 }}
            className="mt-10 sm:mt-14 flex flex-col items-center gap-4"
          >
            <button
              onClick={() => navigate('/proyecto')}
              data-cursor="hover"
              className="label-luxury flex items-center gap-3 transition-all duration-500"
              style={{
                border: '1px solid rgba(184,152,72,0.7)',
                backgroundColor: 'rgba(184,152,72,0.10)',
                color: 'var(--color-accent)',
                fontSize: '0.65rem',
                letterSpacing: '0.22em',
                padding: '14px 36px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.18)'
                e.currentTarget.style.borderColor = 'var(--color-accent)'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(184,152,72,0.10)'
                e.currentTarget.style.borderColor = 'rgba(184,152,72,0.7)'
                e.currentTarget.style.color = 'var(--color-accent)'
              }}
            >
              {lang === 'es' ? 'ENTRAR' : 'ENTER'}
              <span style={{ display: 'inline-block', marginLeft: 2 }}>→</span>
            </button>

            <button
              onClick={() => navigate('/contact')}
              data-cursor="hover"
              className="label-luxury transition-all duration-300"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
                fontSize: '0.52rem', letterSpacing: '0.2em',
                color: 'rgba(244,241,234,0.45)',
                borderBottom: '1px solid rgba(244,241,234,0.25)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'rgba(244,241,234,0.8)'
                e.currentTarget.style.borderBottomColor = 'rgba(244,241,234,0.6)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(244,241,234,0.45)'
                e.currentTarget.style.borderBottomColor = 'rgba(244,241,234,0.25)'
              }}
            >
              {lang === 'es' ? 'CONTACTAR' : 'CONTACT'}
            </button>

            <button
              onClick={() => navigate('/admin')}
              data-cursor="hover"
              className="label-luxury transition-all duration-300 mt-2"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0',
                fontSize: '0.48rem', letterSpacing: '0.28em',
                color: 'rgba(184,152,72,0.55)',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(184,152,72,0.55)'}
            >
              {lang === 'es' ? 'VER PANEL DE VENTAS →' : 'VIEW SALES PANEL →'}
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
