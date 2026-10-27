import { useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useSpecies } from '../../hooks/useSpecies'
import { useSpeciesRows } from '../../hooks/useSpeciesRows'
import { SpeciesPreview } from './SpeciesPreview'

/**
 * The mushrooms tagged on a corner as tag pills: the name, and a × beside it when `onRemove` is
 * given (the edit dialog). The name opens the species' sheet over whatever is open. Nothing is
 * drawn for an empty list. `ids` are catalogue ids; an unknown one shows as its id.
 */
export function SpeciesPills({ ids, onRemove, className = '' }) {
  const { t } = useApp()
  const rows = useSpeciesRows()
  const { species: catalog } = useSpecies()
  const [viewing, setViewing] = useState(null) // id of the species whose catalogue modal is open
  const items = useMemo(() => {
    const byId = new Map(rows.map(r => [r.id, r]))
    return (ids ?? []).map(id => byId.get(id) ?? { id, name: id })
  }, [rows, ids])
  if (!items.length) return null
  const open = viewing && (catalog ?? []).find(s => s.id === viewing)
  return (
    <>
      <ul className={`flex flex-wrap gap-2 ${className}`} aria-label={t.obsCornerSpecies} data-testid="species-pills">
        {items.map(r => (
          <li key={r.id} className={`inline-flex items-center rounded-full glass text-sm text-cream max-w-full ${onRemove ? 'pl-3 pr-1 py-1' : 'px-3 py-1'}`}>
            <button
              type="button"
              onClick={() => setViewing(r.id)}
              title={r.scientific || r.name}
              aria-label={t.obsCornerSpeciesOpen.replace('{name}', r.name)}
              className="truncate outline-none hover:underline underline-offset-2 focus-visible:underline"
            >
              {r.name}
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(r.id)}
                aria-label={t.obsCornerSpeciesRemove.replace('{name}', r.name)}
                className="ml-1 shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-cream/60 hover:text-cream hover:bg-white/10 transition-colors"
              >
                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </li>
        ))}
      </ul>
      {open && <SpeciesPreview species={open} onClose={() => setViewing(null)} />}
    </>
  )
}
