// ==================== ZONA MODAL ====================
function ZoneModal({ t, zone, onClose, isFollowed, onToggleFollow, onViewSpecies }) {
  const zoneSpecies = mockSpecies.filter(e => e.forestTypes?.includes(zone.forestType));
  const conditions = useMemo(() => fakeConditions(), [zone.id]);
  const currentMonth = new Date().getMonth() + 1;
  const sc = getScoreColor(conditions.overallScore);

  const available = useMemo(() =>
    zoneSpecies.filter(e => e.fruitingMonths?.includes(currentMonth))
      .map(e => ({ ...e, score: Math.floor(60 + Math.random() * 35), dias: Math.floor(3 + Math.random() * 8) }))
      .sort((a, b) => b.score - a.score),
    [zone.id]
  );

  // Imagen hero de la zone: usamos foto de una species representativa del tipo de bosque
  const heroSpecies = zoneSpecies[0];
  const forestColors = { pinar: '#2a4a1e', hayedo: '#3a2a0a', robledal: '#2a180a', encinar: '#1a3a10' };
  const [scrolled, setScrolled] = useState(false);
  const modalRef = useRef(null);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center modal-outer"
      style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)', overflowY: 'auto' }} onClick={onClose}>
      <div ref={modalRef} onScroll={() => setScrolled((modalRef.current?.scrollTop ?? 0) > 160)}
        className="sm:my-8 rounded-2xl max-w-4xl w-full anim-scale modal-inner" style={{ background: MODAL.bg }} onClick={e => e.stopPropagation()}>

        {/* Mini-barra sticky — aparece al hacer scroll */}
        <div className={`glass sticky top-0 z-20 flex items-center gap-3 px-4 overflow-hidden transition-all duration-200 sm:rounded-t-2xl ${scrolled ? 'max-h-20 py-3 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'}`}
          style={{ borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg font-semibold text-[#f4ebe1] truncate">{zone.name}</p>
            <p className="text-[#d9cda1]/60 text-[11px] truncate">{zone.province} · {zone.forestType}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={onToggleFollow} className={`p-2 rounded-xl transition-all ${isFollowed ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30' : 'text-white/50 hover:text-yellow-400 hover:bg-white/10'}`}>{IC.star(isFollowed)}</button>
            <button onClick={onClose} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">{IC.close}</button>
          </div>
        </div>

        {/* Hero con foto */}
        <div className="modal-header sm:rounded-t-2xl overflow-hidden" style={{ background: MODAL.bg }}>
          {/* Imagen hero */}
          <div className="relative h-44 overflow-hidden">
            {heroSpecies ? (
              <img src={heroSpecies.photo?.url} alt={zone.name}
                className="w-full h-full object-cover opacity-50" />
            ) : (
              <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${forestColors[zone.forestType] || '#1a3a2e'}, #30372a)` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#30372a] via-[#30372a]/60 to-transparent" />
            {/* Nombre sobre la foto */}
            <div className="absolute bottom-4 left-6 right-14">
              <h2 className="font-display text-3xl font-semibold text-[#f4ebe1] drop-shadow-lg">{zone.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#4a7c59]/30 text-[#8fcc9a] text-xs font-medium">{zone.province}</span>
                <span className="contents text-[#f4ebe1]/60 text-xs">
                  <img src={`/assets/images/icons/forest-type-${zone.forestType}.png`} alt={zone.forestType} height="16" width="16" /> {zone.forestType} · <img src={`/assets/images/icons/mountain.png`} alt="elevation" height="16" width="16" /> {zone.elevation}m</span>
              </div>
            </div>
            {/* Acciones */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={onToggleFollow}
                className={`p-2.5 rounded-xl transition-all backdrop-blur-sm ${isFollowed ? 'bg-yellow-400/25 text-yellow-400' : 'bg-black/40 text-white/60 hover:text-yellow-400'}`}
                title={isFollowed ? t.siguiendo : t.seguir}>
                {IC.star(isFollowed)}
              </button>
              <button onClick={onClose}
                className="p-2.5 rounded-xl bg-black/40 text-white/60 hover:text-white transition-all backdrop-blur-sm">
                {IC.close}
              </button>
            </div>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="p-6 space-y-8 modal-scroll">
          {/* Descripción de la zone */}
          {zone.description && (
            <p className="text-[#f4ebe1]/60 text-sm leading-relaxed border-l-2 border-[#d9cda1]/40 pl-4">{zone.description}</p>
          )}
          {/* Termómetro compact */}
          <section id="condicion">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-1">{t.termometro}</h3>
            <p className="text-[#f4ebe1]/35 text-[11px] mb-3">Temperatura · Precipitación 14 días · Humedad del suelo</p>
            <div className="flex items-center gap-4 bg-white/[0.03] rounded-xl p-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-semibold ${sc.text}`}>{sc.label}</span>
                  <span className="font-display text-xl font-bold text-[#f4ebe1]">{conditions.overallScore}<span className="text-xs text-[#f4ebe1]/40 font-sans">/100</span></span>
                </div>
                <div className="progress-bar h-[8px]"><div className={`progress-fill ${sc.bar}`} style={{ width: `${conditions.overallScore}%`, height: '8px' }} /></div>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-3">
              {[
                { icon: 'temperature', l: 'Temperatura', v: `${conditions.temperature}°C` },
                { icon: 'soil-moisture', l: 'T. Suelo', v: `${conditions.soilTemp}°C` },
                { icon: 'accumulated-precipitation', l: 'Precipit. 14d', v: `${conditions.rainfall14d}mm` },
                { icon: 'humidity', l: 'Humedad', v: `${conditions.humidity}%` },
                { icon: 'wind', l: 'Viento', v: `${conditions.wind}km/h` },
                { icon: 'sunny', l: 'Sin lluvia', v: `${conditions.dryDays}d` },
              ].map((c, i) => {
                const iconUrl = `/assets/images/icons/${c.icon}.png`;
                return (
                  <div key={i} className="bg-white/[0.03] rounded-xl p-3 text-center">
                    <img className="m-auto mb-1" src={iconUrl} alt={c.l} height="36" width="36" />
                    <div className="text-[#f4ebe1]/70 text-[11px] mb-1">{c.l}</div>
                    <div className="text-[#f4ebe1] text-sm font-semibold">{c.v}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Disponibles ahora */}
          <section id="available">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-3">{t.disponiblesAhora}</h3>
            {available.length === 0 ? (
              <div className="text-center py-8 text-[#f4ebe1]/40 text-sm">No hay especies available este mes.</div>
            ) : (
              <div className="space-y-2">
                {available.map(e => {
                  const ss = getScoreColor(e.score);
                  return (
                    <div key={e.id} onClick={() => onViewSpecies && onViewSpecies(e)}
                      className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3 hover:bg-white/[0.05] transition-all cursor-pointer group">
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={e.photo?.url} alt={e.scientificName}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          onError={ev => { ev.target.parentNode.style.background='rgba(139,111,71,0.15)'; ev.target.style.display='none'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-lg text-[#f4ebe1] truncate group-hover:text-[#c4a06b] transition-colors">{e.scientificName}</div>
                        <EdibilityTag edibility={e.edibility} variant="glass" />
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`font-semibold text-sm ${ss.text}`}>{e.score}</div>
                        <div className="text-[#f4ebe1]/40 text-[10px]">~{e.dias} días</div>
                        <svg className="w-3 h-3 text-[#f4ebe1]/20 group-hover:text-[#d9cda1] transition-colors ml-auto mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Calendario */}
          <section id="calendario">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-3">{t.calendarioFruct}</h3>
            <div className="space-y-3">
              {zoneSpecies.map(e => {
                return (
                  <div key={e.id} onClick={() => onViewSpecies && onViewSpecies(e)}
                    className="bg-white/[0.03] rounded-xl p-4 hover:bg-white/[0.05] transition-all cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-display text-lg text-[#f4ebe1] group-hover:text-[#c4a06b] transition-colors">{e.scientificName}</span>
                      <EdibilityTag edibility={e.edibility} variant="glass" className="ml-auto" />
                      <svg className="w-3 h-3 text-[#f4ebe1]/20 group-hover:text-[#d9cda1] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      {MONTHS.map((m, i) => (
                        <div key={i} className={`text-center py-1.5 rounded text-[9px] font-medium ${e.fruitingMonths?.includes(i+1) ? 'bg-emerald-500/25 text-emerald-400' : 'bg-white/[0.03] text-[#f4ebe1]/20'}`}>{m}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Mapa de ubicación */}
          <section id="ubicacion">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-3">{t.ubicacion}</h3>
            <LeafletMap singleZone={zone} height="280px" title={zone.name} />
            <div className="flex items-center gap-2 mt-2 text-[#f4ebe1]/40 text-xs">
              {IC.pin} {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)} · {zone.elevation}m s.n.m.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

