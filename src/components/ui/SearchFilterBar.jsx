import { useState, useRef } from 'react'
import { IC } from '../../lib/helpers'

// variant="full"  → solo búsqueda
// variant="split" → búsqueda + botón Filtrar integrado
export function SearchFilterBar({ value, onChange, onClear, placeholder, onFilterClick, activeFilters = 0, variant = 'full', className = '' }) {
  const H = '52px'
  const R = '26px'
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const hasFilter   = variant === 'split'
  const inputRadius = hasFilter && !focused ? `${R} 0 0 ${R}` : R

  return (
    <div className={`flex ${className}`} style={{ gap: '2px' }}>
      <div className="relative flex-1">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#f4ebe1]/50 pointer-events-none">{IC.search}</span>
        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => { if (e.key === 'Escape') { onClear(); inputRef.current?.blur() } }}
          className="w-full glass text-[#f4ebe1] text-sm outline-none placeholder-[#f4ebe1]/30 pl-12 pr-12 transition-all duration-200"
          style={{ height: H, borderRadius: inputRadius }}
        />
        {value && (
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => { onClear(); inputRef.current?.blur() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-[#f4ebe1]/45 hover:text-[#f4ebe1]/90 hover:bg-white/10 transition-all"
            style={{ width: '32px', height: '32px' }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {hasFilter && (
        <div className="overflow-hidden shrink-0"
          style={{ maxWidth: focused ? 0 : '160px', opacity: focused ? 0 : 1, transition: 'max-width 0.2s ease, opacity 0.15s ease' }}>
          <button onClick={onFilterClick}
            className="px-5 glass text-[#f4ebe1]/85 hover:text-[#c4a06b] transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
            style={{ height: H, borderRadius: `0 ${R} ${R} 0` }}>
            {IC.filter}
            <span>Filtrar</span>
            {activeFilters > 0 && (
              <span className="px-1.5 py-0.5 bg-[#887b4b] text-white rounded-full text-[10px] font-bold leading-none">{activeFilters}</span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
