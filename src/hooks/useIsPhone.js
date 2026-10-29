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
