import { useState, useMemo } from 'react'
import { useApp } from '../contexts/AppContext'
import { mockZones } from '../data/zones'
import { ZoneCard } from '../components/ui/ZoneCard'
import { useAllZoneConditions } from '../hooks/useWeatherConditions'
import { SearchFilterBar } from '../components/ui/SearchFilterBar'
import { FilterPanel } from '../components/ui/FilterPanel'
import { ActiveFilterChip } from '../components/ui/ActiveFilterChip'
import { Tabs } from '../components/ui/Tabs'
import { LeafletMap } from '../components/map/LeafletMap'

const RAIN_THRESHOLD = 30

export default function Zones() {
  const { t, followedZones, toggleFollow, setSelectedZone } = useApp()
  const [tab, setTab]               = useState('mapa')
  const [onlyFollowed, setOnlyFollowed] = useState(false)
  const [onlyRained, setOnlyRained] = useState(false)
  const [forestFilter, setForestFilter] = useState('')
  const [ccaaFilter, setCcaaFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [pillOpen, setPillOpen]     = useState(false)
  const [mapMode, setMapMode]       = useState('markers')

  const isFollowed = id => followedZones.some(z => z.id === id)

  const { conditionsMap, loading: weatherLoading, progress: weatherProgress } = useAllZoneConditions(mockZones)

  const forestTypes = useMemo(() => [...new Set(mockZones.map(z => z.forestType))].sort(), [])
  const comunidades = useMemo(() => [...new Set(mockZones.map(z => z.comunidadAutonoma).filter(Boolean))].sort(), [])

  const filteredZones = useMemo(() => {
    let r = onlyFollowed ? mockZones.filter(z => isFollowed(z.id)) : [...mockZones]
    if (onlyRained) r = r.filter(z => parseFloat(conditionsMap[z.id]?.rainfall14d ?? 0) >= RAIN_THRESHOLD)
    if (forestFilter) r = r.filter(z => z.forestType === forestFilter)
    if (ccaaFilter) r = r.filter(z => z.comunidadAutonoma === ccaaFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      r = r.filter(z => z.name.toLowerCase().includes(q) || z.province.toLowerCase().includes(q) || (z.region || '').toLowerCase().includes(q))
    }
    r.sort((a, b) => (conditionsMap[b.id]?.overallScore ?? 0) - (conditionsMap[a.id]?.overallScore ?? 0))
    return r
  }, [onlyFollowed, onlyRained, forestFilter, ccaaFilter, searchQuery, followedZones, conditionsMap])

  const activeFilters = (onlyFollowed ? 1 : 0) + (onlyRained ? 1 : 0) + (forestFilter ? 1 : 0) + (ccaaFilter ? 1 : 0)

  return (
    <div className="space-y-6 anim-up pb-6">
      {/* Header */}
      <div className="flex flex-col md:grid md:grid-cols-[auto_1fr_auto] md:items-center gap-4">
        <div className="flex items-center justify-between md:block">
          <div>
            <h2 className="font-display text-4xl font-semibold text-[#f4ebe1]">{t.zonas}</h2>
            <p className="text-[#d9cda1] text-sm mt-1">
              {followedZones.length} {t.followedZones.toLowerCase()}
              {weatherLoading && (
                <span className="ml-2 text-[#887b4b] text-xs">
                  · cargando datos meteorológicos {weatherProgress.done}/{weatherProgress.total}…
                </span>
              )}
            </p>
          </div>
          <div className="md:hidden shrink-0 ml-4">
            <Tabs options={[{ id: 'mapa', label: t.mapa }, { id: 'listado', label: 'Listado' }]} selected={tab} onChange={setTab} size="md" />
          </div>
        </div>
        <div className="flex justify-center">
          <SearchFilterBar
            variant="split"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setTab('listado') }}
            onClear={() => setSearchQuery('')}
            placeholder={t.buscar}
            onFilterClick={() => setPillOpen(p => !p)}
            activeFilters={activeFilters}
            className="w-full md:max-w-[50%] sm:min-w-[350px]"
          />
        </div>
        <div className="hidden md:flex justify-end">
          <Tabs options={[{ id: 'mapa', label: t.mapa }, { id: 'listado', label: 'Listado' }]} selected={tab} onChange={setTab} size="md" />
        </div>
      </div>

      {/* Panel filtros — visible en mapa y listado */}
      <FilterPanel isOpen={pillOpen} onClose={() => setPillOpen(false)}>
        <div className="mb-5">
          <p className="text-[#d9cda1] text-xs uppercase tracking-wider mb-3">Mostrar</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setOnlyFollowed(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${!onlyFollowed ? 'bg-[#887b4b] text-white' : 'glass text-[#f4ebe1]/60'}`}>
              Todas las zonas
            </button>
            <button onClick={() => setOnlyFollowed(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${onlyFollowed ? 'bg-yellow-400/20 text-yellow-400' : 'glass text-[#f4ebe1]/60'}`}>
              ⭐ Mis zonas
            </button>
            <button onClick={() => setOnlyRained(v => !v)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${onlyRained ? 'bg-sky-400/20 text-sky-400' : 'glass text-[#f4ebe1]/60'}`}>
              🌧️ Ha llovido
            </button>
          </div>
        </div>
        {comunidades.length > 0 && (
          <div className="mb-5">
            <p className="text-[#d9cda1] text-xs uppercase tracking-wider mb-3">Comunidad autónoma</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCcaaFilter('')}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${!ccaaFilter ? 'bg-[#887b4b] text-white' : 'glass text-[#f4ebe1]/60'}`}>
                Todas
              </button>
              {comunidades.map(ca => (
                <button key={ca} onClick={() => setCcaaFilter(ca)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${ccaaFilter === ca ? 'bg-[#4a7c59]/30 text-emerald-400' : 'glass text-[#f4ebe1]/60'}`}>
                  {ca}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mb-5">
          <p className="text-[#d9cda1] text-xs uppercase tracking-wider mb-3">Tipo de bosque</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setForestFilter('')}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${!forestFilter ? 'bg-[#887b4b] text-white' : 'glass text-[#f4ebe1]/60'}`}>
              Todos
            </button>
            {forestTypes.map(tb => {
              const emoji = { pinar: '🌲', hayedo: '🌳', robledal: '🌿', encinar: '🫒' }
              return (
                <button key={tb} onClick={() => setForestFilter(tb)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all capitalize ${forestFilter === tb ? 'bg-[#4a7c59]/30 text-emerald-400' : 'glass text-[#f4ebe1]/60'}`}>
                  {emoji[tb] || '🌲'} {tb}
                </button>
              )
            })}
          </div>
        </div>
        <div className="sm:flex sm:justify-end">
          <button onClick={() => setPillOpen(false)}
            className="w-full sm:w-auto sm:px-6 py-3 bg-[#887b4b] text-white rounded-xl font-medium hover:bg-[#a0855a] transition-colors">
            Ver {filteredZones.length} zona{filteredZones.length !== 1 ? 's' : ''}
          </button>
        </div>
      </FilterPanel>

      {/* Tab: Mapa */}
      {tab === 'mapa' && (
        <LeafletMap
          zonas={filteredZones}
          onZoneClick={setSelectedZone}
          height="calc(100vh - 220px)"
          title="Mapa de zonas"
          mode={mapMode}
          onModeChange={setMapMode}
          conditionsMap={conditionsMap} />
      )}

      {/* Tab: Listado */}
      {tab === 'listado' && (
        <div className="space-y-4">
          {/* Chips filtros activos */}
          {(onlyFollowed || onlyRained || forestFilter || ccaaFilter) && (
            <div className="flex flex-wrap gap-2">
              {onlyFollowed && <ActiveFilterChip emoji="⭐" label="Solo seguidas" color="yellow" onRemove={() => setOnlyFollowed(false)} />}
              {onlyRained   && <ActiveFilterChip emoji="🌧️" label={`Lluvia ≥ ${RAIN_THRESHOLD}mm / 14d`} color="blue" onRemove={() => setOnlyRained(false)} />}
              {forestFilter && <ActiveFilterChip emoji="🌲" label={forestFilter} color="emerald" onRemove={() => setForestFilter('')} />}
              {ccaaFilter   && <ActiveFilterChip emoji="📍" label={ccaaFilter} color="amber" onRemove={() => setCcaaFilter('')} />}
            </div>
          )}

          {filteredZones.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="font-display text-xl text-[#f4ebe1] mb-2">Sin zonas</h3>
              <p className="text-[#f4ebe1]/70 text-sm">Ajusta los filtros para ver más zonas.</p>
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
          <p className="text-center text-[#f4ebe1]/30 text-xs pt-2">{filteredZones.length} zona{filteredZones.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}
