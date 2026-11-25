import { useEffect, useState } from 'react'
import { useMediaQuery } from './useMediaQuery'

const nativeFullscreen = () => Boolean(document.fullscreenElement || document.webkitFullscreenElement)

/** The installed app on iPhone and iPad (Safari's own flag): the system's status bar stays over the page, even in the map's fullscreen. */
export const isIosApp = () => window.navigator.standalone === true

/**
 * True when the site runs without the browser's chrome: opened as the installed app (standalone or
 * fullscreen display mode; `navigator.standalone` is iOS Safari's own flag) or in the browser's fullscreen.
 */
export function useImmersive() {
  const displayMode = useMediaQuery('(display-mode: standalone), (display-mode: fullscreen)')
  const [fullscreen, setFullscreen] = useState(nativeFullscreen)
  useEffect(() => {
    const on = () => setFullscreen(nativeFullscreen())
    on()
    document.addEventListener('fullscreenchange', on)
    document.addEventListener('webkitfullscreenchange', on)
    return () => {
      document.removeEventListener('fullscreenchange', on)
      document.removeEventListener('webkitfullscreenchange', on)
    }
  }, [])
  return displayMode || fullscreen || isIosApp()
}
