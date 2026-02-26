import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { IC } from '../lib/helpers'

export default function Layout() {
  const { followedZones } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { to: '/',          label: 'Inicio',    icon: IC.chart,    end: true },
    { to: '/zonas',     label: 'Zonas',     icon: IC.pin,      badge: followedZones.length },
    { to: '/especies',  label: 'Especies',  icon: IC.mushroom },
    { to: '/micologia', label: 'Micología', icon: IC.book },
    { to: '/perfil',    label: 'Perfil',    icon: IC.user },
  ]

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40">
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
                    isActive ? 'bg-[#d9cea1]/10 text-[#d9cea1]' : 'text-[#f4ebe1] hover:bg-white/[0.05]'
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
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-[#f4ebe1]/70 transition-colors">
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
                    isActive ? 'bg-[#d9cea1]/10 text-[#d9cea1]' : 'text-[#f4ebe1] hover:bg-white/[0.05]'
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
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
