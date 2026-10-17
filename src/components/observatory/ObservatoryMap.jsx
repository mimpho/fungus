import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { CARTO_TILES_URL, BASEMAP_ATTRIBUTION, ICGC_HYBRID_TILES_URL, ICGC_ATTRIBUTION } from '../../lib/basemap'
import { CATALONIA_BOUNDS } from '../../lib/catalonia'

// Leaflet draws SVG outside React's DOM: colours are literal hex, never CSS vars
// (see the Leaflet entry in memory/gotchas.md).
const OBSERVED_STYLE = { radius: 10, color: '#f4ebe1', weight: 2, fillColor: '#4a7c59', fillOpacity: 0.95 }
const PENDING_STYLE  = { radius: 9, color: '#f0d9a8', weight: 3, dashArray: '3 3', fillColor: '#c4a06b', fillOpacity: 0.45 }

const BOUNDS = L.latLngBounds(
  [CATALONIA_BOUNDS.lat[0], CATALONIA_BOUNDS.lon[0]],
  [CATALONIA_BOUNDS.lat[1], CATALONIA_BOUNDS.lon[1]],
)
const OBSERVED_ZOOM = 12

/**
 * Map of Catalonia. A click only reports the coordinates (onPick); what to do with them is the
 * page's. `observed` is the point being observed (green), `pending` the one just picked (dashed).
 */
export function ObservatoryMap({ observed, pending, onPick, label, basemap = 'satellite', flyTo = null, className = '' }) {
  const elRef      = useRef(null)
  const mapRef     = useRef(null)
  const observedRef = useRef(null)
  const pendingRef  = useRef(null)
  const tilesRef    = useRef(null)
  const onPickRef  = useRef(onPick)
  const initial    = useRef(observed)
  useEffect(() => { onPickRef.current = onPick }, [onPick])

  // Create the map once
  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = L.map(elRef.current, {
      zoomControl: false,
      minZoom: 7,
      maxBounds: BOUNDS.pad(0.25),
      maxBoundsViscosity: 0.8,
    })
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    if (initial.current) map.setView([initial.current.lat, initial.current.lon], OBSERVED_ZOOM)
    else map.fitBounds(BOUNDS)
    map.on('click', e => onPickRef.current?.(e.latlng.lat, e.latlng.lng))
    mapRef.current = map

    // The container changes size with the viewport and the panel: Leaflet must be told.
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(elRef.current)

    return () => {
      ro.disconnect()
      try { map.remove() } catch (_e) { /* partial state: ignore */ }
      mapRef.current = observedRef.current = pendingRef.current = tilesRef.current = null
    }
  }, [])

  // Basemap: satellite (default) or streets. Swapped without touching the view or the markers.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    tilesRef.current?.remove()
    tilesRef.current = basemap === 'streets'
      ? L.tileLayer(CARTO_TILES_URL, { attribution: BASEMAP_ATTRIBUTION, subdomains: 'abcd', maxZoom: 19 })
      : L.tileLayer(ICGC_HYBRID_TILES_URL, { attribution: ICGC_ATTRIBUTION, maxZoom: 19 })
    tilesRef.current.addTo(map).bringToBack()
  }, [basemap])

  // Observed point: marker, and the view goes to it (also when it comes from the URL)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    observedRef.current?.remove()
    observedRef.current = null
    if (!observed) return
    observedRef.current = L.circleMarker([observed.lat, observed.lon], { ...OBSERVED_STYLE, interactive: false }).addTo(map)
    map.setView([observed.lat, observed.lon], Math.max(map.getZoom(), OBSERVED_ZOOM), { animate: true })
  }, [observed?.lat, observed?.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  // Move the view on request (search result). `flyTo.n` changes on every request, even to the same place.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !flyTo) return
    map.flyTo([flyTo.lat, flyTo.lon], Math.max(map.getZoom(), OBSERVED_ZOOM), { duration: 0.8 })
  }, [flyTo?.n]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pending point (picked, not observed yet)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    pendingRef.current?.remove()
    pendingRef.current = null
    if (!pending) return
    pendingRef.current = L.circleMarker([pending.lat, pending.lon], { ...PENDING_STYLE, interactive: false }).addTo(map)
  }, [pending?.lat, pending?.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={elRef} role="region" aria-label={label} className={className} />
}
