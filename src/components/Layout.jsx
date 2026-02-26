import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/',         label: 'Dashboard',  end: true },
  { to: '/zonas',    label: 'Zonas'  },
  { to: '/especies', label: 'Especies' },
  { to: '/micologia',label: 'Micología' },
  { to: '/perfil',   label: 'Perfil' },
]

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/assets/images/logoFungus.png" alt="Fungus" className="h-16 w-auto object-contain" />
          </NavLink>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#d9cea1]/10 text-[#d9cea1] shadow-inner'
                      : 'text-[#f4ebe1] hover:bg-white/[0.05]'
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
    </div>
  )
}
