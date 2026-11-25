import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { IC } from '../lib/helpers'
import UserMenu, { AccountItems, MENU_ROW } from './UserMenu'
import FloatingMenu from './FloatingMenu'
import { isIosApp, useFullscreen, useImmersive } from '../hooks/useImmersive'
import { useIsPhone } from '../hooks/useIsPhone'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { lockScroll } from '../lib/scrollLock'
import { CreditsModal } from './CreditsModal'

export default function Layout() {
  const { t, setCreditsOpen, isAuthenticated, authLoading } = useApp()
  // The Observatory's map is the page: edge to edge under the header, without the site's wrapper or footer.
  // (Logged out, the page is the login card, which keeps the normal layout.)
  const { pathname } = useLocation()
  const fullBleed = pathname === '/observatorio' && isAuthenticated && !authLoading
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Installed app, browser fullscreen or the map's own fullscreen (the only one iPhone Safari has): no header,
  // just the floating menu button. The Observatory reports its map's fullscreen and zone layer through the Outlet.
  const immersive = useImmersive()
  const [mapState, setMapState] = useState({ fullscreen: false, covered: false })
  const noHeader = immersive || mapState.fullscreen
  // A phone in fullscreen gains the top of the screen, with the camera in the middle of it: what reaches the middle
  // (a search, a title) stays below the safe area, and the page starts higher than under a header's margin
  const phone = useIsPhone()
  const fullscreen = useFullscreen()
  const underCamera = phone && fullscreen && !isIosApp()
  // `viewport-fit=cover` makes the safe-area insets real: on the Observatory (its tab bar runs down to the screen's
  // edge) and wherever there is no header, where every page handles them. One owner, so no page undoes another's.
  const coverViewport = noHeader || pathname === '/observatorio'
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]')
    // In the installed app index.html has already set it, for the first paint
    if (!meta || !coverViewport || meta.getAttribute('content').includes('viewport-fit')) return undefined
    const previous = meta.getAttribute('content')
    meta.setAttribute('content', `${previous}, viewport-fit=cover`)
    return () => meta.setAttribute('content', previous)
  }, [coverViewport])
  useEffect(() => {
    document.documentElement.classList.toggle('no-header', noHeader)
    document.documentElement.classList.toggle('ios-app', isIosApp())
    return () => document.documentElement.classList.remove('no-header')
  }, [noHeader])
  // The mobile menu is a fixed panel over the page, from under the header to the bottom. While it is open the
  // header stays whole at the top and the page behind does not scroll. It closes on Esc, and when the window
  // widens or the header goes away.
  const wideNav = useMediaQuery('(min-width: 768px)')
  useEffect(() => { if (wideNav || noHeader) setMobileMenuOpen(false) }, [wideNav, noHeader])
  useEffect(() => {
    if (!mobileMenuOpen) return undefined
    const unlock = lockScroll()
    // Capture: this Esc closes the menu only, not also what the page under it listens for
    const onKey = e => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      unlock()
      window.removeEventListener('keydown', onKey, true)
    }
  }, [mobileMenuOpen])

  // ── Header fixed + spacer ──────────────────────────────────────────────────
  // Phase 1 (scroll ≤ headerH): header scrolls up naturally with the content
  //   → translateY(-scrollY), no CSS transition (follows scroll in real time)
  // Phase 2 (scroll > headerH):
  //   - Scroll up   → snaps sticky: translateY(0) with smooth transition
  //   - Scroll down → stays hidden (transform not updated)
  // Returning to Phase 1 by scrolling up: stays visible until the natural
  // position catches up (Math.max prevents the abrupt jump).
  const headerRef          = useRef(null)
  const headerHRef         = useRef(88)        // header height (for handler, avoids stale closure)
  const headerTransformRef = useRef(0)         // current transform in px (same reason)
  const transitionRef      = useRef('none')    // 'none' during natural scroll, animated when snapping
  const [headerH,         setHeaderH]         = useState(0)
  const [headerTransform, setHeaderTransform] = useState(0)

  // Measure header height with ResizeObserver.
  // Also publishes --header-h as a CSS variable (available to any child component).
  // Without a header the variable goes away, so its readers use their fallback (the zone's own header keeps its height).
  useEffect(() => {
    if (noHeader || !headerRef.current) {
      setHeaderH(0)
      document.documentElement.style.removeProperty('--header-h')
      return undefined
    }
    const ro = new ResizeObserver(entries => {
      const h = Math.ceil(entries[0].borderBoxSize?.[0]?.blockSize
                          ?? entries[0].contentRect.height)
      setHeaderH(h)
      headerHRef.current = h
      document.documentElement.style.setProperty('--header-h', `${h}px`)
    })
    ro.observe(headerRef.current)
    return () => ro.disconnect()
  }, [noHeader])

  // Scroll handler: two phases
  useEffect(() => {
    let lastY       = window.scrollY
    let inputActive = false

    const onFocusIn  = e => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') inputActive = true }
    const onFocusOut = e => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') inputActive = false }

    const handler = () => {
      const y = window.scrollY
      const h = headerHRef.current

      // ── Phase 1: scroll within header range ────────────────────────────────
      // Header moves up with content (translateY = -scrollY).
      // Scrolling down: natural position. Scrolling up: stays visible until
      // the natural position catches up (avoids jump when returning from Phase 2).
      if (y <= h) {
        const naturalT = -y
        const delta1   = y - lastY
        const newT     = delta1 >= 0
          ? naturalT                                          // scrolling down → natural
          : Math.max(naturalT, headerTransformRef.current)   // scrolling up → keep visible
        transitionRef.current      = 'none'
        headerTransformRef.current = newT
        setHeaderTransform(newT)
        lastY = y
        return
      }

      // ── Phase 2: beyond the header ──────────────────────────────────────────
      const delta = y - lastY
      if (Math.abs(delta) < 4) return
      if (inputActive) { lastY = y; return }
      lastY = y

      if (delta < 0) {
        // Scroll up → snap sticky with animation
        transitionRef.current      = 'transform 0.25s ease'
        headerTransformRef.current = 0
        setHeaderTransform(0)
      } else {
        // Scroll down → hide (may have been visible from a previous snap)
        if (headerTransformRef.current !== -h) {
          transitionRef.current      = 'transform 0.25s ease'
          headerTransformRef.current = -h
          setHeaderTransform(-h)
        }
      }
    }

    window.addEventListener('scroll',    handler,    { passive: true })
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      window.removeEventListener('scroll',    handler)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  // Four sections (Zonas is deprecated: its page stays reachable, but it is not in the row). Perfil lives in the avatar menu (UserMenu), not in this row.
  const navItems = [
    { to: '/',            label: t.dashboard,  icon: IC.chart,       end: true },
    { to: '/observatorio', label: t.obsTitle,  icon: IC.observatory },
    { to: '/especies',    label: t.especies,   icon: IC.mushroom },
    { to: '/micologia',   label: t.micologia,  icon: IC.book },
  ]

  const headerContent = (
    <>
      <div className={`${fullBleed ? 'w-full' : 'max-w-7xl mx-auto'} px-4 py-3 flex items-center`}>
        {/* Logo */}
        <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>
          <img src="/assets/images/logoFungus.png" alt="Fungus" className="h-16 w-auto object-contain logo-adaptive" />
        </NavLink>

        {/* Nav desktop: icons only between md and lg (aria-label + title), icon and text from lg */}
        <nav className="hidden md:flex items-center gap-1 ml-auto mr-3">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} aria-label={label} title={label}
              className={({ isActive }) => `nav-item relative flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200${isActive ? ' nav-item--active' : ''}`}>
              {icon} <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Avatar menu (from md up) or hamburger (mobile, whose menu holds the account's entries too) */}
        <div className="ml-auto md:ml-0 flex items-center gap-1">
          <div className="hidden md:block">
            <UserMenu onOpen={() => setMobileMenuOpen(false)} />
          </div>
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label={mobileMenuOpen ? t.menuClose : t.menuOpen}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-cream/70 transition-colors">
            {mobileMenuOpen
              ? IC.close
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            }
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen">
      {/* Spacer: always takes up the header height so content is not hidden beneath it.
          When the header is measured by ResizeObserver, the spacer adjusts automatically
          if the mobile menu expands it. */}
      {!noHeader && <div style={{ height: headerH }} aria-hidden="true" />}
      {/* Without a header, outside a phone's fullscreen: the page keeps its margin below the safe area, and what scrolls goes
          behind a strip on the iPhone's app. The map runs under the status bar */}
      {noHeader && !fullBleed && (
        <>
          {!underCamera && <div style={{ height: 'var(--safe-top)' }} aria-hidden="true" />}
          <div className="status-strip fixed top-0 inset-x-0 z-30" aria-hidden="true" />
        </>
      )}

      {noHeader ? (
        // Not under the observed zone's layer: its close cross is in the same corner
        !(mapState.fullscreen && mapState.covered) && <FloatingMenu navItems={navItems} raised={mapState.fullscreen} />
      ) : (
        /* Fixed header: transform is managed by the scroll handler.
           In Phase 1 it moves up with the content naturally. In Phase 2 it snaps up on scroll-up. */
        <header
          ref={headerRef}
          className="glass-olive fixed top-0 left-0 right-0 z-40"
          style={{ transition: transitionRef.current, transform: `translateY(${mobileMenuOpen ? 0 : headerTransform}px)` }}>
          {headerContent}
        </header>
      )}

      {/* Mobile menu: outside the header, so it neither grows it (and its spacer) nor moves the page */}
      {!noHeader && mobileMenuOpen && (
        <div
          className="md:hidden glass-olive-92 fixed inset-x-0 bottom-0 z-40 overflow-y-auto overscroll-contain border-t border-white/[0.06] px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] flex flex-col gap-1 [animation:animUpOpacity_0.2s_ease_both] motion-reduce:[animation:none]"
          style={{ top: headerH }}>
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `${MENU_ROW}${isActive ? ' nav-item--active' : ''}`}>
              {icon} {label}
            </NavLink>
          ))}
          <div role="menu" aria-label={t.userMenu} className="shrink-0 flex flex-col gap-1 mt-1 pt-2 border-t border-cream/15">
            <AccountItems rows onDone={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* A phone's fullscreen: the page starts just below the safe area, never closer than 28px */}
      <main className={fullBleed ? undefined : `max-w-7xl mx-auto px-4 ${underCamera ? 'pb-8 pt-[max(calc(var(--safe-top)+8px),28px)]' : 'py-8'}`}>
        <Outlet context={{ noHeader, setMapState }} />
      </main>

      {!fullBleed && (
        <footer className="max-w-7xl mx-auto px-4 pb-[calc(1.5rem+var(--safe-bottom))] text-center">
          <button type="button" onClick={() => setCreditsOpen(true)}
            className="text-xs text-cream/50 underline underline-offset-2 hover:text-cream transition-colors">
            {t.creditsLink}
          </button>
        </footer>
      )}
      <CreditsModal />
    </div>
  )
}
