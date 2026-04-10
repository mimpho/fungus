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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

export function AuthModal({ initialTab = 'login', onClose }) {
  const { t, login, register, loginWithGoogle } = useApp()

  const [tab, setTab]           = useState(initialTab)  // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const emailRef = useRef(null)

  // Focus email on open
  useEffect(() => { emailRef.current?.focus() }, [])

  // Reset error when switching tabs or typing
  useEffect(() => { setError(null) }, [tab, email, password, firstName, lastName])

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleGoogleLogin() {
    if (!GOOGLE_CLIENT_ID || !window.google) return
    setError(null)
    setGoogleLoading(true)
    try {
      // Prompt Google One Tap / account chooser and get an ID token
      await new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            try {
              await loginWithGoogle(credential)
              resolve()
            } catch (err) {
              reject(err)
            }
          },
        })
        window.google.accounts.id.prompt(notification => {
          // If the user dismisses the prompt, reject so we reset loading state
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('dismissed'))
          }
        })
      })
      onClose()
    } catch (err) {
      if (err.message !== 'dismissed') {
        setError(translateApiError(err.message, t))
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await register(email, password, firstName, lastName, birthDate || undefined)
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

          {/* Extra fields — registro only */}
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted text-xs uppercase tracking-wide block mb-1.5">
                    {t.nombre ?? 'Nombre'}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                    placeholder="Maria"
                    className="w-full bg-white/[0.04] rounded-xl px-4 py-2.5 text-cream text-sm outline-none focus:ring-1 focus:ring-bar/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-muted text-xs uppercase tracking-wide block mb-1.5">
                    {t.apellidos ?? 'Apellidos'}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                    placeholder="García"
                    className="w-full bg-white/[0.04] rounded-xl px-4 py-2.5 text-cream text-sm outline-none focus:ring-1 focus:ring-bar/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-muted text-xs uppercase tracking-wide block mb-1.5">
                  {t.fechaNacimiento ?? 'Fecha de nacimiento'}
                  <span className="normal-case ml-1 opacity-50">({t.opcional ?? 'Opcional'})</span>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  autoComplete="bday"
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/[0.04] rounded-xl px-4 py-2.5 text-cream text-sm outline-none focus:ring-1 focus:ring-bar/50 transition-all"
                />
              </div>
            </>
          )}

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

        {/* Google sign-in — only shown if GIS script is loaded */}
        {GOOGLE_CLIENT_ID && window.google && (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-cream/30 text-xs">{t.o ?? 'o'}</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium bg-white/[0.06] hover:bg-white/[0.10] text-cream transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {/* Google SVG icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? '...' : (t.continuarConGoogle ?? 'Continuar con Google')}
            </button>
          </>
        )}

        {/* Auth gate context hint */}
        <p className="text-center text-cream/40 text-xs mt-4">
          {isLogin
            ? (t.authHintLogin ?? 'Necesitas cuenta para guardar tus zonas y especies favoritas')
            : (t.authHintRegister ?? 'Registro gratuito · Sin tarjeta de crédito')
          }
        </p>

        {/* Cookie notice */}
        <p className="text-center text-cream/25 text-xs mt-2">
          🔒 {t.cookieInfo ?? 'Al iniciar sesión guardamos una cookie segura para mantener tu sesión activa.'}
        </p>
      </div>
    </div>
  )
}
