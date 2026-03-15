import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { IC } from '../lib/helpers'

export default function Layout() {
  const { followedZones, t } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ── Header fixed + spacer ──────────────────────────────────────────────────
  // El header es siempre `position: fixed`. Un spacer en el flujo normal
  // reserva su altura para que el contenido no quede tapado.
  // En y≈0 el header coincide visualmente con el spacer → parece parte del flujo.
  // Al scrollear down desaparece (translateY(-100%)), al subir reaparece.
  const headerRef  = useRef(null)
  const [headerH,  setHeaderH]  = useState(0)     // altura medida del header
  const [headerVisible, setHeaderVisible] = useState(true)

  // Medir altura del header con ResizeObserver (cambia si el menú mobile se abre)
  useEffect(() => {
    if (!headerRef.current) return
    const ro = new ResizeObserver(entries => {
      setHeaderH(Math.ceil(entries[0].borderBoxSize?.[0]?.blockSize
                           ?? entries[0].contentRect.height))
    })
    ro.observe(headerRef.current)
    return () => ro.disconnect()
  }, [])

  // Scroll handler: hide on scroll down, show on scroll up, always visible near top.
  useEffect(() => {
    let lastY       = window.scrollY
    let inputActive = false

    const onFocusIn  = e => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') inputActive = true }
    const onFocusOut = e => { if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') inputActive = false }

    const NEAR_TOP = 80  // px — dentro de este rango el header siempre es visible

    const handler = () => {
      const y = window.scrollY

      // Cerca del top: siempre visible, sin importar guards
      if (y < NEAR_TOP) { lastY = y; setHeaderVisible(true); return }

      // Guard: el usuario está escribiendo en un input → filtrar resultados
      // puede acortar la página y generar un scroll event falso
      if (inputActive) { lastY = y; return }

      const delta = y - lastY
      if (Math.abs(delta) < 4) return
      lastY = y

      setHeaderVisible(delta < 0)  // scroll up → show, scroll down → hide
    }

    window.addEventListener('scroll',     handler,    { passive: true })
    document.addEventListener('focusin',  onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      window.removeEventListener('scroll',     handler)
      document.removeEventListener('focusin',  onFocusIn)
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

      {/* Header fixed: siempre en el top del viewport.
          translateY(-100%) lo saca de vista sin afectar el layout
          (el spacer mantiene el espacio reservado). */}
      <header
        ref={headerRef}
        className="glass-olive fixed top-0 left-0 right-0 z-40"
        style={{ transition: 'transform 0.25s ease', transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)' }}>
        {headerContent}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
