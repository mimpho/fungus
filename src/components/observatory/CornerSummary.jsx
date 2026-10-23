import { useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { useSpeciesRows } from '../../hooks/useSpeciesRows'
import { resolveUrl } from '../../lib/helpers'
import { SpeciesPreview } from './SpeciesPreview'

/** A hairline horizontal scrollbar, in the page's cream (Firefox and WebKit) */
export const SCROLL_THIN = '[scrollbar-width:thin] [scrollbar-color:rgb(var(--color-cream-rgb)/0.35)_transparent] [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cream/[0.35]'

/** True when the notes are only the names of the corner's species, which the cards already show. */
export function notesAreSpeciesNames(notes, names) {
  const parts = (notes ?? '').split(/[,;\n]/).map(x => x.trim().toLowerCase()).filter(Boolean)
  const known = new Set(names.filter(Boolean).map(x => x.toLowerCase()))
  return parts.length > 0 && parts.every(x => known.has(x))
}

/**
 * The species a corner has, as a strip of 4:3 photos 100px tall that scrolls sideways (for the
 * map's small panel; the page has them as cards). Each photo opens the species' preview. The kind
 * is not written here: the pin before the corner's name says it.
 */
export function CornerSummary({ corner }) {
  const { t } = useApp()
  const rows = useSpeciesRows()
  const { species: catalog } = useSpecies()
  const [viewing, setViewing] = useState(null)
  const items = useMemo(() => {
    const byId = new Map(rows.map(r => [r.id, r]))
    return (corner.species_ids ?? []).map(id => byId.get(id) ?? { id, name: id, photo: null })
  }, [rows, corner.species_ids])
  if (!items.length) return null
  const open = viewing && (catalog ?? []).find(s => s.id === viewing)
  return (
    <>
      <ul className={`flex gap-2 overflow-x-auto pb-1.5 ${SCROLL_THIN}`} data-testid="corner-summary" aria-label={t.obsCornerSpecies}>
        {items.map(r => (
          <li key={r.id} className="shrink-0 w-[133px]">
            <button
              type="button"
              onClick={() => setViewing(r.id)}
              title={r.name}
              aria-label={t.obsCornerSpeciesOpen.replace('{name}', r.name)}
              className="relative block h-[100px] w-full overflow-hidden rounded-xl bg-cream/[0.1] hover:brightness-110 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
            >
              {r.photo && (
                <img
                  src={resolveUrl(r.photo)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={e => { e.currentTarget.style.visibility = 'hidden' }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </button>
            {r.scientific && <p className="mt-1 text-xs italic text-cream/70 truncate">{r.scientific}</p>}
          </li>
        ))}
      </ul>
      {open && <SpeciesPreview species={open} onClose={() => setViewing(null)} />}
    </>
  )
}
