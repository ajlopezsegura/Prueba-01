import { createContext, useContext, useState, useCallback } from 'react'
import es from '../i18n/es.json'
import en from '../i18n/en.json'

const translations = { es, en }

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')

  const toggle = useCallback(() => {
    setLang(prev => prev === 'es' ? 'en' : 'es')
  }, [])

  const t = useCallback((key) => translations[lang][key] ?? key, [lang])

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
