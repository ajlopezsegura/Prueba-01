import { useEffect, useState } from 'react'
import { useLang } from '../../context/LangContext'
import JourneyModal from './JourneyModal'

const STORAGE_KEY = 'tvbs_seen_intro_v1'

const COPY = {
  es: {
    eyebrow: 'CASO DEMO',
    title:   'UN SISTEMA DE VENTA\nCON DOS CARAS',
    body: [
      'Esto no es una web. Es un sistema para vender una promoción de alto valor — y trabaja por dos caras a la vez.',
      'Para el comprador: un recorrido guiado que ordena la decisión. Entender, comparar, elegir. Menos ruido, más intención.',
      'Para ti, promotor: una lectura en vivo de cada visita — quién se interesa, dónde duda, qué lead está caliente. Vendes antes, defiendes precio y sabes a quién llamar.',
    ],
    button:  'ENTRAR EN LA DEMO',
    caption: 'Caso demo construido íntegramente por TVBS.',
  },
  en: {
    eyebrow: 'DEMO CASE',
    title:   'A SALES SYSTEM\nWITH TWO SIDES',
    body: [
      'This is not a website. It is a system built to sell a high-value development — working on two sides at once.',
      'For the buyer: a guided path that orders the decision. Understand, compare, choose. Less noise, more intent.',
      'For you, the developer: a live reading of every visit — who is interested, where they hesitate, which lead is warm. Sell sooner, defend price and know exactly who to call.',
    ],
    button:  'ENTER THE DEMO',
    caption: 'A demo case built entirely by TVBS.',
  },
}

export default function IntroModal() {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const t = COPY[lang] ?? COPY.es

  useEffect(() => {
    // localStorage gate disabled — modal always shows on each visit
    const id = setTimeout(() => setOpen(true), 600)
    return () => clearTimeout(id)
  }, [])

  function dismiss() {
    setOpen(false)
  }

  return (
    <JourneyModal
      open={open}
      onClose={dismiss}
      studioMark
      eyebrow={t.eyebrow}
      title={t.title}
      body={t.body}
      button={t.button}
      caption={t.caption}
    />
  )
}
