// size: 'sm' | 'md' | 'lg'
// variant: 'default' | 'compact'
export function Tabs({ options, selected, onChange, size = 'md', variant = 'default' }) {
  const sizeClasses = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' }
  const containerClasses = variant === 'compact'
    ? 'flex gap-1'
    : 'flex bg-white/[0.04] rounded-xl p-1 gap-1'
  const btnBase     = 'rounded-lg font-medium transition-all'
  const btnActive   = variant === 'compact' ? 'bg-bar/90 text-white shadow-md' : 'bg-bar text-white shadow-sm'
  const btnInactive = variant === 'compact' ? 'text-cream/55 hover:text-cream hover:bg-white/[0.08]' : 'text-cream/60 hover:text-cream'

  return (
    <div className={containerClasses}>
      {options.map(opt => (
        <button key={opt.id} onClick={() => onChange(opt.id)}
          className={`${btnBase} ${sizeClasses[size]} ${selected === opt.id ? btnActive : btnInactive}`}>
          {opt.icon && <span className="mr-1.5">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  )
}
