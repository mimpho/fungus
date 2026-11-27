import { useEffect, useState } from 'react'

const QUERY = '(max-width: 639px)'

/** True on a phone (under 640px, the width the dialogs turn into bottom sheets at); follows the window. */
export function useIsPhone() {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches === true)
  useEffect(() => {
    if (!window.matchMedia) return undefined
    const mq = window.matchMedia(QUERY)
    const on = () => setPhone(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return phone
}

const WIDE = '(min-width: 1024px)'

/** True from 1024px on: wide enough for the point card and a map panel side by side. */
export function useIsWide() {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(WIDE).matches === true)
  useEffect(() => {
    if (!window.matchMedia) return undefined
    const mq = window.matchMedia(WIDE)
    const on = () => setWide(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
}

// A phone held sideways, or a window just as short: too little height for the bottom bar and its sheets, and width
// enough for the side panels. The 640px keep out a phone held upright, whose keyboard can make it look sideways
const LOW = '(orientation: landscape) and (max-height: 500px) and (min-width: 640px)'
const TOUCH = '(pointer: coarse)'

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(query).matches === true)
  useEffect(() => {
    if (!window.matchMedia) return undefined
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

/** True on a short landscape screen: the map then keeps the side panels, with a narrower rail. */
export const useIsLowLandscape = () => useMediaQuery(LOW)

/** True where the short rail is narrower too (see TabRail). */
export const useIsLowest = () => useMediaQuery('(max-height: 380px)')

/** True where the main pointer is a finger. */
export const useIsTouch = () => useMediaQuery(TOUCH)
