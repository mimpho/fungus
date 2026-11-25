/**
 * ResetPassword — landing page for the password-recovery link.
 *
 * Route: /restablecer-contrasena?token=<token>
 * The person picks a new password; on success they are sent to the login (the server does not
 * sign them in).
 */
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { apiResetPassword, translateApiError } from '../services/authService'

const MIN_LENGTH = 8
const STATE = { FORM: 'form', SUCCESS: 'success', INVALID: 'invalid' }

function IconCheck() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-14 h-14 mx-auto mb-6">
      <circle cx="28" cy="28" r="27" stroke="#4a7c59" strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="28" cy="28" r="20" fill="#4a7c59" fillOpacity="0.15" />
      <path d="M19 28.5l6.5 6.5 11.5-13"
        stroke="#4a7c59" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconWarning() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-14 h-14 mx-auto mb-6">
      <circle cx="28" cy="28" r="27" stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="28" cy="28" r="20" fill="#d97706" fillOpacity="0.10" />
      <path d="M28 20v10" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="35" r="1.25" fill="#d97706" />
    </svg>
  )
}

const INPUT = 'w-full surface-input rounded-xl px-4 py-2.5 text-cream text-sm outline-none focus:ring-1 focus:ring-bar/50 transition-all'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const { t, setAuthModal } = useApp()
  const token = searchParams.get('token')

  const [state, setState] = useState(token ? STATE.FORM : STATE.INVALID)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError(t.resetMismatch); return }
    setError(null)
    setLoading(true)
    try {
      await apiResetPassword(token, password)
      setState(STATE.SUCCESS)
    } catch (err) {
      if (err.message === 'Invalid or expired reset token') setState(STATE.INVALID)
      else setError(translateApiError(err.message, t))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="glass rounded-2xl p-10 max-w-sm w-full text-center anim-up">

        {state === STATE.FORM && (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <h2 className="font-display text-2xl font-semibold text-cream mb-2 text-center leading-snug">
              {t.resetTitle}
            </h2>
            <div>
              <label className="text-muted text-xs uppercase tracking-wide block mb-1.5">{t.resetNewPass}</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                required
                minLength={MIN_LENGTH}
                autoComplete="new-password"
                autoFocus
                placeholder={t.minPass}
                className={INPUT}
              />
            </div>
            <div>
              <label className="text-muted text-xs uppercase tracking-wide block mb-1.5">{t.resetConfirmPass}</label>
              <input
                type="password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(null) }}
                required
                minLength={MIN_LENGTH}
                autoComplete="new-password"
                className={INPUT}
              />
            </div>
            {error && (
              <p role="alert" className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-2.5">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-medium bg-bar hover:bg-[#a0834d] text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '...' : t.resetSave}
            </button>
          </form>
        )}

        {state === STATE.SUCCESS && (
          <>
            <IconCheck />
            <h2 className="font-display text-2xl font-semibold text-cream mb-2 leading-snug">{t.resetDone}</h2>
            <p className="text-cream/50 text-sm mb-8 leading-relaxed">{t.resetDoneMsg}</p>
            <button
              type="button"
              onClick={() => setAuthModal('login')}
              className="inline-block w-full py-3 rounded-xl bg-[#4a7c59] hover:bg-[#3d6b4a] text-white text-sm font-medium transition-all"
            >
              {t.resetGoLogin}
            </button>
          </>
        )}

        {state === STATE.INVALID && (
          <>
            <IconWarning />
            <h2 className="font-display text-2xl font-semibold text-cream mb-2 leading-snug">{t.verifyEmailErrorTitle}</h2>
            <p className="text-cream/50 text-sm mb-8 leading-relaxed">{token ? t.resetInvalid : t.resetNoToken}</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setAuthModal('forgot')}
                className="inline-block w-full py-3 rounded-xl bg-bar hover:bg-[#a0834d] text-white text-sm font-medium transition-all"
              >
                {t.resetRequestNew}
              </button>
              <Link to="/" className="text-cream/30 hover:text-cream/60 text-sm transition-colors py-1">
                {t.volverInicio}
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
