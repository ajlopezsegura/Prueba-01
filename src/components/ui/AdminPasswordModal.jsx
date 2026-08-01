import { useEffect, useState } from 'react'
import JourneyModal from './JourneyModal'

const STORAGE_KEY = 'tvbs_seen_admin_password_hint_v1'

export default function AdminPasswordModal({ password }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // localStorage gate disabled — modal always shows on each visit
    const id = setTimeout(() => setOpen(true), 350)
    return () => clearTimeout(id)
  }, [])

  function dismiss() {
    setOpen(false)
  }

  return (
    <JourneyModal
      open={open}
      onClose={dismiss}
      eyebrow="DEMO · PERSPECTIVA COMERCIAL"
      title="PANEL DE VENTAS"
      body={[
        'Esta zona muestra el otro lado de la experiencia: cómo el equipo comercial recibe el recorrido, las señales de decisión y el contexto de cada lead.',
        'En producción, el acceso estaría restringido al promotor y a su equipo, con credenciales privadas y tratamiento de datos conforme a normativa.',
        'En esta demo, puedes acceder con la contraseña:',
        <span style={{
          display: 'inline-block',
          padding: '8px 22px',
          marginTop: 4,
          border: '1px solid rgba(184,152,72,0.5)',
          background: 'rgba(184,152,72,0.1)',
          color: 'var(--color-accent)',
          letterSpacing: '0.22em',
          fontSize: '0.95rem',
          fontWeight: 500,
        }}>{password}</span>,
      ]}
      button="ENTRAR"
    />
  )
}
