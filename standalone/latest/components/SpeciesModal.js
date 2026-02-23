// ==================== ESPECIE MODAL ====================
function SpeciesModal({ t, species, onClose, isFav, onToggleFav, onViewFamily, onOpenLightbox, onViewZone, onViewSpecies }) {
  const family = mockFamilies[species.family];
  const [mapMode, setMapMode] = useState('heatmap');
  const [scrolled, setScrolled] = useState(false);
  const modalRef = useRef(null);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const compatZones = useMemo(() => {
    if (species.distributionZones?.length > 0) {
      return mockZones.filter(z => species.distributionZones.includes(z.id));
    }
    return mockZones.filter(z => species.forestTypes?.includes(z.forestType));
  }, [species.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center modal-outer"
      style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)', overflowY: 'auto' }} onClick={onClose}>
      <div ref={modalRef} onScroll={() => setScrolled((modalRef.current?.scrollTop ?? 0) > 180)}
        className="sm:my-8 rounded-2xl max-w-4xl w-full anim-scale modal-inner" style={{ background: MODAL.bg }} onClick={e => e.stopPropagation()}>
        {/* Mini-barra sticky — aparece al hacer scroll */}
        <div className={`glass sticky top-0 z-20 flex items-center gap-3 px-4 overflow-hidden transition-all duration-200 sm:rounded-t-2xl ${scrolled ? 'max-h-20 py-3 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'}`}
          style={{ borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg font-semibold text-[#f4ebe1] truncate">{species.scientificName}</p>
            <p className="text-[#d9cda1]/60 text-[11px] truncate">{species.commonNames?.[0]}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={onToggleFav} className={`p-2 rounded-xl transition-all ${isFav ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'text-white/50 hover:text-red-400 hover:bg-white/10'}`}>{IC.heart(isFav)}</button>
            <button onClick={onClose} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">{IC.close}</button>
          </div>
        </div>
        {/* Hero foto */}
        <div className="relative h-56 overflow-hidden sm:rounded-t-2xl modal-header">
          <SpeciesImg localSrc={species.photo?.url} scientificName={species.scientificName} className="w-full h-full opacity-70" objectFit="cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#30372a] via-[#30372a]/40 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6">
            <h2 className="font-display text-4xl font-semibold text-[#f4ebe1] drop-shadow-lg">{species.scientificName}</h2>
            <p className="text-[#d9cda1] text-sm mt-1">{species.family} · {species.commonNames[0]}</p>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={onToggleFav} className={`p-2 rounded-xl transition-all ${isFav ? 'bg-red-500/20 text-red-400' : 'bg-black/40 text-white/50 hover:text-red-400'}`}>{IC.heart(isFav)}</button>
            <button onClick={onClose} className="p-2 rounded-xl bg-black/40 text-white/50 hover:text-white transition-all">{IC.close}</button>
          </div>
        </div>

        <div className="p-6 space-y-8 modal-scroll">
          {/* Comestibilidad + family */}
          <div className="flex flex-wrap gap-3 items-center">
            <EdibilityTag edibility={species.edibility} variant="glass" showDot={true} className="px-4 py-2 rounded-xl text-sm font-semibold" />
            {family && (
              <button onClick={() => onViewFamily(family)}
                className="glass px-4 py-2 rounded-xl text-sm text-[#d9cda1] hover:text-[#c4a06b] transition-colors">
                🔬 {t.ver_familia}: {species.family}
              </button>
            )}
          </div>

          {species.edibility === 'mortal' && (
            <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-red-500/40 bg-red-500/10">
              {IC.warning}
              <div>
                <div className="font-bold text-red-400 mb-1">ESPECIE MORTAL — PELIGRO EXTREMO</div>
                <p className="text-red-300/80 text-sm">Esta species puede causar la muerte. NUNCA la consumas. En caso de ingestión, contacta inmediatamente con Urgencias (112) o el Centro Toxicológico (91 562 04 20).</p>
              </div>
            </div>
          )}

          {/* Nombres comunes */}
          {species.commonNames?.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-3">{t.tambienConocida}</h3>
              <div className="flex flex-wrap gap-2">
                {species.commonNames.map((n, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-[#887b4b]/15 text-[#c4a06b] text-sm">{n}</span>
                ))}
              </div>
            </section>
          )}

          {/* Descripción */}
          {species.description && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-3">{t.description}</h3>
              <p className="text-[#f4ebe1]/70 text-sm leading-relaxed">{species.description}</p>
            </section>
          )}

          {/* Hábitat + altitud */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-3">{t.habitat}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {species.forestTypes?.map((b, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-[#4a7c59]/15 text-[#4a7c59] text-sm">🌲 {b}</span>
              ))}
            </div>
            {(species.elevationMin != null) && (
              <div className="text-xs text-[#f4ebe1]/50">⛰️ Altitud: {species.elevationMin}–{species.elevationMax}m s.n.m.</div>
            )}
          </section>

          {/* Fructificación */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-3">{t.fructificacion}</h3>
            <div className="grid grid-cols-12 gap-1.5">
              {MONTHS.map((m, i) => (
                <div key={i} className={`text-center py-2 rounded-lg text-[10px] font-medium ${species.fruitingMonths?.includes(i+1) ? 'bg-emerald-500/25 text-emerald-400' : 'bg-white/[0.03] text-[#f4ebe1]/20'}`}>{m}</div>
              ))}
            </div>
          </section>

          {/* Galería de fotos */}
          {(
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-3">
                📷 Galería {species.photos && species.photos.length > 0 ? `(${species.photos.length + 1} fotos)` : '(1 foto)'}
              </h3>
              <div className={`grid gap-2 ${!species.photos || species.photos.length === 0 ? 'grid-cols-1' : species.photos.length === 1 ? 'grid-cols-2' : species.photos.length === 2 ? 'grid-cols-4 grid-rows-2 w-full aspect-[2/1] overflow-hidden' : 'grid-cols-4'}`}>
                {/* Foto principal siempre desde Wikipedia */}
                <div className={`gallery-thumb group relative overflow-hidden rounded-lg${species.photos?.length === 2 ? ' col-span-3 row-span-2' : ''}`} style={{ aspectRatio: '4/3' }}>
                  <SpeciesImg localSrc={species.photo?.largeUrl || species.photo?.url} scientificName={species.scientificName} className="w-full h-full" objectFit="cover" />
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[9px] text-white/80 truncate rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                    {species.scientificName}
                  </div>
                </div>
                {/* Fotos adicionales si las hay */}
                {species.photos && species.photos.map((foto, i) => (
                  <div key={i} className={`gallery-thumb group relative${species.photos.length === 2 ? ' col-span-1 row-span-1' : '' }`}
                    onClick={() => onOpenLightbox(species.photos, i)}>
                    <img src={foto.url} alt={foto.caption}
                      onError={ev => { ev.target.parentNode.style.background = 'rgba(139,111,71,0.1)'; ev.target.style.display = 'none'; }} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center rounded-lg">
                      <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                    {foto.caption && (
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[9px] text-white/80 truncate rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                        {foto.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[#f4ebe1]/30 text-[10px] mt-2 text-center">Haz clic en cualquier imagen para verla a pantalla completa · ← → para navegar</p>
            </section>
          )}

          {/* Condiciones de fructificación */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-4">Condiciones de fructificación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Temperatura */}
              <div className="bg-white/[0.03] rounded-xl p-4 flex items-start gap-3">
                <div className="shrink-0">
                  <img src="/assets/images/icons/temperature.png" alt="Temperatura" height="36" width="36" />
                </div>
                <div>
                  <h4 className="text-[#c4a06b] font-medium text-xs uppercase tracking-wide mb-1">Temperatura</h4>
                  <p className="text-[#f4ebe1]/70 text-xs leading-relaxed">
                    {species.family === 'Amanitaceae' && species.edibility === 'excelente'
                      ? 'Noches frescas (8–14°C) con días cálidos. Requiere oscilación térmica diaria mínima de 15°C para estimular la fructificación.'
                      : species.family === 'Morchellaceae'
                      ? 'Primavera temprana, entre 10–18°C de temperatura diurna. Tolerante a heladas nocturnas.'
                      : species.family === 'Pleurotaceae'
                      ? 'Temperaturas bajas de otoño-invierno (2–15°C). Alta resistencia al frío.'
                      : 'Temperaturas frescas a moderadas (8–18°C). Mejor tras el primer frío otoñal.'}
                  </p>
                </div>
              </div>

              {/* Precipitación */}
              <div className="bg-white/[0.03] rounded-xl p-4 flex items-start gap-3">
                <div className="shrink-0">
                  <img src="/assets/images/icons/cloudy-sun.png" alt="Precipitación" height="36" width="36" />
                </div>
                <div>
                  <h4 className="text-[#c4a06b] font-medium text-xs uppercase tracking-wide mb-1">Precipitación</h4>
                  <p className="text-[#f4ebe1]/70 text-xs leading-relaxed">
                    {species.family === 'Cantharellaceae'
                      ? 'Mínimo 30–50mm en los 14 días previos. Prefiere periodos húmedos prolongados con buena infiltración.'
                      : species.family === 'Morchellaceae'
                      ? 'Suelos húmedos por deshielo o lluvias primaverales. Evita encharcamientos.'
                      : '25–60mm en los 10–14 días previos. Fructificación óptima 5–10 días tras lluvia significativa.'}
                  </p>
                </div>
              </div>

              {/* Tipo de suelo */}
              <div className="bg-white/[0.03] rounded-xl p-4 flex items-start gap-3">
                <div className="text-2xl shrink-0">🌱</div>
                <div>
                  <h4 className="text-[#c4a06b] font-medium text-xs uppercase tracking-wide mb-1">Suelo</h4>
                  <p className="text-[#f4ebe1]/70 text-xs leading-relaxed">
                    {species.family === 'Boletaceae'
                      ? 'Suelos ácidos a neutros, bien drenados. Prefiere substrato orgánico rico con pH 5–6.5. Micorriza con coníferas y caducifolios.'
                      : species.family === 'Russulaceae'
                      ? 'Suelos forestales con horizonte orgánico bien desarrollado. pH ligeramente ácido (5–6).'
                      : species.family === 'Amanitaceae'
                      ? 'Suelos calcáreos o silíceos según la species. Requiere horizonte orgánico maduro y presencia de árboles huésped.'
                      : 'Suelos forestales húmedos con buena materia orgánica y drenaje moderado.'}
                  </p>
                </div>
              </div>

              {/* Requisitos especiales */}
              <div className="bg-white/[0.03] rounded-xl p-4 flex items-start gap-3">
                <div className="shrink-0">
                  <img src="/assets/images/icons/search.png" alt="Requisitos especiales" height="36" width="36" />
                </div>
                <div>
                  <h4 className="text-[#c4a06b] font-medium text-xs uppercase tracking-wide mb-1">Requisitos especiales</h4>
                  <p className="text-[#f4ebe1]/70 text-xs leading-relaxed">
                    {species.scientificName === 'Amanita caesarea'
                      ? 'Requiere choque térmico pronunciado. Sensible a heladas. Aparece tras tormentas de verano en zonas templadas mediterráneas.'
                      : species.scientificName === 'Morchella esculenta'
                      ? 'Choque térmico primaveral esencial. Favorecida por incendios previos o zonas de remoción del suelo. Cocinar siempre.'
                      : species.scientificName === 'Pleurotus ostreatus'
                      ? 'Especie lignícola saprófita. No requiere árboles vivos. Tolera heladas. Mayor producción con días cortos (otoño-invierno).'
                      : species.family === 'Cantharellaceae'
                      ? 'Imposibles de cultivar. Requieren micorriza con árboles vivos. Indicadoras de bosques maduros con buena salud ecológica.'
                      : 'Especie micorrizógena. Requiere presencia de árboles huésped adultos. Las conditions óptimas varían por elevación y orientación.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Score clima */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Tolerancia frío', value: species.family === 'Pleurotaceae' || species.family === 'Morchellaceae' ? 90 : species.family === 'Amanitaceae' && species.edibility === 'excelente' ? 30 : 60, icon: '❄️' },
                { label: 'Necesidad lluvia', value: species.family === 'Cantharellaceae' ? 85 : species.family === 'Boletaceae' ? 70 : 65, icon: '💧' },
                { label: 'Altitud óptima', value: Math.round(((species.elevationMax - species.elevationMin) / 2400) * 100), icon: '⛰️' },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <div className="text-sm mb-1">{m.icon}</div>
                  <div className="progress-bar mb-1">
                    <div className="progress-fill bg-[#887b4b]" style={{ width: `${m.value}%` }} />
                  </div>
                  <div className="text-[#f4ebe1]/40 text-[10px]">{m.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Morfología técnica */}
          {(species.cap || species.stem || species.flesh) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-4">{t.morfologia}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {species.cap && (
                  <div className="bg-white/[0.03] rounded-xl p-4">
                    <div className="text-center text-4xl mb-3" title="Sombrero">
                      {/* SVG ilustración sombrero */}
                      <svg width="60" height="40" viewBox="0 0 60 40" className="mx-auto">
                        <ellipse cx="30" cy="35" rx="28" ry="5" fill="rgba(139,111,71,0.3)" />
                        <path d="M5,32 Q15,10 30,8 Q45,10 55,32" fill="rgba(139,111,71,0.6)" stroke="rgba(196,160,107,0.5)" strokeWidth="1" />
                        <ellipse cx="30" cy="32" rx="27" ry="4" fill="rgba(139,111,71,0.4)" />
                      </svg>
                    </div>
                    <h4 className="text-[#c4a06b] font-medium text-xs uppercase tracking-wide mb-2 text-center">Sombrero</h4>
                    <div className="space-y-1.5 text-xs text-[#f4ebe1]/60">
                      <div><span className="text-[#f4ebe1]/40">Forma:</span> {species.cap.forma}</div>
                      <div><span className="text-[#f4ebe1]/40">Color:</span> {species.cap.color}</div>
                      <div><span className="text-[#f4ebe1]/40">Diámetro:</span> {species.cap.diametro}</div>
                      <div><span className="text-[#f4ebe1]/40">Superficie:</span> {species.cap.superficie}</div>
                    </div>
                  </div>
                )}
                {species.stem && (
                  <div className="bg-white/[0.03] rounded-xl p-4">
                    <div className="text-center mb-3">
                      <svg width="30" height="60" viewBox="0 0 30 60" className="mx-auto">
                        <rect x="10" y="5" width="10" height="45" rx="4" fill="rgba(139,111,71,0.5)" stroke="rgba(196,160,107,0.4)" strokeWidth="1"/>
                        <ellipse cx="15" cy="52" rx="14" ry="5" fill="rgba(139,111,71,0.25)" />
                      </svg>
                    </div>
                    <h4 className="text-[#c4a06b] font-medium text-xs uppercase tracking-wide mb-2 text-center">Pie</h4>
                    <div className="space-y-1.5 text-xs text-[#f4ebe1]/60">
                      <div><span className="text-[#f4ebe1]/40">Forma:</span> {species.stem.forma}</div>
                      <div><span className="text-[#f4ebe1]/40">Color:</span> {species.stem.color}</div>
                      <div><span className="text-[#f4ebe1]/40">Altura:</span> {species.stem.altura}</div>
                      <div><span className="text-[#f4ebe1]/40">Diámetro:</span> {species.stem.diametro}</div>
                    </div>
                  </div>
                )}
                {species.flesh && (
                  <div className="bg-white/[0.03] rounded-xl p-4">
                    <div className="text-center mb-3">
                      <svg width="50" height="50" viewBox="0 0 50 50" className="mx-auto">
                        <circle cx="25" cy="25" r="22" fill="none" stroke="rgba(139,111,71,0.5)" strokeWidth="1.5" strokeDasharray="4 2"/>
                        <circle cx="25" cy="25" r="16" fill="rgba(244,235,225,0.08)" />
                        <path d="M10,25 Q25,10 40,25 Q25,40 10,25" fill="rgba(139,111,71,0.2)" />
                      </svg>
                    </div>
                    <h4 className="text-[#c4a06b] font-medium text-xs uppercase tracking-wide mb-2 text-center">Carne</h4>
                    <div className="space-y-1.5 text-xs text-[#f4ebe1]/60">
                      <div><span className="text-[#f4ebe1]/40">Color:</span> {species.flesh.color}</div>
                      <div><span className="text-[#f4ebe1]/40">Textura:</span> {species.flesh.textura}</div>
                      <div><span className="text-[#f4ebe1]/40">Olor:</span> {species.flesh.olor}</div>
                      <div><span className="text-[#f4ebe1]/40">Sabor:</span> {species.flesh.sabor}</div>
                    </div>
                  </div>
                )}
              </div>
              {species.sporePrint && (
                <div className="mt-3 flex items-center gap-2 text-xs text-[#f4ebe1]/50 bg-white/[0.03] rounded-lg px-4 py-2">
                  <span className="text-[#f4ebe1]/30">Esporada:</span> {species.sporePrint}
                </div>
              )}
            </section>
          )}

          {/* Posibles Confusiones — generadas por familia */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-3">⚠️ Posibles confusiones</h3>
            <ConfusionesBlock species={species} onViewSpecies={onViewSpecies} />
          </section>


          {/* Mapa de disponibilidad por zona */}
          {compatZones.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#d9cda1] mb-1">{t.dondeEncontrar}</h3>
              <p className="text-[#f4ebe1]/35 text-[11px] mb-3">{compatZones.length} zonas compatibles · Pulsa una zona para ver su ficha</p>
              <LeafletMap
                zonas={compatZones}
                onZoneClick={onViewZone}
                height="300px"
                title={`Disponibilidad de ${species.scientificName}`}
                mode={mapMode}
                onModeChange={setMapMode} />
            </section>
          )}
        </div>

        <div className="px-6 py-4 text-center text-[#f4ebe1]/30 text-xs">
          ⚠️ Ficha orientativa. Consulta siempre a un micólogo experto antes de consumir cualquier seta silvestre.
        </div>
      </div>
    </div>
  );
}

