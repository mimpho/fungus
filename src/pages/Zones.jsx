import { useState, useMemo } from 'react'
import { useApp } from '../contexts/AppContext'
import { mockZones } from '../data/zones'
import { ZoneCard } from '../components/ui/ZoneCard'
import { useAllZoneConditions } from '../hooks/useWeatherConditions'
import { SearchFilterBar } from '../components/ui/SearchFilterBar'
import { Tabs } from '../components/ui/Tabs'
import { LeafletMap } from '../components/map/LeafletMap'

const RAIN_THRESHOLD = 30
const FOREST_EMOJI = { pinar: '🌲', hayedo: '🌳', robledal: '🌿', encinar: '🫒' }

export default function Zones() {
  const { t, followedZones, toggleFollow, setSelectedZone } = useApp()
  const [tab, setTab]               = useState('mapa')
  const [onlyFollowed, setOnlyFollowed] = useState(false)
  const [onlyRained, setOnlyRained] = useState(false)
  const [forestFilter, setForestFilter] = useState('')
  const [ccaaFilter, setCcaaFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
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

  const chipBase = 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap'
  const chipOff  = `${chipBase} glass text-[#f4ebe1]/55 hover:text-[#f4ebe1]/80`
  const chipOn   = (color) => ({
    yellow:  `${chipBase} bg-yellow-400/20 text-yellow-400`,
    sky:     `${chipBase} bg-sky-400/20 text-sky-400`,
    emerald: `${chipBase} bg-[#4a7c59]/30 text-emerald-400`,
    amber:   `${chipBase} bg-[#887b4b]/25 text-[#c4a06b]`,
  }[color])

  return (
    <div className="space-y-5 anim-up pb-6">
      {/* Header */}
      <div className="flex flex-col md:grid md:grid-cols-[auto_1fr_auto] md:items-start gap-4">
        {/* Título */}
        <div className="flex items-center justify-between md:block">
          <div>
            <h2 className="font-display text-4xl font-semibold text-[#f4ebe1]">{t.zonas}</h2>
            <p className="text-[#d9cda1] text-sm mt-1">
              {followedZones.length} {t.followedZones.toLowerCase()}
              {weatherLoading && (
                <span className="ml-2 text-[#887b4b] text-xs">
                  · cargando {weatherProgress.done}/{weatherProgress.total}…
                </span>
              )}
            </p>
          </div>
          <div className="md:hidden shrink-0 ml-4">
            <Tabs options={[{ id: 'mapa', label: t.mapa }, { id: 'listado', label: 'Listado' }]} selected={tab} onChange={setTab} size="md" />
          </div>
        </div>

        {/* Buscador + filtros inline */}
        <div className="flex flex-col gap-2">
          <SearchFilterBar
            variant="full"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setTab('listado') }}
            onClear={() => setSearchQuery('')}
            placeholder={t.buscar}
            className="w-full"
          />
          {/* Chips de filtro — siempre visibles (mapa y listado) */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setOnlyFollowed(v => !v)}
              className={onlyFollowed ? chipOn('yellow') : chipOff}>
              ⭐ Mis zonas
            </button>
            <button
              onClick={() => setOnlyRained(v => !v)}
              className={onlyRained ? chipOn('sky') : chipOff}>
              🌧️ Ha llovido
            </button>

            {forestTypes.length > 0 && (
              <div className="w-px self-stretch bg-white/10 mx-0.5" />
            )}
            {forestTypes.map(ft => (
              <button
                key={ft}
                onClick={() => setForestFilter(f => f === ft ? '' : ft)}
                className={forestFilter === ft ? chipOn('emerald') : chipOff}>
                {FOREST_EMOJI[ft] || '🌲'} {ft}
              </button>
            ))}

            {comunidades.length > 0 && (
              <>
                <div className="w-px self-stretch bg-white/10 mx-0.5" />
                <div className="relative">
                  <select
                    value={ccaaFilter}
                    onChange={e => setCcaaFilter(e.target.value)}
                    className={`appearance-none pr-6 cursor-pointer ${ccaaFilter ? chipOn('amber') : chipOff}`}
                    style={{ backgroundImage: 'none', background: ccaaFilter ? 'rgba(136,107,75,0.25)' : 'rgba(255,255,255,0.04)' }}>
                    <option value="">📍 CCAA</option>
                    {comunidades.map(ca => (
                      <option key={ca} value={ca}>{ca}</option>
                    ))}
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 pointer-events-none opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs (desktop) */}
        <div className="hidden md:flex justify-end pt-1">
          <Tabs options={[{ id: 'mapa', label: t.mapa }, { id: 'listado', label: 'Listado' }]} selected={tab} onChange={setTab} size="md" />
        </div>
      </div>

      {/* Tab: Mapa */}
      {tab === 'mapa' && (
        <LeafletMap
          zonas={filteredZones}
          onZoneClick={setSelectedZone}
          height="calc(100vh - 260px)"
          title="Mapa de zonas"
          mode={mapMode}
          onModeChange={setMapMode}
          conditionsMap={conditionsMap} />
      )}

      {/* Tab: Listado */}
      {tab === 'listado' && (
        <div className="space-y-4">
          {filteredZones.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
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
