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

// ==================== FAKE METEO HEATMAP GRID ====================
// Genera una cuadrícula de puntos sobre la Península con un score de oportunidad
// micológica basado en ruido sinusoidal multicapa (coherencia espacial).
// Sesgos geográficos: latitud alta → más húmedo, interiores montañosos → mejor.
function fakeMeteoIntensity(lat, lng) {
  // Capa base: ondas grandes (~200km) para patrones de frente meteorológico
  const macro = (
    Math.sin(lat * 2.3 + lng * 1.7 + 1.2) * 0.35 +
    Math.sin(lat * 1.8 - lng * 2.9 + 0.7) * 0.30
  );
  // Capa media: detalle regional (~80km)
  const meso = (
    Math.sin(lat * 5.1 + lng * 4.3 + 2.1) * 0.20 +
    Math.sin(lat * 6.7 - lng * 3.8 - 1.4) * 0.15
  );
  // Sesgo geográfico: norte y montaña interior puntúan más
  const latBias = (lat - 38) / 10 * 0.25;          // norte España ~+0.15
  const mountainBias =
    Math.exp(-((lat - 42.5) ** 2 + (lng + 1.5) ** 2) / 8)  * 0.2   // Pirineos
  + Math.exp(-((lat - 43.2) ** 2 + (lng + 5.8) ** 2) / 6)  * 0.18  // Cantábrico
  + Math.exp(-((lat - 40.3) ** 2 + (lng + 4.0) ** 2) / 7)  * 0.15  // Gredos/Guadarrama
  + Math.exp(-((lat - 41.9) ** 2 + (lng + 2.9) ** 2) / 5)  * 0.15  // Ibérica/Urbión
  + Math.exp(-((lat - 37.9) ** 2 + (lng + 2.9) ** 2) / 6)  * 0.12; // Cazorla

  const raw = macro + meso + latBias + mountainBias;
  // Normalizar aprox. al rango [0,1]
  return Math.max(0, Math.min(1, (raw + 0.6) / 1.2));
}

const HEAT_STEP = 0.12; // ~13km entre puntos

function generateMeteoHeatGrid() {
  const points = [];
  const LAT_MIN = 35.8, LAT_MAX = 44.2;
  const LNG_MIN = -9.5, LNG_MAX = 4.5;
  for (let lat = LAT_MIN; lat <= LAT_MAX; lat += HEAT_STEP) {
    for (let lng = LNG_MIN; lng <= LNG_MAX; lng += HEAT_STEP) {
      const intensity = fakeMeteoIntensity(lat, lng);
      if (intensity > 0.05) points.push([lat, lng, intensity]);
    }
  }
  return points;
}

// Radio en píxeles que mantiene solapamiento continuo a cualquier zoom
function heatRadiusForZoom(zoom) {
  const pixPerDegree = (256 * Math.pow(2, zoom)) / 360;
  const r = Math.ceil(pixPerDegree * HEAT_STEP * 0.65);
  return Math.max(8, Math.min(60, r));
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

    if (mode === 'heatmap') {
      // Mapa de calor independiente de zonas: cuadrícula meteorológica sobre la Península
      const heatData = generateMeteoHeatGrid();
      const initRadius = heatRadiusForZoom(zoom);

      const heatLayer = L.heatLayer(heatData, {
        radius: initRadius,
        blur: Math.ceil(initRadius * 0.75),
        maxZoom: 17,
        max: 0.7,
        minOpacity: 0.45,
        gradient: {
          0.0: '#ef4444',
          0.35: '#f97316',
          0.6: '#eab308',
          0.8: '#84cc16',
          1.0: '#22c55e'
        }
      }).addTo(map);
      heatLayerRef.current = heatLayer;

      // Adaptar radio al zoom para que los puntos siempre se solapen
      const onZoom = () => {
        const r = heatRadiusForZoom(map.getZoom());
        heatLayer.setOptions({ radius: r, blur: Math.ceil(r * 0.75) });
        heatLayer.redraw();
      };
      map.on('zoomend', onZoom);
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

