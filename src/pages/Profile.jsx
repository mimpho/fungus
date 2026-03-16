import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { IC, getScoreColor, resolveUrl } from '../lib/helpers'

export default function Profile() {
  const {
    t, lang, setLang,
    profile, setProfile,
    followedZones, favoriteSpecies,
    setSelectedZone, setSelectedSpecies,
    user, isAuthenticated, authLoading, logout,
    setAuthModal,
  } = useApp()

  const [form, setForm]           = useState(profile)
  const [saved, setSaved]         = useState(false)
  const [signingOut, setSigningOut] = useState(false)

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
              className="px-6 py-3 rounded-xl glass text-cream text-sm font-medium hover:bg-white/[0.08] transition-all"
            >
              {t.iniciarSesion ?? 'Iniciar sesión'}
            </button>
          </div>
        </section>

        {/* Idioma — siempre disponible */}
        <section className="glass rounded-2xl p-5">
          <h3 className="font-medium text-cream mb-4">{t.idioma}</h3>
          <div className="grid grid-cols-3 gap-3">
            {[['es', '🇪🇸 Castellano'], ['ca', '🏴 Català'], ['en', '🇬🇧 English']].map(([code, label]) => (
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
  return (
    <div className="space-y-8 anim-up max-w-2xl mx-auto pb-20">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-4xl font-semibold text-cream">{t.profile}</h2>
          <p className="text-muted text-sm mt-1">
            {followedZones.length} {t.followedZones.toLowerCase()} · {favoriteSpecies.length} {t.favoriteSpecies.toLowerCase()}
          </p>
        </div>
        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="flex items-center gap-1.5 text-cream/50 hover:text-red-400 text-sm transition-colors disabled:opacity-50 mt-1"
        >
          {IC.close}
          <span>{signingOut ? '...' : (t.cerrarSesion ?? 'Cerrar sesión')}</span>
        </button>
      </div>

      {/* User info */}
      <section className="glass rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-bar/20 flex items-center justify-center text-xl flex-shrink-0">
          🍄
        </div>
        <div className="min-w-0">
          <p className="text-cream font-medium truncate">{user.email}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            user.plan === 'premium'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-white/[0.06] text-cream/50'
          }`}>
            {user.plan === 'premium' ? '⭐ Premium' : 'Free'}
          </span>
        </div>
      </section>

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

      {/* Idioma */}
      <section className="glass rounded-2xl p-5">
        <h3 className="font-medium text-cream mb-4">{t.idioma}</h3>
        <div className="grid grid-cols-3 gap-3">
          {[['es', '🇪🇸 Castellano'], ['ca', '🏴 Català'], ['en', '🇬🇧 English']].map(([code, label]) => (
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
            <Link to="/zonas" className="text-xs text-cream/50 hover:text-cream transition-colors">
              {t.verTodas ?? 'Ver todas →'}
            </Link>
          )}
        </div>
        {followedZones.length === 0 ? (
          <p className="text-cream/40 text-sm">Aún no sigues ninguna zona.</p>
        ) : (
          <div className="space-y-2">
            {followedZones.slice(0, 3).map(z => (
              <button key={z.id} onClick={() => setSelectedZone(z)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] hover-lift text-left">
                <span className="text-muted flex-shrink-0">{IC.pin}</span>
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-cream truncate">{z.name}</p>
                  <p className="text-cream/50 text-xs">{z.region || z.province}</p>
                </div>
                <span className="ml-auto text-cream/30 flex-shrink-0">{IC.chevron}</span>
              </button>
            ))}
            {followedZones.length > 3 && (
              <Link to="/zonas" className="block text-center text-xs text-cream/40 hover:text-cream pt-1 transition-colors">
                +{followedZones.length - 3} más
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Especies favoritas */}
      <section className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-cream flex items-center gap-2">
            {IC.heart}
            {t.favoriteSpecies}
            <span className="text-cream/40 text-sm font-normal">({favoriteSpecies.length})</span>
          </h3>
          {favoriteSpecies.length > 0 && (
            <Link to="/especies" className="text-xs text-cream/50 hover:text-cream transition-colors">
              {t.verTodas ?? 'Ver todas →'}
            </Link>
          )}
        </div>
        {favoriteSpecies.length === 0 ? (
          <p className="text-cream/40 text-sm">Aún no tienes especies favoritas.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {favoriteSpecies.slice(0, 3).map(sp => (
                <button key={sp.id} onClick={() => setSelectedSpecies(sp)}
                  className="glass rounded-xl overflow-hidden hover:bg-white/[0.07] hover-lift text-left">
                  <div className="aspect-square bg-white/[0.03]">
                    <img src={resolveUrl(sp.photo?.url)} alt=""
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none' }} />
                  </div>
                  <p className="font-display text-xs font-semibold text-cream px-2 py-1.5 truncate leading-tight">
                    {sp.commonNames?.[0] || sp.scientificName}
                  </p>
                </button>
              ))}
            </div>
            {favoriteSpecies.length > 3 && (
              <Link to="/especies" className="block text-center text-xs text-cream/40 hover:text-cream pt-3 transition-colors">
                +{favoriteSpecies.length - 3} más
              </Link>
            )}
          </>
        )}
      </section>
    </div>
  )
}
