import { useMemo } from 'react'
import { useApp } from '../contexts/AppContext'
import { useSpecies } from './useSpecies'
import { buildPickerRows } from '../lib/speciesList'

/** The catalogue as rows for people (name, Latin name, photo) in the app language. */
export function useSpeciesRows() {
  const { lang } = useApp()
  const { species } = useSpecies()
  return useMemo(() => buildPickerRows(species, lang), [species, lang])
}
