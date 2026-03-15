import { useState, useEffect } from 'react'

/**
 * Returns `true` while the user is scrolling down and has scrolled past
 * `minScroll` px. Returns `false` when scrolling up or near top.
 * Uses a 4px dead-zone to avoid jitter.
 */
export function useScrollDir(minScroll = 80) {
  const [scrolledDown, setScrolledDown] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    const handler = () => {
      const y     = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < 4) return
      lastY = y
      if (y < minScroll) { setScrolledDown(false); return }
      setScrolledDown(delta > 0)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [minScroll])

  return scrolledDown
}
