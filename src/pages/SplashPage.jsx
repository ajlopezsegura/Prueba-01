import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProject } from '../context/ProjectContext'
import { useLang } from '../context/LangContext'

export default function SplashPage() {
  const navigate = useNavigate()
  const { project } = useProject()
  const { lang } = useLang()
  const name = lang === 'es' ? project.name : project.nameEN

  useEffect(() => {
    const timer = setTimeout(() => navigate('/home'), 3800)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.0, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg-deep)' }}
      onClick={() => navigate('/home')}
    >
      {/* Studio mark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: [0.43, 0.13, 0.23, 0.96], delay: 0.3 }}
        className="text-center mb-12"
      >
        <p className="label-luxury" style={{ color: 'rgba(184,152,72,0.5)', fontSize: '0.55rem', letterSpacing: '0.25em' }}>
          THE VISUALS BOUTIQUE·STUDIO
        </p>
      </motion.div>

      {/* Project name — display heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96], delay: 0.6 }}
        className="text-center"
      >
        <h1
          className="display-heading text-text"
          style={{
            fontSize: 'clamp(2rem, 6vw, 5rem)',
            letterSpacing: '0.10em',
            lineHeight: 1.0,
          }}
        >
          {name.toUpperCase()}
        </h1>

        {/* Animated gold rule */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ duration: 0.9, ease: [0.43, 0.13, 0.23, 0.96], delay: 1.4 }}
          className="h-px mx-auto mt-8"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="label-luxury mt-6 text-text"
          style={{ fontSize: '0.6rem' }}
        >
          {project.subtitle}
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
