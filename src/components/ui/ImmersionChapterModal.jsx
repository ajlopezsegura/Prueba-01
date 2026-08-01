import { useEffect, useState } from 'react'
import { useLang } from '../../context/LangContext'
import JourneyModal from './JourneyModal'

const STORAGE_KEY = 'tvbs_seen_chapter_immersion_v1'

const COPY = {
  es: {
    eyebrow: 'CAPÍTULO 05',
    title:   'DE ENTENDER\nA PROYECTARSE',
    body: [
      'Aquí la vivienda deja de ser una opción comparada y empieza a convertirse en una experiencia personal.',
      'La experiencia permite explorar distintas posibilidades para que el comprador visualice cómo podría vivir realmente el espacio antes de contactar o reservar.',
      'El objetivo no es ofrecer infinitas combinaciones, sino aumentar implicación, deseo y claridad en la decisión.',
    ],
    button:  'COMENZAR EXPERIENCIA',
  },
  en: {
    eyebrow: 'CHAPTER 05',
    title:   'FROM UNDERSTANDING\nTO PROJECTING',
    body: [
      'Here the residence stops being a compared option and starts becoming a personal experience.',
      'The experience lets buyers explore different possibilities to visualise how they could actually live the space before contacting or reserving.',
      'The goal is not to offer infinite combinations, but to increase involvement, desire and clarity in the decision.',
    ],
    button:  'START THE EXPERIENCE',
  },
}

export default function ImmersionChapterModal() {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const t = COPY[lang] ?? COPY.es

  useEffect(() => {
    // localStorage gate disabled — modal always shows on each visit
    const id = setTimeout(() => setOpen(true), 500)
    return () => clearTimeout(id)
  }, [])

  function dismiss() {
    setOpen(false)
  }

  return (
    <JourneyModal
      open={open}
      onClose={dismiss}
      eyebrow={t.eyebrow}
      title={t.title}
      body={t.body}
      button={t.button}
    />
  )
}
