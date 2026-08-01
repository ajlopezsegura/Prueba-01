import { useState, useEffect } from 'react'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

// Touch-only: coarse primary pointer AND no fine pointer available (e.g. touchscreen laptops still get cursor)
export const useIsTouch = () => {
  const coarse = useMediaQuery('(pointer: coarse)')
  const hasFine = useMediaQuery('(any-pointer: fine)')
  return coarse && !hasFine
}
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
