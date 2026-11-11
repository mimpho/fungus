import { useCallback, useEffect, useState } from 'react'

// The map's navigation (memory/observatory-navigation-plan.md, T1): three tabs, each with a switch that
// says whether its layer is drawn, and one panel open at a time (a tab's or Vista's).
export const TABS = ['data', 'zones', 'forest']

// Where each switch is remembered in this browser. `zones` keeps the key «Mis rincones» used before the
// tabs existed, so a choice made then still holds.
const KEYS = { data: 'fungus-obs-data', zones: 'fungus-obs-corners', forest: 'fungus-obs-forest' }

function stored(tab) {
  try {
    const v = localStorage.getItem(KEYS[tab])
    return v === 'on' ? true : v === 'off' ? false : null
  } catch (_e) { return null }
}

function store(tab, value) {
  try { localStorage.setItem(KEYS[tab], value ? 'on' : 'off') } catch (_e) { /* per-viewer convenience only */ }
}

/**
 * Open panel and switches of the map. First visit (nothing stored): Meteo on, Bosque off, Zonas on only
 * if the user has saved corners — decided once they have loaded (`cornersReady`), off until then.
 * After that each switch is whatever this browser last chose.
 * `openTab`: 'data' | 'zones' | 'forest' | 'view' | null. Opening one closes any other; opening the
 * one already open closes it. A switch keeps its value when its panel closes.
 */
export function useMapNavigation({ hasCorners = false, cornersReady = false } = {}) {
  const [openTab, setOpenTab] = useState(null)
  const [on, setOnState] = useState(() => ({
    data: stored('data') ?? true,
    zones: stored('zones') ?? false,
    forest: stored('forest') ?? false,
  }))

  // Zonas with nothing stored follows the corners: on when the user has some
  useEffect(() => {
    if (!cornersReady || stored('zones') !== null) return
    setOnState(prev => (prev.zones === hasCorners ? prev : { ...prev, zones: hasCorners }))
  }, [cornersReady, hasCorners])

  const setOn = useCallback((tab, value) => {
    store(tab, value)
    setOnState(prev => (prev[tab] === value ? prev : { ...prev, [tab]: value }))
  }, [])

  const toggleTab = useCallback(tab => setOpenTab(prev => (prev === tab ? null : tab)), [])
  const close = useCallback(() => setOpenTab(null), [])

  return { openTab, setOpenTab, toggleTab, close, on, setOn }
}
