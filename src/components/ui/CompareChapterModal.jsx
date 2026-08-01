import { useEffect, useState } from 'react'
import { useLang } from '../../context/LangContext'
import JourneyModal from './JourneyModal'

const STORAGE_KEY = 'tvbs_seen_chapter_compare_v1'

const COPY = {
  es: {
    eyebrow: 'CAPÍTULO 03',
    title:   'ENTENDER EL VALOR\nCOMPARANDO',
    body: [
      'Comparar no consiste solo en cruzar datos, sino en entender qué representa cada opción dentro del conjunto.',
      'La experiencia pone en valor aquello que hace singular a cada unidad, ayudando a que las diferencias sean visibles, comprensibles y defendibles.',
      'El objetivo no es inducir una elección concreta, sino facilitar una decisión más clara, más razonada y más defendible — tanto para el comprador como para el equipo comercial.',
    ],
    button:  'ELEGIR UNA VIVIENDA',
  },
  en: {
    eyebrow: 'CHAPTER 03',
    title:   'UNDERSTANDING VALUE\nTHROUGH COMPARISON',
    body: [
      'Comparing is not just about cross-referencing data, but understanding what each option represents within the set.',
      'The experience surfaces what makes each unit singular, making differences visible, comprehensible and defensible.',
      'The aim is not to push a specific choice, but to enable a clearer, more considered and more defensible decision — both for the buyer and the commercial team.',
    ],
    button:  'CHOOSE A RESIDENCE',
  },
}

export default function CompareChapterModal() {
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
