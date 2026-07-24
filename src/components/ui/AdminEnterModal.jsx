import { useEffect, useState } from 'react'
import JourneyModal from './JourneyModal'

const STORAGE_KEY = 'tvbs_seen_admin_enter_v1'

const COPY = {
  es: {
    eyebrow: 'PERSPECTIVA COMERCIAL',
    title:   'EL RECORRIDO\nCONVERTIDO EN LECTURA',
    body: [
      'Cada visita deja una huella: qué se ha mirado, cuánto tiempo, qué viviendas generan interés, dónde aparecen dudas y qué decisiones avanzan o se frenan.',
      'El panel transforma ese recorrido en una lectura comercial del proyecto: inventario en movimiento, señales de decisión, comportamiento de navegación, leads cualificados y puntos de fricción dentro de la experiencia.',
      'En la práctica, esto es lo que te da: vendes antes, defiendes precio y sabes qué lead está caliente antes de la primera llamada.',
    ],
    button: 'ENTRAR AL PANEL',
  },
  en: {
    eyebrow: 'COMMERCIAL PERSPECTIVE',
    title:   'THE JOURNEY\nTURNED INTO READING',
    body: [
      'Every visit leaves a trace: what was looked at, for how long, which residences generate interest, where doubts appear and which decisions move forward or stall.',
      'The panel turns that journey into a commercial reading of the project: live inventory, decision signals, navigation behaviour, qualified leads and friction points within the experience.',
      'In practice, this is what it gives you: you sell sooner, defend price and know which lead is warm before the first call.',
    ],
    button: 'ENTER THE PANEL',
  },
}

export default function AdminEnterModal({ lang = 'es' }) {
  const [open, setOpen] = useState(false)
  const t = COPY[lang] ?? COPY.es

  useEffect(() => {
    // localStorage gate disabled — modal always shows on each visit
    const id = setTimeout(() => setOpen(true), 400)
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
