/**
 * Select of the Observatory: no border, soft fill, and the chevron placed inside on the right
 * (the native arrow is hidden). `className` goes on the wrapper, so the caller decides its width.
 */
export function ObsSelect({ id, value, onChange, children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="appearance-none w-full pl-3 pr-9 py-2 rounded-xl bg-cream/[0.08] hover:bg-cream/[0.12] text-base md:text-sm text-cream outline-none focus-visible:ring-2 focus-visible:ring-cream/30 cursor-pointer transition-colors [&>option]:bg-modal [&>option]:text-cream"
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cream/50"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
