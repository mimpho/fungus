import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useIsPhone } from '../hooks/useIsPhone'
import { isIosApp } from '../hooks/useImmersive'
import { AccountItems, MENU_ROW } from './UserMenu'

/**
 * The header's replacement where there is no header (installed app, fullscreen): one floating button at the
 * top right with the sections and the account's entries. `raised`: above the fullscreen map (z-150) and still
 * under the dialogs (z-200).
 */
export default function FloatingMenu({ navItems, raised = false }) {
  const { t } = useApp()
  const { pathname } = useLocation()
  const phone = useIsPhone()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const panelId = useId()

  // For the pages' own fixed bars (the sticky search): where to stop and how high to sit to be level with the button
  useEffect(() => {
    const root = document.documentElement.style
    root.setProperty('--float-menu-reserve', phone ? '76px' : '92px')
    root.setProperty('--float-menu-top', `calc(var(--safe-top) + ${phone ? 12 : 16}px)`)
    return () => {
      root.removeProperty('--float-menu-reserve')
      root.removeProperty('--float-menu-top')
    }
  }, [phone])

  // Closes on navigation, outside press and Esc (focus goes back to the button).
  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    // Capture on window: this Esc closes the menu only, not also what is under it (the map's fullscreen)
    const onKeyDown = e => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [open])

  const label = open ? t.menuClose : t.menuOpen
  // Phone, map in fullscreen: the button sits above the search, 16px from the top, and the search keeps the whole width:
  // it starts 76px or more from the top (16 + 52 of the button + 8, see fullscreenTop in pages/Observatory.jsx).
  // Not in the iPhone's installed app: its status icons stay on top, so that strip is taken
  const inStrip = raised && phone && !isIosApp()

  return (
    <div
      ref={rootRef}
      className={`fixed ${raised ? 'z-[160]' : 'z-40'}`}
      // Phone: in the strip above the map's search, or level with the search where there is no strip. Desktop: centred over the map's tabs.
      style={phone
        ? { top: inStrip ? 16 : 'calc(var(--safe-top) + 12px)', right: 'max(12px, calc(env(safe-area-inset-right, 0px) + 12px))' }
        : { top: 'calc(var(--safe-top) + 16px)', right: 28 }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="w-[52px] h-[52px] rounded-full map-surface shadow-float flex items-center justify-center text-cream hover:brightness-110 outline-none focus-visible:ring-2 focus-visible:ring-cream/50">
        {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      {open && (
        <div
          id={panelId}
          className="map-surface shadow-float absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-24px)] max-h-[calc(100dvh-96px-var(--safe-top)-var(--safe-bottom))] overflow-y-auto p-1.5 rounded-2xl anim-up">
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, label: text, icon, end }) => (
              <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
                className={({ isActive }) => `${MENU_ROW}${isActive ? ' nav-item--active' : ''}`}>
                {icon} {text}
              </NavLink>
            ))}
          </nav>
          <div role="menu" aria-label={t.userMenu} className="flex flex-col gap-1 mt-1 pt-2 border-t border-cream/15">
            <AccountItems rows onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
