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

  const emailRef      = useRef(null)
  const googleBtnRef  = useRef(null)
  const googleInitRef = useRef(false)   // guard against StrictMode double-invoke

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

  // Render Google's button using renderButton() (FedCM-compatible).
  //
  // IMPORTANT — why no overlay:
  // In FedCM mode (production) Chrome renders the button as a cross-origin
  // <iframe allow="identity-credentials-get">. Chrome's anti-clickjacking
  // protection blocks pointer events on iframes whose ancestor has opacity: 0,
  // so the invisible-overlay pattern silently breaks. The button must be
  // genuinely visible to the user for FedCM clicks to register.
  //
  // We use theme="filled_black" so the button blends naturally with our dark UI.
  //
  // Timing: GIS script loads with `async defer` so window.google may not be
  // ready when the modal mounts. We handle both cases:
  //   a) window.google already available → initialize + renderButton immediately
  //   b) window.google not yet available → wait for the script's load event
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    function initGoogle() {
      if (!window.google?.accounts?.id) return
      const container = googleBtnRef.current
      if (!container || googleInitRef.current) return
      googleInitRef.current = true

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          setError(null)
          setGoogleLoading(true)
          try {
            await loginWithGoogle(credential)
            onClose()
          } catch (err) {
            setError(translateApiError(err.message, t))
          } finally {
            setGoogleLoading(false)
          }
        },
      })

      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        size: 'large',
        text: 'continue_with',
        theme: 'filled_black',
        shape: 'rectangular',
        width: container.offsetWidth || 320,
      })
    }

    if (window.google?.accounts?.id) {
      initGoogle()
    } else {
      const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]')
      if (script) {
        script.addEventListener('load', initGoogle, { once: true })
        return () => script.removeEventListener('load', initGoogle)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

        {/* Google sign-in — shown whenever client ID is configured.
            The button is rendered natively by GIS (renderButton) so it is
            genuinely visible. Chrome's FedCM anti-clickjacking protection
            blocks clicks on opacity-0 iframes, so an invisible overlay does
            not work in production. theme="filled_black" matches our dark UI. */}
        {GOOGLE_CLIENT_ID && (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-cream/30 text-xs">{t.o ?? 'o'}</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            <div
              ref={googleBtnRef}
              className={`w-full flex justify-center rounded-xl overflow-hidden transition-opacity ${googleLoading ? 'opacity-50 pointer-events-none' : ''}`}
            />
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
