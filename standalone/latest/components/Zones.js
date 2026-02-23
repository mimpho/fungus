// ==================== ZONAS ====================
function Zones({ t, followedZones, toggleFollow, setSelectedZone }) {
  const [tab, setTab] = useState('mapa');
  const [mapMode, setMapMode] = useState('markers'); // 'markers' o 'heatmap'
  const [zoneSort, setOrdenZonas] = useState('score');
  const [onlyFollowed, setSoloSeguidas] = useState(false);
  const [onlyRained, setOnlyRained] = useState(false);
  const [forestFilter, setFiltroBosque] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pillOpen, setPillOpen] = useState(false);
  const isFollowed = (id) => followedZones.some(z => z.id === id);

  const conditionsMap = useMemo(() => {
    const m = {};
    mockZones.forEach(z => { m[z.id] = fakeConditions(); });
    return m;
  }, []);

  const forestTypes = useMemo(() => [...new Set(mockZones.map(z => z.forestType))].sort(), []);

  // Umbral de lluvia: >= 30mm en 14 días se considera "ha llovido"
  const RAIN_THRESHOLD = 30;

  const filteredZones = useMemo(() => {
    let r = onlyFollowed ? mockZones.filter(z => isFollowed(z.id)) : [...mockZones];
    if (onlyRained) r = r.filter(z => parseFloat(conditionsMap[z.id]?.rainfall14d ?? 0) >= RAIN_THRESHOLD);
    if (forestFilter) r = r.filter(z => z.forestType === forestFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(z => z.name.toLowerCase().includes(q) || z.province.toLowerCase().includes(q) || z.region.toLowerCase().includes(q));
    }
    if (zoneSort === 'score') r.sort((a, b) => (conditionsMap[b.id]?.overallScore ?? 0) - (conditionsMap[a.id]?.overallScore ?? 0));
    else if (zoneSort === 'alfa') r.sort((a, b) => a.name.localeCompare(b.name));
    else if (zoneSort === 'elevation') r.sort((a, b) => b.elevation - a.elevation);
    return r;
  }, [onlyFollowed, onlyRained, zoneSort, forestFilter, searchQuery, followedZones]);

  const activeFilters = (onlyFollowed ? 1 : 0) + (onlyRained ? 1 : 0) + (forestFilter ? 1 : 0) + (zoneSort !== 'score' ? 1 : 0);

  return (
    <div className="space-y-6 anim-up pb-6">
      {/* Header: título · barra búsqueda/filtro · tabs */}
      <div className="flex flex-col md:grid md:grid-cols-[auto_1fr_auto] md:items-center gap-4">

        {/* Título + tabs (mobile: misma fila; desktop: título solo) */}
        <div className="flex items-center justify-between md:block">
          <div>
            <h2 className="font-display text-4xl font-semibold text-[#f4ebe1]">{t.zonas}</h2>
            <p className="text-[#d9cda1] text-sm mt-1">{followedZones.length} {t.followedZones.toLowerCase()}</p>
          </div>
          {/* Tabs visibles solo en mobile aquí */}
          <div className="md:hidden shrink-0 ml-4">
            <Tabs
              options={[
                { id: 'mapa', label: t.mapa },
                { id: 'listado', label: 'Listado' }
              ]}
              selected={tab}
              onChange={setTab}
              size="md"
            />
          </div>
        </div>

        {/* Barra búsqueda: full en mapa, split en listado */}
        <div className="flex justify-center">
          <SearchFilterBar
            variant={tab === 'mapa' ? 'full' : 'split'}
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setTab('listado'); }}
            onClear={() => setSearchQuery('')}
            placeholder={t.buscar}
            onFilterClick={() => setPillOpen(p => !p)}
            activeFilters={activeFilters}
            className="w-full md:max-w-[50%] sm:min-w-[350px]"
          />
        </div>

        {/* Tabs visibles solo en desktop */}
        <div className="hidden md:flex justify-end">
          <Tabs
            options={[
              { id: 'mapa', label: t.mapa },
              { id: 'listado', label: 'Listado' }
            ]}
            selected={tab}
            onChange={setTab}
            size="md"
          />
        </div>

      </div>

      {/* Panel filtros — inline desktop / bottom-sheet mobile (solo en listado) */}
      {tab === 'listado' && (
        <FilterPanel isOpen={pillOpen} onClose={() => setPillOpen(false)}>
          {/* Filtro mostrar */}
          <div className="mb-5">
            <p className="text-[#d9cda1] text-xs uppercase tracking-wider mb-3">Mostrar</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSoloSeguidas(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${!onlyFollowed ? 'bg-[#887b4b] text-white' : 'glass text-[#f4ebe1]/60'}`}>
                Todas las zonas
              </button>
              <button onClick={() => setSoloSeguidas(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${onlyFollowed ? 'bg-yellow-400/20 text-yellow-400' : 'glass text-[#f4ebe1]/60'}`}>
                ⭐ Mis zonas
              </button>
              <button onClick={() => setOnlyRained(v => !v)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${onlyRained ? 'bg-sky-400/20 text-sky-400' : 'glass text-[#f4ebe1]/60'}`}>
                🌧️ Ha llovido
              </button>
            </div>
          </div>

          {/* Filtro tipo bosque */}
          <div className="mb-5">
            <p className="text-[#d9cda1] text-xs uppercase tracking-wider mb-3">Tipo de bosque</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFiltroBosque('')}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${!forestFilter ? 'bg-[#887b4b] text-white' : 'glass text-[#f4ebe1]/60'}`}>
                Todos
              </button>
              {forestTypes.map(tb => {
                const bosqueEmoji = { pinar: '🌲', hayedo: '🌳', robledal: '🌿', encinar: '🫒' };
                return (
                  <button key={tb} onClick={() => setFiltroBosque(tb)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all capitalize ${forestFilter === tb ? 'bg-[#4a7c59]/30 text-emerald-400' : 'glass text-[#f4ebe1]/60'}`}>
                    {bosqueEmoji[tb] || '🌲'} {tb}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ordenar */}
          <div className="mb-5">
            <p className="text-[#d9cda1] text-xs uppercase tracking-wider mb-3">Ordenar por</p>
            <div className="flex flex-col sm:flex-row gap-2">
              {[
                { id: 'score', label: '🌡️ Mejor condición ahora' },
                { id: 'alfa', label: '🔤 Nombre (A–Z)' },
                { id: 'elevation', label: '⛰️ Mayor altitud' },
              ].map(op => (
                <button key={op.id} onClick={() => setOrdenZonas(op.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-left transition-all ${zoneSort === op.id ? 'bg-[#887b4b]/20 text-[#c4a06b]' : 'glass text-[#f4ebe1]/70 hover:text-[#f4ebe1]'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${zoneSort === op.id ? 'bg-[#887b4b]' : 'bg-white/20'}`}>
                    {zoneSort === op.id && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </span>
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:flex sm:justify-end">
            <button onClick={() => setPillOpen(false)}
              className="w-full sm:w-auto sm:px-6 py-3 bg-[#887b4b] text-white rounded-xl font-medium hover:bg-[#a0855a] transition-colors">
              Ver {filteredZones.length} zona{filteredZones.length !== 1 ? 's' : ''}
            </button>
          </div>
        </FilterPanel>
      )}

      {tab === 'mapa' && (
        <div className="space-y-4">
          <div className="relative">
            <LeafletMap
              zonas={filteredZones}
              onZoneClick={setSelectedZone}
              height="520px"
              mode={mapMode}
              onModeChange={setMapMode}
              title="Mapa de zonas micológicas" />
          </div>
          {mapMode === 'markers' ? (
            <div className="flex gap-3 flex-wrap text-xs">
              {[['pinar','#4a7c59'],['hayedo','#d9cda1'],['robledal','#a0522d'],['encinar','#6b8e23']].map(([t2,c]) => (
                <span key={t2} className="flex items-center gap-1.5 text-[#f4ebe1]/60">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  {t2.charAt(0).toUpperCase()+t2.slice(1)}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 text-xs text-[#f4ebe1]/60">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: '#ef4444' }} />
                <span>Regular (&lt;55)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: '#f97316' }} />
                <span>Bueno (55-70)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: '#eab308' }} />
                <span>Muy bueno (70-85)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: '#22c55e' }} />
                <span>Excelente (&gt;85)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'listado' && (
        <div className="space-y-4">
          {/* Chips de filtros activos */}
          {(onlyFollowed || onlyRained || forestFilter) && (
            <div className="flex flex-wrap gap-2">
              {onlyFollowed && (
                <ActiveFilterChip emoji="⭐" label="Solo seguidas" color="yellow" onRemove={() => setSoloSeguidas(false)} />
              )}
              {onlyRained && (
                <ActiveFilterChip emoji="🌧️" label={`Lluvia ≥ ${RAIN_THRESHOLD}mm / 14d`} color="blue" onRemove={() => setOnlyRained(false)} />
              )}
              {forestFilter && (
                <ActiveFilterChip emoji="🌲" label={forestFilter} color="emerald" onRemove={() => setFiltroBosque('')} />
              )}
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
                <ZoneCard key={z.id} zone={z} isFollowed={isFollowed(z.id)} condOverride={conditionsMap[z.id]}
                  onToggle={() => toggleFollow(z)} onClick={() => setSelectedZone(z)} />
              ))}
            </div>
          )}
          <p className="text-center text-[#f4ebe1]/30 text-xs pt-2">{filteredZones.length} zone{filteredZones.length !== 1 ? 's' : ''}</p>
        </div>
      )}

    </div>
  );
}

function ZoneCard({ zone, isFollowed, onToggle, onClick, condOverride }) {
  const condGen = useMemo(() => fakeConditions(), [zone.id]);
  const cond = condOverride || condGen;
  const sc = getScoreColor(cond.overallScore);
  const forestTypeIcon = `/assets/images/icons/forest-type-${zone.forestType}.png`;
  const elevationIcon = `/assets/images/icons/mountain.png`;
  const forestTypeImage = `/assets/images/forest-type/${zone.forestType}.webp`;

  return (
    <div className="glass rounded-2xl transition-all hover-lift overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
            <h3 className="font-display text-lg font-semibold text-[#f4ebe1] truncate">{zone.name}</h3>
            <p className="text-[#d9cda1] text-xs mt-0.5">{zone.region} · {zone.province}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`ml-3 p-2 rounded-xl transition-all ${isFollowed ? 'text-yellow-400 hover:bg-yellow-400/20' : 'text-[#f4ebe1]/30 hover:text-yellow-400 hover:bg-yellow-400/10'}`}>
            {IC.star(isFollowed)}
          </button>
        </div>
        <div onClick={onClick} className="cursor-pointer relative z-[1]">
          <div className="flex items-center gap-3 text-xs text-[#f4ebe1]/70 mb-4">
            <span className="contents"><img src={forestTypeIcon} alt={zone.forestType} height="16" width="16" /> {zone.forestType}</span>
            <span className="contents"><img src={elevationIcon} alt="elevation" height="16" width="16" /> {zone.elevation}m</span>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[#f4ebe1]/70 text-xs">Cond. de recolección</span>
            <span className={`text-xs font-semibold ${sc.text}`}>{sc.label}</span>
          </div>
          <div className="progress-bar">
            <div className={`progress-fill ${sc.bar}`} style={{ width: `${cond.overallScore}%` }} />
          </div>
          <div className="flex gap-1.5 mt-1.5 text-[#f4ebe1]/35 text-[10px]">
            <span className="contents"><img src={`/assets/images/icons/temperature.png`} alt="temperature" height="16" width="16" /> {cond.temperature}°C</span>
            <span>·</span>
            <span className="contents"><img src={`/assets/images/icons/accumulated-precipitation.png`} alt="accumulated-precipitation" height="16" width="16" /> {cond.rainfall14d}mm</span>
            <span>·</span>
            <span className="contents"><img src={`/assets/images/icons/humidity.png`} alt="humidity" height="16" width="16" /> {cond.humidity}%</span>
          </div>
        </div>
        <img class="absolute bottom-0 right-1 opacity-25" 
          src={forestTypeImage} 
          alt={zone.forestType} height="125" width="125" />
      </div>
    </div>
  );
}

