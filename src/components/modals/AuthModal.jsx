// =====================================================
// AuthModal — modal de login / registro
// Se abre cuando el usuario intenta guardar favs o seguir zonas sin estar logado,
// o cuando hace clic en el botón de login del perfil.
// =====================================================
import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../contexts/AppContext'
import { IC } from '../../lib/helpers'
import { MODAL } from '../../lib/constants'
import { translateApiError } from '../../services/authService'

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
      setError(translateApiError(err.message, t))
    } finally {
      setLoading(false)
    }
  }

  const isLogin = tab === 'login'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-outer"
      style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative rounded-2xl w-full max-w-sm p-6 anim-scale" style={{ background: MODAL.bg }}>

        {/* Close — absolute para no empujar la imagen */}
        <button onClick={onClose} className="absolute top-4 right-4 text-cream/40 hover:text-cream transition-colors p-1">
          {IC.close}
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <img src="/assets/images/placeholder.png" alt="" className="h-20 w-20 object-contain opacity-70" />
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b border-white/[0.08]">
          {[['login', t.iniciarSesion ?? 'Iniciar sesión'], ['register', t.registrarse ?? 'Registrarse']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`pb-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                tab === key
                  ? 'text-cream border-bar'
                  : 'text-cream/40 border-transparent hover:text-cream/70'
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
