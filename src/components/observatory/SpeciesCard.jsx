import { EdibilityTag, resolveUrl } from '../../lib/helpers'

// The look of the species list's card (glass, rounded, photo to the edges, Latin name in the display font)
// in a size for rows of several: smaller type and tag.
const CARD = 'glass rounded-2xl overflow-hidden block w-full text-left'

function Body({ row }) {
  const title = row.scientific || row.name
  const sub = row.scientific && row.scientific !== row.name ? row.name : ''
  return (
    <>
      <span className="block relative aspect-[4/3] overflow-hidden bg-cream/[0.08]">
        {row.photo && (
          <img
            src={resolveUrl(row.photo)}
            alt=""
            loading="lazy"
            decoding="async"
            onError={e => { e.currentTarget.style.visibility = 'hidden' }}
            className="w-full h-full object-cover"
          />
        )}
        {row.edibility && (
          <span className="absolute bottom-1.5 left-1.5">
            <EdibilityTag edibility={row.edibility} variant="onImage" className="!px-2 !py-0.5 !text-[10px]" />
          </span>
        )}
      </span>
      <span className="block px-2.5 py-2">
        <span className="block font-display text-sm font-semibold text-cream leading-snug truncate">{title}</span>
        <span className="block text-muted text-[11px] mt-0.5 truncate">{sub || ' '}</span>
      </span>
    </>
  )
}

/**
 * A species as a card like the ones of the species list: photo to the edges (4:3) with its
 * edibility tag, the Latin name as title and the common name under it. With `onOpen` the whole
 * card is a button (it opens the species' sheet); `onRemove` adds a × over the photo.
 * `placeholder` is the empty place a species will take: the same card, dashed and empty, so
 * the free places have the size of the full ones.
 */
export function SpeciesCard({ row, onOpen, openLabel, onRemove, removeLabel, placeholder = false, className = '' }) {
  if (placeholder) {
    return (
      <div aria-hidden="true" className={`${CARD} border-2 border-dashed border-cream/25 !bg-transparent !backdrop-filter-none ${className}`}>
        <span className="block aspect-[4/3]" />
        <span className="block px-2.5 py-2">
          <span className="block text-sm leading-snug">&nbsp;</span>
          <span className="block text-[11px] mt-0.5">&nbsp;</span>
        </span>
      </div>
    )
  }
  return (
    <div className={`relative min-w-0 ${className}`}>
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={openLabel}
          title={openLabel}
          className={`${CARD} hover-lift outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-cream/50`}
        >
          <Body row={row} />
        </button>
      ) : <div className={CARD}><Body row={row} /></div>}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-cream hover:bg-black/80 transition-colors"
        >
          <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  )
}
