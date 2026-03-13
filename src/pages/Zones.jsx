import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { slugify } from '../lib/helpers'
import { ZoneCard } from '../components/ui/ZoneCard'
import { useZones } from '../hooks/useZones'
import { SearchFilterBar } from '../components/ui/SearchFilterBar'
import { FilterPanel } from '../components/ui/FilterPanel'
import { ActiveFilterChip } from '../components/ui/ActiveFilterChip'
import { Tabs } from '../components/ui/Tabs'
import { LeafletMap } from '../components/map/LeafletMap'

const RAIN_THRESHOLD = 30

export default function Zones() {
  const { t, followedZones, toggleFollow, setSelectedZone } = useApp()
  const { id: zoneSlug } = useParams()
  const [searchParams] = useSearchParams()

  const { zones, conditionsMap, loading: weatherLoading } = useZones()

  // Sincronizar URL param → modal de zona
  useEffect(() => {
    if (zoneSlug) {
      const zone = zones.find(z => slugify(z.name) === zoneSlug)
      setSelectedZone(zone || null)
    } else {
      setSelectedZone(null)
    }
    return () => setSelectedZone(null)
  }, [zoneSlug, zones])

  // Initialize tab and onlyFollowed from URL params (set by Dashboard links)
  const [tab, setTab]               = useState(() => searchParams.get('vista') === 'listado' ? 'listado' : 'mapa')
  const [onlyFollowed, setOnlyFollowed] = useState(() => searchParams.get('seguidas') === '1')
  const [onlyRained, setOnlyRained] = useState(false)
  const [forestFilter, setForestFilter] = useState('')
  const [ccaaFilter, setCcaaFilter] = useState('')
  const [comarcaFilter, setComarcaFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [pillOpen, setPillOpen]     = useState(false)
  const [mapMode, setMapMode]       = useState('markers')
  const [mapHeight, setMapHeight]   = useState('500px')
  const [zoneSort, setZoneSort]     = useState('score')
  const aboveMapRef = useRef(null)

  const isFollowed = id => followedZones.some(z => z.id === id)

  const forestTypes = useMemo(() => [...new Set(zones.map(z => z.forestType))].sort(), [zones])
  const comunidades = useMemo(() => [...new Set(zones.map(z => z.comunidadAutonoma).filter(Boolean))].sort(), [zones])
  const comarcas    = useMemo(() => {
    const pool = ccaaFilter ? zones.filter(z => z.comunidadAutonoma === ccaaFilter) : zones
    return [...new Set(pool.map(z => z.region).filter(Boolean))].sort()
  }, [zones, ccaaFilter])

  // Reset comarca when CCAA changes
  useEffect(() => { setComarcaFilter('') }, [ccaaFilter])

  // Calcula la altura disponible para el mapa (viewport − cabecera layout − contenido superior)
  useEffect(() => {
    if (tab !== 'mapa') return
    const LAYOUT_HEADER  = 88  // header sticky: logo h-16 (64px) + py-3 (24px)
    const MAIN_PADDING_T = 32  // <main py-8> padding superior
    const GAP            = 20  // space-y-5 entre cabecera de zona y mapa

    const BOTTOM_MARGIN = 16
    const compute = () => {
      const layoutHeaderH = document.querySelector('header')?.offsetHeight ?? LAYOUT_HEADER
      const aboveH  = aboveMapRef.current?.offsetHeight ?? 0
      const available = window.innerHeight - layoutHeaderH - MAIN_PADDING_T - aboveH - GAP - BOTTOM_MARGIN
      setMapHeight(`${Math.max(available, 280)}px`)
    }

    compute()
    const ro = new ResizeObserver(compute)
    if (aboveMapRef.current) ro.observe(aboveMapRef.current)
    window.addEventListener('resize', compute)
    return () => { ro.disconnect(); window.removeEventListener('resize', compute) }
  }, [tab, pillOpen])

  const filteredZones = useMemo(() => {
    let r = onlyFollowed ? zones.filter(z => isFollowed(z.id)) : [...zones]
    if (onlyRained) r = r.filter(z => parseFloat(conditionsMap[z.id]?.rainfall14d ?? 0) >= RAIN_THRESHOLD)
    if (forestFilter) r = r.filter(z => z.forestType === forestFilter)
    if (ccaaFilter) r = r.filter(z => z.comunidadAutonoma === ccaaFilter)
    if (comarcaFilter) r = r.filter(z => z.region === comarcaFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      r = r.filter(z => z.name.toLowerCase().includes(q) || z.province.toLowerCase().includes(q) || (z.region || '').toLowerCase().includes(q))
    }
    if (zoneSort === 'score') r.sort((a, b) => (conditionsMap[b.id]?.overallScore ?? 0) - (conditionsMap[a.id]?.overallScore ?? 0))
    else if (zoneSort === 'alfa') r.sort((a, b) => a.name.localeCompare(b.name))
    else if (zoneSort === 'elevation') r.sort((a, b) => b.elevation - a.elevation)
    return r
  }, [onlyFollowed, onlyRained, forestFilter, ccaaFilter, comarcaFilter, searchQuery, zoneSort, followedZones, conditionsMap, zones])

  const activeFilters = (onlyFollowed ? 1 : 0) + (onlyRained ? 1 : 0) + (forestFilter ? 1 : 0) + (ccaaFilter ? 1 : 0) + (comarcaFilter ? 1 : 0)

  return (
    <div className="space-y-6 anim-up pb-6">
      {/* Bloque medido para calcular altura del mapa */}
      <div ref={aboveMapRef}>
      {/* Header */}
      <div className="flex flex-col md:grid md:grid-cols-[auto_1fr_auto] md:items-center gap-4">
        <div className="flex items-center justify-between md:block">
          <div>
            <h2 className="font-display text-4xl font-semibold text-cream">{t.zonas}</h2>
            <p className="text-muted text-sm mt-1">
              {filteredZones.length} zona{filteredZones.length !== 1 ? 's' : ''}
              {weatherLoading && (
                <span className="ml-2 text-bar text-xs">{t.datosLoading}</span>
              )}
            </p>
          </div>
          <div className="md:hidden shrink-0 ml-4">
            <Tabs options={[{ id: 'mapa', label: t.mapa }, { id: 'listado', label: t.listado }]} selected={tab} onChange={setTab} size="md" />
          </div>
        </div>
        <div className="flex justify-center">
          <SearchFilterBar
            variant="split"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder={t.buscar}
            onFilterClick={() => setPillOpen(p => !p)}
            activeFilters={activeFilters}
            className="w-full md:max-w-[50%] sm:min-w-[350px]"
          />
        </div>
        <div className="hidden md:flex justify-end">
          <Tabs options={[{ id: 'mapa', label: t.mapa }, { id: 'listado', label: t.listado }]} selected={tab} onChange={setTab} size="md" />
        </div>
      </div>

      {/* Panel filtros — visible en mapa y listado */}
      <FilterPanel isOpen={pillOpen} onClose={() => setPillOpen(false)}>
        <div className="mb-5">
          <p className="text-muted text-xs uppercase tracking-wider mb-3">{t.mostrar}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setOnlyFollowed(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${!onlyFollowed ? 'bg-bar text-white' : 'glass text-cream/60'}`}>
              {t.todasZonas}
            </button>
            <button onClick={() => setOnlyFollowed(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${onlyFollowed ? 'bg-yellow-400/20 text-yellow-400' : 'glass text-cream/60'}`}>
              ⭐ {t.misZonas}
            </button>
            <button onClick={() => setOnlyRained(v => !v)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${onlyRained ? 'bg-sky-400/20 text-sky-400' : 'glass text-cream/60'}`}>
              {t.haLlovido}
            </button>
          </div>
        </div>
        {comunidades.length > 0 && (
          <div className="mb-5">
            <p className="text-muted text-xs uppercase tracking-wider mb-3">{t.comunidadAutonoma}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCcaaFilter('')}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${!ccaaFilter ? 'bg-bar text-white' : 'glass text-cream/60'}`}>
                {t.todos}
              </button>
              {comunidades.map(ca => (
                <button key={ca} onClick={() => setCcaaFilter(ca)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${ccaaFilter === ca ? 'bg-green-f/30 text-emerald-400' : 'glass text-cream/60'}`}>
                  {ca}
                </button>
              ))}
            </div>
          </div>
        )}
        {comarcas.length > 0 && (
          <div className="mb-5">
            <p className="text-muted text-xs uppercase tracking-wider mb-3">{t.comarca}</p>
            <div className="relative sm:inline-block sm:min-w-[220px]">
              <select value={comarcaFilter} onChange={e => setComarcaFilter(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm text-cream outline-none cursor-pointer appearance-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <option value="" style={{ background: 'var(--color-modal)' }}>{t.todasLasComarcas}</option>
                {comarcas.map(c => <option key={c} value={c} style={{ background: 'var(--color-modal)' }}>{c}</option>)}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cream/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        )}
        <div className="mb-5">
          <p className="text-muted text-xs uppercase tracking-wider mb-3">{t.tipoBosque}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setForestFilter('')}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${!forestFilter ? 'bg-bar text-white' : 'glass text-cream/60'}`}>
              {t.todos}
            </button>
            {forestTypes.map(tb => {
              const emoji = { pinar: '🌲', hayedo: '🌳', robledal: '🌿', encinar: '🫒' }
              return (
                <button key={tb} onClick={() => setForestFilter(tb)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all capitalize ${forestFilter === tb ? 'bg-green-f/30 text-emerald-400' : 'glass text-cream/60'}`}>
                  {emoji[tb] || '🌲'} {tb}
                </button>
              )
            })}
          </div>
        </div>
        {tab === 'listado' && (
          <div className="mb-5">
            <p className="text-muted text-xs uppercase tracking-wider mb-3">{t.ordenarPor}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setZoneSort('score')}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${zoneSort === 'score' ? 'bg-bar text-white' : 'glass text-cream/60'}`}>
                {t.mejorCondicion}
              </button>
              <button onClick={() => setZoneSort('alfa')}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${zoneSort === 'alfa' ? 'bg-bar text-white' : 'glass text-cream/60'}`}>
                {t.azNombre}
              </button>
              <button onClick={() => setZoneSort('elevation')}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${zoneSort === 'elevation' ? 'bg-bar text-white' : 'glass text-cream/60'}`}>
                {t.altitud}
              </button>
            </div>
          </div>
        )}
        <div className="sm:flex sm:justify-end">
          <button onClick={() => setPillOpen(false)}
            className="w-full sm:w-auto sm:px-6 py-3 bg-bar text-white rounded-xl font-medium hover:bg-[#a0855a] transition-colors">
            Ver {filteredZones.length} zona{filteredZones.length !== 1 ? 's' : ''}
          </button>
        </div>
      </FilterPanel>

      {/* Chips filtros activos — visibles en mapa y listado */}
      {(onlyFollowed || onlyRained || forestFilter || ccaaFilter || comarcaFilter || searchQuery) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {onlyFollowed  && <ActiveFilterChip emoji="⭐" label={t.soloSeguidas} color="yellow" onRemove={() => setOnlyFollowed(false)} />}
          {onlyRained    && <ActiveFilterChip emoji="🌧️" label={`Lluvia ≥ ${RAIN_THRESHOLD}mm / 14d`} color="blue" onRemove={() => setOnlyRained(false)} />}
          {forestFilter  && <ActiveFilterChip emoji="🌲" label={forestFilter} color="emerald" onRemove={() => setForestFilter('')} />}
          {ccaaFilter    && <ActiveFilterChip emoji="📍" label={ccaaFilter} color="amber" onRemove={() => setCcaaFilter('')} />}
          {comarcaFilter && <ActiveFilterChip emoji="🗺️" label={comarcaFilter} color="amber" onRemove={() => setComarcaFilter('')} />}
          {searchQuery   && <ActiveFilterChip emoji="🔍" label={`"${searchQuery}"`} color="amber" onRemove={() => setSearchQuery('')} />}
        </div>
      )}

      </div>{/* /aboveMapRef */}

      {/* Tab: Mapa */}
      {tab === 'mapa' && (
        <LeafletMap
          zonas={filteredZones}
          onZoneClick={setSelectedZone}
          height={mapHeight}
          title="Mapa de zonas"
          mode={mapMode}
          onModeChange={setMapMode}
          conditionsMap={conditionsMap}
          ccaaFilter={ccaaFilter} />
      )}

      {/* Tab: Listado */}
      {tab === 'listado' && (
        <div className="space-y-4">
          {filteredZones.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="font-display text-xl text-cream mb-2">{t.sinZonas}</h3>
              <p className="text-cream/70 text-sm">{t.ajustaFiltros}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredZones.map(z => (
                <ZoneCard key={z.id} zone={z}
                  isFollowed={isFollowed(z.id)}
                  condOverride={conditionsMap[z.id]}
                  onToggle={() => toggleFollow(z)}
                  onClick={() => setSelectedZone(z)}
                />
              ))}
            </div>
          )}
          <p className="text-center text-cream/30 text-xs pt-2">{filteredZones.length} zona{filteredZones.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}
