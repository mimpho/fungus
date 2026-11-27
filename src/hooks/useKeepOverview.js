import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { CATALONIA_BOUNDS } from '../lib/catalonia'
import { bestFreeRect } from '../lib/freeArea'
import { ZOOM_STEP } from '../lib/mapZoom'

const CATALONIA = L.latLngBounds(
  [CATALONIA_BOUNDS.lat[0], CATALONIA_BOUNDS.lon[0]],
  [CATALONIA_BOUNDS.lat[1], CATALONIA_BOUNDS.lon[1]],
)
// The box has empty corners (sea, France, Aragón): what must be in view to count as «all of Catalonia» is a
// little inside it, and it may reach a little under what covers the map
const CORE = CATALONIA.pad(-0.1)
const OVERLAP_PX = 12
const SETTLE_MS = 450 // sheets and panels slide in: the map moves once, when they are done
const SAME_PX = 12 // a smaller move than this is not worth making

/** What covers the map (every element marked `data-map-cover` under `root`), in the map's own pixels. */
function covers(root, map) {
  const base = map.getContainer().getBoundingClientRect()
  return [...root.querySelectorAll('[data-map-cover]')].map(el => {
    const r = el.getBoundingClientRect()
    return {
      el,
      left: r.left - base.left + OVERLAP_PX, right: r.right - base.left - OVERLAP_PX,
      top: r.top - base.top + OVERLAP_PX, bottom: r.bottom - base.top - OVERLAP_PX,
    }
  })
}

/** All of Catalonia is in the view, and not as a speck: the user is looking at the whole of it. */
function seesCatalonia(map) {
  const whole = map.getBoundsZoom(CATALONIA)
  return map.getBounds().contains(CORE) && map.getZoom() <= whole + 1
}

/**
 * The view is still the one the last `fit` left (neither panned nor zoomed since; a resize keeps the centre). Where
 * little is free that view does not hold all of Catalonia, so `seesCatalonia` alone would never bring it back.
 */
function stillFitted(map) {
  const last = map.obsFitted
  if (!last || Math.abs(map.getZoom() - last.zoom) >= ZOOM_STEP / 2) return false
  return map.project(map.getCenter(), last.zoom).distanceTo(map.project(last.centre, last.zoom)) < SAME_PX
}

/** Moves the map so that Catalonia is as large as it can be in the part left free. */
function fit(map, list) {
  const size = map.getSize()
  const at = map.getZoom()
  const nw = map.project(CATALONIA.getNorthWest(), at)
  const se = map.project(CATALONIA.getSouthEast(), at)
  const shape = { w: se.x - nw.x, h: se.y - nw.y }
  const rect = bestFreeRect(size, list, shape, { level: s => Math.floor((at + Math.log2(s)) / ZOOM_STEP) })
  if (!rect) return // hardly any map left in view: leave it
  const scale = Math.min((rect.right - rect.left) / shape.w, (rect.bottom - rect.top) / shape.h)
  const zoom = Math.max(map.getMinZoom(), Math.floor((at + Math.log2(scale)) / ZOOM_STEP) * ZOOM_STEP)
  // the view's centre sits as far from Catalonia's as the screen's centre does from the free part's
  const middle = map.project(CATALONIA.getNorthWest(), zoom).add(map.project(CATALONIA.getSouthEast(), zoom)).divideBy(2)
  const shift = L.point(size.x / 2 - (rect.left + rect.right) / 2, size.y / 2 - (rect.top + rect.bottom) / 2)
  const centre = map.unproject(middle.add(shift), zoom)
  const moved = map.project(map.getCenter(), zoom).distanceTo(map.project(centre, zoom))
  if (Math.abs(zoom - at) < ZOOM_STEP / 2 && moved < SAME_PX) return
  // The drag limits must allow this view, or they pull it back to the middle of the screen
  const half = size.divideBy(2)
  const centrePx = map.project(centre, zoom)
  map.obsOverview = L.latLngBounds(map.unproject(centrePx.subtract(half), zoom), map.unproject(centrePx.add(half), zoom))
  // The old limits off while moving, and the new ones back once there: set during the move they would cut it short
  map.setMaxBounds(null)
  map.once('moveend', () => map.obsFitDragBounds?.())
  map.obsFitted = { centre, zoom }
  map.setView(centre, zoom, { animate: true })
}

/**
 * While the whole of Catalonia is in view, keeps it clear of the interface: when the window changes size or a
 * panel, a card or a sheet opens, closes, folds or grows, the map moves it to the free part. Zoomed in on a
 * place, the map is left alone. `rootRef`: the element holding the map and what covers it. `signature`: any
 * string that changes when a cover appears or goes (their own size changes are watched here).
 */
export function useKeepOverview(map, rootRef, signature) {
  const timer = useRef(null)
  const observer = useRef(null)
  const watched = useRef(new Set())

  useEffect(() => {
    if (!map) return undefined
    const run = () => {
      const root = rootRef.current
      if (!root) return
      const list = covers(root, map)
      // watch the covers there are now, so that one folding or growing is seen
      for (const { el } of list) {
        if (!watched.current.has(el)) { watched.current.add(el); observer.current?.observe(el) }
      }
      if (!map.getSize().x || !(stillFitted(map) || seesCatalonia(map))) return
      fit(map, list)
    }
    const later = () => { clearTimeout(timer.current); timer.current = setTimeout(run, SETTLE_MS) }
    observer.current = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(later)
    watched.current = new Set()
    map.on('resize', later)
    map.obsLater = later
    later()
    return () => {
      clearTimeout(timer.current)
      observer.current?.disconnect()
      map.off('resize', later)
      delete map.obsLater
    }
  }, [map, rootRef])

  useEffect(() => { map?.obsLater?.() }, [map, signature])
}
