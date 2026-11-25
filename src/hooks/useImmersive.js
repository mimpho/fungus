import { useEffect, useState } from 'react'
import { useMediaQuery } from './useMediaQuery'

const nativeFullscreen = () => Boolean(document.fullscreenElement || document.webkitFullscreenElement)

/** The installed app on iPhone and iPad (Safari's own flag): the system's status bar stays over the page, even in the map's fullscreen. */
export const isIosApp = () => window.navigator.standalone === true

/** True while the browser's Fullscreen API holds the page (asked for by the map's switch, or left on from it). */
function useNativeFullscreen() {
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
  return fullscreen
}

/**
 * True when the page is already in fullscreen without the Fullscreen API having been asked: the installed app
 * (`display: fullscreen` in the manifest; iPhone ignores it) or the browser's own (F11). The page cannot leave it.
 */
export function useAppFullscreen() {
  const displayMode = useMediaQuery('(display-mode: fullscreen)')
  return !useNativeFullscreen() && displayMode
}

/** True in any fullscreen, app or not: the installed app's, F11, or the one the map's switch asked the browser for. */
export function useFullscreen() {
  const displayMode = useMediaQuery('(display-mode: fullscreen)')
  return useNativeFullscreen() || displayMode
}

/**
 * True when the site runs without the browser's chrome: opened as the installed app (standalone or
 * fullscreen display mode; `navigator.standalone` is iOS Safari's own flag) or in the browser's fullscreen.
 */
export function useImmersive() {
  const displayMode = useMediaQuery('(display-mode: standalone), (display-mode: fullscreen)')
  const fullscreen = useNativeFullscreen()
  return displayMode || fullscreen || isIosApp()
}
