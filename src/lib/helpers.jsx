// =====================================================
// helpers.jsx — Iconos, utilidades y micro-componentes compartidos
// Importar desde cualquier página o componente:
//   import { IC, getEdibilityColor, EdibilityTag, ... } from '@/lib/helpers'
// =====================================================
import { useState, useEffect } from 'react';
import { MODAL, COLORS } from './constants';

export { MODAL, COLORS };

// =====================================================
// IC — Iconos SVG inline (sin dependencias externas)
// =====================================================
export const IC = {
  map: (
    <svg className="w-5 h-5" fill="none" stroke="#f4ebe1" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  pin: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  mushroom: <span>🍄</span>,
  book:     <span>📖</span>,
  star: (filled) => (
    <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  heart: (filled) => (
    <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  grid: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  chevron: (dir) => (
    <svg className={`w-4 h-4 ${dir === 'left' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  filter: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  cloud: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  drop: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3.586l5.657 5.657a8 8 0 11-11.314 0L12 3.586z" />
    </svg>
  ),
};

// =====================================================
// getEdibilityColor — badge colors para nivel de comestibilidad
// =====================================================
export function getEdibilityColor(com) {
  const m = {
    excelente:     { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Excelente',
                     solidBg: 'bg-emerald-600', solidText: 'text-white' },
    bueno:         { bg: 'bg-teal-500/15',    text: 'text-teal-400',    dot: 'bg-teal-400',    label: 'Comestible',
                     solidBg: 'bg-teal-600',    solidText: 'text-white' },
    comestible:    { bg: 'bg-teal-500/15',    text: 'text-teal-400',    dot: 'bg-teal-400',    label: 'Comestible',
                     solidBg: 'bg-teal-600',    solidText: 'text-white' },
    precaucion:    { bg: 'bg-amber-500/15',   text: 'text-amber-400',   dot: 'bg-amber-400',   label: 'Precaución',
                     solidBg: 'bg-amber-600',   solidText: 'text-white' },
    no_comestible: { bg: 'bg-slate-500/15',   text: 'text-slate-400',   dot: 'bg-slate-400',   label: 'No comestible',
                     solidBg: 'bg-slate-600',   solidText: 'text-white' },
    toxico:        { bg: 'bg-orange-500/15',  text: 'text-orange-400',  dot: 'bg-orange-400',  label: 'Tóxica',
                     solidBg: 'bg-orange-600',  solidText: 'text-white' },
    mortal:        { bg: 'bg-red-600/15',     text: 'text-red-400',     dot: 'bg-red-500',     label: '⚠ MORTAL',
                     solidBg: 'bg-red-700',     solidText: 'text-white' },
  };
  return m[com] || m.no_comestible;
}

// =====================================================
// getScoreColor — colores del termómetro de score
// =====================================================
export function getScoreColor(s) {
  if (s >= 85) return { bar: 'bg-emerald-400', text: 'text-emerald-400', label: 'Excelente' };
  if (s >= 70) return { bar: 'bg-[#887b4b]',   text: 'text-[#c4a06b]',   label: 'Muy bueno' };
  if (s >= 55) return { bar: 'bg-amber-500',   text: 'text-amber-400',   label: 'Bueno' };
  return             { bar: 'bg-red-500',       text: 'text-red-400',     label: 'Regular' };
}

// =====================================================
// fakeConditions — genera condiciones aleatorias mock
// Usar con useMemo(() => fakeConditions(), [zone.id]) para evitar flicker
// =====================================================
export function fakeConditions() {
  const score = Math.floor(60 + Math.random() * 35);
  return {
    temperature:  parseFloat((10 + Math.random() * 8).toFixed(1)),
    soilTemp:     parseFloat((9  + Math.random() * 7).toFixed(1)),
    rainfall14d:  parseFloat((25 + Math.random() * 60).toFixed(1)),
    humidity:     parseFloat((65 + Math.random() * 25).toFixed(0)),
    wind:         parseFloat((5  + Math.random() * 20).toFixed(0)),
    dryDays:      Math.floor(Math.random() * 6),
    overallScore: score,
  };
}

// =====================================================
// EdibilityTag — badge de comestibilidad reutilizable
// variant="glass"   → fondo semitransparente (listas)
// variant="onImage" → fondo sólido (sobre fotos)
// =====================================================
export function EdibilityTag({ edibility, variant = 'glass', showDot = false, className = '' }) {
  const cc = getEdibilityColor(edibility);
  if (variant === 'onImage') {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide shadow-md backdrop-blur-sm ${cc.solidBg} ${cc.solidText} bg-opacity-85 ${className}`}>
        {cc.label}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${cc.bg} ${cc.text} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cc.dot}`} />}
      {cc.label}
    </span>
  );
}

// =====================================================
// SpeciesImg — imagen de especie con fallback a Wikipedia
// =====================================================
export function SpeciesImg({ localSrc, scientificName, className, style, objectFit, objectPosition }) {
  const [phase, setPhase]     = useState('local');
  const [wikiSrc, setWikiSrc] = useState(null);

  useEffect(() => {
    setPhase('local');
    setWikiSrc(null);
  }, [localSrc, scientificName]);

  useEffect(() => {
    if (phase !== 'wiki') return;
    const name = encodeURIComponent(scientificName);
    fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${name}&prop=pageimages&format=json&pithumbsize=600&origin=*`)
      .then(r => r.json())
      .then(d => {
        const page = d.query && Object.values(d.query.pages)[0];
        if (page?.thumbnail?.source) { setWikiSrc(page.thumbnail.source); setPhase('done'); }
        else setPhase('failed');
      })
      .catch(() => setPhase('failed'));
  }, [phase, scientificName]);

  const imgStyle = { ...style, objectFit: objectFit || 'cover', ...(objectPosition ? { objectPosition } : {}) };

  const Placeholder = ({ loading }) => (
    <div className={className} style={{ ...style, background: 'rgba(74,124,89,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {loading
        ? <span style={{ fontSize: '0.65rem', color: 'rgba(244,235,225,0.3)' }}>cargando…</span>
        : <img src="/assets/images/placeholder.png" alt="mushroom" height="150" width="150" style={{ opacity: 0.15 }} />
      }
    </div>
  );

  if (phase === 'failed') return <Placeholder loading={false} />;
  if (phase === 'local' && localSrc) {
    return <img src={localSrc} alt={scientificName} className={className} style={imgStyle} onError={() => setPhase('wiki')} />;
  }
  if (phase === 'wiki' || (phase === 'local' && !localSrc)) return <Placeholder loading={true} />;
  return <img src={wikiSrc} alt={scientificName} className={className} style={imgStyle} />;
}

// =====================================================
// SpeciesCard — tarjeta de especie reutilizable
// size="full"    → imagen alta (h-64), botón favorito
// size="compact" → imagen corta (h-28), sin favorito
// =====================================================
export function SpeciesCard({ species, onOpen, isFav, onToggleFav, size = 'full', animDelay }) {
  const isCompact = size === 'compact';
  return (
    <div
      onClick={() => onOpen(species)}
      className="glass rounded-2xl transition-all hover-lift anim-up overflow-hidden cursor-pointer"
      style={animDelay !== undefined ? { animationDelay: `${animDelay}s` } : {}}
    >
      <div className={`relative ${isCompact ? 'h-28' : 'h-[16rem]'} overflow-hidden`}>
        <SpeciesImg
          localSrc={species.photo?.url}
          scientificName={species.scientificName}
          className={`w-full h-full ${isCompact ? 'opacity-70' : ''}`}
          objectFit="cover"
        />
        {!isCompact && onToggleFav && (
          <button
            onClick={ev => { ev.stopPropagation(); onToggleFav(species); }}
            className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${isFav ? 'text-red-400' : 'text-white/50 hover:text-red-400'}`}
          >
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

// =====================================================
// CONFUSIONES_POR_FAMILIA — datos de especies confundibles
// =====================================================
export const CONFUSIONES_POR_FAMILIA = {
  Boletaceae: [
    { name: 'Boletus edulis', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400', diff: 'El cep noble: poros blancos→amarillo-verdosos, no azulea al corte, olor agradable fúngico.' },
    { name: 'Rubroboletus satanas', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400', diff: 'Poros rojo intenso, pie reticulado con tonos rojos, azulea fuertemente al corte. Tóxico incluso cocinado.' },
    { name: 'Suillellus luridus', risk: 'tóxico en crudo', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400', diff: 'Poros anaranjados-rojizos, azulea muy rápido. Comestible solo con cocción prolongada.' },
    { name: 'Neoboletus erythropus', risk: 'tóxico en crudo', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400', diff: 'Poros rojo sangre desde joven, azulea instantáneamente. Tóxico crudo.' },
  ],
  Amanitaceae: [
    { name: 'Amanita caesarea', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400', diff: 'Láminas y pie amarillos, volva blanca sacciforme. Excelente comestible.' },
    { name: 'Amanita phalloides', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400', diff: 'Sombrero verdoso, volva blanca sacciforme. Responsable del 90% de muertes micológicas. NUNCA consumir.' },
    { name: 'Amanita verna', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400', diff: 'Completamente blanca, volva sacciforme. Contiene las mismas amatoxinas. Igualmente mortal.' },
    { name: 'Amanita muscaria', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400', diff: 'Sombrero rojo con verrugas blancas. Contiene muscimol. No confundir con A. caesarea.' },
    { name: 'Amanita pantherina', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400', diff: 'Sombrero marrón con verrugas blancas, más tóxica que A. muscaria.' },
  ],
  Cantharellaceae: [
    { name: 'Cantharellus cibarius', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400', diff: 'Pliegues (no láminas) amarillo yema, olor afrutado. Puede confundirse con el falso rebozuelo.' },
    { name: 'Omphalotus olearius', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400', diff: 'Láminas verdaderas, anaranjado intenso, crece en base de árboles. Puede ser bioluminiscente.' },
    { name: 'Hygrophoropsis aurantiaca', risk: 'sospechoso', icon: 'ℹ️', borderColor: 'border-blue-500/30', nameColor: 'text-blue-400', diff: 'Falso rebozuelo: láminas densas y ramificadas, color más intenso. Comestibilidad dudosa.' },
  ],
  Russulaceae: [
    { name: 'Lactarius deliciosus', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400', diff: 'Látex anaranjado no picante. Confundible con L. torminosus (látex blanco muy picante).' },
    { name: 'Russula emetica', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400', diff: 'Sombrero rojo brillante, carne muy picante. Las Russulas comestibles tienen sabor suave.' },
    { name: 'Lactarius torminosus', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400', diff: 'Látex blanco muy picante, margen peloso enrollado. Causa intoxicación gastrointestinal severa.' },
  ],
  Morchellaceae: [
    { name: 'Morchella esculenta', risk: 'excelente', icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-emerald-400', diff: 'Sombrero alveolado, interior hueco, pie blanco. Siempre cocinar.' },
    { name: 'Gyromitra esculenta', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400', diff: 'Sombrero cerebriforme (no alveolado). Contiene giromitrinas hepatotóxicas. Mortal incluso cocinado.' },
    { name: 'Helvella lacunosa', risk: 'precaución', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400', diff: 'Sombrero lobulado gris-negro. Siempre cocinar; cruda puede provocar hemólisis.' },
  ],
  Cortinariaceae: [
    { name: 'Cortinarius orellanus', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400', diff: 'Sombrero ocre-anaranjado, orellanina nefrotóxica con síntomas a 2–3 semanas. Nunca consumir Cortinarius sin certeza.' },
    { name: 'Cortinarius rubellus', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400', diff: 'Sombrero cónico canela-rojizo. Contiene orellanina. Abetales y hayedos húmedos.' },
  ],
  Tricholomataceae: [
    { name: 'Clitocybe dealbata', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400', diff: 'Blanca-grisácea en prados. Contiene muscarina. Causa el síndrome muscarínico.' },
    { name: 'Clitocybe nebularis', risk: 'precaución', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400', diff: 'Sombrero gris con bloom harinoso, olor fuerte. Tóxica para muchas personas.' },
  ],
  Pleurotaceae: [
    { name: 'Omphalotus olearius', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400', diff: 'Anaranjado vivo, láminas verdaderas, crece en base de árboles. La confusión con Pleurotus es documentada.' },
  ],
  Agaricaceae: [
    { name: 'Agaricus xanthodermus', risk: 'tóxico', icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-amber-400', diff: 'Amarillea vivamente en la base del pie al corte, olor a fenol. Carácter diferencial clave.' },
    { name: 'Amanita phalloides', risk: 'mortal', icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-red-400', diff: 'Joven en "huevo": puede confundirse con champiñones jóvenes. Siempre cortar por la mitad.' },
  ],
}

export const CONFUSION_GENERICA = [
  { name: 'Especies del mismo género', risk: 'variable', icon: 'ℹ️', borderColor: 'border-blue-500/30', nameColor: 'text-blue-400',
    diff: 'Dentro del mismo género pueden existir especies tóxicas morfológicamente similares. Verificar siempre esporada, olor y hábitat.' },
]

// =====================================================
// TaxonomyBlock — acordeón de sinónimos
// =====================================================
export function TaxonomyBlock({ species }) {
  const [open, setOpen] = useState(false)
  const syns = species.synonyms || []
  if (syns.length === 0) return null
  return (
    <div className="mt-5">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm text-[#d9cda1]/60 hover:text-[#c4a06b] transition-colors">
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        🔬 {open ? 'Ocultar taxonomía' : `Ver taxonomía (${syns.length} sinónimo${syns.length > 1 ? 's' : ''})`}
      </button>
      {open && (
        <div className="mt-2 ml-1 pl-3 border-l-2 border-[#887b4b]/20 space-y-1">
          {syns.map((s, i) => <p key={i} className="text-sm text-[#f4ebe1]/45 italic">{s}</p>)}
        </div>
      )}
    </div>
  )
}

// =====================================================
// ConfusionesBlock — lista de especies confundibles
// =====================================================
export function ConfusionesBlock({ species, onViewSpecies, allSpecies = [] }) {
  const todas = CONFUSIONES_POR_FAMILIA[species.family] || CONFUSION_GENERICA
  const confusiones = todas.filter(c => c.name !== species.scientificName)
  return (
    <div className="space-y-3">
      {confusiones.map((c, i) => {
        const inApp = allSpecies.find(s => s.scientificName === c.name)
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
                    <span className={`font-medium text-sm ${c.nameColor}`}>{c.name}</span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[#f4ebe1]/50">{c.risk}</span>
                </div>
                <p className="text-[#f4ebe1]/60 text-sm leading-relaxed">{c.diff}</p>
              </div>
            </div>
          </div>
        )
      })}
      <p className="text-[#f4ebe1]/30 text-xs text-center pt-1">
        ⚠️ Datos orientativos. Consulta siempre con un micólogo experto antes de consumir cualquier seta silvestre.
      </p>
    </div>
  )
}
