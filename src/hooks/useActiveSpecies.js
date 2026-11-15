import { useCallback, useEffect, useState } from 'react'
import { useSpecies } from './useSpecies'

/**
 * The map's active species: one mushroom chosen for the whole map (an id, or null = none). It is a lens, not a filter:
 * the layers that answer a question about the species read it (Meteo · Condiciones, later the habitat and the Top 10);
 * the ones that show what exists never hide anything because of it.
 * It lives in the page, is mirrored in the URL (`seta`, whatever Meteo does) and is not stored in this browser.
 * `initial` comes from the URL; `onChange(id)` writes it back. A species the catalogue does not have (an old or mistyped
 * link) is dropped without a notice once the catalogue has loaded.
 * Returns { speciesId, setSpecies, clear }.
 */
export function useActiveSpecies({ initial = null, onChange } = {}) {
  const [speciesId, setSpeciesId] = useState(initial)
  const { species: catalog } = useSpecies()

  useEffect(() => {
    if (speciesId && catalog?.length && !catalog.some(x => x.id === speciesId)) setSpeciesId(null)
  }, [catalog, speciesId])

  useEffect(() => { onChange?.(speciesId) }, [speciesId, onChange])

  const clear = useCallback(() => setSpeciesId(null), [])
  return { speciesId, setSpecies: setSpeciesId, clear }
}
