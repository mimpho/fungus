import { useApp } from '../../contexts/AppContext'

const LOCALES = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }

// error.kind → i18n key (see observatoryService.js)
const MESSAGE_KEY = {
  auth: 'obsErrAuth',
  outside: 'obsErrOutside',
  invalid: 'obsErrInvalid',
  not_found: 'obsErrNotFound',
  conflict: 'obsErrConflict',
  limit: 'obsErrLimit',
  unavailable: 'obsErrUnavailable',
  network: 'errRed',
  unknown: 'obsErrUnknown',
}

// Worth offering «Reintentar»: the same request may work a moment later.
const RETRYABLE = new Set(['network', 'unavailable', 'unknown', 'not_found'])

/** «dentro de 3 horas» / «in 25 minutes», in the app language. */
export function formatWait(seconds, lang) {
  const rtf = new Intl.RelativeTimeFormat(LOCALES[lang] ?? 'es-ES', { numeric: 'always' })
  if (seconds < 5400) return rtf.format(Math.max(1, Math.ceil(seconds / 60)), 'minute')
  return rtf.format(Math.round(seconds / 3600), 'hour')
}

/**
 * Message for an ObservatoryError, with the action that makes sense for it:
 * sign in again (401), retry (network, 503, 404) or nothing (outside Catalonia, daily limit).
 * The score is never the only thing on screen: every failure says what happened and what to do.
 */
export function ObservatoryNotice({ error, onRetry }) {
  const { t, lang, setAuthModal } = useApp()
  if (!error) return null

  const kind = error.kind ?? 'unknown'
  const wait = error.retryAfter ? formatWait(error.retryAfter, lang) : null
  let message = t[MESSAGE_KEY[kind]] ?? t.obsErrUnknown
  if (kind === 'limit') message = message.replace('{tiempo}', wait ?? '')
  if (kind === 'unavailable' && wait) message = `${message} ${t.obsRetryAt.replace('{tiempo}', wait)}`

  return (
    <div role="alert" className="glass obs-card rounded-2xl p-5 flex flex-wrap items-center gap-3 justify-between">
      <p className="text-sm text-cream/80 flex-1 min-w-[16rem]">{message}</p>
      {kind === 'auth' && (
        <button
          onClick={() => setAuthModal('login')}
          className="px-4 py-2 rounded-xl bg-bar hover:bg-[#a0834d] text-white text-sm font-medium transition-all"
        >
          {t.iniciarSesion}
        </button>
      )}
      {RETRYABLE.has(kind) && onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl glass text-cream text-sm font-medium hover:[background-color:var(--ui-surface-hover)] transition-all"
        >
          {t.obsRetry}
        </button>
      )}
    </div>
  )
}
