// ==================== MAPA FULLSCREEN MODAL ====================
function MapFullscreenModal({ zonas, singleZone, onZoneClick, title, onClose, mode = 'markers', onModeChange = null }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="map-fullscreen anim-scale" style={{ zIndex: 10000 }}>
      <div className="map-fullscreen-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          {IC.map}
          <span className="font-display text-lg text-[#f4ebe1]">{title || 'Mapa'}</span>
          {singleZone && (
            <span className="text-xs text-[#d9cda1]">
              {singleZone.lat.toFixed(4)}, {singleZone.lng.toFixed(4)} · ⛰️ {singleZone.elevation}m
            </span>
          )}
        </div>
        <button onClick={onClose}
          className="p-2.5 rounded-xl hover:bg-white/10 text-[#f4ebe1]/60 hover:text-[#f4ebe1] transition-colors"
          title="Cerrar">
          {IC.close}
        </button>
      </div>
      <div className="map-fullscreen-body" style={{ position: 'relative' }}>
        {/* Tabs de modo si está disponible */}
        {onModeChange && (
          <div className="absolute top-3 left-3 z-[1000] backdrop-blur-sm bg-[#30372a]/80 rounded-xl p-1">
            <Tabs
              options={[
                { id: 'markers', label: 'Zones' },
                { id: 'heatmap', label: 'Mapa de calor' }
              ]}
              selected={mode}
              onChange={onModeChange}
              size="sm"
              variant="compact"
            />
          </div>
        )}
        <LeafletMapInner
          zonas={zonas} singleZone={singleZone} onZoneClick={onZoneClick}
          height="100%" fullscreen mode={mode} />
      </div>
    </div>,
    document.body
  );
}

// ==================== LEAFLET MAP INNER (sin botón expand) ====================
function LeafletMapInner({ zonas, onZoneClick, height = '400px', selectedZone = null, singleZone = null, fullscreen = false, mode = 'markers' }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    const center = singleZone ? [singleZone.lat, singleZone.lng] : [41.8, 1.5];
    const zoom = singleZone ? 11 : 7;
    const map = L.map(mapRef.current, { 
      zoomControl: false,  // Desactivar control por defecto
      scrollWheelZoom: true 
    }).setView(center, zoom);
    
    // Añadir zoom control en bottom-left
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO', subdomains: 'abcd', maxZoom: 19
    }).addTo(map);
    leafletRef.current = map;

    if (mode === 'heatmap' && zonas && zonas.length > 0) {
      // Modo mapa de calor
      const heatData = zonas.map(z => {
        const cond = fakeConditions();
        const intensity = cond.overallScore / 100; // Normalizar 0-1
        return [z.lat, z.lng, intensity];
      });
      
      const heatLayer = L.heatLayer(heatData, {
        radius: 35,
        blur: 25,
        maxZoom: 17,
        gradient: {
          0.4: '#ef4444',    // rojo (malo)
          0.55: '#f97316',   // naranja
          0.7: '#eab308',    // amarillo
          0.85: '#84cc16',   // lima
          1.0: '#22c55e'     // verde (excelente)
        }
      }).addTo(map);
      heatLayerRef.current = heatLayer;
    } else {
      // Modo marcadores (predeterminado)
      const mushIcon = (color = '#d9cda1', active = false) => L.divIcon({
        className: '',
        html: `<div style="width:${active?38:28}px;height:${active?38:28}px;background:${color};border:2px solid rgba(255,255,255,0.4);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${active?16:12}px;box-shadow:0 0 ${active?20:10}px ${color}80;transition:all 0.2s;">🍄</div>`,
        iconSize: [active?38:28, active?38:28], iconAnchor: [active?19:14, active?19:14], popupAnchor: [0, -20],
      });

      const toRender = singleZone ? [singleZone] : (zonas || []);
      toRender.forEach(z => {
        const isActive = selectedZone && selectedZone.id === z.id;
        const colors = { pinar: '#4a7c59', hayedo: '#d9cda1', robledal: '#a0522d', encinar: '#6b8e23' };
        const color = colors[z.forestType] || '#d9cda1';
        const marker = L.marker([z.lat, z.lng], { icon: mushIcon(color, isActive) })
          .bindPopup(`<div style="font-family:DM Sans,sans-serif;color:#f4ebe1;min-width:160px"><strong style="font-size:14px">${z.name}</strong><br><span style="color:#d9cda1;font-size:12px">${z.province} · ${z.forestType}</span><br><span style="color:#aaa;font-size:11px">⛰️ ${z.elevation}m</span></div>`)
          .addTo(map);
        if (onZoneClick) marker.on('click', () => onZoneClick(z));
        markersRef.current.push(marker);
      });
    }

    // En fullscreen, invalidar tamaño después del mount
    if (fullscreen) {
      setTimeout(() => map.invalidateSize(), 100);
    }

    return () => { 
      if (heatLayerRef.current) {
        leafletRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      map.remove(); 
      leafletRef.current = null; 
      markersRef.current = []; 
    };
  }, [mode]); // Agregar mode como dependencia

  const h = fullscreen ? '100%' : height;
  return <div ref={mapRef} style={{ height: h, width: '100%', borderRadius: fullscreen ? '0' : '12px', zIndex: 1 }} />;
}

// ==================== LEAFLET MAP (con botón expand) ====================
function LeafletMap({ zonas, onZoneClick, height = '400px', selectedZone = null, singleZone = null, title, mode = 'markers', onModeChange = null }) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div className="relative">
        <LeafletMapInner
          zonas={zonas} onZoneClick={onZoneClick} height={height}
          selectedZone={selectedZone} singleZone={singleZone} mode={mode} />
        
        {/* Selector de modo dentro del mapa (si se proporciona) */}
        {onModeChange && (
          <div className="absolute top-3 left-3 z-[1000] backdrop-blur-sm bg-[#30372a]/80 rounded-xl p-1">
            <Tabs
              options={[
                { id: 'markers', label: 'Zones' },
                { id: 'heatmap', label: 'Mapa de calor' }
              ]}
              selected={mode}
              onChange={onModeChange}
              size="sm"
              variant="compact"
            />
          </div>
        )}
        
        <button className="map-expand-btn" onClick={() => setFullscreen(true)}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Pantalla completa
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
  );
}

