import { useEffect, useRef, useState } from 'react'

export default function LuxuryCursor() {
  const dotRef         = useRef(null)
  const ringWrapperRef = useRef(null)
  const ringInnerRef   = useRef(null)
  const isHovering     = useRef(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onMove(e) {
      // Position wrappers follow the cursor (no transition → always exact)
      const t = `translate(${e.clientX}px, ${e.clientY}px)`
      if (dotRef.current)         dotRef.current.style.transform         = t
      if (ringWrapperRef.current) ringWrapperRef.current.style.transform = t
      if (!visible) setVisible(true)

      // Toggle hover scale on the INNER ring only (separate transform, no conflict)
      const hovering = !!e.target.closest?.('[data-cursor="hover"]')
      if (hovering !== isHovering.current) {
        isHovering.current = hovering
        if (ringInnerRef.current) {
          ringInnerRef.current.style.transform = hovering ? 'scale(1.6)' : 'scale(1)'
        }
      }
    }

    function onTouch() {
      setVisible(false)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchstart', onTouch)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchstart', onTouch)
    }
  }, [visible])

  // Toggle native cursor hiding based on whether the deluxe cursor is active
  useEffect(() => {
    const root = document.documentElement
    if (visible) root.classList.add('luxury-cursor-active')
    else         root.classList.remove('luxury-cursor-active')
    return () => root.classList.remove('luxury-cursor-active')
  }, [visible])

  if (!visible) return null

  return (
    <>
      {/* Dot — positioned via transform with -50%,-50% (size is stable) */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 7, height: 7,
          marginLeft: -3.5, marginTop: -3.5,
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent)',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
        }}
      />
      {/* Ring wrapper: handles position only — JS writes translate(X,Y) here */}
      <div
        ref={ringWrapperRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          pointerEvents: 'none',
          zIndex: 9998,
          willChange: 'transform',
        }}>
        {/* Ring inner: handles scale only, centered via negative margins */}
        <div
          ref={ringInnerRef}
          style={{
            width: 34, height: 34,
            marginLeft: -17, marginTop: -17,
            borderRadius: '50%',
            border: '1px solid rgba(184,152,72,0.6)',
            transition: 'transform 0.2s ease',
            willChange: 'transform',
            transform: 'scale(1)',
          }}
        />
      </div>
    </>
  )
}
