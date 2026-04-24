import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { IC, getScoreColor, resolveUrl } from '../lib/helpers'
import { Tabs } from '../components/ui/Tabs'
import { EditProfileModal } from '../components/modals/EditProfileModal'
import { apiResendVerification } from '../services/authService'

export default function Profile() {
  const {
    t, lang, setLang,
    themeMode, setThemeMode,
    profile, setProfile,
    followedZones, favoriteSpecies,
    setSelectedZone, setSelectedSpecies,
    user, isAuthenticated, authLoading, logout, deleteAccount,
    setAuthModal,
    isAdminView, setIsAdminView,
  } = useApp()

  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resendState, setResendState] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'

  const notifications = followedZones.map(z => {
    const sc = getScoreColor(Math.floor(60 + Math.random() * 35))
    return {
      id: z.id,
      msg: `Condiciones ${(t[sc.tKey] ?? sc.tKey).toLowerCase()} en ${z.name}`,
      hora: `Hace ${Math.floor(1 + Math.random() * 5)}h`,
    }
  })

  const handleSave = () => {
    setProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleLogout = async () => {
    setSigningOut(true)
    await logout()
    setSigningOut(false)
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    await deleteAccount()
    setDeleting(false)
  }

  const handleResendVerification = async () => {
    setResendState('sending')
    try {
      await apiResendVerification()
      setResendState('sent')
    } catch {
      setResendState('error')
    }
  }

  // ── Loading (initial session restore) ───────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cream/40 text-sm animate-pulse">{t.cargando ?? 'Cargando...'}</div>
      </div>
    )
  }

  // ── Not authenticated ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="space-y-8 anim-up max-w-2xl mx-auto pb-20">
        <div>
          <h2 className="font-display text-4xl font-semibold text-cream">{t.profile}</h2>
          <p className="text-muted text-sm mt-1">{t.authHintLogin ?? 'Inicia sesión para guardar tus zonas y especies favoritas'}</p>
        </div>

        <section className="glass rounded-2xl p-8 text-center">
          <img src="/assets/images/placeholder.png" alt="" className="h-20 w-20 object-contain opacity-70 mx-auto mb-4" />
          <h3 className="font-display text-2xl text-cream mb-2">{t.bienvenido ?? 'Bienvenido a Fungus'}</h3>
          <p className="text-cream/60 text-sm mb-6 max-w-xs mx-auto">
            {t.authCta ?? 'Crea una cuenta gratuita para seguir zonas y guardar tus especies favoritas.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setAuthModal('register')}
              className="px-6 py-3 rounded-xl bg-bar hover:bg-[#a0834d] text-white text-sm font-medium transition-all"
            >
              {t.registrarse ?? 'Registrarse'}
            </button>
            <button
              onClick={() => setAuthModal('login')}
              className="px-6 py-3 rounded-xl glass text-cream text-sm font-medium hover:[background-color:var(--ui-surface-hover)] transition-all"
            >
              {t.iniciarSesion ?? 'Iniciar sesión'}
            </button>
          </div>
        </section>

        {/* Apariencia — siempre disponible */}
        <section className="glass rounded-2xl p-5">
          <h3 className="font-medium text-cream mb-4">Apariencia</h3>
          <div className="grid grid-cols-3 gap-2 surface-subtle rounded-xl p-1">
            {[['dark','Oscuro'],['light','Claro'],['system','Sistema']].map(([mode, label]) => (
              <button key={mode} onClick={() => setThemeMode(mode)}
                className={`py-2.5 rounded-lg text-sm font-medium transition-all ${themeMode === mode ? 'bg-bar/80 text-cream shadow-sm' : 'text-cream/60 hover:text-cream'}`}>
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Idioma — siempre disponible */}
        <section className="glass rounded-2xl p-5">
          <h3 className="font-medium text-cream mb-4">{t.idioma}</h3>
          <div className="grid grid-cols-3 gap-3">
            {[['es', 'Castellano'], ['ca', 'Català'], ['en', 'English']].map(([code, label]) => (
              <button key={code} onClick={() => setLang(code)}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${lang === code ? 'bg-bar/10 text-coffee-light' : 'glass text-cream/80 hover:text-cream'}`}>
                {label}
              </button>
            ))}
          </div>
        </section>
      </div>
    )
  }

  // ── Authenticated ────────────────────────────────────────────────────────────
  const initials = user.first_name && user.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user.first_name
      ? user.first_name[0].toUpperCase()
      : null

  const greeting = user.first_name
    ? `${t.hola ?? 'Hola'}, ${user.first_name}`
    : (t.hola ?? 'Hola')

  return (
    <div className="space-y-8 anim-up max-w-2xl mx-auto pb-20">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-4xl font-semibold text-cream">{greeting}</h2>
          {user.role === 'admin' && (
            <Tabs
              options={[
                { id: 'user', label: t.modoPublico ?? 'Público' },
                { id: 'admin', label: t.modoAdmin ?? 'Admin' },
              ]}
              selected={isAdminView ? 'admin' : 'user'}
              onChange={(val) => setIsAdminView(val === 'admin')}
              size="sm"
            />
          )}
        </div>
        <p className="text-muted text-sm mt-1">
          {followedZones.length} {t.followedZones.toLowerCase()} · {favoriteSpecies.length} {t.favoriteSpecies.toLowerCase()}
        </p>
      </div>

      {/* User info */}
      <section className="glass rounded-2xl p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full bg-bar/20 flex items-center justify-center flex-shrink-0 ${initials ? 'font-display font-semibold text-coffee-light text-lg' : 'text-xl'}`}>
          {initials ?? '🍄'}
        </div>
        <div className="min-w-0 flex-1">
          {(user.first_name || user.last_name) && (
            <p className="font-display text-lg font-semibold text-cream truncate leading-tight">
              {[user.first_name, user.last_name].filter(Boolean).join(' ')}
            </p>
          )}
          <p className="text-cream/60 text-sm truncate">{user.email}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${user.plan === 'premium'
            ? 'bg-amber-500/20 text-amber-400'
            : 'surface-subtle text-cream/50'
            }`}>
            {user.plan === 'premium' ? '⭐ Premium' : 'Free'}
          </span>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex-shrink-0 flex items-center gap-1.5 text-cream/40 hover:text-cream transition-colors px-3 py-2 rounded-xl hover:[background-color:var(--ui-surface-hover)]"
        >
          {IC.pencil}
          <span className="hidden md:inline text-sm">{t.editarPerfil ?? 'Editar perfil'}</span>
        </button>
      </section>

      {showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} />}

      {/* Banner verificación email — sólo para usuarios locales no verificados */}
      {user && !user.email_verified && user.auth_provider !== 'google' && (
        <section className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.25)' }}>
          <span className="text-amber-400 mt-0.5 flex-shrink-0">⚠</span>
          <div className="flex-1 min-w-0">
            <p className="text-amber-200 text-sm font-medium leading-snug">
              {t.verifyEmailBanner ?? 'Verifica tu dirección de email'}
            </p>
            <p className="text-amber-200/60 text-xs mt-0.5 leading-relaxed">
              {t.verifyEmailBannerMsg ?? 'Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada.'}
            </p>
            {resendState !== 'sent' && resendState !== 'error' && (
              <button
                onClick={handleResendVerification}
                disabled={resendState === 'sending'}
                className="mt-2 text-xs text-amber-300 hover:text-amber-100 transition-colors disabled:opacity-50"
              >
                {resendState === 'sending'
                  ? (t.enviando ?? 'Enviando…')
                  : (t.verifyEmailResend ?? 'Reenviar email de verificación')}
              </button>
            )}
            {resendState === 'sent' && (
              <p className="mt-2 text-xs text-accent-positive">
                {t.verifyEmailResentOk ?? '✓ Email reenviado. Revisa tu bandeja.'}
              </p>
            )}
            {resendState === 'error' && (
              <p className="mt-2 text-xs text-red-400">
                {t.verifyEmailResendError ?? 'No se pudo reenviar. Inténtalo más tarde.'}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Notificaciones */}
      <section className="glass rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center gap-2">
          {IC.bell}
          <h3 className="font-medium text-cream">{t.notifications}</h3>
          {notifications.length > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 bg-emerald-500 text-white rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="divide-y divide-white/[0.04]">
          {notifications.length === 0 ? (
            <p className="p-5 text-cream/40 text-sm">{t.sin_notif}</p>
          ) : notifications.map(n => (
            <div key={n.id} className="p-4 flex items-start gap-3">
              <span className="text-muted mt-0.5">{IC.pin}</span>
              <div>
                <p className="text-cream text-sm">{n.msg}</p>
                <p className="text-cream/60 text-xs mt-0.5">{n.hora}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Apariencia */}
      <section className="glass rounded-2xl p-5">
        <h3 className="font-medium text-cream mb-4">Apariencia</h3>
        <div className="grid grid-cols-3 gap-2 surface-subtle rounded-xl p-1">
          {[['dark','Oscuro'],['light','Claro'],['system','Sistema']].map(([mode, label]) => (
            <button key={mode} onClick={() => setThemeMode(mode)}
              className={`py-2.5 rounded-lg text-sm font-medium transition-all ${themeMode === mode ? 'bg-bar/80 text-cream shadow-sm' : 'text-cream/60 hover:text-cream'}`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Idioma */}
      <section className="glass rounded-2xl p-5">
        <h3 className="font-medium text-cream mb-4">{t.idioma}</h3>
        <div className="grid grid-cols-3 gap-3">
          {[['es', 'Castellano'], ['ca', 'Català'], ['en', 'English']].map(([code, label]) => (
            <button key={code} onClick={() => setLang(code)}
              className={`py-3 rounded-xl text-sm font-medium transition-all ${lang === code ? 'bg-bar/10 text-coffee-light' : 'glass text-cream/80 hover:text-cream'}`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Zonas seguidas */}
      <section className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-cream flex items-center gap-2">
            {IC.pin}
            {t.followedZones}
            <span className="text-cream/40 text-sm font-normal">({followedZones.length})</span>
          </h3>
          {followedZones.length > 0 && (
            <Link to="/zonas?seguidas=1" className="text-xs text-cream/50 hover:text-cream transition-colors">
              {t.verTodas ?? 'Ver todas →'}
            </Link>
          )}
        </div>
        {followedZones.length === 0 ? (
          <p className="text-cream/40 text-sm">{t.sinZonasSeguidas ?? 'Aún no sigues ninguna zona.'}</p>
        ) : (
          <div className="space-y-2">
            {followedZones.slice(0, 3).map(z => (
              <button key={z.id} onClick={() => setSelectedZone(z)}
                className="w-full flex items-center gap-3 p-3 rounded-xl surface-hover text-left">
                <span className="text-muted flex-shrink-0">{IC.pin}</span>
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-cream truncate">{z.name}</p>
                  <p className="text-cream/50 text-xs">{z.region || z.province}</p>
                </div>
                <span className="ml-auto text-cream/30 flex-shrink-0">{IC.chevron()}</span>
              </button>
            ))}
            {followedZones.length > 3 && (
              <Link to="/zonas?seguidas=1" className="block text-center text-xs text-cream/40 hover:text-cream pt-1 transition-colors">
                +{followedZones.length - 3} {t.mas ?? 'más'}
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Especies favoritas */}
      <section className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-cream flex items-center gap-2">
            {IC.mushroom}
            {t.favoriteSpecies}
            <span className="text-cream/40 text-sm font-normal">({favoriteSpecies.length})</span>
          </h3>
          {favoriteSpecies.length > 0 && (
            <Link to="/especies?filtro=favoritas" className="text-xs text-cream/50 hover:text-cream transition-colors">
              {t.verTodas ?? 'Ver todas →'}
            </Link>
          )}
        </div>
        {favoriteSpecies.length === 0 ? (
          <p className="text-cream/40 text-sm">{t.sinEspeciesFavoritas ?? 'Aún no tienes especies favoritas.'}</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {favoriteSpecies.slice(0, 3).map(sp => (
                <button key={sp.id} onClick={() => setSelectedSpecies(sp)}
                  className="glass rounded-xl overflow-hidden hover:[background-color:var(--ui-surface-hover)] text-left">
                  <div className="aspect-square surface-subtle">
                    <img src={resolveUrl(sp.photo?.url)} alt=""
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none' }} />
                  </div>
                  <p className="font-display text-sm font-semibold text-cream px-2 py-1.5 truncate leading-tight">
                    {sp.commonNames?.[0] || sp.scientificName}
                  </p>
                </button>
              ))}
            </div>
            {favoriteSpecies.length > 3 && (
              <Link to="/especies?filtro=favoritas" className="block text-center text-xs text-cream/40 hover:text-cream pt-3 transition-colors">
                +{favoriteSpecies.length - 3} {t.mas ?? 'más'}
              </Link>
            )}
          </>
        )}
      </section>

      {/* Sesión */}
      <section className="pt-2 pb-4">
        {!confirmDelete ? (
          <div className="flex items-center gap-3 text-sm text-cream/40">
            <button
              onClick={handleLogout}
              disabled={signingOut || deleting}
              className="hover:text-cream/70 transition-colors disabled:opacity-40 text-center"
              style={{ minWidth: '5.5rem' }}
            >
              {signingOut ? '...' : (t.cerrarSesion ?? 'Cerrar sesión')}
            </button>
            <span className="select-none">|</span>
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={signingOut || deleting}
              className="hover:text-red-400 transition-colors disabled:opacity-40"
            >
              {t.eliminarCuenta ?? 'Eliminar cuenta'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-400">{t.confirmarEliminar ?? '¿Seguro? Esta acción es irreversible.'}</p>
            <div className="flex items-center gap-3 text-sm">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
              >
                {deleting ? '...' : (t.siEliminar ?? 'Sí, eliminar')}
              </button>
              <span className="text-cream/40 select-none">|</span>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="text-cream/40 hover:text-cream/70 transition-colors disabled:opacity-40"
              >
                {t.cancelar ?? 'Cancelar'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
