import { useEffect, useState } from 'react'

const EMPTY = { mapW: 0, creditsW: 0, creditsH: 0 }

/** The map's width and the size of its credits, kept up to date as the window or the credits' text change. */
export function useMapCorner(map) {
  const [corner, setCorner] = useState(EMPTY)
  useEffect(() => {
    if (!map) return undefined
    const credits = map.attributionControl?.getContainer()
    const measure = () => {
      const next = { mapW: map.getContainer().clientWidth, creditsW: credits?.offsetWidth ?? 0, creditsH: credits?.offsetHeight ?? 0 }
      setCorner(prev => (Object.keys(next).every(key => prev[key] === next[key]) ? prev : next))
    }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    if (credits) observer?.observe(credits)
    // the map's box too: Leaflet fires no 'resize' when a change of 1px leaves its centre on the same pixel
    observer?.observe(map.getContainer())
    map.on('resize', measure)
    measure()
    return () => { observer?.disconnect(); map.off('resize', measure) }
  }, [map])
  return corner
}
