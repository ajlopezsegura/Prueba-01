import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import LuxuryCursor      from './components/cursor/LuxuryCursor'
import AppFooter        from './components/layout/AppFooter'
import { useProject }    from './context/ProjectContext'

const CoverPage         = lazy(() => import('./pages/CoverPage'))
const ContextPage       = lazy(() => import('./pages/ContextPage'))
const AvailabilityPage  = lazy(() => import('./pages/AvailabilityPage'))
const UnitDetailPage    = lazy(() => import('./pages/UnitDetailPage'))
const ImmersionPage     = lazy(() => import('./pages/ImmersionPage'))
const DecisionPage      = lazy(() => import('./pages/DecisionPage'))
const ComparePage       = lazy(() => import('./pages/ComparePage'))
const ContactPage       = lazy(() => import('./pages/ContactPage'))
const SummaryPage       = lazy(() => import('./pages/SummaryPage'))
const PrivacyPage       = lazy(() => import('./pages/PrivacyPage'))
const MapPage           = lazy(() => import('./pages/MapPage'))
const AdminPage         = lazy(() => import('./pages/AdminPage'))
const OnePagerPage      = lazy(() => import('./pages/OnePagerPage'))
const LandingStandardPage = lazy(() => import('./pages/LandingStandardPage'))
const BodaCoverPage     = lazy(() => import('./pages/boda/BodaCoverPage'))

export default function App() {
  const location        = useLocation()
  const { loading }     = useProject()

  // The wedding site is a self-contained guest page: it shares the shell but
  // none of the Las Conchas chrome, data or tracking.
  const isBoda = location.pathname.startsWith('/boda')

  if (loading && !isBoda) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div style={{
            width: 32, height: 32, border: '1px solid rgba(184,152,72,0.3)',
            borderTopColor: 'var(--color-accent)', borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      {!isBoda && <LuxuryCursor />}
      <AppFooter />
      <AnimatePresence mode="sync" initial={false}>
        <Suspense fallback={
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-bg)' }}>
            <div style={{
              width: 24, height: 24, border: '1px solid rgba(184,152,72,0.3)',
              borderTopColor: 'var(--color-accent)', borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </motion.div>
        }>
          <Routes location={location} key={location.pathname}>
            <Route path="/"                        element={<CoverPage />} />
            <Route path="/proyecto"                element={<ContextPage />} />
            <Route path="/availability"            element={<AvailabilityPage />} />
            <Route path="/availability/:slug"      element={<UnitDetailPage />} />
            <Route path="/inmersion/:unitId"       element={<ImmersionPage />} />
            <Route path="/decision"                element={<DecisionPage />} />
            <Route path="/compare"                 element={<ComparePage />} />
            <Route path="/contact"                 element={<ContactPage />} />
            <Route path="/summary/:slug"           element={<SummaryPage />} />
            <Route path="/map"                     element={<MapPage />} />
            <Route path="/privacy"                 element={<PrivacyPage />} />
            <Route path="/admin"                   element={<AdminPage />} />
            <Route path="/tvbs"                    element={<OnePagerPage />} />
            <Route path="/v1"                      element={<LandingStandardPage />} />
            <Route path="/boda"                    element={<BodaCoverPage />} />
            <Route path="/seleccion"               element={<Navigate to="/availability" replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  )
}
