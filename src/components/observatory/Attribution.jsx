import { useApp } from '../../contexts/AppContext'

const LINK = 'underline underline-offset-2 hover:text-cream transition-colors'

/**
 * Credits required by the data licences (CC BY 4.0, ODbL) plus the standing disclaimer.
 * Always rendered with the page, signed in or not: the data it credits is on screen
 * whenever the page shows a result.
 */
export function Attribution() {
  const { t } = useApp()
  return (
    <footer className="text-xs text-cream/50 space-y-1 pt-4 border-t border-white/[0.06]">
      <p>{t.obsDisclaimer}</p>
      <p>
        {t.obsAttrWeather}{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className={LINK}>Open-Meteo.com</a>
        {' '}(<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className={LINK}>CC BY 4.0</a>)
        {' · '}
        {t.obsAttrCover}{' '}
        <a href="https://www.icgc.cat/" target="_blank" rel="noopener noreferrer" className={LINK}>ICGC</a>
        {' '}(<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className={LINK}>CC BY 4.0</a>)
        {' · '}
        {t.obsAttrSearch}{' '}
        <a href="https://photon.komoot.io/" target="_blank" rel="noopener noreferrer" className={LINK}>Photon</a>
        {' · © '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className={LINK}>OpenStreetMap contributors</a>
      </p>
    </footer>
  )
}
