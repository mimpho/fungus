import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import {
  CARTO_LABELS_URL, CARTO_NOLABELS_URL, BASEMAP_ATTRIBUTION, ICGC_HYBRID_TILES_URL,
  ICGC_RELIEF_TILES_URL, ICGC_RELIEF_BOUNDS, ICGC_ATTRIBUTION,
} from '../../lib/basemap'
import { CATALONIA_BOUNDS } from '../../lib/catalonia'
import { cellFill, ALPHA_SCALE_BY_BASEMAP } from '../../lib/layerColors'
import { reliefOverlay } from '../../lib/reliefLayer'
import { forestTypeOverlay, FOREST_ALPHA_SCALE_BY_BASEMAP } from '../../lib/forestLayer'
import { pinSvg } from '../../lib/cornerKinds'
import { useApp } from '../../contexts/AppContext'

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
// A picked point brings the map at least this close, so the surroundings of the point are in view
const PICK_ZOOM = 11
// A cell's score: one number, or (excellent edibles together) one per species
const meanScore = s => {
  if (!Array.isArray(s)) return s
  const v = s.filter(x => x != null)
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}
// Draw order, bottom to top (PRD rule 5): Meteo colours, Bosque classes, Zonas de interés, Top 10, Mis rincones.
// All between the tiles (200) and the markers (400, where the corners are): no layer ever covers a point.
const LAYER_PANE = 'obsLayer' // Meteo: the conditions layer (350)
const FOREST_PANE = 'obsForest' // Bosque: over the conditions (355), so both can be read at once
const LABELS_PANE = 'obsLabels' // place names of the dark maps: over both layers (360)
// Reserved for epic/observatory-zones-of-interest and the Top 10: 370 and 380
// How the layer mixes with the base map: on the relief it multiplies the grey shading; on the satellite
// `hard-light` keeps the colour strong while the ground (valleys, rivers, towns) still reads through it
const LAYER_BLEND = { relief: 'multiply', satellite: 'hard-light' }

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

// With a sheet over the bottom of the map (phone) or a panel over its right side (desktop) a picked point
// must not end up under it: if it is not clearly in the part left in view (`area` = { top, bottomPx, rightPx }),
// the map moves it to the middle of that part
function keepClear(map, point, area) {
  if (!area) return
  const size = map.getSize()
  const top = area.top ?? 0
  const visibleBottom = size.y - (area.bottomPx ?? 0)
  const visibleRight = size.x - (area.rightPx ?? 0)
  const p = map.latLngToContainerPoint([point.lat, point.lon])
  const dy = p.y < top + 24 || p.y > visibleBottom - 40 ? p.y - (top + visibleBottom) / 2 : 0
  const dx = area.rightPx && (p.x < 24 || p.x > visibleRight - 40) ? p.x - visibleRight / 2 : 0
  if (dx || dy) map.panBy([dx, dy], { animate: true })
}

// How far the map can be dragged: Catalonia with a margin, as if the whole map were in view
const DRAG_BOUNDS = BOUNDS.pad(0.25)

/**
 * The drag limits, grown by what the interface covers at the map's edges (`area`: the search at the
 * top, the phone's bar or sheet at the bottom, a desktop panel at the right), so that every part of
 * Catalonia can be dragged into the strip left in view. In pixels at the current zoom, so it is worked
 * out again when the zoom or the covered area changes.
 */
function fitDragBounds(map, area) {
  const top = area?.top ?? 0
  const bottom = area?.bottomPx ?? 0
  const right = area?.rightPx ?? 0
  if (!top && !bottom && !right) { map.setMaxBounds(DRAG_BOUNDS); return }
  const zoom = map.getZoom()
  const nw = map.project(DRAG_BOUNDS.getNorthWest(), zoom).subtract([0, top])
  const se = map.project(DRAG_BOUNDS.getSouthEast(), zoom).add([right, bottom])
  map.setMaxBounds(L.latLngBounds(map.unproject(nw, zoom), map.unproject(se, zoom)))
}

// The first base tiles get this long to arrive before the layers are drawn anyway
const BASE_WAIT_MS = 2500

// Working out a layer's picture holds the page for a moment. React runs the effects of a click before the
// browser paints, so the work is put off until after the next paint: the switch that was clicked shows as
// on at once, and the loading bar can show while the picture is worked out. Returns a cancel function.
function afterPaint(work) {
  let timer = null
  const frame = requestAnimationFrame(() => { timer = setTimeout(work, 0) })
  return () => { cancelAnimationFrame(frame); clearTimeout(timer) }
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
export function ObservatoryMap({ observed, pending, saved = [], showSaved = true, pinLabel = '{name}', layer = null, elevation = null, habitat = null, forestTypes = null, onPick, label, basemap = 'satellite', flyTo = null, startAt = null, onViewChange = null, centerAbove = null, dataSources = null, leafletZoom = true, onMap = null, onDrawing = null, className = '' }) {
  const { t, setCreditsOpen } = useApp()
  const elRef      = useRef(null)
  const mapRef     = useRef(null)
  const observedRef = useRef(null)
  const pendingRef  = useRef(null)
  const tilesRef    = useRef(null)
  const savedRef    = useRef(null)
  const layerRef    = useRef(null)
  const forestRef   = useRef(null)
  const onPickRef  = useRef(onPick)
  const onViewRef  = useRef(onViewChange)
  const centerRef  = useRef(centerAbove)
  const flyingRef  = useRef(false) // a search result's flight is under way
  const initial    = useRef(observed ?? startAt)
  // Pictures being worked out (layer, forest): the page shows its loading bar meanwhile
  const drawingRef = useRef({ layer: false, forest: false })
  const onDrawingRef = useRef(onDrawing)
  useEffect(() => { onDrawingRef.current = onDrawing }, [onDrawing])
  const setDrawing = (key, value) => {
    if (drawingRef.current[key] === value) return
    drawingRef.current = { ...drawingRef.current, [key]: value }
    onDrawingRef.current?.(drawingRef.current.layer || drawingRef.current.forest)
  }
  // Working out a layer's colours holds the page for a moment: the first time, the base map is painted first
  const [baseReady, setBaseReady] = useState(false)
  useEffect(() => { onPickRef.current = onPick }, [onPick])
  useEffect(() => { onViewRef.current = onViewChange; centerRef.current = centerAbove }, [onViewChange, centerAbove])

  // Create the map once
  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = L.map(elRef.current, {
      zoomControl: false,
      minZoom: 7,
      maxBounds: DRAG_BOUNDS,
      maxBoundsViscosity: 0.8,
    })
    map.createPane(LAYER_PANE).style.zIndex = 350
    map.createPane(FOREST_PANE).style.zIndex = 355
    map.createPane(LABELS_PANE).style.zIndex = 360
    if (leafletZoom) L.control.zoom({ position: 'bottomright' }).addTo(map)
    if (initial.current) map.setView([initial.current.lat, initial.current.lon], initial.current.zoom ?? OBSERVED_ZOOM)
    else map.fitBounds(BOUNDS)
    map.on('click', e => onPickRef.current?.(e.latlng.lat, e.latlng.lng))
    map.on('zoomend', () => fitDragBounds(map, centerRef.current))
    map.on('moveend', () => { const c = map.getCenter(); onViewRef.current?.({ lat: c.lat, lon: c.lng, zoom: map.getZoom() }) })
    mapRef.current = map
    onMap?.(map)

    // The container changes size with the viewport and the panel: Leaflet must be told.
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(elRef.current)

    return () => {
      ro.disconnect()
      onMap?.(null)
      try { map.remove() } catch (_e) { /* partial state: ignore */ }
      mapRef.current = observedRef.current = pendingRef.current = tilesRef.current = savedRef.current = layerRef.current = forestRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  // The first base tiles: once they are painted (or after BASE_WAIT_MS), the layers may be drawn
  useEffect(() => {
    if (baseReady) return undefined
    const tiles = tilesRef.current
    const ready = () => requestAnimationFrame(() => setBaseReady(true))
    const timer = setTimeout(ready, BASE_WAIT_MS)
    tiles?.once?.('load', ready)
    // a layer group (relief, streets) passes the event of its first tile layer
    tiles?.eachLayer?.(l => l.once?.('load', ready))
    return () => { clearTimeout(timer); tiles?.off?.('load', ready); tiles?.eachLayer?.(l => l.off?.('load', ready)) }
  }, [baseReady, basemap])

  // Credits on the map: tile credits (set by the basemap), a «Sources» link that opens the credits modal
  // and, while a data layer is on, the short credit of that data. The full list lives in the modal.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const ctl = map.attributionControl
    ctl.setPrefix(false)
    // Leaflet keeps a removed credit's slot (count 0), so a credit added again would keep its old place:
    // forget the slot too, to make the link the last thing in the line
    const dataText = dataSources ? `${t.creditsMapData} ${dataSources.split('|').join(' · ')}` : null
    const linkHtml = `<a href="#" data-credits>${t.creditsLinkShort}</a>`
    if (dataText) ctl.addAttribution(dataText)
    ctl.addAttribution(linkHtml)
    return () => {
      for (const text of [dataText, linkHtml]) {
        if (!text) continue
        ctl.removeAttribution(text)
        if (ctl._attributions?.[text] === 0) delete ctl._attributions[text]
      }
    }
  }, [dataSources, t, basemap])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const el = map.attributionControl.getContainer()
    const onClick = e => {
      if (!e.target.closest?.('[data-credits]')) return
      e.preventDefault()
      setCreditsOpen(true)
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [setCreditsOpen])

  // On the shaded relief the layer multiplies the grey shading instead of covering it: the pane is
  // blended with the tiles under it (the pane is a sibling of the tile pane, so it sees them)
  useEffect(() => {
    const pane = mapRef.current?.getPane(LAYER_PANE)
    if (pane) pane.style.mixBlendMode = LAYER_BLEND[basemap] ?? ''
  }, [basemap])

  // Probability layer: a picture blending the cells (with relief when the elevation raster is
  // loaded); if drawing it fails, one rectangle per scored cell, sized by the grid the backend measured.
  // The new picture replaces the old one only once it is ready, so the map never blinks empty.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return undefined
    const replace = next => {
      layerRef.current?.remove()
      layerRef.current = next ? next.addTo(map) : null
    }
    if (!baseReady || !layer?.cells?.length) { replace(null); setDrawing('layer', false); return undefined }
    setDrawing('layer', true)
    const cancel = afterPaint(() => {
      const options = { pane: LAYER_PANE, interactive: false }
      let next = null
      try {
        const overlay = reliefOverlay(elevation, layer, habitat ?? {}, { alphaScale: ALPHA_SCALE_BY_BASEMAP[basemap] ?? 1 }) // elevation null: blended by cell, without relief
        if (overlay) next = L.imageOverlay(overlay.url, overlay.bounds, options)
      } catch (err) {
        console.warn('Probability layer: picture failed, drawing cells', err)
      }
      if (!next) {
        const cells = layer.cells.filter(c => c.status === 'scored' && c.half_lat && c.half_lon)
        if (cells.length) {
          next = L.layerGroup()
          for (const c of cells) {
            L.rectangle(
              [[c.lat - c.half_lat, c.lon - c.half_lon], [c.lat + c.half_lat, c.lon + c.half_lon]],
              { ...options, stroke: false, ...cellFill(meanScore(c.score)) },
            ).addTo(next)
          }
        }
      }
      if (mapRef.current === map) replace(next)
      setDrawing('layer', false)
    })
    return () => { cancel(); setDrawing('layer', false) }
  }, [layer, elevation, habitat, basemap, baseReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // Forest type layer: the forest raster painted by dominant type; `forestTypes` = { raster, active }
  useEffect(() => {
    const map = mapRef.current
    if (!map) return undefined
    const replace = next => {
      forestRef.current?.remove()
      forestRef.current = next ? next.addTo(map) : null
    }
    if (!baseReady || !forestTypes?.raster) { replace(null); setDrawing('forest', false); return undefined }
    setDrawing('forest', true)
    const cancel = afterPaint(() => {
      let next = null
      try {
        // A translucent fill with plain alpha, no blend: over the conditions a blended forest would mix into colours
        // neither legend has (compared in T4 with `hard-light` and with an outline per class)
        const overlay = forestTypeOverlay(forestTypes.raster, forestTypes.active, { alphaScale: FOREST_ALPHA_SCALE_BY_BASEMAP[basemap] ?? 1 })
        if (overlay) next = L.imageOverlay(overlay.url, overlay.bounds, { pane: FOREST_PANE, interactive: false })
      } catch (err) {
        console.warn('Forest type layer: picture failed', err)
      }
      if (mapRef.current === map) replace(next)
      setDrawing('forest', false)
    })
    return () => { cancel(); setDrawing('forest', false) }
  }, [forestTypes, basemap, baseReady]) // eslint-disable-line react-hooks/exhaustive-deps

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
    // The map stays as it is while the point is in view (observing from the map's own card, under the zone's layer, must not
    // change what the person comes back to); a point out of view (from the corners list, a link, Back) takes the map to it
    const target = L.latLng(observed.lat, observed.lon)
    if (!map.getBounds().contains(target)) map.setView(target, Math.max(map.getZoom(), OBSERVED_ZOOM), { animate: false })
  }, [observed?.lat, observed?.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  // Move the view on request (search result). `flyTo.n` changes on every request, even to the same place.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !flyTo) return undefined
    // The flight ends with the place in the middle of the map: then it is kept clear of a sheet or panel
    // over the map (the picked point's own move ran while the map was still flying)
    const clear = () => { flyingRef.current = false; keepClear(map, flyTo, centerRef.current) }
    flyingRef.current = true
    map.once('moveend', clear)
    map.flyTo([flyTo.lat, flyTo.lon], Math.max(map.getZoom(), OBSERVED_ZOOM), { duration: 0.8 })
    return () => { flyingRef.current = false; map.off('moveend', clear) }
  }, [flyTo?.n]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pending point (picked, not observed yet)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    pendingRef.current?.remove()
    pendingRef.current = null
    if (!pending) return
    pendingRef.current = L.circleMarker([pending.lat, pending.lon], { ...PENDING_STYLE, interactive: false }).addTo(map)
    // Too far out to tell what is around the point: the map flies to it first (the card stays where it is)
    // and, with a bottom sheet over the map (phone), it is then kept clear of the sheet
    const clear = () => keepClear(map, pending, centerRef.current)
    // A search result is already flying there: its flight keeps the point clear when it lands
    // (moving the map now would cut the flight short)
    if (flyingRef.current) return undefined
    if (map.getZoom() < PICK_ZOOM) {
      map.once('moveend', clear)
      map.flyTo([pending.lat, pending.lon], PICK_ZOOM, { duration: 0.6 })
      return () => { map.off('moveend', clear) }
    }
    // With a bottom sheet over the map (phone) the point must not end up under it: if it is not
    // clearly in the strip left above the sheet, the map moves it to the middle of that strip
    clear()
  }, [pending?.lat, pending?.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  // The sheet grows as its content arrives (up to 80% of the screen), a panel opens on the right: the point is kept clear of
  // them, and the drag limits grow by what they cover (a part of Catalonia under the sheet can be dragged up into view)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    fitDragBounds(map, centerAbove)
    if (pending && !flyingRef.current) keepClear(map, pending, centerRef.current)
  }, [centerAbove?.top, centerAbove?.bottomPx, centerAbove?.rightPx]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={elRef} role="region" aria-label={label} className={className} />
}
