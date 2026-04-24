import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { IC } from '../lib/helpers'

export default function Layout() {
  const { followedZones, t, user, isAdminView } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
  useEffect(() => {
    if (!headerRef.current) return
    const ro = new ResizeObserver(entries => {
      const h = Math.ceil(entries[0].borderBoxSize?.[0]?.blockSize
                          ?? entries[0].contentRect.height)
      setHeaderH(h)
      headerHRef.current = h
      document.documentElement.style.setProperty('--header-h', `${h}px`)
    })
    ro.observe(headerRef.current)
    return () => ro.disconnect()
  }, [])

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

  const isAdmin = user?.role === 'admin'

  const userNavItems = [
    { to: '/',          label: t.dashboard,  icon: IC.chart,    end: true },
    { to: '/zonas',     label: t.zonas,      icon: IC.pin,      badge: followedZones.length },
    { to: '/especies',  label: t.especies,   icon: IC.mushroom },
    { to: '/micologia', label: t.micologia,  icon: IC.book },
  ]

  const adminNavItems = [
    { to: '/admin/generator', label: t.adminGenerator, icon: IC.wand },
    { to: '/admin/gallery',   label: t.adminGallery,   icon: IC.grid },
  ]

  const navItems = [
    ...(isAdmin && isAdminView ? adminNavItems : userNavItems),
    { to: '/perfil', label: t.profile, icon: IC.user },
  ]

  const headerContent = (
    <>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>
          <img src="/assets/images/logoFungus.png" alt="Fungus" className="h-16 w-auto object-contain logo-adaptive" />
        </NavLink>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon, end, badge }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `nav-item relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200${isActive ? ' nav-item--active' : ''}`}>
              {icon} {label}
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">{badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Hamburger button — mobile only */}
        <button
          onClick={() => setMobileMenuOpen(o => !o)}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 text-cream/70 transition-colors">
          {mobileMenuOpen
            ? IC.close
            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          }
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 flex flex-col gap-1 anim-up border-t border-white/[0.06]">
          {navItems.map(({ to, label, icon, end, badge }) => (
            <NavLink key={to} to={to} end={end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `nav-item relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all${isActive ? ' nav-item--active' : ''}`}>
              {icon} {label}
              {badge > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-emerald-500 text-white rounded-full text-xs font-bold">{badge}</span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </>
  )

  return (
    <div className="min-h-screen">
      {/* Spacer: always takes up the header height so content is not hidden beneath it.
          When the header is measured by ResizeObserver, the spacer adjusts automatically
          if the mobile menu expands it. */}
      <div style={{ height: headerH }} aria-hidden="true" />

      {/* Fixed header: transform is managed by the scroll handler.
          In Phase 1 it moves up with the content naturally. In Phase 2 it snaps up on scroll-up. */}
      <header
        ref={headerRef}
        className="glass-olive fixed top-0 left-0 right-0 z-40"
        style={{ transition: transitionRef.current, transform: `translateY(${headerTransform}px)` }}>
        {headerContent}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
