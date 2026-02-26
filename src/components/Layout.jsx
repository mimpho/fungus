import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'

const navItems = [
  { to: '/',          label: 'Inicio',    emoji: '🏠', end: true },
  { to: '/zonas',     label: 'Zonas',     emoji: '🗺️' },
  { to: '/especies',  label: 'Especies',  emoji: '🍄' },
  { to: '/micologia', label: 'Micología', emoji: '📖' },
  { to: '/perfil',    label: 'Perfil',    emoji: '👤' },
]

export default function Layout() {
  useApp() // asegura que el contexto esté disponible en el árbol

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/">
            <img src="/assets/images/logoFungus.png" alt="Fungus" className="h-16 w-auto object-contain" />
          </NavLink>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive ? 'bg-[#d9cea1]/10 text-[#d9cea1]' : 'text-[#f4ebe1] hover:bg-white/[0.05]'
                  }`
                }>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/[0.06]">
        <div className="flex items-stretch">
          {navItems.map(({ to, label, emoji, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-all ${
                  isActive ? 'text-[#c4a06b]' : 'text-[#f4ebe1]/40'
                }`
              }>
              <span className="text-xl leading-none">{emoji}</span>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
