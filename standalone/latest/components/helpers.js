const { useState, useEffect, useRef, useMemo, useCallback } = React;
const IC = {
  map: <svg className="w-5 h-5" fill="none" stroke="#f4ebe1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  pin: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  mushroom: <span>🍄</span>,
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
//   className, style, objectFit → CSS habitual.
function SpeciesImg({ localSrc, scientificName, className, style, objectFit }) {
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

  const imgStyle = { ...style, objectFit: objectFit || 'cover' };
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
const CONFUSIONES_POR_FAMILIA = {
  Boletaceae: [
    { name: 'Boletus satanas', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Poros rojos o rosados en el himenio, pie reticulado rojo intenso, azulea fuertemente al corte. Olor desagradable. Crece en bosques calcáreos.' },
    { name: 'Boletus luridus', risk: 'tóxico en crudo', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Pie con retículo rojo, poros anaranjados-rojizos, azulea muy rápido al corte. Tóxico si se consume crudo o poco cocinado.' },
  ],
  Amanitaceae: [
    { name: 'Amanita phalloides', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Sombrero verdoso a amarillento, volva blanca sacciforme en la base, anillo blanco persistente. Responsable del 90% de muertes por intoxicación micológica. NUNCA consumir Amanitas sin certeza absoluta.' },
    { name: 'Amanita muscaria', risk: 'tóxico', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Sombrero rojo brillante con verrugas blancas, anillo persistente blanco. Contiene muscarina e ibotenic acid. Muy tóxica aunque rara vez mortal.' },
    { name: 'Amanita verna', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Completamente blanca, volva sacciforme, anillo membranoso. Confundible con champiñones blancos. Tan mortal como A. phalloides.' },
  ],
  Cantharellaceae: [
    { name: 'Hygrophoropsis aurantiaca', risk: 'comestible mediocre', icon: 'ℹ️', borderColor: 'border-blue-500/30', nameColor: 'text-blue-400',
      diff: 'Falso rebozuelo: tiene láminas verdaderas y ramificadas (vs. pliegues/venas en Cantharellus), color más anaranjado intenso. Comestible pero de calidad inferior.' },
    { name: 'Omphalotus olearius', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Crece en madera o raíces de olivos y robles, láminas verdaderas amarillo-anaranjadas que pueden ser bioluminiscentes de noche. Provoca intoxicación gastrointestinal grave.' },
  ],
  Russulaceae: [
    { name: 'Russula emetica', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Sombrero rojo brillante, carne muy picante al paladar. Las Russulas comestibles tienen sabor suave o algo dulce. Siempre probar la carne en crudo tocándola con la lengua.' },
    { name: 'Lactarius torminosus', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Látex blanco picante, margen enrollado con pelillos. Causa intoxicación gastrointestinal severa. Distinguible de los Lactarius comestibles por su sabor muy acre.' },
  ],
  Morchellaceae: [
    { name: 'Gyromitra esculenta', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Sombrero cerebriforme (no alveolado), color marrón rojizo, contiene giromitrinas (hepatotóxicas). Mortal incluso tras cocción. Las Morchella tienen sombrero claramente alveolado y pie hueco.' },
    { name: 'Verpa bohemica', risk: 'precaución', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Sombrero acampanado unido al pie solo en el ápice (en Morchella está fusionado en toda su longitud). Tóxica en grandes cantidades o cocinada inadecuadamente.' },
  ],
  Cortinariaceae: [
    { name: 'Cortinarius orellanus', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Sombrero ocre-anaranjado, láminas herrumbrosas, cortina aracnoide en jóvenes. Contiene orellanina, un nefrotóxico con síntomas retardados 2-3 semanas. Nunca confundir Cortinarius con chanterelas u otras setas.' },
  ],
  Tricholomataceae: [
    { name: 'Clitocybe nebularis', risk: 'precaución', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Sombrero gris-blanquecino, láminas decurrentes, olor fuerte harinoso. Tóxica para muchas personas (intolerancia individual). Siempre bien cocinada y en cantidades moderadas.' },
    { name: 'Clitocybe dealbata', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Blanca-grisácea, pequeña, en praderas y bordes de bosque. Contiene muscarina en altas concentraciones. Puede confundirse con pequeñas Marasmius o Melanoleuca.' },
  ],
  Pleurotaceae: [
    { name: 'Crepidotus sp.', risk: 'no comestible', icon: 'ℹ️', borderColor: 'border-blue-500/30', nameColor: 'text-blue-400',
      diff: 'Pequeño, sin pie o con pie rudimentario, esporada marrón. A diferencia de Pleurotus, las especies de Crepidotus son insignificantes y de sabor desagradable. Inofensivas pero sin valor culinario.' },
  ],
  Strophariaceae: [
    { name: 'Galerina marginata', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Pequeña, marrón-ocrácea, crece en madera. Contiene amatoxinas igual que Amanita phalloides. Confundible con Pholiota o pequeñas Stropharia. Nunca recoger setas pequeñas en madera sin certeza.' },
  ],
  Marasmiaceae: [
    { name: 'Marasmius oreades', risk: 'confusión con tóxicas', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Puede confundirse con Clitocybe rivulosa (tóxica, blanca-rosada) que crece en los mismos prados. La senderuela tiene pie cartilaginoso flexible, no huele a almendras amargas.' },
  ],
  Hymenogastraceae: [
    { name: 'Galerina marginata', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Muy similar morfológicamente, crece en madera. Contiene amatoxinas. Las Psilocybe comestibles (trufas mágicas) y medicinales no deben confundirse con esta especie de campo. Revisión microscópica necesaria.' },
  ],
  Agaricaceae: [
    { name: 'Agaricus xanthodermus', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400',
      diff: 'Amarillea vivamente en la base del pie al corte (vs. amarilleo leve o rosado en comestibles), olor desagradable a fenol o tinta. Causa intoxicaciones gastrointestinales.' },
    { name: 'Amanita phalloides (joven)', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'El basidioma joven de A. phalloides en estado de "huevo" puede confundirse con champiñones jóvenes. Cortar siempre por la mitad: la Amanita muestra la silueta del futuro sombrero envuelta en volva.' },
  ],
  Physalacriaceae: [
    { name: 'Galerina marginata', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400',
      diff: 'Crece también en madera en grupos, sombrero marrón. Armillaria tiene anillo bien definido y esporada blanca; Galerina tiene esporada marrón-oxidada y anillo membranoso. Confusión potencialmente mortal.' },
  ],
};

// Confusión genérica para familias sin entrada específica
const CONFUSION_GENERICA = [
  { name: 'Especies del mismo género', risk: 'variable', icon: 'ℹ️', borderColor: 'border-blue-500/30', nameColor: 'text-blue-400',
    diff: 'Dentro del mismo género pueden existir especies tóxicas morfológicamente muy similares. Verificar siempre esporada, olor, reacciones químicas y hábitat antes de consumir.' },
];

function ConfusionesBlock({ species, onViewSpecies }) {
  const confusiones = CONFUSIONES_POR_FAMILIA[species.family] || CONFUSION_GENERICA;
  return (
    <div className="space-y-3">
      {confusiones.map((c, i) => {
        const inApp = mockSpecies.find(s => s.scientificName === c.name);
        const iNatUrl = `https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(c.name)}&rank=species`;
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
                    <a href={iNatUrl} target="_blank" rel="noopener noreferrer"
                      className={`font-medium text-sm ${c.nameColor} underline underline-offset-2 decoration-dotted hover:decoration-solid transition-all inline-flex items-center gap-1`}>
                      {c.name}
                      <svg className="w-2.5 h-2.5 opacity-60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </a>
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
