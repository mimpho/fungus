// =====================================================
// AuthModal — modal de login / registro
// Se abre cuando el usuario intenta guardar favs o seguir zonas sin estar logado,
// o cuando hace clic en el botón de login del perfil.
// =====================================================
import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../contexts/AppContext'
import { IC } from '../../lib/helpers'

export function AuthModal({ initialTab = 'login', onClose }) {
  const { t, login, register } = useApp()

  const [tab, setTab]           = useState(initialTab)  // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const emailRef = useRef(null)

  // Focus email on open
  useEffect(() => { emailRef.current?.focus() }, [])

  // Reset error when switching tabs or typing
  useEffect(() => { setError(null) }, [tab, email, password])

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
      }
      onClose()
    } catch (err) {
      setError(err.message || (tab === 'login' ? 'Error al iniciar sesión' : 'Error al registrarse'))
    } finally {
      setLoading(false)
    }
  }

  const isLogin = tab === 'login'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass-warm rounded-2xl w-full max-w-sm p-6 anim-scale">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-2xl">🍄</span>
          <button onClick={onClose} className="text-cream/40 hover:text-cream transition-colors p-1">
            {IC.x}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/[0.04] rounded-xl p-1">
          {[['login', t.iniciarSesion ?? 'Iniciar sesión'], ['register', t.registrarse ?? 'Registrarse']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-bar text-white'
                  : 'text-cream/60 hover:text-cream'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-muted text-xs uppercase tracking-wide block mb-1.5">
              Email
            </label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="hola@ejemplo.com"
              className="w-full bg-white/[0.04] rounded-xl px-4 py-2.5 text-cream text-sm outline-none focus:ring-1 focus:ring-bar/50 transition-all"
            />
          </div>

          <div>
            <label className="text-muted text-xs uppercase tracking-wide block mb-1.5">
              {t.contrasena ?? 'Contraseña'}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              placeholder={isLogin ? '••••••••' : t.minPass ?? 'Mínimo 8 caracteres'}
              className="w-full bg-white/[0.04] rounded-xl px-4 py-2.5 text-cream text-sm outline-none focus:ring-1 focus:ring-bar/50 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium bg-bar hover:bg-[#a0834d] text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? '...'
              : isLogin
                ? (t.iniciarSesion ?? 'Iniciar sesión')
                : (t.registrarse ?? 'Registrarse')
            }
          </button>
        </form>

        {/* Auth gate context hint */}
        <p className="text-center text-cream/40 text-xs mt-4">
          {isLogin
            ? (t.authHintLogin ?? 'Necesitas cuenta para guardar tus zonas y especies favoritas')
            : (t.authHintRegister ?? 'Registro gratuito · Sin tarjeta de crédito')
          }
        </p>
      </div>
    </div>
  )
}
