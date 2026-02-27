// LeafletMap.jsx — mapa Leaflet vanilla (useRef/useEffect) con modo markers y heatmap
// Depende de: leaflet, leaflet.heat (instalados vía npm)
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import L from 'leaflet'
// leaflet.heat es CommonJS y busca `L` como global — hay que exponerlo antes de importarlo
window.L = L
let _heatLoaded = false
async function ensureHeat() {
  if (!_heatLoaded) { await import('leaflet.heat'); _heatLoaded = true }
}
import { IC } from '../../lib/helpers'
import { Tabs } from '../ui/Tabs'

// ─── Heatmap meteórico sintético ─────────────────────────────────────────────
function fakeMeteoIntensity(lat, lng) {
  const G = (clat, clng, sig, amp) =>
    Math.exp(-((lat - clat) ** 2 + (lng - clng) ** 2) / sig) * amp
  const front =
    Math.sin(lat * 0.85 + lng * 0.60 + 1.8) * 0.22 +
    Math.sin(lat * 0.65 - lng * 1.00 + 3.5) * 0.16
  const regional =
    Math.sin(lat * 5.0 + lng * 4.6 + 0.9) * 0.10 +
    Math.sin(lat * 7.1 - lng * 3.0 - 2.1) * 0.07
  const local =
    Math.sin(lat * 14.8 + lng * 12.1 + 4.3) * 0.06 +
    Math.sin(lat * 19.3 - lng * 9.0  + 1.7) * 0.04 +
    Math.sin(lat * 23.7 + lng * 17.4 - 3.1) * 0.02
  const mountains =
    G(42.6, -1.4, 1.4, 0.55) + G(43.1, -5.7, 1.2, 0.52) +
    G(43.3, -2.3, 1.5, 0.44) + G(42.8,  3.0, 1.8, 0.28) +
    G(40.2, -4.0, 1.4, 0.34) + G(41.9, -2.8, 1.3, 0.38) +
    G(37.9, -2.9, 1.2, 0.28) + G(38.1, -5.2, 2.0, 0.20) +
    G(41.7,  0.8, 1.8, 0.22)
  const latBias = Math.max(0, (lat - 37.0) / 8.0) * 0.22
  const raw = 0.28 + front + regional + local + mountains + latBias
  let v = (raw - 0.20) / 1.00
  v = Math.max(0, Math.min(1, v))
  v = 1 - (1 - v) * (1 - v)
  return Math.max(0, Math.min(1, v))
}

const HEAT_STEP = 0.12
function generateMeteoHeatGrid() {
  const points = []
  for (let lat = 35.8; lat <= 44.2; lat += HEAT_STEP) {
    for (let lng = -9.5; lng <= 4.5; lng += HEAT_STEP) {
      const intensity = fakeMeteoIntensity(lat, lng)
      if (intensity > 0.28) points.push([lat, lng, intensity])
    }
  }
  return points
}

function heatRadiusForZoom(zoom) {
  const pixPerDegree = (256 * Math.pow(2, zoom)) / 360
  const r = Math.ceil(pixPerDegree * HEAT_STEP * 0.65)
  return Math.max(8, Math.min(60, r))
}

// ─── LeafletMapInner ──────────────────────────────────────────────────────────
function LeafletMapInner({ zonas, onZoneClick, height = '400px', singleZone = null, fullscreen = false, mode = 'markers' }) {
  const mapRef     = useRef(null)
  const leafletRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return
    let destroyed = false

    ;(async () => {
      if (mode === 'heatmap') await ensureHeat()
      if (destroyed || !mapRef.current) return

      const center = singleZone ? [singleZone.lat, singleZone.lng] : [41.8, 1.5]
      const zoom   = singleZone ? 11 : 6

      const map = L.map(mapRef.current, { zoomControl: false, scrollWheelZoom: true })
        .setView(center, zoom)
      L.control.zoom({ position: 'bottomleft' }).addTo(map)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd', maxZoom: 19,
      }).addTo(map)
      leafletRef.current = map

      if (mode === 'heatmap') {
        const heatData   = generateMeteoHeatGrid()
        const initRadius = heatRadiusForZoom(zoom)
        const heatLayer  = L.heatLayer(heatData, {
          radius: initRadius,
          blur: Math.ceil(initRadius * 0.80),
          maxZoom: 17, max: 0.80, minOpacity: 0.30,
          gradient: { 0.0: '#d97706', 0.42: '#7a9e3a', 0.72: '#4a7c59', 1.0: '#2d6640' },
        }).addTo(map)
        const onZoom = () => {
          const r = heatRadiusForZoom(map.getZoom())
          heatLayer.setOptions({ radius: r, blur: Math.ceil(r * 0.75) })
          heatLayer.redraw()
        }
        map.on('zoomend', onZoom)
      } else {
        const forestColors = { pinar: '#4a7c59', hayedo: '#d9cda1', robledal: '#a0522d', encinar: '#6b8e23' }
        const mushIcon = (color = '#d9cda1', active = false) => L.divIcon({
          className: '',
          html: `<div style="width:${active ? 38 : 28}px;height:${active ? 38 : 28}px;background:${color};border:2px solid rgba(255,255,255,0.4);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${active ? 16 : 12}px;box-shadow:0 0 ${active ? 20 : 10}px ${color}80;transition:all 0.2s;">🍄</div>`,
          iconSize: [active ? 38 : 28, active ? 38 : 28],
          iconAnchor: [active ? 19 : 14, active ? 19 : 14],
          popupAnchor: [0, -20],
        })

        const toRender = singleZone ? [singleZone] : (zonas || [])
        toRender.forEach(z => {
          const color  = forestColors[z.forestType] || '#d9cda1'
          const marker = L.marker([z.lat, z.lng], { icon: mushIcon(color, !!singleZone) })
            .bindPopup(`<div style="font-family:DM Sans,sans-serif;color:#f4ebe1;min-width:160px"><strong style="font-size:14px">${z.name}</strong><br><span style="color:#d9cda1;font-size:12px">${z.province} · ${z.forestType}</span><br><span style="color:#aaa;font-size:11px">⛰️ ${z.elevation}m</span></div>`)
            .addTo(map)
          if (onZoneClick) marker.on('click', () => onZoneClick(z))
        })
      }

      if (fullscreen) setTimeout(() => map.invalidateSize(), 100)
    })()

    return () => {
      destroyed = true
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const h = fullscreen ? '100%' : height
  return (
    <div ref={mapRef}
      style={{ height: h, width: '100%', borderRadius: fullscreen ? '0' : '12px', zIndex: 1 }} />
  )
}

// ─── MapFullscreenModal ───────────────────────────────────────────────────────
function MapFullscreenModal({ zonas, singleZone, onZoneClick, title, onClose, mode = 'markers', onModeChange = null }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 flex flex-col" style={{ zIndex: 10000, background: '#0f1f18' }}>
      {/* Header */}
      <div className="glass flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          {IC.map}
          <span className="font-display text-lg text-[#f4ebe1]">{title || 'Mapa'}</span>
          {singleZone && (
            <span className="text-xs text-[#d9cda1] hidden sm:block">
              {singleZone.lat.toFixed(4)}, {singleZone.lng.toFixed(4)} · ⛰️ {singleZone.elevation}m
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onModeChange && (
            <div className="backdrop-blur-sm bg-[#30372a]/80 rounded-xl p-1">
              <Tabs
                options={[{ id: 'markers', label: 'Zonas' }, { id: 'heatmap', label: 'Mapa de calor' }]}
                selected={mode}
                onChange={onModeChange}
                size="sm"
                variant="compact" />
            </div>
          )}
          <button onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-white/10 text-[#f4ebe1]/60 hover:text-[#f4ebe1] transition-colors">
            {IC.close}
          </button>
        </div>
      </div>
      {/* Map */}
      <div className="flex-1 relative">
        <LeafletMapInner
          zonas={zonas} singleZone={singleZone} onZoneClick={onZoneClick}
          height="100%" fullscreen mode={mode} />
      </div>
    </div>,
    document.body
  )
}

// ─── LeafletMap (público) — con botón expand ─────────────────────────────────
export function LeafletMap({
  zonas, onZoneClick, height = '400px',
  singleZone = null, title,
  mode = 'markers', onModeChange = null,
}) {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <>
      <div className="relative">
        <LeafletMapInner
          zonas={zonas} onZoneClick={onZoneClick} height={height}
          singleZone={singleZone} mode={mode} />

        {/* Selector modo (si se proporciona) */}
        {onModeChange && (
          <div className="absolute top-3 left-3 z-[1000] backdrop-blur-sm bg-[#30372a]/80 rounded-xl p-1">
            <Tabs
              options={[{ id: 'markers', label: 'Zonas' }, { id: 'heatmap', label: 'Mapa de calor' }]}
              selected={mode}
              onChange={onModeChange}
              size="sm"
              variant="compact" />
          </div>
        )}

        {/* Botón pantalla completa */}
        <button
          className="absolute bottom-3 right-3 z-[1000] p-2 rounded-xl backdrop-blur-sm bg-[#30372a]/80 text-[#f4ebe1]/60 hover:text-[#f4ebe1] transition-colors"
          onClick={() => setFullscreen(true)}
          title="Pantalla completa">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {fullscreen && (
        <MapFullscreenModal
          zonas={zonas} singleZone={singleZone} onZoneClick={onZoneClick}
          title={title || (singleZone ? singleZone.name : 'Mapa de zonas')}
          onClose={() => setFullscreen(false)}
          mode={mode}
          onModeChange={onModeChange} />
      )}
    </>
  )
}
