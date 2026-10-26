import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import {
  CARTO_LABELS_URL, CARTO_NOLABELS_URL, BASEMAP_ATTRIBUTION, ICGC_HYBRID_TILES_URL,
  ICGC_RELIEF_TILES_URL, ICGC_RELIEF_BOUNDS, ICGC_ATTRIBUTION,
} from '../../lib/basemap'
import { CATALONIA_BOUNDS } from '../../lib/catalonia'
import { cellFill, ALPHA_SCALE_BY_BASEMAP } from '../../lib/layerColors'
import { reliefOverlay } from '../../lib/reliefLayer'
import { forestTypeOverlay } from '../../lib/forestLayer'
import { pinSvg } from '../../lib/cornerKinds'

// leaflet.markercluster is UMD and looks for `L` as a global: expose it before importing it
// (same as LeafletMap.jsx does for leaflet.heat), and import it only when the layer is shown.
window.L = L
let clusterLoad = null
const ensureCluster = () => (clusterLoad ??= import('leaflet.markercluster').catch(err => { clusterLoad = null; throw err }))

// Leaflet draws SVG outside React's DOM: colours are literal hex, never CSS vars
// (see the Leaflet entry in memory/gotchas.md).
const OBSERVED_STYLE = { radius: 10, color: '#f4ebe1', weight: 2, fillColor: '#4a7c59', fillOpacity: 0.95 }
const PENDING_STYLE  = { radius: 9, color: '#f0d9a8', weight: 3, dashArray: '3 3', fillColor: '#c4a06b', fillOpacity: 0.45 }

const BOUNDS = L.latLngBounds(
  [CATALONIA_BOUNDS.lat[0], CATALONIA_BOUNDS.lon[0]],
  [CATALONIA_BOUNDS.lat[1], CATALONIA_BOUNDS.lon[1]],
)
const OBSERVED_ZOOM = 12
// A cell's score: one number, or (excellent edibles together) one per species
const meanScore = s => {
  if (!Array.isArray(s)) return s
  const v = s.filter(x => x != null)
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}
const LAYER_PANE = 'obsLayer' // between the tiles (200) and the markers (400): the layer never covers a point
const FOREST_PANE = 'obsForest' // forest types: under the conditions layer, so both can be on
const LABELS_PANE = 'obsLabels' // place names of the dark maps: over the layer (350), under the markers

// A cluster of corners: dark olive disc with a cream ring, so it reads on satellite, streets and relief alike
function clusterIcon(cluster) {
  const n = cluster.getChildCount()
  const size = n < 10 ? 36 : n < 50 ? 42 : 48
  return L.divIcon({
    className: 'corner-cluster',
    iconSize: [size, size],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#2f5d3f;border:2px solid #f4ebe1;box-shadow:0 1px 4px rgba(0,0,0,.6);color:#f4ebe1;display:flex;align-items:center;justify-content:center;font:700 ${n < 100 ? 14 : 12}px Arial,Helvetica,sans-serif">${n}</div>`,
  })
}

function cornerMarker(sp, pinLabel, onPick) {
  const marker = L.marker([sp.lat, sp.lon], {
    icon: L.divIcon({ className: 'corner-pin', html: pinSvg(sp.kind), iconSize: [30, 38], iconAnchor: [15, 37], tooltipAnchor: [0, -34] }),
    title: pinLabel.replace('{name}', sp.name), // setAttribute: the name is user text, never HTML
    riseOnHover: true,
  })
  const name = document.createElement('span')
  name.textContent = sp.name
  marker.bindTooltip(name, { direction: 'top' })
  marker.on('click', () => onPick(sp.lat, sp.lon))
  return marker
}

/**
 * Map of Catalonia. A click only reports the coordinates (onPick); what to do with them is the
 * page's. `observed` is the point being observed (green), `pending` the one just picked (dashed).
 * `saved` are the user's corners, drawn as pins by kind and grouped in clusters (the «Mis rincones» layer) while `showSaved` is on.
 * `layer` is the answer of /layer/probability. With the elevation raster (`elevation`) every pixel
 * is coloured by the score of its own elevation; without it every scored cell is a rectangle
 * coloured by its score. With the habitat rasters (`habitat` = { forest, substrate }) the probability is also lowered where
 * the forest is not one the species fits or the soil pH is not its own. Neither takes clicks, so picking a point works over the layer.
 */
export function ObservatoryMap({ observed, pending, saved = [], showSaved = true, pinLabel = '{name}', layer = null, elevation = null, habitat = null, forestTypes = null, onPick, label, basemap = 'satellite', flyTo = null, startAt = null, className = '' }) {
  const elRef      = useRef(null)
  const mapRef     = useRef(null)
  const observedRef = useRef(null)
  const pendingRef  = useRef(null)
  const tilesRef    = useRef(null)
  const savedRef    = useRef(null)
  const layerRef    = useRef(null)
  const forestRef   = useRef(null)
  const onPickRef  = useRef(onPick)
  const initial    = useRef(observed ?? startAt)
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
    map.createPane(FOREST_PANE).style.zIndex = 340
    map.createPane(LAYER_PANE).style.zIndex = 350
    map.createPane(LABELS_PANE).style.zIndex = 360
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
      mapRef.current = observedRef.current = pendingRef.current = tilesRef.current = savedRef.current = layerRef.current = forestRef.current = null
    }
  }, [])

  // Basemap: satellite (default), streets or shaded relief. Swapped without touching the view or the markers.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    tilesRef.current?.remove()
    // The dark maps (relief, streets) are drawn without names and the names go in a pane of their
    // own above the conditions layer, so the colour never covers them. The satellite image is
    // ICGC's "hybrid" tile, with the names printed in it: they cannot be separated.
    const carto = { attribution: BASEMAP_ATTRIBUTION, subdomains: 'abcd', maxZoom: 19 }
    const labels = () => L.tileLayer(CARTO_LABELS_URL, { ...carto, attribution: '', pane: LABELS_PANE })
    if (basemap === 'relief') {
      // The shading only covers Catalonia and has no place names: CARTO's dark map goes under it
      // (so nothing outside is empty)
      const ground = L.tileLayer(CARTO_NOLABELS_URL, carto)
      const relief = L.tileLayer(ICGC_RELIEF_TILES_URL, { attribution: ICGC_ATTRIBUTION, maxZoom: 19, maxNativeZoom: 15, bounds: ICGC_RELIEF_BOUNDS })
      tilesRef.current = L.layerGroup([ground, relief, labels()]).addTo(map)
      ground.bringToBack()
      return
    }
    if (basemap === 'streets') {
      tilesRef.current = L.layerGroup([L.tileLayer(CARTO_NOLABELS_URL, carto), labels()]).addTo(map)
      return
    }
    tilesRef.current = L.tileLayer(ICGC_HYBRID_TILES_URL, { attribution: ICGC_ATTRIBUTION, maxZoom: 19 })
    tilesRef.current.addTo(map).bringToBack()
  }, [basemap])

  // On the shaded relief the layer multiplies the grey shading instead of covering it: the pane is
  // blended with the tiles under it (the pane is a sibling of the tile pane, so it sees them)
  useEffect(() => {
    const pane = mapRef.current?.getPane(LAYER_PANE)
    if (pane) pane.style.mixBlendMode = basemap === 'relief' ? 'multiply' : ''
  }, [basemap])

  // Probability layer: a picture blending the cells (with relief when the elevation raster is
  // loaded); if drawing it fails, one rectangle per scored cell, sized by the grid the backend measured
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    layerRef.current?.remove()
    layerRef.current = null
    if (!layer?.cells?.length) return
    const options = { pane: LAYER_PANE, interactive: false }
    try {
      const overlay = reliefOverlay(elevation, layer, habitat ?? {}, { alphaScale: ALPHA_SCALE_BY_BASEMAP[basemap] ?? 1 }) // elevation null: blended by cell, without relief
      if (overlay) {
        layerRef.current = L.imageOverlay(overlay.url, overlay.bounds, options).addTo(map)
        return
      }
    } catch (err) {
      console.warn('Probability layer: picture failed, drawing cells', err)
    }
    const cells = layer.cells.filter(c => c.status === 'scored' && c.half_lat && c.half_lon)
    if (!cells.length) return
    const group = L.layerGroup()
    for (const c of cells) {
      L.rectangle(
        [[c.lat - c.half_lat, c.lon - c.half_lon], [c.lat + c.half_lat, c.lon + c.half_lon]],
        { ...options, stroke: false, ...cellFill(meanScore(c.score)) },
      ).addTo(group)
    }
    group.addTo(map)
    layerRef.current = group
  }, [layer, elevation, habitat, basemap])

  // Forest type layer: the forest raster painted by dominant type; `forestTypes` = { raster, active }
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    forestRef.current?.remove()
    forestRef.current = null
    if (!forestTypes?.raster) return
    try {
      const overlay = forestTypeOverlay(forestTypes.raster, forestTypes.active, { alphaScale: ALPHA_SCALE_BY_BASEMAP[basemap] ?? 1 })
      if (overlay) forestRef.current = L.imageOverlay(overlay.url, overlay.bounds, { pane: FOREST_PANE, interactive: false }).addTo(map)
    } catch (err) {
      console.warn('Forest type layer: picture failed', err)
    }
  }, [forestTypes, basemap])

  // Corners: a pin per kind with its name, in clusters (leaflet.markercluster, loaded on demand);
  // clicking one picks it like a click on that spot. If the plugin cannot load, plain pins.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return undefined
    let cancelled = false
    savedRef.current?.remove()
    savedRef.current = null
    if (!showSaved || !saved.length) return undefined
    const pick = (lat, lon) => onPickRef.current?.(lat, lon)
    const fill = group => {
      for (const sp of saved) cornerMarker(sp, pinLabel, pick).addTo(group)
      if (cancelled || mapRef.current !== map) return
      group.addTo(map)
      savedRef.current = group
    }
    ensureCluster()
      .then(() => fill(L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 45, iconCreateFunction: clusterIcon })))
      .catch(err => {
        console.warn('Corners layer: clustering unavailable, plain pins', err)
        if (!cancelled) fill(L.layerGroup())
      })
    return () => { cancelled = true }
  }, [saved, showSaved, pinLabel])

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
