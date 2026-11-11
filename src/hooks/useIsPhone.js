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
