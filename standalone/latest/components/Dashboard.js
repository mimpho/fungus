// ==================== DASHBOARD ====================
function Dashboard({ t, setView, setSelectedZone, setSelectedSpecies, followedZones, toggleFollow, favoriteSpecies }) {
  const [mapMode, setMapMode] = useState('markers'); // 'markers' o 'heatmap'
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const todayDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  // Zones interesantes: top 3 por score simulado, que además coincidan con época actual
  const conditionsMap = useMemo(() => {
    const m = {};
    mockZones.forEach(z => { m[z.id] = fakeConditions(); });
    return m;
  }, []);

  const topZones = useMemo(() =>
    [...mockZones].sort((a, b) => (conditionsMap[b.id]?.overallScore ?? 0) - (conditionsMap[a.id]?.overallScore ?? 0)).slice(0, 3),
  [conditionsMap]);

  // Species en temporada ahora
  const inSeasonSpecies = useMemo(() =>
    mockSpecies.filter(e => e.fruitingMonths.includes(currentMonth)).slice(0, 4),
  [currentMonth]);

  return (
    <div className="space-y-10 anim-up pb-20">
      {/* Header */}
      <div>
        <h2 className="font-display text-4xl font-semibold text-[#f4ebe1] mb-1">Bienvenido</h2>
        <p className="text-[#d9cda1] text-sm">Condiciones micológicas de hoy · {todayDate}</p>
      </div>

      {/* Resumen inteligente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Condiciones Generales */}
        <div className="glass rounded-2xl p-6 hover-lift anim-up">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-[#d9cda1] uppercase tracking-wider mb-1">Condiciones Generales</div>
              <div className="font-display text-4xl font-bold text-emerald-400">
                {Math.round(topZones.reduce((acc, z) => acc + conditionsMap[z.id].overallScore, 0) / 3)}
              </div>
              <div className="text-[#f4ebe1]/70 text-xs mt-1">Promedio zonas top</div>
            </div>
            <img src="/assets/images/icons/temperature.png" alt="temperature" className="w-10 h-10 opacity-70" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#f4ebe1]/60">Temperatura media</span>
              <span className="text-[#f4ebe1] font-medium">
                {Math.round(topZones.reduce((acc, z) => acc + conditionsMap[z.id].temperature, 0) / 3)}°C
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#f4ebe1]/60">Humedad media</span>
              <span className="text-[#f4ebe1] font-medium">
                {Math.round(topZones.reduce((acc, z) => acc + conditionsMap[z.id].humidity, 0) / 3)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#f4ebe1]/60">Lluvia últimos 14d</span>
              <span className="text-[#f4ebe1] font-medium">
                {Math.round(topZones.reduce((acc, z) => acc + conditionsMap[z.id].rainfall14d, 0) / 3)}mm
              </span>
            </div>
          </div>
        </div>

        {/* Mejor Zona del Día */}
        <div className="glass rounded-2xl p-6 hover-lift anim-up cursor-pointer"
             style={{ animationDelay: '0.08s' }}
             onClick={() => setSelectedZone(topZones[0])}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-emerald-400 uppercase tracking-wider mb-1">🌟 Mejor Zona Hoy</div>
              <div className="font-display text-lg font-semibold text-[#f4ebe1] truncate">
                {topZones[0]?.name}
              </div>
              <div className="text-[#d9cda1] text-xs mt-0.5">
                {topZones[0]?.province} · {topZones[0]?.elevation}m
              </div>
            </div>
            <div className="font-display text-3xl font-bold text-emerald-400">
              {conditionsMap[topZones[0]?.id]?.overallScore}
            </div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-3">
            <div className="text-xs text-emerald-300 mb-1">¿Por qué es la mejor?</div>
            <div className="text-[#f4ebe1]/80 text-xs leading-relaxed">
              {conditionsMap[topZones[0]?.id]?.rainfall14d > 30 
                ? `Lluvia abundante (${conditionsMap[topZones[0]?.id]?.rainfall14d}mm), ` 
                : 'Lluvia moderada, '}
              temperatura óptima ({conditionsMap[topZones[0]?.id]?.temperature}°C), 
              humedad alta ({conditionsMap[topZones[0]?.id]?.humidity}%).
            </div>
          </div>
        </div>

        {/* Species en Temporada */}
        <div className="glass rounded-2xl p-6 hover-lift anim-up" style={{ animationDelay: '0.16s' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-[#d9cda1] uppercase tracking-wider mb-1">Especies Activas</div>
              <div className="font-display text-4xl font-bold text-[#f4ebe1]">
                {inSeasonSpecies.length}
              </div>
              <div className="text-[#f4ebe1]/70 text-xs mt-1">Fructificando este mes</div>
            </div>
            <img src="/assets/images/icons/mushroom.png" alt="season" className="w-10 h-10 opacity-70" />
          </div>
          <div className="space-y-2">
            {inSeasonSpecies.slice(0, 3).map((e, i) => {
              return (
                <div key={e.id}
                     className="flex items-center gap-2 bg-white/[0.03] rounded-lg p-2 cursor-pointer hover:bg-white/[0.06] transition-colors"
                     onClick={() => setSelectedSpecies(e)}>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getEdibilityColor(e.edibility).dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-xs text-[#f4ebe1] truncate">
                      {e.scientificName}
                    </div>
                  </div>
                </div>
              );
            })}
            {inSeasonSpecies.length > 3 && (
              <button 
                onClick={() => setView('especies')}
                className="w-full text-center text-xs text-[#d9cda1] hover:text-[#c4a06b] transition-colors pt-1">
                Ver todas las {inSeasonSpecies.length} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── ÁREA ZONAS ─── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-[#4a7c59]" />
          <h3 className="font-display text-2xl font-semibold text-[#f4ebe1]">Zones</h3>
        </div>

        {/* Zones interesantes ahora */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#d9cda1] text-sm font-medium uppercase tracking-wider">🌟 Mejores conditions hoy</p>
            <button onClick={() => setView('zonas')} className="text-[#d9cda1] hover:text-[#c4a06b] text-xs transition-colors">Ver todas →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topZones.map(z => (
              <ZoneCard
                key={z.id}
                zone={z}
                isFollowed={followedZones.some(fz => fz.id === z.id)}
                onToggle={() => toggleFollow(z)}
                onClick={() => setSelectedZone(z)}
                condOverride={conditionsMap[z.id]}
              />
            ))}
          </div>
        </div>

        {/* Zones seguidas */}
        {followedZones.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#d9cda1] text-sm font-medium uppercase tracking-wider">⭐ {t.followedZones}</p>
              <button onClick={() => setView('zonas')} className="text-[#d9cda1] hover:text-[#c4a06b] text-xs transition-colors">Ver todas →</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {followedZones.slice(0, 4).map((z) => {
                const cond = conditionsMap[z.id] || fakeConditions();
                const sc = getScoreColor(cond.overallScore);
                return (
                  <div key={z.id} onClick={() => setSelectedZone(z)}
                    className="glass rounded-xl p-4 flex items-center gap-4 hover-lift cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#f4ebe1] text-sm truncate">{z.name}</div>
                      <div className="text-[#d9cda1] text-xs">{z.province} · {z.forestType} · {z.elevation}m</div>
                      <div className="mt-2 progress-bar"><div className={`progress-fill ${sc.bar}`} style={{ width: `${cond.overallScore}%` }} /></div>
                    </div>
                    <div className={`text-right ${sc.text} shrink-0`}>
                      <div className="text-sm font-semibold">{cond.overallScore}<span className="text-xs font-normal opacity-60">/100</span></div>
                      <div className="text-[10px] opacity-70 mt-0.5">{sc.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mapa de zonas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#d9cda1] text-sm font-medium uppercase tracking-wider">🗺️ Mapa de conditions</p>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <LeafletMap
              zonas={mockZones}
              onZoneClick={setSelectedZone}
              height="400px"
              mode={mapMode}
              onModeChange={setMapMode}
              title="Mapa de zonas micológicas" />
          </div>
          {mapMode === 'heatmap' && (
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[#f4ebe1]/60">
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
      </div>

      {/* ─── ÁREA ESPECIES ─── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-[#887b4b]" />
          <h3 className="font-display text-2xl font-semibold text-[#f4ebe1]">Species</h3>
        </div>

        {/* Species en temporada */}
        {inSeasonSpecies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#d9cda1] text-sm font-medium uppercase tracking-wider">🌱 Fructificando este mes</p>
              <button onClick={() => setView('especies')} className="text-[#d9cda1] hover:text-[#c4a06b] text-xs transition-colors">Ver catálogo →</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {inSeasonSpecies.map((e, i) => (
                <SpeciesCard
                  key={e.id}
                  species={e}
                  onOpen={setSelectedSpecies}
                  size="compact"
                  animDelay={i * 0.06}
                />
              ))}
            </div>
          </div>
        )}

        {/* Species favoritas */}
        {favoriteSpecies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#d9cda1] text-sm font-medium uppercase tracking-wider">❤️ {t.favoriteSpecies}</p>
              <button onClick={() => setView('especies')} className="text-[#d9cda1] hover:text-[#c4a06b] text-xs transition-colors">Ver todas →</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {favoriteSpecies.slice(0, 6).map(e => {
                const enTemporada = e.fruitingMonths.includes(currentMonth);
                return (
                  <div key={e.id} onClick={() => setSelectedSpecies(e)}
                    className="flex items-center gap-3 glass rounded-xl px-3 py-2.5 cursor-pointer hover-lift transition-all">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                      <SpeciesImg localSrc={e.photo?.url} scientificName={e.scientificName} className="w-full h-full opacity-80" objectFit="cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm text-[#f4ebe1] truncate max-w-[120px]">{e.scientificName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <EdibilityTag edibility={e.edibility} variant="glass" showDot={true} className="text-[9px] px-0 bg-transparent" />
                        {enTemporada && <span className="text-emerald-400 text-[9px] font-medium">EN TEMPORADA</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

