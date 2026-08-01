import { useLang } from '../../context/LangContext'

export default function SpaceHeader({ space }) {
  const { lang, t } = useLang()

  const label       = (lang === 'es' ? space.label       : space.labelEN)       ?? space.label
  const description = (lang === 'es' ? space.description : space.descriptionEN) ?? space.description
  const typeLabel   = t(`space_type_${space.type}`)

  return (
    <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-8 md:px-16">
      <p className="label-luxury mb-3 sm:mb-5" style={{ color: 'var(--color-accent)' }}>{typeLabel}</p>
      <h1
        className="display-heading text-text mb-5 sm:mb-6"
        style={{ fontSize: 'clamp(1.6rem, 6vw, 4rem)', letterSpacing: 'clamp(0.04em, 1vw, 0.08em)' }}
      >
        {label?.toUpperCase()}
      </h1>
      <div className="accent-rule mb-6 sm:mb-8" />
      <p
        className="font-sans font-light max-w-xl"
        style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', lineHeight: 1.9, color: 'var(--color-text-muted)' }}
      >
        {description}
      </p>
    </div>
  )
}
