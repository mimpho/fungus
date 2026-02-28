import { useState, useMemo, useEffect, useCallback } from 'react'
import { useApp } from '../contexts/AppContext'
import { mockSpecies } from '../data/species'
import { SpeciesCard, IC } from '../lib/helpers'
import { SearchFilterBar } from '../components/ui/SearchFilterBar'
import { FilterPanel } from '../components/ui/FilterPanel'
import { ActiveFilterChip } from '../components/ui/ActiveFilterChip'

const PER_PAGE = 24

const SHOW_FILTERS = [
  { id: 'todas',      label: 'Todas',       emoji: '🍄' },
  { id: 'favoritas',  label: 'Favoritas',   emoji: '❤️' },
  { id: 'excelente',  label: 'Excelentes',  emoji: '⭐' },
  { id: 'comestible', label: 'Comestibles', emoji: '✅' },
  { id: 'toxico',     label: 'Tóxicas',     emoji: '⚠️' },
  { id: 'mortal',     label: 'Mortales',    emoji: '☠️' },
]

export default function Species() {
  const { t, favoriteSpecies, toggleFavorite, setSelectedSpecies, setSelectedFamily } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [orden, setOrden]             = useState('alfa')
  const [showFilter, setShowFilter]   = useState('todas')
  const [familyFilter, setFamilyFilter] = useState('')
  const [page, setPage]               = useState(1)
  const [pillOpen, setPillOpen]       = useState(false)

  const uniqueFamilies = useMemo(() => [...new Set(mockSpecies.map(e => e.family))].sort(), [])
  const isFav = useCallback(e => favoriteSpecies.some(f => f.id === e.id), [favoriteSpecies])

  const filteredSpecies = useMemo(() => {
    let r = [...mockSpecies]
    if (showFilter === 'favoritas')  r = r.filter(e => favoriteSpecies.some(f => f.id === e.id))
    else if (showFilter === 'excelente')  r = r.filter(e => e.edibility === 'excelente')
    else if (showFilter === 'comestible') r = r.filter(e => ['bueno', 'comestible', 'precaucion'].includes(e.edibility))
    else if (showFilter === 'toxico')     r = r.filter(e => e.edibility === 'toxico')
    else if (showFilter === 'mortal')     r = r.filter(e => e.edibility === 'mortal')
    if (familyFilter) r = r.filter(e => e.family === familyFilter)
    if (searchQuery) {
      const b = searchQuery.toLowerCase()
      r = r.filter(e =>
        e.scientificName.toLowerCase().includes(b) ||
        e.commonNames.some(n => n.toLowerCase().includes(b)) ||
        (e.synonyms || []).some(s => s.toLowerCase().includes(b))
      )
    }
    if (orden === 'alfa')   r.sort((a, b) => a.scientificName.localeCompare(b.scientificName))
    else if (orden === 'family') r.sort((a, b) => a.family.localeCompare(b.family))
    else if (orden === 'comest') {
      const p = { excelente: 0, bueno: 1, comestible: 2, precaucion: 3, no_comestible: 4, toxico: 5, mortal: 6 }
      r.sort((a, b) => (p[a.edibility] ?? 7) - (p[b.edibility] ?? 7))
    }
    return r
  }, [searchQuery, orden, showFilter, familyFilter, favoriteSpecies])

  const totalPages = Math.ceil(filteredSpecies.length / PER_PAGE)
  const pageItems  = filteredSpecies.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const activeFilters = (showFilter !== 'todas' ? 1 : 0) + (familyFilter ? 1 : 0) + (orden !== 'alfa' ? 1 : 0)

  useEffect(() => { setPage(1) }, [searchQuery, orden, showFilter, familyFilter])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])

  // Paginación con elipsis
  function pageItems2() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const delta = 1
    const left  = Math.max(2, page - delta)
    const right = Math.min(totalPages - 1, page + delta)
    const items = [1]
    if (left > 2) items.push('…l')
    for (let i = left; i <= right; i++) items.push(i)
    if (right < totalPages - 1) items.push('…r')
    items.push(totalPages)
    return items
  }

  return (
    <div className="space-y-6 anim-up pb-6">
      {/* Header + barra búsqueda */}
      <div className="flex flex-col md:grid md:grid-cols-[auto_1fr] md:items-center gap-4">
        <div>
          <h2 className="font-display text-4xl font-semibold text-cream">{t.especies}</h2>
          <p className="text-muted text-sm mt-1">{filteredSpecies.length} especies encontradas</p>
        </div>
        <div className="flex justify-center">
          <SearchFilterBar
            variant="split"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder={t.buscarEspecies}
            onFilterClick={() => setPillOpen(p => !p)}
            activeFilters={activeFilters}
            className="w-full md:max-w-[60%] sm:min-w-[350px]"
          />
        </div>
      </div>

      {/* Panel filtros */}
      <FilterPanel isOpen={pillOpen} onClose={() => setPillOpen(false)}>
        <div className="mb-5">
          <p className="text-muted text-xs uppercase tracking-wider mb-3">Mostrar</p>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
            {SHOW_FILTERS.map(f => (
              <button key={f.id} onClick={() => setShowFilter(f.id)}
                className={`py-2.5 rounded-xl text-xs font-medium transition-all flex flex-col sm:flex-row items-center gap-1 sm:px-3.5 ${showFilter === f.id ? 'bg-bar text-white' : 'glass text-cream/60 hover:text-cream'}`}>
                <span className="text-base sm:text-sm">{f.emoji}</span>{f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <p className="text-muted text-xs uppercase tracking-wider mb-3">Familia</p>
          <div className="relative sm:inline-block sm:min-w-[220px]">
            <select value={familyFilter} onChange={e => setFamilyFilter(e.target.value)}
              className="w-full px-4 py-3 pr-10 rounded-xl text-sm text-cream outline-none cursor-pointer appearance-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <option value="" style={{ background: 'var(--color-modal)' }}>Todas las familias</option>
              {uniqueFamilies.map(f => <option key={f} value={f} style={{ background: 'var(--color-modal)' }}>{f}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cream/50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        <div className="mb-5">
          <p className="text-muted text-xs uppercase tracking-wider mb-3">Ordenar por</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {[
              { id: 'alfa',   label: '🔤 Nombre (A–Z)' },
              { id: 'family', label: '🍄 Familia' },
              { id: 'comest', label: '⭐ Comestibilidad' },
            ].map(op => (
              <button key={op.id} onClick={() => setOrden(op.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-left transition-all ${orden === op.id ? 'bg-bar/20 text-coffee-light' : 'glass text-cream/70 hover:text-cream'}`}>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${orden === op.id ? 'bg-bar' : 'bg-white/20'}`}>
                  {orden === op.id && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </span>
                {op.label}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:flex sm:justify-end">
          <button onClick={() => setPillOpen(false)}
            className="w-full sm:w-auto sm:px-6 py-3 bg-bar text-white rounded-xl font-medium hover:bg-[#a0855a] transition-colors">
            Ver {filteredSpecies.length} especie{filteredSpecies.length !== 1 ? 's' : ''}
          </button>
        </div>
      </FilterPanel>

      {/* Chips filtros activos */}
      {(showFilter !== 'todas' || familyFilter) && (
        <div className="flex flex-wrap gap-2">
          {showFilter !== 'todas' && (() => {
            const f = SHOW_FILTERS.find(f => f.id === showFilter)
            return <ActiveFilterChip key="sf" emoji={f?.emoji} label={f?.label} onRemove={() => setShowFilter('todas')} />
          })()}
          {familyFilter && <ActiveFilterChip key="ff" emoji="🔬" label={familyFilter} onRemove={() => setFamilyFilter('')} />}
        </div>
      )}

      {/* Grid */}
      {pageItems.length === 0 ? (
        <div className="text-center py-16 text-cream/70">
          <div className="text-4xl mb-3">🔍</div>
          <p>Sin resultados para tu búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {pageItems.map((e, i) => (
            <SpeciesCard key={e.id} species={e}
              onOpen={setSelectedSpecies}
              isFav={isFav(e)}
              onToggleFav={toggleFavorite}
              animDelay={i * 0.04}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-4 flex-wrap">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm glass text-cream/60 hover:text-cream disabled:opacity-25 disabled:cursor-not-allowed transition-all shrink-0">
            {IC.chevron('left')}
          </button>
          {pageItems2().map((item, i) =>
            typeof item === 'number' ? (
              <button key={item} onClick={() => setPage(item)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all shrink-0 ${item === page ? 'bg-bar text-white' : 'text-cream/40 hover:text-cream hover:bg-white/[0.05]'}`}>
                {item}
              </button>
            ) : (
              <span key={item + i} className="w-6 text-center text-cream/25 text-sm select-none">…</span>
            )
          )}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm glass text-cream/60 hover:text-cream disabled:opacity-25 disabled:cursor-not-allowed transition-all shrink-0">
            {IC.chevron('right')}
          </button>
          <span className="text-cream/30 text-xs ml-1 shrink-0">{page}/{totalPages}</span>
        </div>
      )}
    </div>
  )
}
