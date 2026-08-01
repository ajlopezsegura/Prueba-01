import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProject } from '../../context/ProjectContext'
import { useLang } from '../../context/LangContext'
import LangToggle from '../ui/LangToggle'

export default function AppShell() {
  const { project } = useProject()
  const { lang, t } = useLang()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (project?.name) document.title = `${project.name} · Marbella`
  }, [project?.name])

  const projectName = lang === 'es' ? project.name : project.nameEN

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-5"
      style={{
        backgroundColor: scrolled ? 'rgba(37,45,58,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'background-color 0.6s ease, backdrop-filter 0.6s ease',
        borderBottom: scrolled ? '1px solid rgba(184,152,72,0.15)' : 'none',
        minHeight: 'var(--header-h)',
      }}
    >
      {/* Studio mark */}
      <Link to="/home" data-cursor="hover" className="no-underline flex flex-col gap-0.5">
        <span className="display-heading text-text" style={{ fontSize: 'clamp(0.6rem, 2.5vw, 0.75rem)', letterSpacing: '0.12em' }}>
          THE VISUALS
        </span>
        <span className="label-luxury text-accent" style={{ fontSize: 'clamp(0.45rem, 1.5vw, 0.5rem)', letterSpacing: '0.20em' }}>
          BOUTIQUE·STUDIO
        </span>
      </Link>

      {/* Center: Project name (desktop only) */}
      <div className="hidden md:flex flex-col items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
        <span className="label-luxury text-text/40" style={{ fontSize: '0.55rem' }}>
          {projectName}
        </span>
      </div>

      {/* Right: Nav + lang toggle */}
      <div className="flex items-center gap-4 sm:gap-8">
        {location.pathname !== '/map' && (
          <Link
            to="/map"
            data-cursor="hover"
            className="label-luxury text-text/60 hover:text-accent transition-colors duration-500 no-underline min-h-[44px] flex items-center"
          >
            {t('nav_map')}
          </Link>
        )}
        <LangToggle />
      </div>
    </motion.header>
  )
}
