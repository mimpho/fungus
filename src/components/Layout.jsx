import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { IC } from '../lib/helpers'

export default function Layout() {
  const { followedZones, t } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ── Header fixed + spacer ──────────────────────────────────────────────────
  // Fase 1 (scroll ≤ headerH): header sube con el contenido de forma natural
  //   → translateY(-scrollY), sin transición CSS (sigue el scroll en tiempo real)
  // Fase 2 (scroll > headerH):
  //   - Scroll up  → se pone sticky: translateY(0) con transición suave
  //   - Scroll down → permanece oculto (no se actualiza el transform)
  // Al volver a Fase 1 haciendo scroll up: se mantiene visible hasta que
  // el scroll natural lo recupere (Math.max evita el salto brusco).
  const headerRef          = useRef(null)
  const headerHRef         = useRef(88)        // altura del header (para el handler, sin stale closure)
  const headerTransformRef = useRef(0)         // transform actual en px (idem)
  const transitionRef      = useRef('none')    // 'none' en scroll natural, animado al snappear
  const [headerH,         setHeaderH]         = useState(0)
  const [headerTransform, setHeaderTransform] = useState(0)

  // Medir altura del header con ResizeObserver.
  // También publica --header-h como CSS variable (disponible para cualquier componente hijo).
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

  // Scroll handler: dos fases
  useEffect(() => {
    let lastY       = window.scrollY
    let inputActive = false

    const onFocusIn  = e => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') inputActive = true }
    const onFocusOut = e => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') inputActive = false }

    const handler = () => {
      const y = window.scrollY
      const h = headerHRef.current

      // ── Fase 1: scroll dentro del rango del header ─────────────────────────
      // El header sube con el contenido (translateY = -scrollY).
      // Al bajar: posición natural. Al subir: se mantiene visible hasta que
      // la posición natural lo alcance (evita salto al volver de Fase 2).
      if (y <= h) {
        const naturalT = -y
        const delta1   = y - lastY
        const newT     = delta1 >= 0
          ? naturalT                                          // bajando → natural
          : Math.max(naturalT, headerTransformRef.current)   // subiendo → mantener visible
        transitionRef.current      = 'none'
        headerTransformRef.current = newT
        setHeaderTransform(newT)
        lastY = y
        return
      }

      // ── Fase 2: más allá del header ─────────────────────────────────────────
      const delta = y - lastY
      if (Math.abs(delta) < 4) return
      if (inputActive) { lastY = y; return }
      lastY = y

      if (delta < 0) {
        // Scroll up → snappear sticky con animación
        transitionRef.current      = 'transform 0.25s ease'
        headerTransformRef.current = 0
        setHeaderTransform(0)
      } else {
        // Scroll down → ocultar (puede que estuviera visible por snap previo)
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

  const navItems = [
    { to: '/',          label: t.dashboard,  icon: IC.chart,    end: true },
    { to: '/zonas',     label: t.zonas,      icon: IC.pin,      badge: followedZones.length },
    { to: '/especies',  label: t.especies,   icon: IC.mushroom },
    { to: '/micologia', label: t.micologia,  icon: IC.book },
    { to: '/perfil',    label: t.profile,    icon: IC.user },
  ]

  const headerContent = (
    <>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>
          <img src="/assets/images/logoFungus.png" alt="Fungus" className="h-16 w-auto object-contain" />
        </NavLink>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon, end, badge }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-[#d9cea1]/10 text-[#d9cea1]' : 'text-cream hover:bg-white/[0.05]'
                }`
              }>
              {icon} {label}
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">{badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Botón hamburguesa — solo mobile */}
        <button
          onClick={() => setMobileMenuOpen(o => !o)}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 text-cream/70 transition-colors">
          {mobileMenuOpen
            ? IC.close
            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          }
        </button>
      </div>

      {/* Menú desplegable mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 flex flex-col gap-1 anim-up border-t border-white/[0.06]">
          {navItems.map(({ to, label, icon, end, badge }) => (
            <NavLink key={to} to={to} end={end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-[#d9cea1]/10 text-[#d9cea1]' : 'text-cream hover:bg-white/[0.05]'
                }`
              }>
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
      {/* Spacer: siempre ocupa la altura del header para que el contenido
          no quede tapado. Al medir el header con ResizeObserver, el spacer
          se ajusta automáticamente si el menú mobile lo alarga. */}
      <div style={{ height: headerH }} aria-hidden="true" />

      {/* Header fixed: el transform lo gestiona el scroll handler.
          En Fase 1 sube con el contenido (natural). En Fase 2 snappea arriba al subir. */}
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
