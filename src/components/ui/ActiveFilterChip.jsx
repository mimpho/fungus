// color: 'amber' (default) | 'yellow' | 'emerald' | 'blue'
export function ActiveFilterChip({ label, emoji, color = 'amber', onRemove }) {
  const colors = {
    amber:   'bg-bar/15 text-coffee-light',
    yellow:  'ui-star-on',
    emerald: 'bg-accent-positive-subtle text-accent-positive',
    blue:    'ui-rain-on',
  }
  return (
    <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${colors[color] ?? colors.amber}`}>
      {emoji && <span>{emoji}</span>}
      {label}
      <button onClick={onRemove}
        className="hover:text-white -mr-1 p-1 rounded-full hover:bg-white/10 transition-all leading-none">
        ×
      </button>
    </span>
  )
}
