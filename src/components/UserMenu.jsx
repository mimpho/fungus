import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { IC } from '../lib/helpers'

// Avatar button on the right of the header, with a dropdown:
//   signed in  → Perfil · Generador de imágenes (admins only) · Cerrar sesión
//   guest      → Perfil · Iniciar sesión (opens AuthModal)
// Replaces the old Público/Admin toggle: admins reach the generator from here.

const ITEM_CLASS =
  'nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all'

function initialsOf(user) {
  if (!user) return null
  if (user.first_name && user.last_name) return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  if (user.first_name) return user.first_name[0].toUpperCase()
  return null
}

export default function UserMenu({ onOpen }) {
  const { t, user, isAuthenticated, logout, setAuthModal } = useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const menuId = useId()

  const isAdmin = user?.role === 'admin'
  const onUserPage = pathname === '/perfil' || pathname.startsWith('/admin')
  const initials = initialsOf(user)
  const label = t.userMenu ?? 'Menú de usuario'

  // Closes on navigation, outside press and Esc (focus goes back to the button).
  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return
    const onPointerDown = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = e => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // On open, focus the first item so the menu is usable from the keyboard.
  useEffect(() => {
    if (open) rootRef.current?.querySelector('[role="menuitem"]')?.focus()
  }, [open])

  const onMenuKeyDown = e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const items = [...rootRef.current.querySelectorAll('[role="menuitem"]')]
    if (!items.length) return
    e.preventDefault()
    const i = items.indexOf(document.activeElement)
    const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length
    items[next].focus()
  }

  const toggle = () => {
    if (!open) onOpen?.()
    setOpen(o => !o)
  }

  const handleLogin = () => {
    setOpen(false)
    setAuthModal('login')
  }

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      await logout()
      if (onUserPage) navigate('/')
    } finally {
      setSigningOut(false)
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={`nav-item flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200${onUserPage || open ? ' nav-item--active' : ''}`}>
        {initials
          ? <span className="font-display font-semibold text-sm">{initials}</span>
          : IC.user}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className="glass-olive-92 absolute right-0 top-full mt-2 w-60 p-1.5 rounded-xl border border-white/10 shadow-xl anim-up z-50">
          {isAuthenticated && user?.email && (
            <p className="px-3 py-2 text-xs text-cream/60 truncate border-b border-white/[0.06] mb-1" title={user.email}>
              {user.email}
            </p>
          )}

          <Link to="/perfil" role="menuitem" className={ITEM_CLASS}>
            {IC.user} {t.profile}
          </Link>

          {isAuthenticated && isAdmin && (
            <Link to="/admin/generator" role="menuitem" className={ITEM_CLASS}>
              {IC.wand} {t.imageGenerator ?? 'Generador de imágenes'}
            </Link>
          )}

          {isAuthenticated ? (
            <button type="button" role="menuitem" onClick={handleLogout} disabled={signingOut} className={`${ITEM_CLASS} disabled:opacity-60`}>
              {IC.logout} {t.cerrarSesion ?? 'Cerrar sesión'}
            </button>
          ) : (
            <button type="button" role="menuitem" onClick={handleLogin} className={ITEM_CLASS}>
              {IC.login} {t.iniciarSesion ?? 'Iniciar sesión'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
