// size: 'sm' | 'md' | 'lg'
// variant: 'default' | 'compact'
// fullWidth: buttons share the row equally (e.g. profile sections)
// option.badge: number shown as a notification bubble on the label (hidden when 0)
export function Tabs({ options, selected, onChange, size = 'md', variant = 'default', fullWidth = false }) {
  const sizeClasses = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' }
  // fullWidth tabs are taller (py-2.5) for touch; px-1 because each button already fills 1/n of the row
  const btnSize = fullWidth ? sizeClasses[size].replace(/py-[\d.]+/, 'py-2.5').replace(/px-[\d.]+/, 'px-1') : sizeClasses[size]
  const containerClasses = variant === 'compact'
    ? 'flex gap-1'
    : 'flex rounded-xl p-1 gap-1'
  const btnBase     = `rounded-lg font-medium transition-all${fullWidth ? ' flex-1 text-center whitespace-nowrap' : ''}`
  const btnActive   = variant === 'compact' ? 'bg-bar/90 text-white shadow-md' : 'bg-bar text-white shadow-sm'
  const btnInactive = variant === 'compact' ? 'text-cream/55 hover:text-cream hover:[background-color:var(--ui-surface-hover)]' : 'text-cream/60 hover:text-cream'

  const containerStyle = variant === 'compact' ? undefined : { background: 'var(--ui-tabs-bg)' }

  return (
    <div className={containerClasses} style={containerStyle}>
      {options.map(opt => (
        <button key={opt.id} onClick={() => onChange(opt.id)}
          className={`${btnBase} ${btnSize} ${selected === opt.id ? btnActive : btnInactive}`}>
          {opt.icon && <span className="mr-1.5">{opt.icon}</span>}
          {opt.badge > 0 ? (
            <span className="relative">
              {opt.label}
              <span className="absolute -top-2.5 -right-4 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-semibold leading-none flex items-center justify-center">
                {opt.badge > 99 ? '99+' : opt.badge}
              </span>
            </span>
          ) : opt.label}
        </button>
      ))}
    </div>
  )
}
