import { useEffect, useState } from 'react'
import { useLang } from '../../context/LangContext'
import JourneyModal from './JourneyModal'

const STORAGE_KEY = 'tvbs_seen_chapter_unit_v1'

const COPY = {
  es: {
    eyebrow: 'CAPÍTULO 04',
    title:   'DE LA COMPARACIÓN\nA LA VIVIENDA REAL',
    body: [
      'Después de comparar opciones, la decisión aterriza en una unidad concreta.',
      'Aquí la vivienda deja de leerse como una referencia dentro del conjunto y empieza a entenderse desde aquello que la hace singular y habitable para un comprador específico.',
      'El objetivo es pasar de "esta opción encaja" a "esta vivienda podría ser la adecuada", preparando el siguiente paso: hacerla propia.',
    ],
    button:  'CONTINUAR AL CONFIGURADOR',
  },
  en: {
    eyebrow: 'CHAPTER 04',
    title:   'FROM COMPARISON\nTO THE REAL RESIDENCE',
    body: [
      'After comparing options, the decision lands on a specific unit.',
      'Here the residence stops reading as a reference within the set and starts being understood through what makes it singular and inhabitable for a specific buyer.',
      'The goal is to move from "this option fits" to "this could be the right one", preparing the next step: making it your own.',
    ],
    button:  'CONTINUE TO CONFIGURATOR',
  },
}

export default function UnitChapterModal() {
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
