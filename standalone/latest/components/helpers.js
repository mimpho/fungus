const { useState, useEffect, useRef, useMemo, useCallback } = React;
const IC = {
  map: <svg className="w-5 h-5" fill="none" stroke="#f4ebe1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  pin: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  mushroom: <span>🍄</span>,
  book: <span>📖</span>,
  star: (filled) => <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  heart: (filled) => <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  bell: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  search: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  user: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  grid: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  chart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  close: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  chevron: (dir) => <svg className={`w-4 h-4 ${dir==='left'?'rotate-180':''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  filter: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  warning: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  cloud: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
  drop: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3.586l5.657 5.657a8 8 0 11-11.314 0L12 3.586z" /></svg>,
};

// ==================== MODAL COLORS ====================
// Color palette shared by all modals — change here to update all at once
const MODAL = {
  bg:      '#30372a',      // dark forest green — inner modal background
  overlay: '#232522d9',   // dark semi-transparent — backdrop overlay
};

// ==================== HELPERS ====================
function getEdibilityColor(com) {
  const m = {
    excelente:    { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Excelente',
                    solidBg: 'bg-emerald-600', solidText: 'text-white' },
    bueno:        { bg: 'bg-teal-500/15',    text: 'text-teal-400',    dot: 'bg-teal-400',    label: 'Comestible',
                    solidBg: 'bg-teal-600',    solidText: 'text-white' },
    comestible:   { bg: 'bg-teal-500/15',    text: 'text-teal-400',    dot: 'bg-teal-400',    label: 'Comestible',
                    solidBg: 'bg-teal-600',    solidText: 'text-white' },
    precaucion:   { bg: 'bg-amber-500/15',   text: 'text-amber-400',   dot: 'bg-amber-400',   label: 'Precaución',
                    solidBg: 'bg-amber-600',   solidText: 'text-white' },
    no_comestible:{ bg: 'bg-slate-500/15',   text: 'text-slate-400',   dot: 'bg-slate-400',   label: 'No comestible',
                    solidBg: 'bg-slate-600',   solidText: 'text-white' },
    toxico:       { bg: 'bg-orange-500/15',  text: 'text-orange-400',  dot: 'bg-orange-400',  label: 'Tóxica',
                    solidBg: 'bg-orange-600',  solidText: 'text-white' },
    mortal:       { bg: 'bg-red-600/15',     text: 'text-red-400',     dot: 'bg-red-500',     label: '⚠ MORTAL',
                    solidBg: 'bg-red-700',     solidText: 'text-white' },
  };
  return m[com] || m.no_comestible;
}

// EdibilityTag — componente reutilizable para mostrar la comestibilidad
// variant="glass"   → fondo semitransparente con texto de color  (listas, modales)
// variant="onImage" → fondo sólido con texto blanco              (sobre fotos)
// variant="pill"    → igual que glass pero compacto sin dot       (chips de lista)
// showDot           → muestra círculo indicador (solo en glass/pill)
function EdibilityTag({ edibility, variant = 'glass', showDot = false, className = '' }) {
  const cc = getEdibilityColor(edibility);
  if (variant === 'onImage') {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide shadow-md backdrop-blur-sm ${cc.solidBg} ${cc.solidText} bg-opacity-85 ${className}`}>
        {cc.label}
      </span>
    );
  }
  // glass / pill
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${cc.bg} ${cc.text} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cc.dot}`} />}
      {cc.label}
    </span>
  );
}

// ==================== SPECIES CARD ====================
// Componente de tarjeta de especie reutilizable.
// size="full"    → imagen alta (h-64), botón favorito, nombre científico + familia + nombres comunes
// size="compact" → imagen corta (h-28), sin favorito, nombre + primer nombre común
function SpeciesCard({ species, onOpen, isFav, onToggleFav, size = 'full', animDelay }) {
  const isCompact = size === 'compact';
  return (
    <div onClick={() => onOpen(species)}
      className="glass rounded-2xl transition-all hover-lift anim-up overflow-hidden cursor-pointer"
      style={animDelay !== undefined ? { animationDelay: `${animDelay}s` } : {}}>
      <div className={`relative ${isCompact ? 'h-28' : 'h-[16rem]'} overflow-hidden`}>
        <SpeciesImg
          localSrc={species.photo?.url}
          scientificName={species.scientificName}
          className={`w-full h-full ${isCompact ? 'opacity-70' : ''}`}
          objectFit="cover" />
        {!isCompact && onToggleFav && (
          <button
            onClick={ev => { ev.stopPropagation(); onToggleFav(species); }}
            className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${isFav ? 'text-red-400' : 'text-white/50 hover:text-red-400'}`}>
            {IC.heart(!!isFav)}
          </button>
        )}
        <div className="absolute bottom-2 left-2">
          <EdibilityTag edibility={species.edibility} variant="onImage" />
        </div>
      </div>
      {isCompact ? (
        <div className="p-3">
          <h4 className="font-display text-sm font-semibold text-[#f4ebe1] leading-snug truncate">{species.scientificName}</h4>
          <p className="text-[#d9cda1] text-[10px] mt-0.5 truncate">{species.commonNames[0]}</p>
        </div>
      ) : (
        <div className="p-4 pt-2">
          <h3 className="font-display text-xl font-semibold text-[#f4ebe1] mb-1">{species.scientificName}</h3>
          <p className="text-[#d9cda1] text-xs mb-2">{species.family}</p>
          <p className="text-[#f4ebe1]/70 text-xs truncate">{species.commonNames.join(' · ')}</p>
        </div>
      )}
    </div>
  );
}

function getScoreColor(s) {
  if (s >= 85) return { bar: 'bg-emerald-400', text: 'text-emerald-400', label: 'Excelente' };
  if (s >= 70) return { bar: 'bg-[#887b4b]', text: 'text-[#c4a06b]', label: 'Muy bueno' };
  if (s >= 55) return { bar: 'bg-amber-500', text: 'text-amber-400', label: 'Bueno' };
  return { bar: 'bg-red-500', text: 'text-red-400', label: 'Regular' };
}

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// ==================== SPECIES IMAGE: local → Wikipedia fallback ====================
// Props:
//   localSrc      → ruta local (assets/images/esp-XXX-main.jpg). Si existe, se usa directamente.
//   scientificName → nombre científico usado para buscar en Wikipedia si local falla.
//   className, style, objectFit, objectPosition → CSS habitual.
function SpeciesImg({ localSrc, scientificName, className, style, objectFit, objectPosition }) {
  // 'local'   → intentando imagen local
  // 'wiki'    → local falló, buscando en Wikipedia
  // 'done'    → imagen lista (src tendrá la URL)
  // 'failed'  → ambas fuentes fallaron
  const [phase, setPhase]   = useState('local');
  const [wikiSrc, setWikiSrc] = useState(null);

  // Cuando cambia la especie, reiniciar
  useEffect(() => {
    setPhase('local');
    setWikiSrc(null);
  }, [localSrc, scientificName]);

  // Fetch Wikipedia solo cuando phase === 'wiki'
  useEffect(() => {
    if (phase !== 'wiki') return;
    const name = encodeURIComponent(scientificName);
    fetch('https://en.wikipedia.org/w/api.php?action=query&titles=' + name + '&prop=pageimages&format=json&pithumbsize=600&origin=*')
      .then(r => r.json())
      .then(d => {
        const pages = d.query && d.query.pages;
        const page  = pages && Object.values(pages)[0];
        if (page && page.thumbnail && page.thumbnail.source) {
          setWikiSrc(page.thumbnail.source);
          setPhase('done');
        } else {
          setPhase('failed');
        }
      })
      .catch(() => setPhase('failed'));
  }, [phase, scientificName]);

  const imgStyle = { ...style, objectFit: objectFit || 'cover', ...(objectPosition ? { objectPosition } : {}) };
  const placeholder = (loading) => (
    <div className={className} style={{ ...style, background: 'rgba(74,124,89,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {loading
        ? <span style={{ fontSize: '0.65rem', color: 'rgba(244,235,225,0.3)' }}>cargando…</span>
        : <span style={{ fontSize: '2rem', opacity: 0.15 }}>
            <img src={`/assets/images/placeholder.png`} alt="mushroom" height="150" width="150" />
          </span>}
    </div>
  );

  if (phase === 'failed') return placeholder(false);

  // Intentar imagen local; si falla, pasar a fase Wikipedia
  if (phase === 'local' || phase === 'wiki') {
    if (phase === 'local' && localSrc) {
      return (
        <img src={localSrc} alt={scientificName} className={className} style={imgStyle}
          onError={() => setPhase('wiki')} />
      );
    }
    // Esperando respuesta de Wikipedia
    return placeholder(true);
  }

  // phase === 'done' → tenemos URL de Wikipedia
  return <img src={wikiSrc} alt={scientificName} className={className} style={imgStyle} />;
}

// ==================== CONFUSIONES POR FAMILIA ====================
// Mapa de confusiones típicas por familia. Cada entrada: { name, risk, icon, borderColor, nameColor, diff }
// Incluye tanto especies tóxicas/mortales como comestibles que comparten morfología.
// ConfusionesBlock filtra automáticamente la especie actual para evitar auto-referencias.
const CONFUSIONES_POR_FAMILIA = {
  Boletaceae: [
    { name: 'Boletus edulis', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400',
      diff: 'El cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico. Confundible con boletos de poros rojos o que azulean fuertemente.' },
    { name: 'Boletus reticulatus', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400',
      diff: 'Muy similar a B. edulis. Sombrero ocre-amarillento, pie reticulado casi hasta la base. Estival, típico de robledales y bosques caducifolios. Igual de excelente que el cep.' },
    { name: 'Rubroboletus satanas', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Poros rojo intenso, pie reticulado con tonos rojos, azulea fuertemente al corte. Olor a carroña en maduros. Bosques calcáreos. Tóxico incluso cocinado.' },
    { name: 'Suillellus luridus', risk: 'tóxico en crudo', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Poros anaranjados-rojizos, retículo rojo en el pie, azulea muy rápido al corte. Comestible solo con cocción prolongada; tóxico en crudo.' },
    { name: 'Neoboletus erythropus', risk: 'tóxico en crudo', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Poros rojo sangre desde joven, azulea instantáneamente al corte. Sin retículo en el pie. Tóxico crudo; comestible con cocción prolongada.' },
  ],
  Amanitaceae: [
    { name: 'Amanita caesarea', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400',
      diff: 'Sombrero rojo-anaranjado brillante, láminas y pie amarillos, volva blanca sacciforme. Excelente comestible. En estado de huevo puede confundirse con A. phalloides joven; distinguir siempre por el color amarillo de las láminas.' },
    { name: 'Amanita rubescens', risk: 'comestible', icon: '✅', borderColor: 'border-emerald-500/20', nameColor: 'text-emerald-300',
      diff: 'La carne enrojece al corte o en zonas comidas por insectos (carácter diagnóstico). Comestible solo cocinada; cruda es tóxica. Confundible con A. pantherina que no enrojece.' },
    { name: 'Amanita phalloides', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Sombrero verdoso-amarillento, volva blanca sacciforme, anillo blanco persistente. Responsable del 90% de muertes por intoxicación micológica. NUNCA consumir Amanitas sin certeza absoluta.' },
    { name: 'Amanita verna', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Completamente blanca, volva sacciforme, anillo membranoso. Confundible con champiñones blancos. Contiene las mismas amatoxinas que A. phalloides; igualmente mortal.' },
    { name: 'Amanita virosa', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Blanca, pie escamoso-floculoso, sombrero cónico-umbonado. Propia de abetales y hayedos de montaña. Letal; no confundir con A. ovoidea ni A. caesarea joven.' },
    { name: 'Amanita muscaria', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Sombrero rojo con verrugas blancas, anillo y volva fragmentada blancos. Contiene muscimol. No confundir con A. caesarea (láminas amarillas vs. blancas en muscaria).' },
    { name: 'Amanita pantherina', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Sombrero marrón con verrugas blancas, anillo frágil, volva con reborde. Más tóxica que A. muscaria. Distinguible de A. rubescens porque la carne no enrojece.' },
  ],
  Cantharellaceae: [
    { name: 'Cantharellus cibarius', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400',
      diff: 'Rebozuelo clásico: pliegues (no láminas) amarillo yema decurrentes, pie macizo, olor afrutado. Puede confundirse con el falso rebozuelo o con Omphalotus olearius.' },
    { name: 'Cantharellus pallens', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400',
      diff: 'Muy similar a C. cibarius pero de tonos más pálidos (amarillo-crema a blancuzco). Mismo valor culinario. Frecuente en hayedos y robledales del norte.' },
    { name: 'Omphalotus olearius', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Láminas verdaderas (no pliegues), anaranjado intenso, crece en macollo en base de árboles. Puede ser bioluminiscente. Causa intoxicación gastrointestinal grave.' },
    { name: 'Hygrophoropsis aurantiaca', risk: 'sospechoso', icon: 'ℹ️', borderColor: 'border-blue-500/30', nameColor: 'text-blue-400',
      diff: 'Falso rebozuelo: láminas verdaderas muy densas y ramificadas, color anaranjado más intenso, carne blanda. Comestibilidad dudosa; mejor evitar.' },
  ],
  Russulaceae: [
    { name: 'Lactarius deliciosus', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400',
      diff: 'Látex anaranjado no picante, sombrero con zonas concéntricas anaranjadas. Excelente comestible. Confundible con L. torminosus (látex blanco muy picante) u otras especies de látex amargo.' },
    { name: 'Russula cyanoxantha', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400',
      diff: 'Sombrero violáceo-verde-grisáceo variable, láminas blandas y flexibles (untuosas al tacto), sabor suave. Una de las russulas más fáciles de identificar y de las mejores.' },
    { name: 'Russula virescens', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400',
      diff: 'Sombrero verde-grisáceo con cutícula agrietada en escuámulas, sabor suave. Excelente. Clave: cutícula agrietada y láminas blancas la diferencian de russulas verdes tóxicas.' },
    { name: 'Russula emetica', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Sombrero rojo brillante, carne muy picante al paladar. Las Russulas comestibles tienen sabor suave. Probar siempre tocando la lengua con un fragmento de carne cruda.' },
    { name: 'Lactarius torminosus', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Látex blanco y muy picante, margen fuertemente enrollado con pelillos. Causa intoxicación gastrointestinal severa. Diferenciable de L. deliciosus por el color del látex (blanco vs. anaranjado).' },
  ],
  Morchellaceae: [
    { name: 'Morchella esculenta', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400',
      diff: 'Colmenilla clásica: sombrero claramente alveolado, interior completamente hueco, pie blanco. Excelente comestible pero siempre cocinar. Las crestas más pálidas que las fosas la distinguen.' },
    { name: 'Gyromitra esculenta', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Sombrero cerebriforme (no alveolado), marrón rojizo, contiene giromitrinas hepatotóxicas. Mortal incluso tras cocción. La confusión con Morchella es frecuente entre principiantes.' },
    { name: 'Helvella lacunosa', risk: 'precaución', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Sombrero lobulado gris-negro (no alveolado). Contiene compuestos similares a Gyromitra. Siempre cocinar; cruda puede provocar hemólisis.' },
    { name: 'Verpa bohemica', risk: 'precaución', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Sombrero acampanado unido al pie solo en el ápice (en Morchella fusionado en toda su longitud). Tóxica en grandes cantidades o cocinada inadecuadamente.' },
  ],
  Cortinariaceae: [
    { name: 'Cortinarius caperatus', risk: 'comestible', icon: '✅', borderColor: 'border-emerald-500/20', nameColor: 'text-emerald-300',
      diff: 'La única Cortinarius comestible habitual. Sombrero ocráceo-crema arrugado, láminas violáceas en joven, anillo membranoso persistente. Solo recoger con identificación segura.' },
    { name: 'Cortinarius violaceus', risk: 'comestible', icon: '✅', borderColor: 'border-emerald-500/20', nameColor: 'text-emerald-300',
      diff: 'Todo violáceo oscuro, superficie del sombrero fibrillosa, esporada herrumbrosa. Comestible de calidad mediocre. Confundible con Cortinarius tóxicos; verificar siempre la esporada.' },
    { name: 'Cortinarius orellanus', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Sombrero ocre-anaranjado, láminas herrumbrosas, cortina aracnoide en jóvenes. Contiene orellanina, nefrotóxico con síntomas retardados 2–3 semanas. Nunca consumir Cortinarius sin certeza absoluta.' },
    { name: 'Cortinarius rubellus', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Sombrero cónico-umbonado canela-rojizo, cortina aracnoide. Contiene orellanina. Propia de abetales y hayedos húmedos.' },
  ],
  Tricholomataceae: [
    { name: 'Tricholoma portentosum', risk: 'comestible', icon: '✅', borderColor: 'border-emerald-500/20', nameColor: 'text-emerald-300',
      diff: 'Sombrero gris plomizo con umbo oscuro, láminas blancas-amarillentas, olor harinoso suave. Buen comestible otoñal e invernal. Confundible con Tricholoma tóxicas grises.' },
    { name: 'Tricholoma equestre', risk: 'precaución', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Sombrero amarillo-verdoso, láminas amarillas, olor harinoso. Históricamente consumido; asociado a rabdomiólisis en consumo repetido. Actualmente desaconsejado.' },
    { name: 'Clitocybe nebularis', risk: 'precaución', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Sombrero gris-blanquecino con bloom harinoso, láminas decurrentes, olor fuerte harinoso. Tóxica para muchas personas por intolerancia individual.' },
    { name: 'Clitocybe dealbata', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Blanca-grisácea, pequeña, en praderas y bordes de bosque. Contiene muscarina en altas concentraciones. Causa el síndrome muscarínico.' },
  ],
  Pleurotaceae: [
    { name: 'Pleurotus ostreatus', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400',
      diff: 'Gírgola clásica: sombrero en forma de ostra gris-marrón, láminas blancas decurrentes, en madera caducifolia. Excelente comestible y cultivado. La más importante del género.' },
    { name: 'Omphalotus olearius', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Anaranjado vivo, láminas verdaderas (no decurrentes suaves), crece en base de árboles o raíces. La confusión con Pleurotus es rara pero documentada en ejemplares decolorados.' },
    { name: 'Crepidotus sp.', risk: 'no comestible', icon: 'ℹ️', borderColor: 'border-blue-500/30', nameColor: 'text-blue-400',
      diff: 'Pequeño, sin pie, esporada marrón (vs. blanca-liláceas en Pleurotus). Sin valor culinario pero inofensivo.' },
  ],
  Strophariaceae: [
    { name: 'Kuehneromyces mutabilis', risk: 'comestible', icon: '✅', borderColor: 'border-emerald-500/20', nameColor: 'text-emerald-300',
      diff: 'Sombrero bicolor (centro ocre, margen más oscuro al mojarse), escamas en el pie bajo el anillo. Comestible apreciado. La confusión crítica es con Galerina marginata, que crece en el mismo sustrato.' },
    { name: 'Armillaria mellea', risk: 'comestible', icon: '✅', borderColor: 'border-emerald-500/20', nameColor: 'text-emerald-300',
      diff: 'Sombrero ocre-mieloso con escámulas oscuras, anillo persistente, en macollo en madera. Comestible cocinado. Confundible con Galerina marginata (mortal) o Hypholoma fasciculare (tóxico).' },
    { name: 'Galerina marginata', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Marrón-ocrácea, crece en madera. Contiene amatoxinas idénticas a Amanita phalloides. Confundible con Kuehneromyces o pequeñas Armillaria. Nunca recoger setas pequeñas en madera sin certeza.' },
    { name: 'Hypholoma fasciculare', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Amarillo-verdoso intenso en láminas y sombrero, sabor muy amargo, en densas matas en madera. Causa intoxicaciones gastrointestinales graves.' },
  ],
  Marasmiaceae: [
    { name: 'Marasmius oreades', risk: 'comestible', icon: '✅', borderColor: 'border-emerald-500/20', nameColor: 'text-emerald-300',
      diff: 'Senderuela: pie cartilaginoso flexible que no se rompe, sin olor a almendras amargas. Comestible muy apreciada. La confusión crítica es con Clitocybe dealbata (tóxica) en los mismos prados.' },
    { name: 'Clitocybe dealbata', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Blanca-rosada, en los mismos prados que la senderuela. Contiene muscarina. Láminas decurrentes y pie no cartilaginoso la diferencian de Marasmius. Causa el síndrome muscarínico.' },
  ],
  Hymenogastraceae: [
    { name: 'Psilocybe semilanceata', risk: 'psicoactivo', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Pequeña, con umbo pronunciado, en prados con estiércol. Contiene psilocibina. Confundible con Galerina marginata (mortal) en hábitats similares.' },
    { name: 'Galerina marginata', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Morfológicamente muy similar, crece en madera. Contiene amatoxinas. La confusión con Psilocybe o Conocybe es una de las principales causas de intoxicación mortal.' },
  ],
  Agaricaceae: [
    { name: 'Agaricus campestris', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400',
      diff: 'Champiñón silvestre: láminas rosadas en joven→chocolate, olor agradable, amarilleo leve y rosado al corte. Distinguible de A. xanthodermus por el olor (no a fenol) y el amarilleo moderado.' },
    { name: 'Macrolepiota procera', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400',
      diff: 'Parasol: sombrero grande con escuámulas pardas, pie largo con anillo doble deslizante, sin volva. Excelente. No confundir con Lepiota cristata (tóxica, más pequeña) ni con Amanita en huevo.' },
    { name: 'Agaricus xanthodermus', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Amarillea vivamente en la base del pie al corte, olor desagradable a fenol. El amarilleo intenso en la base es el carácter diferencial clave respecto a champiñones comestibles.' },
    { name: 'Amanita phalloides', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Joven en "huevo": puede confundirse con champiñones jóvenes. Cortar siempre por la mitad: la Amanita muestra la silueta del sombrero envuelta en volva.' },
    { name: 'Lepiota cristata', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Lepiotácea pequeña (4–8 cm), escuámulas concéntricas rojo-pardas, olor desagradable a caucho. Tóxica; confundible con champiñones jóvenes o pequeñas Macrolepiota.' },
  ],
  Physalacriaceae: [
    { name: 'Armillaria mellea', risk: 'comestible', icon: '✅', borderColor: 'border-emerald-500/20', nameColor: 'text-emerald-300',
      diff: 'Seta de miel: sombrero ocre con escámulas oscuras, anillo membranoso, esporada blanca. Comestible cocinada (cruda tóxica). Clave: anillo bien definido y esporada blanca.' },
    { name: 'Galerina marginata', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Crece también en madera en grupos. Armillaria tiene anillo bien definido y esporada blanca; Galerina tiene esporada marrón-oxidada y anillo fino. Confusión potencialmente mortal.' },
    { name: 'Hypholoma fasciculare', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Amarillo-verdoso en láminas y sombrero, sabor muy amargo, en la misma madera. Sin anillo. Tóxico aunque raramente mortal.' },
  ],
};

// Confusión genérica para familias sin entrada específica
const CONFUSION_GENERICA = [
  { name: 'Especies del mismo género', risk: 'variable', icon: 'ℹ️', borderColor: 'border-blue-500/30', nameColor: 'text-blue-400',
    diff: 'Dentro del mismo género pueden existir especies tóxicas morfológicamente muy similares. Verificar siempre esporada, olor, reacciones químicas y hábitat antes de consumir.' },
];

function ConfusionesBlock({ species, onViewSpecies }) {
  const todas = CONFUSIONES_POR_FAMILIA[species.family] || CONFUSION_GENERICA;
  // Filtrar auto-referencias: la especie no aparece confundida consigo misma
  const confusiones = todas.filter(c => c.name !== species.scientificName);
  return (
    <div className="space-y-3">
      {confusiones.map((c, i) => {
        // Buscar en la BD por nombre científico exacto → enlace interno
        const inApp = mockSpecies.find(s => s.scientificName === c.name);
        return (
          <div key={i} className={`bg-white/[0.03] rounded-xl p-4 border ${c.borderColor}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{c.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {inApp && onViewSpecies ? (
                    <button onClick={() => onViewSpecies(inApp)}
                      className={`font-medium text-sm ${c.nameColor} underline underline-offset-2 decoration-dotted hover:decoration-solid transition-all text-left`}>
                      {c.name}
                    </button>
                  ) : (
                    // Sin ficha interna: texto plano sin enlace externo
                    <span className={`font-medium text-sm ${c.nameColor}`}>{c.name}</span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[#f4ebe1]/50">{c.risk}</span>
                </div>
                <p className="text-[#f4ebe1]/60 text-xs leading-relaxed">{c.diff}</p>
              </div>
            </div>
          </div>
        );
      })}
      <p className="text-[#f4ebe1]/30 text-[10px] text-center pt-1">
        ⚠️ Datos orientativos. Consulta siempre con un micólogo experto antes de consumir cualquier seta silvestre.
      </p>
    </div>
  );
}

function fakeConditions() {
  const score = Math.floor(60 + Math.random() * 35);
  return {
    temperature: parseFloat((10 + Math.random() * 8).toFixed(1)),
    soilTemp: parseFloat((9 + Math.random() * 7).toFixed(1)),
    rainfall14d: parseFloat((25 + Math.random() * 60).toFixed(1)),
    humidity: parseFloat((65 + Math.random() * 25).toFixed(0)),
    wind: parseFloat((5 + Math.random() * 20).toFixed(0)),
    dryDays: Math.floor(Math.random() * 6),
    overallScore: score,
  };
}
