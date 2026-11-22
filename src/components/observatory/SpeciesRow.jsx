import { useApp } from '../../contexts/AppContext'
import { getEdibilityColor, resolveUrl } from '../../lib/helpers'

/**
 * A species as a card: photo to the card's edge, common name, scientific name in italics, edibility tag and
 * a button that opens the species' sheet. Shared by the observed zone's «¿Qué seta buscas?» panel and the
 * map search's species list, so both look the same.
 * `row`: { id, name, scientific, photo, edibility, followed? }. `onPick(row)` runs when the card is chosen;
 * `onOpenCard(id)` when its file-card button is pressed.
 * Slots, for what only the zone has: `score` (at the right end of the card), `aside` (a button after the card,
 * the details arrow) and `children` (the details under it).
 * `option`: the card is an option of a listbox (the map search): it takes `optionId`, is highlighted while
 * `active`, and its buttons are out of the tab order and do not take the focus from the field
 * (`keepFocus`), so typing and the dropdown go on while a card is pressed.
 * `dark`: the card sits on a dark surface in both themes (the zone's bottom sheet), so it takes no light-theme text colours (and its card is white in the light one).
 * `dim`: the species is out of season: the card is toned down (it is still pickable).
 */
export function SpeciesRow({
  row, selected = false, onPick, onOpenCard, pickLabel, score = null, aside = null, children = null,
  option = false, optionId, active = false, onHover, dark = false, dim = false,
}) {
  const { t } = useApp()
  const edib = getEdibilityColor(row.edibility)
  const keep = option ? { tabIndex: -1, onPointerDown: e => e.preventDefault() } : {}
  // In the zone's panel the card is a translucent tint over the dark glass. Over the search bar's lighter surface the same tint
  // would not carry the text (the tag and the Latin name fell under 4.5:1), so there it is the same tint over a solid `modal` base
  const tint = dark
    ? (selected ? 'bg-bar/10 [[data-theme=light]_&]:bg-white/65' : 'bg-cream/[0.14] [[data-theme=light]_&]:bg-white/65')
    : selected
      ? 'bg-bar/10'
      : active ? 'bg-cream/[0.16]' : 'bg-cream/[0.08] [[data-theme=light]_&]:bg-[var(--ui-filter-pill-bg)]'
  const surface = option ? 'bg-modal' : tint
  // The zone's panel writes its text in `--ui-filter-pill-text` in the light theme (olive, 3.8:1 on white); the search bar's list
  // sits on a white surface and uses the theme's own text colour
  const pillText = option || dark ? '' : '[[data-theme=light]_&]:text-[var(--ui-filter-pill-text)]'
  const pillHover = option || dark ? '' : '[[data-theme=light]_&]:hover:text-[var(--ui-filter-pill-text)]'
  return (
    <li
      data-testid="species-row"
      id={optionId}
      role={option ? 'option' : undefined}
      aria-selected={option ? selected : undefined}
      onMouseEnter={onHover}
      className={`obs-card [[data-theme=light]_&]:shadow-none relative rounded-xl overflow-hidden ${surface} ${dim ? 'opacity-75' : ''}`}
    >
      {option && <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${tint}`} />}
      {/* Selection outline drawn inside the card (above the photo) so the list never clips it */}
      {selected && <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-xl ring-2 ring-inset ring-bar" />}
      <div className="flex items-stretch">
        {/* The row is one big button (an overlay) so the card icon next to the edibility tag is not
            a button inside a button; the content above it lets clicks through, except that icon */}
        <div className="relative flex-1 min-w-0 flex items-stretch">
          <button
            type="button"
            onClick={() => onPick(row)}
            aria-pressed={option ? undefined : selected}
            aria-label={(pickLabel ?? t.obsSpPick).replace('{name}', row.name)}
            className="absolute inset-0 z-0 hover:bg-cream/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cream/50"
            {...keep}
          />
          {/* The catalogue's photo, to the card's edge (no padding) and as tall as the row */}
          <span aria-hidden="true" className="pointer-events-none relative shrink-0 w-20 bg-cream/[0.08]">
            {row.photo && (
              <img
                src={resolveUrl(row.photo)}
                alt=""
                loading="lazy"
                decoding="async"
                onError={e => { e.currentTarget.style.visibility = 'hidden' }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </span>
          <span className="pointer-events-none relative flex-1 min-w-0 flex items-center gap-2.5 pl-3 pr-1 py-2.5">
            <span className="min-w-0 flex-1">
              <span className={`block text-sm font-medium text-cream ${pillText} truncate`}>
                {row.followed && <span aria-label={t.obsSpFollowed} title={t.obsSpFollowed}>★ </span>}
                {row.name}
              </span>
              <span className={`block text-xs ${pillText} truncate italic ${option ? 'text-cream/80' : 'text-cream/60 opacity-80'}`}>{row.scientific}</span>
              <span className="mt-0.5 flex items-center gap-1.5">
                <span className={`inline-block text-[11px] px-1.5 py-px rounded-full ${edib.bg} ${edib.text}`}>{t[edib.tKey]}</span>
                <button
                  type="button"
                  onClick={() => onOpenCard(row.id)}
                  title={t.ver_ficha}
                  aria-label={t.obsCornerSpeciesOpen.replace('{name}', row.name)}
                  className={`pointer-events-auto relative z-10 inline-flex items-center justify-center size-6 -my-1 rounded-full text-cream/60 ${pillText} ${pillHover} hover:text-cream hover:bg-cream/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/60`}
                  {...keep}
                >
                  {/* A file card with lines */}
                  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5" />
                    <path d="M9 13h6M9 17h6" />
                  </svg>
                </button>
              </span>
            </span>
            {score}
          </span>
        </div>
        {aside}
      </div>
      {children}
    </li>
  )
}
