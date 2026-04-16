/**
 * VerifyEmail — landing page for the email confirmation link.
 *
 * Route: /verificar-email?token=<token>
 */
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { apiVerifyEmail } from '../services/authService'

const STATE = { LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' }

// ── SVG icons — no emojis, consistent with the design system ──────────────────

function IconCheck() {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-14 h-14 mx-auto mb-6">
      {/* Outer ring */}
      <circle cx="28" cy="28" r="27" stroke="#4a7c59" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Inner filled circle */}
      <circle cx="28" cy="28" r="20" fill="#4a7c59" fillOpacity="0.15" />
      {/* Checkmark */}
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

// ─────────────────────────────────────────────────────────────────────────────

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const { t, user, refreshUser } = useApp()
  const [state, setState] = useState(STATE.LOADING)
  const [errorMsg, setErrorMsg] = useState('')

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setErrorMsg(t.verifyEmailNoToken ?? 'Enlace de verificación inválido.')
      setState(STATE.ERROR)
      return
    }

    let cancelled = false

    apiVerifyEmail(token)
      .then(() => {
        if (cancelled) return
        refreshUser().catch(() => {})
        setState(STATE.SUCCESS)
      })
      .catch(err => {
        if (cancelled) return
        setErrorMsg(
          err.message === 'Invalid or expired verification token'
            ? (t.verifyEmailExpired ?? 'El enlace ha caducado o ya fue usado. Solicita uno nuevo desde tu perfil.')
            : (t.verifyEmailError ?? 'No se pudo verificar el email. Inténtalo de nuevo.')
        )
        setState(STATE.ERROR)
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="glass rounded-2xl p-10 max-w-sm w-full text-center anim-up">

        {/* ── Loading ── */}
        {state === STATE.LOADING && (
          <>
            <div className="w-10 h-10 border border-[#4a7c59] border-t-transparent
                            rounded-full animate-spin mx-auto mb-6" />
            <p className="text-cream/50 text-sm tracking-wide">
              {t.verifyEmailVerifying ?? 'Verificando tu email…'}
            </p>
          </>
        )}

        {/* ── Success ── */}
        {state === STATE.SUCCESS && (
          <>
            <IconCheck />
            <h2 className="font-display text-2xl font-semibold text-cream mb-2 leading-snug">
              {t.verifyEmailSuccess ?? '¡Email confirmado!'}
            </h2>
            <p className="text-cream/50 text-sm mb-8 leading-relaxed">
              {t.verifyEmailSuccessMsg ?? 'Tu cuenta está completamente activa.'}
            </p>
            <Link
              to="/perfil"
              className="inline-block w-full py-3 rounded-xl bg-[#4a7c59] hover:bg-[#3d6b4a]
                         text-white text-sm font-medium transition-all"
            >
              {t.verifyEmailGoProfile ?? 'Ir a mi perfil'}
            </Link>
          </>
        )}

        {/* ── Error ── */}
        {state === STATE.ERROR && (
          <>
            <IconWarning />
            <h2 className="font-display text-2xl font-semibold text-cream mb-2 leading-snug">
              {t.verifyEmailErrorTitle ?? 'Enlace inválido'}
            </h2>
            <p className="text-cream/50 text-sm mb-8 leading-relaxed">{errorMsg}</p>
            <div className="flex flex-col gap-3">
              {user && !user.email_verified && (
                <Link
                  to="/perfil"
                  className="inline-block w-full py-3 rounded-xl bg-bar hover:bg-[#a0834d]
                             text-white text-sm font-medium transition-all"
                >
                  {t.verifyEmailResendFromProfile ?? 'Solicitar nuevo enlace'}
                </Link>
              )}
              <Link to="/"
                className="text-cream/30 hover:text-cream/60 text-sm transition-colors py-1">
                {t.volverInicio ?? 'Volver al inicio'}
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
