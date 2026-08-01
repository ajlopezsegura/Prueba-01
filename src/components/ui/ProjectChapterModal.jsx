import { useEffect, useState } from 'react'
import { useLang } from '../../context/LangContext'
import JourneyModal from './JourneyModal'

const STORAGE_KEY = 'tvbs_seen_chapter_project_v1'

const COPY = {
  es: {
    eyebrow: 'CAPÍTULO 01',
    title:   'EL PROYECTO COMO\nARGUMENTO COMERCIAL',
    body: [
      'Antes de mostrar las viviendas, el sistema construye el marco que permite entender el valor del proyecto.',
      'La información no se presenta como una ficha técnica, sino como una lectura comercial: qué debe entenderse primero, qué ayuda a defender el valor y qué prepara mejor la entrada a las viviendas.',
      'Cada experiencia se diseña a medida según las características del activo, sus públicos, sus objeciones y la decisión que necesita facilitar.',
    ],
    button:  'CONTINUAR',
  },
  en: {
    eyebrow: 'CHAPTER 01',
    title:   'THE PROJECT AS\nCOMMERCIAL ARGUMENT',
    body: [
      'Before showing the residences, the system builds the frame that lets the value of the project be understood.',
      'Information is not presented as a technical sheet, but as a commercial reading: what must be understood first, what helps defend value, and what best prepares the entry to the residences.',
      'Each experience is tailored to the asset, its audiences, its objections and the decision it needs to facilitate.',
    ],
    button:  'CONTINUE',
  },
}

export default function ProjectChapterModal() {
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
