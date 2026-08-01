import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLang } from '../../context/LangContext'

export default function BackButton() {
  const navigate = useNavigate()
  const { t } = useLang()

  return (
    <button
      onClick={() => navigate('/map')}
      data-cursor="hover"
      className="flex items-center gap-2 sm:gap-3 label-luxury transition-colors duration-500 min-h-[44px]"
      style={{ color: 'var(--color-text-muted)' }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
    >
      <ArrowLeft size={14} strokeWidth={1.5} className="transition-transform duration-500 group-hover:-translate-x-1" />
      {t('cta_back_map')}
    </button>
  )
}
