import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useIsPhone } from '../hooks/useIsPhone'
import { isIosApp, useFullscreen } from '../hooks/useImmersive'
import { lockScroll } from '../lib/scrollLock'
import { AccountItems, MENU_ROW } from './UserMenu'

const BUTTON_PX = 52
const SHADOW_PX = 16 // so that, scrolled away, not even its shadow shows

/**
 * The header's replacement where there is no header (installed app, fullscreen): one floating button at the
 * top right with the sections and the account's entries. On a phone the menu takes the whole screen, as under the
 * header, and the button turns into its cross; wider, it is a card under the button. `raised`: above the fullscreen map (z-150) and still
 * under the dialogs (z-200).
 * `scroll` (`{ offset, over, transition }`, Layout's header movement): the button leaves with the page and comes back on
 * the way up. In its own place at the top it is a bare icon; the round button is for when it lies over content.
 * Without `scroll` (the map) it is always the round button, in place. `onReach(px)`: how far down it comes.
 */
export default function FloatingMenu({ navItems, raised = false, scroll = null, onReach = null }) {
  const { t } = useApp()
  const { pathname } = useLocation()
  const phone = useIsPhone()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const panelId = useId()

  // Phone in fullscreen (the map's, or on any page: the app's or the browser's): the button goes 16px from the top, whatever the safe area. On the
  // map it then sits above the search, which keeps the whole width and starts 76px or more from the top (16 + 52 of the
  // button + 8, see fullscreenTop in pages/Observatory.jsx). Not in the iPhone's installed app: its status icons stay on top
  const fullscreen = useFullscreen()
  const inStrip = (raised || fullscreen) && phone && !isIosApp()

  // For the pages' own fixed bars (the sticky search). With the button in the strip they go below it, at the same height
  // as the map's search in fullscreen (fullscreenTop), with the whole width; otherwise level with it, stopping before it
  useEffect(() => {
    const root = document.documentElement.style
    root.setProperty('--float-menu-reserve', inStrip ? '0px' : phone ? '76px' : '92px')
    root.setProperty('--float-menu-top', inStrip ? 'max(calc(var(--safe-top) + 12px), 76px)' : `calc(var(--safe-top) + ${phone ? 12 : 16}px)`)
    return () => {
      root.removeProperty('--float-menu-reserve')
      root.removeProperty('--float-menu-top')
    }
  }, [phone, inStrip])

  const reachRef = useRef(onReach)
  reachRef.current = onReach
  useEffect(() => {
    if (rootRef.current) reachRef.current?.(rootRef.current.offsetTop + BUTTON_PX + SHADOW_PX)
  }, [phone, inStrip])

  const bare = Boolean(scroll) && !scroll.over
  const offset = scroll && !open ? scroll.offset : 0

  // Closes on navigation, outside press and Esc (focus goes back to the button).
  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = e => {
      if (rootRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return
      setOpen(false)
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

  // On the phone the menu covers the page, which must not scroll behind it
  useEffect(() => (open && phone ? lockScroll() : undefined), [open, phone])

  const label = open ? t.menuClose : t.menuOpen
  // No circle in its own place at the top of a page, nor over the phone's full-screen menu (its cross, as in the header)
  const plain = open ? phone : bare

  const entries = (
    <>
      <nav className="shrink-0 flex flex-col gap-1">
        {navItems.map(({ to, label: text, icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
            className={({ isActive }) => `${MENU_ROW}${isActive ? ' nav-item--active' : ''}`}>
            {icon} {text}
          </NavLink>
        ))}
      </nav>
      <div role="menu" aria-label={t.userMenu} className="shrink-0 flex flex-col gap-1 mt-1 pt-2 border-t border-cream/15">
        <AccountItems rows onDone={() => setOpen(false)} />
      </div>
    </>
  )

  return (
    <>
    {/* The phone's menu, outside the button's box: that one is transformed, which would keep a fixed child inside it.
        Before it in the page, so the button (its cross) stays on top. The entries start under the button */}
    {open && phone && (
      <div
        ref={panelRef}
        id={panelId}
        className={`glass-olive-92 fixed inset-0 ${raised ? 'z-[160]' : 'z-40'} overflow-y-auto overscroll-contain px-4 pb-[max(12px,var(--safe-bottom))] flex flex-col gap-1 [animation:animUpOpacity_0.2s_ease_both] motion-reduce:[animation:none]`}
        style={{ paddingTop: inStrip ? 'max(80px, calc(var(--safe-top) + 12px))' : 'calc(var(--safe-top) + 76px)' }}>
        {entries}
      </div>
    )}
    <div
      ref={rootRef}
      // Bare, it goes under the iPhone's status strip (z-30) as it leaves; open, its panel is over everything of the page
      className={`fixed ${raised ? 'z-[160]' : bare && !open ? 'z-20' : 'z-40'}`}
      // Phone: in the strip above the map's search, or level with the search where there is no strip. Desktop: centred over the map's tabs.
      style={{
        ...(phone
          ? { top: inStrip ? 16 : 'calc(var(--safe-top) + 12px)', right: 'max(12px, calc(env(safe-area-inset-right, 0px) + 12px))' }
          : { top: 'calc(var(--safe-top) + 16px)', right: 28 }),
        transform: `translateY(${offset}px)`,
        transition: scroll?.transition,
      }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={`w-[52px] h-[52px] rounded-full ${plain ? 'hover:bg-white/10' : 'map-surface shadow-float hover:brightness-110'} flex items-center justify-center text-cream outline-none focus-visible:ring-2 focus-visible:ring-cream/50`}>
        {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      {open && !phone && (
        <div
          id={panelId}
          className="map-surface shadow-float absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-24px)] max-h-[calc(100dvh-96px-var(--safe-top)-var(--safe-bottom))] overflow-y-auto p-1.5 rounded-2xl flex flex-col gap-1 anim-up">
          {entries}
        </div>
      )}
    </div>
    </>
  )
}
