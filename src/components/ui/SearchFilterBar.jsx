import { useState, useRef } from 'react'
import { IC } from '../../lib/helpers'

// variant="full"  → solo búsqueda
// variant="split" → búsqueda + botón Filtrar integrado
// theme="dark"    → (por defecto) fondo glass, texto crema
// theme="light"   → fondo blanco, texto verde oscuro — para sticky bar
// itemClassName / iconClassName — overrides manuales (toman precedencia sobre theme)
export function SearchFilterBar({ value, onChange, onClear, placeholder, onFilterClick, onSearchFocus, activeFilters = 0, variant = 'full', className = '', itemClassName, iconClassName, theme = 'dark' }) {
  const H = '52px'
  const R = '26px'
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const hasFilter   = variant === 'split'
  const inputRadius = hasFilter && !focused ? `${R} 0 0 ${R}` : R

  const light = theme === 'light'

  // itemClassName/iconClassName son overrides explícitos; sino, deriva del theme
  const itemCls    = itemClassName ?? (light ? 'search-light'      : 'glass')
  const iconCls    = iconClassName ?? (light ? 'search-light-text' : 'text-cream/85')
  const inputTxtCls = light ? 'search-light-input' : 'text-cream placeholder-cream/85'
  const clearCls    = light
    ? 'search-light-text opacity-60 hover:opacity-100 hover:bg-black/10'
    : 'text-cream/75 hover:text-cream hover:bg-white/10'
  const btnTxtCls   = light
    ? 'search-light-text hover:opacity-100'
    : 'text-cream/85 hover:text-coffee-light'
  const badgeCls    = light
    ? 'px-1.5 py-0.5 bg-forest text-white rounded-full text-[10px] font-bold leading-none'
    : 'px-1.5 py-0.5 bg-bar text-white rounded-full text-[10px] font-bold leading-none'

  return (
    <div className={`flex ${className}`} style={{ gap: '4px' }}>
      <div className="relative flex-1">
        <span className={`absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none z-10 ${iconCls}`}>{IC.search}</span>
        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => { setFocused(true); onSearchFocus?.() }}
          onBlur={() => setFocused(false)}
          onKeyDown={e => { if (e.key === 'Escape') { onClear(); inputRef.current?.blur() } }}
          className={`w-full ${itemCls} ${inputTxtCls} text-sm outline-none pl-12 pr-12 transition-all duration-200`}
          style={{ height: H, borderRadius: inputRadius }}
        />
        {value && (
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => { onClear(); inputRef.current?.blur() }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all ${clearCls}`}
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
            className={`px-5 ${itemCls} ${btnTxtCls} transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap`}
            style={{ height: H, borderRadius: `0 ${R} ${R} 0` }}>
            {IC.filter}
            <span>Filtrar</span>
            {activeFilters > 0 && (
              <span className={badgeCls}>{activeFilters}</span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
