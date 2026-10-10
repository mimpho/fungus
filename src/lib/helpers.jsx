// =====================================================
// helpers.jsx — Icons, utilities and shared micro-components
// Import from any page or component:
//   import { IC, getEdibilityColor, EdibilityTag, ... } from '@/lib/helpers'
// =====================================================
import { useState, useEffect } from 'react';
import { MODAL, COLORS } from './constants';
import { useApp } from '../contexts/AppContext';

export { MODAL, COLORS };

// =====================================================
// resolveUrl — ensures absolute paths from the root
// Asset URLs in data lack a leading '/'.
// When the browser path is /especies/boletus-edulis
// relative URLs resolve from /especies/, breaking images.
// =====================================================
export function resolveUrl(url) {
  if (!url) return url
  if (url.startsWith('/') || url.startsWith('http') || url.startsWith('data:')) return url
  return `/${url}`
}

// =====================================================
// slugify — normalises text to a URL-friendly slug
// =====================================================
export function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// =====================================================
// IC — Inline SVG icons (no external dependencies)
// =====================================================
export const IC = {
  map: (
    <svg className="w-5 h-5" fill="none" stroke="var(--color-cream)" viewBox="0 0 24 24">
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
  mushroom: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 2C7.03 2 3 6.03 3 11h18c0-4.97-4.03-9-9-9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 11v8a1 1 0 001 1h4a1 1 0 001-1v-8" />
    </svg>
  ),
  book: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5M12 6.5C14 5 17 4.5 20 5v13c-3-.5-6 0-8 1.5M12 6.5v13" />
    </svg>
  ),
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  wand: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 3l1.5 1.5M3 5l1.5 1.5M9 3l.5 2M3 9l2 .5M7 7l10 10M17 3l4 4-12 12H5v-4L17 3z" />
    </svg>
  ),
  pencil: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
// getEdibilityColor — badge colors by edibility level
// =====================================================
export function getEdibilityColor(com) {
  const m = {
    excelente:     { bg: 'edib-excelente',  text: 'text-[var(--ui-edib-excelente-text)]',  dot: 'edib-dot-excelente',  tKey: 'edib_excelente',
                     solidBg: 'edib-solid-excelente',  solidText: 'text-white' },
    bueno:         { bg: 'edib-comestible', text: 'text-[var(--ui-edib-comestible-text)]', dot: 'edib-dot-comestible', tKey: 'edib_comestible',
                     solidBg: 'edib-solid-comestible', solidText: 'text-white' },
    comestible:    { bg: 'edib-comestible', text: 'text-[var(--ui-edib-comestible-text)]', dot: 'edib-dot-comestible', tKey: 'edib_comestible',
                     solidBg: 'edib-solid-comestible', solidText: 'text-white' },
    precaucion:    { bg: 'edib-precaucion', text: 'text-[var(--ui-edib-precaucion-text)]', dot: 'edib-dot-precaucion', tKey: 'edib_precaucion',
                     solidBg: 'edib-solid-precaucion', solidText: 'text-white' },
    no_comestible: { bg: 'edib-neutral',    text: 'text-[var(--ui-edib-neutral-text)]',    dot: 'edib-dot-neutral',    tKey: 'edib_no_comestible',
                     solidBg: 'edib-solid-neutral',    solidText: 'text-white' },
    toxico:        { bg: 'edib-toxico',     text: 'text-[var(--ui-edib-toxico-text)]',     dot: 'edib-dot-toxico',     tKey: 'edib_toxico',
                     solidBg: 'edib-solid-toxico',     solidText: 'text-white' },
    mortal:        { bg: 'edib-mortal',     text: 'text-[var(--ui-edib-mortal-text)]',     dot: 'edib-dot-mortal',     tKey: 'edib_mortal',
                     solidBg: 'edib-solid-mortal',     solidText: 'text-white' },
  };
  return m[com] || m.no_comestible;
}

// =====================================================
// getScoreColor — score thermometer colors
// =====================================================
export function getScoreColor(s) {
  if (s >= 85) return { bar: 'score-bar-high', text: 'score-text-high', tKey: 'excelente' };
  if (s >= 70) return { bar: 'score-bar-good', text: 'score-text-good', tKey: 'muyBueno' };
  if (s >= 55) return { bar: 'score-bar-ok',   text: 'score-text-ok',   tKey: 'bueno' };
  return             { bar: 'score-bar-low',   text: 'score-text-low',   tKey: 'regular' };
}

// =====================================================
// speciesQualityScore — species quality score for the current season
//
// For a given zone and the current month, filters species matching
// forestType and fruitingMonths, and returns a 0-100 score based on
// the mean edibility weight of present species.
//
// Edibility weights (strongly skewed toward real gastronomic value):
//   excelente  → 100   (Boletus edulis, Cantharellus, Tuber… — the reason for the trip)
//   bueno      →  20   (Tuber borchii, Marzuelo… — interesting but not the main goal)
//   comestible →   5   (Hypholoma, Auriscalpium… — present but not worth the outing)
//   precaucion →   0   (not suitable for general consumption)
//   toxico     →   0
//   mortal     →   0
//
// Returns:
//   { sqs: number|null, allToxic: boolean }
//   sqs=null       → no species for this zone/month (score unchanged)
//   sqs=0 + allToxic=true → only toxic/lethal species → final score = 0
// =====================================================
export const EDIBILITY_SCORE = {
  excelente:  100,
  bueno:       20,
  comestible:   5,
  precaucion:   0,
  toxico:       0,
  mortal:       0,
}

export function speciesQualityScore(zone, allSpecies) {
  const month = new Date().getMonth() + 1
  const matching = allSpecies.filter(
    s => s.forestTypes?.includes(zone.forestType) && s.fruitingMonths?.includes(month)
  )
  if (matching.length === 0) return { sqs: null, allToxic: false }

  const scores = matching.map(s => EDIBILITY_SCORE[s.edibility] ?? 0)
  const avg    = scores.reduce((a, b) => a + b, 0) / scores.length
  const allToxic = scores.every(s => s === 0)
  return { sqs: Math.round(avg), allToxic }
}

/**
 * Adjusts the overallScore of weather conditions based on the quality
 * of species available in the zone for the current month.
 *
 *  - Only toxic/lethal species → overallScore = 0 (no gastronomic interest)
 *  - With species data         → 60% weather + 40% species quality
 *  - No in-season species      → weather score unchanged
 */
export function applySpeciesModifier(conditions, zone, allSpecies) {
  const { sqs, allToxic } = speciesQualityScore(zone, allSpecies)
  if (sqs === null) return conditions                                   // no data → no change
  if (allToxic)     return { ...conditions, overallScore: 0, speciesScore: 0 }
  const adjusted = Math.round(conditions.overallScore * 0.60 + sqs * 0.40)
  return { ...conditions, overallScore: Math.max(0, Math.min(100, adjusted)), speciesScore: sqs }
}

// =====================================================
// fakeConditions — generates random mock conditions
// Use with useMemo(() => fakeConditions(), [zone.id]) to avoid flicker
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
// EdibilityTag — reusable edibility badge
// variant="glass"   → semi-transparent background (lists)
// variant="onImage" → solid background (over photos)
// =====================================================
export function EdibilityTag({ edibility, variant = 'glass', showDot = false, className = '' }) {
  const { t } = useApp();
  const cc = getEdibilityColor(edibility);
  const label = t[cc.tKey] || cc.tKey;
  if (variant === 'onImage') {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide shadow-md backdrop-blur-sm ${cc.solidBg} ${cc.solidText} bg-opacity-85 ${className}`}>
        {label}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 mt-1 py-1 rounded-full text-[11px] font-medium ${cc.bg} ${cc.text} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cc.dot}`} />}
      {label}
    </span>
  );
}

// =====================================================
// SpeciesImg — species image with Wikipedia fallback
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

  const { t } = useApp();
  const Placeholder = ({ loading }) => (
    <div className={className} style={{ ...style, background: 'rgba(74,124,89,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {loading
        ? <span style={{ fontSize: '0.65rem', color: 'rgba(244,235,225,0.3)' }}>{t.cargando}</span>
        : <img src="/assets/images/placeholder.png" alt="mushroom" height="150" width="150" style={{ opacity: 0.15 }} />
      }
    </div>
  );

  if (phase === 'failed') return <Placeholder loading={false} />;
  if (phase === 'local' && localSrc) {
    return <img src={resolveUrl(localSrc)} alt={scientificName} className={className} style={imgStyle} onError={() => setPhase('wiki')} />;
  }
  if (phase === 'wiki' || (phase === 'local' && !localSrc)) return <Placeholder loading={true} />;
  return <img src={wikiSrc} alt={scientificName} className={className} style={imgStyle} />;
}

// =====================================================
// SpeciesCard — reusable species card
// size="full"    → tall image (h-64), favourite button
// size="compact" → short image (h-28), no favourite
// =====================================================
export function SpeciesCard({ species, onOpen, isFav, onToggleFav, size = 'full', animDelay, enTemporada }) {
  const isCompact = size === 'compact';
  return (
    <div
      onClick={() => onOpen(species)}
      className="glass rounded-2xl hover-lift anim-up overflow-hidden cursor-pointer"
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
            className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${isFav ? 'text-red-400' : 'text-white/70 hover:text-red-400'}`}
          >
            {IC.heart(!!isFav)}
          </button>
        )}
        <div className="absolute bottom-2 left-2">
          <EdibilityTag edibility={species.edibility} variant="onImage" />
        </div>
        {enTemporada && (
          <span className="absolute bottom-3 right-3 text-accent-positive text-[9px] font-medium">EN TEMPORADA</span>
        )}
      </div>
      {isCompact ? (
        <div className="p-3">
          <h4 className="font-display text-sm font-semibold text-cream leading-snug truncate">{species.scientificName}</h4>
          <p className="text-muted text-[11px] mt-0.5 truncate">{species.commonNames[0]}</p>
        </div>
      ) : (
        <div className="p-4 pt-2">
          <h3 className="font-display text-xl font-semibold text-cream mb-1">{species.scientificName}</h3>
          <p className="text-muted text-xs mb-2">{species.family}</p>
          <p className="text-cream/70 text-xs truncate">{species.commonNames.join(' · ')}</p>
        </div>
      )}
    </div>
  );
}

// =====================================================
// edibilityStyle — icon and colors derived from edibility
// Used by ConfusionesBlock; presentation is not stored in the DB
// =====================================================
function edibilityStyle(edibility) {
  switch (edibility) {
    case 'excelente':
      return { icon: '⭐', borderColor: 'border-emerald-500/30', nameColor: 'text-[var(--ui-edib-excelente-text)]' }
    case 'bueno':
    case 'comestible':
      return { icon: '✅', borderColor: 'border-emerald-500/20', nameColor: 'text-[var(--ui-edib-comestible-text)]' }
    case 'mortal':
      return { icon: '☠️', borderColor: 'border-red-500/50', nameColor: 'text-[var(--ui-edib-mortal-text)]' }
    case 'no_comestible':
      return { icon: 'ℹ️', borderColor: 'border-blue-500/30', nameColor: 'text-[var(--ui-edib-neutral-text)]' }
    default: // toxico, precaucion, psicoactivo
      return { icon: '⚠️', borderColor: 'border-amber-500/40', nameColor: 'text-[var(--ui-edib-precaucion-text)]' }
  }
}

// REMOVED: CONFUSIONES_POR_FAMILIA and CONFUSION_GENERICA (v4.6.2)
// Confusions now live in extra_data.confusions (DB) → detail.confusions in the modal.
// See memory/decisions.md § Confusiones — data structure (v4.6.2)

// =====================================================
// TaxonomyBlock — synonyms accordion
// =====================================================
export function TaxonomyBlock({ species }) {
  const { t } = useApp()
  const [open, setOpen] = useState(false)
  const syns = species.synonyms || []
  if (syns.length === 0) return null
  return (
    <div className="mt-5">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 glass px-4 py-2 rounded-xl text-sm text-muted hover:text-coffee-light transition-colors">
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        🔬 {open ? t.ocultarTaxonomia : `${t.verTaxonomia} (${syns.length} ${syns.length > 1 ? t.sinonimos : t.sinonimo})`}
      </button>
      {open && (
        <div className="mt-2 ml-1 pl-3 border-l-2 border-bar/20 space-y-1">
          {syns.map((s, i) => <p key={i} className="text-sm text-cream/60 italic">{s}</p>)}
        </div>
      )}
    </div>
  )
}

// =====================================================
// ConfusionesBlock — list of confusable species
// Reads detail.confusions [{with_species_id, diff}] from the API (v4.6.2)
// icon/borderColor/nameColor are derived from edibility via edibilityStyle()
// =====================================================
export function ConfusionesBlock({ species, onViewSpecies, allSpecies = [] }) {
  const { t } = useApp()
  const confusions = species.confusions
  if (!confusions?.length) return null
  return (
    <div className="space-y-2">
      {confusions.map((c, i) => {
        const ref = allSpecies.find(s => s.id === c.with_species_id)
        const canView = ref && onViewSpecies
        return (
          <div key={i}
            onClick={canView ? () => onViewSpecies(ref) : undefined}
            className={`flex items-start gap-3 rounded-xl p-3 transition-all ${canView ? 'surface-hover cursor-pointer' : 'surface-subtle'}`}>
            {/* Imagen — anchored left */}
            <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 surface-subtle">
              <img
                src={resolveUrl(ref?.photo?.url)}
                alt={ref?.scientificName ?? ''}
                className="w-full h-full object-cover object-top opacity-80"
                onError={ev => { ev.target.style.display = 'none' }}
              />
            </div>
            {/* Columna derecha: nombre+tag arriba, descripción debajo a ancho completo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-display text-cream text-lg truncate">{ref?.scientificName ?? c.with_species_id}</div>
                {ref && <EdibilityTag edibility={ref.edibility} variant="glass" className="shrink-0" />}
              </div>
              {c.diff && (
                <p className="text-cream/60 text-[.8rem] leading-relaxed">{c.diff}</p>
              )}
            </div>
          </div>
        )
      })}
      <p className="text-cream/50 text-xs text-center pt-1">
        {t.avisoMicologo}
      </p>
    </div>
  )
}

/**
 * Converts a hex CSS variable to an RGBA string
 * @param {string} variable - CSS variable name (e.g. '--color-coffee')
 * @param {number} alpha - Opacity from 0 to 1
 */
export const getRGBAFromAsset = (variable, alpha) => {
  if (typeof window === 'undefined') return ''; // SSR guard

  // 1. Read the variable value from :root (e.g. "#6f4e37")
  const rootStyle = getComputedStyle(document.documentElement);
  let hex = rootStyle.getPropertyValue(variable).trim();

  // If the variable is missing or empty, return a fallback
  if (!hex) return `rgba(0,0,0,${alpha})`;

  // Strip the '#' if present
  hex = hex.replace('#', '');

  // 2. Parse to RGB channels
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

