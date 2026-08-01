import { useLang } from '../../context/LangContext'

export default function LangToggle() {
  const { lang, toggle } = useLang()

  return (
    <button
      onClick={toggle}
      data-cursor="hover"
      className="label-luxury flex items-center gap-2 transition-colors duration-500"
      style={{ color: 'var(--color-text-muted)' }}
      aria-label="Toggle language"
    >
      <span style={{ opacity: lang === 'es' ? 1 : 0.35, transition: 'opacity 0.4s', color: 'var(--color-text)' }}>ES</span>
      <span style={{ color: 'var(--color-accent)', fontSize: '0.5rem' }}>|</span>
      <span style={{ opacity: lang === 'en' ? 1 : 0.35, transition: 'opacity 0.4s', color: 'var(--color-text)' }}>EN</span>
    </button>
  )
}
