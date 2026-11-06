import { useApp } from '../contexts/AppContext'
import { ObsModal } from './observatory/ObsModal'

const LINK = 'underline underline-offset-2 hover:text-cream transition-colors'

/**
 * The one place for the credits the data licences ask for (CC BY 4.0, ODbL, Copernicus).
 * Opened from the footer link of every page and from the «Sources» link of the observatory map
 * (where the map itself shows the short credit of the data on screen).
 */
export function CreditsModal() {
  const { t, creditsOpen, setCreditsOpen } = useApp()
  if (!creditsOpen) return null
  return (
    <ObsModal title={t.creditsTitle} onClose={() => setCreditsOpen(false)} sheet sheetBackdrop={false} titleNowrap>
    <div className="text-sm text-cream/70 space-y-3">
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
      <p>
        {t.obsAttrTerrain}{' '}
        <a href="https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM" target="_blank" rel="noopener noreferrer" className={LINK}>Copernicus DEM GLO-30</a>
        {' '}(© DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018, provided under COPERNICUS by the European Union and ESA)
        {' · '}
        {t.obsAttrLithology}{' '}
        <a href="https://www.icgc.cat/" target="_blank" rel="noopener noreferrer" className={LINK}>ICGC</a>
        {' '}(<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className={LINK}>CC BY 4.0</a>)
        {' · '}
        {t.obsAttrForest}{' '}
        <a href="https://www.creaf.cat/" target="_blank" rel="noopener noreferrer" className={LINK}>CREAF</a>
        {' '}(Mapa de cobertes del sòl de Catalunya, MCSC-4)
        {' · '}
        {t.obsAttrReliefMap}{' '}
        <a href="https://www.icgc.cat/" target="_blank" rel="noopener noreferrer" className={LINK}>ICGC</a>
      </p>
      <p className="text-xs text-cream/50">{t.obsAttrSoilNote}</p>
      <p className="text-xs text-cream/50">{t.obsDisclaimer}</p>
    </div>
    </ObsModal>
  )
}
