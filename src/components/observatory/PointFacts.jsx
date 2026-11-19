import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Crosshair, TreeDeciduous } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { forestIcon, forestParts, soilParts } from '../../lib/habitat'
import { formatCoords } from '../../lib/observatoryView'
import { SCROLL_THIN } from './scrollStyles'

// Writes to the clipboard; where the async API is missing (an insecure page, an old browser) it falls back to a selected, off-screen textarea
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (_e) {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch (_e2) { return false }
  }
}

/**
 * What the point is, as a row of cards like the zone's conditions (icon, label, value): the comarca, the
 * coordinates, the altitude, the forest (the CREAF's classes around the point, or the ICGC's broad type where the
 *  server has no CREAF raster: `macro`) and the soil (acidity with its typical pH). The coordinates card is a button: it copies them to the clipboard and a toast says so for a few seconds. The cards are the same surface as the zone's other cards (`glass`), without their shadow. The cards without data are left
 * out, and the sources go under them. Each card is at least 150 px wide and they share the row; where they do not fit, the row scrolls sideways. The coordinates are the zone's title when there is no toponym, so they are not repeated.
 */
export function PointFacts({ point, toponym, elevation, habitat, macro = null, className = '' }) {
  const { t, lang } = useApp()
  const forest = forestParts(habitat, t)
  const soil = soilParts(habitat, t, lang)
  const mainIcon = forestIcon(forest[0]?.key)
  const [toast, setToast] = useState(null) // 'ok' | 'fail' while the toast shows
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copyCoords = async () => {
    const ok = await copyText(formatCoords(point))
    setToast(ok ? 'ok' : 'fail')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 2500)
  }

  const cards = [
    toponym?.comarca && { key: 'place', icon: 'location', label: t.obsFactPlace, lines: [{ text: toponym.comarca }] },
    toponym && { key: 'coords', node: <Crosshair size={36} strokeWidth={1.4} />, label: t.obsFactCoords, lines: [{ text: formatCoords(point) }], onClick: copyCoords },
    Number.isFinite(elevation) && { key: 'elevation', icon: 'mountain', label: t.obsFactElevation, lines: [{ text: `${Math.round(elevation)} m` }] },
    (forest.length > 0 || macro) && {
      key: 'forest',
      icon: mainIcon ? `forest-type-${mainIcon}` : null,
      node: mainIcon ? null : <TreeDeciduous size={36} strokeWidth={1.4} />,
      label: t.obsHabForest,
      lines: forest.length > 0 ? forest.map(p => ({ text: p.label, sub: `${p.pct} %` })) : [{ text: macro }],
    },
    soil.length > 0 && {
      key: 'soil',
      icon: 'soil',
      label: t.obsHabSoil,
      lines: soil.map(p => ({ text: p.label, sub: p.ph ? `pH ${p.ph}` : null })),
    },
  ].filter(Boolean)

  if (!cards.length) return null
  return (
    <div data-testid="zone-facts" className={`space-y-2 ${className}`}>
      <div className={`flex gap-3 overflow-x-auto -mx-4 px-4 scroll-px-4 lg:mx-0 lg:px-0 ${SCROLL_THIN}`}>
        {cards.map(c => {
          const Tag = c.onClick ? 'button' : 'div'
          return (
          <Tag
            key={c.key}
            data-testid={`fact-${c.key}`}
            {...(c.onClick ? { type: 'button', onClick: c.onClick, title: t.obsFactCoordsCopy, 'aria-label': `${t.obsFactCoords}: ${c.lines[0].text}. ${t.obsFactCoordsCopy}` } : {})}
            className={`glass rounded-xl py-2.5 px-3 sm:py-3 sm:px-0 text-center flex-[0_0_auto] sm:flex-[1_0_auto] sm:min-w-[170px] flex flex-col justify-center ${c.onClick ? 'cursor-pointer outline-none transition-colors hover:bg-white/[0.08] [[data-theme=light]_&]:hover:bg-white/75 focus-visible:ring-2 focus-visible:ring-cream/40' : ''}`}
          >
            <div className="h-[28px] sm:h-[36px] mb-1 flex items-center justify-center text-cream/70 [&_img]:h-full [&_img]:w-auto [&_svg]:h-full [&_svg]:w-auto" aria-hidden="true">
              {c.icon ? <img src={`/assets/images/icons/${c.icon}.png`} alt="" height="36" width="36" /> : c.node}
            </div>
            <div className="text-cream/70 text-[11px] mb-0.5 sm:mb-1">{c.label}</div>
            {c.lines.map((l, i) => (
              <div key={i} className="text-cream text-[12px] sm:text-xs font-semibold whitespace-nowrap">
                {l.text}{l.sub && <span className="font-normal text-cream/60"> {l.sub}</span>}
              </div>
            ))}
          </Tag>
          )
        })}
      </div>
      {toast && createPortal(
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 -translate-x-1/2 top-[calc(var(--header-h,5.5rem)-20px)] z-[200] inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-modal text-cream border border-cream/20 shadow-lg pointer-events-none"
        >
          {toast === 'ok' && <Check size={16} aria-hidden="true" />}
          {toast === 'ok' ? t.obsFactCoordsCopied : t.obsFactCoordsCopyFail}
        </div>,
        document.body,
      )}
    </div>
  )
}

/**
 * The row while the point's data is on its way: five cards shaped like the real ones (same width, same
 * icon, label and value rows; the forest and the soil with a second line) so that the facts replace them
 * all at once instead of appearing one by one and pushing everything down.
 */
export function PointFactsSkeleton({ className = '' }) {
  const lines = [1, 1, 1, 2, 2]
  return (
    <div data-testid="zone-facts-skeleton" aria-busy="true" className={className}>
      <div className={`flex gap-3 overflow-x-auto -mx-4 px-4 scroll-px-4 lg:mx-0 lg:px-0 ${SCROLL_THIN}`}>
        {lines.map((n, i) => (
          <div key={i} className="glass rounded-xl py-2.5 sm:py-3 px-0 w-[124px] flex-[0_0_auto] sm:flex-[1_0_auto] sm:w-auto sm:min-w-[170px] flex flex-col items-center justify-center">
            <div className="h-[28px] sm:h-[36px] mb-1 flex items-center justify-center"><div className="size-[28px] sm:size-[32px] rounded-full bg-white/10 animate-pulse" /></div>
            <div className="h-[11px] w-16 rounded bg-white/10 animate-pulse mb-1.5" />
            {Array.from({ length: n }, (_, j) => (
              <div key={j} className={`h-3 rounded bg-white/10 animate-pulse ${j ? 'mt-1.5 w-20' : 'w-28'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
