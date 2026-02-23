// ==================== PERFIL ====================
function Profile({ t, lang, setLang, profile, setProfile, followedZones, favoriteSpecies }) {
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  const notifications = followedZones.map(z => ({
    id: z.id, zone: z.name,
    msg: `Condiciones ${getScoreColor(Math.floor(60+Math.random()*35)).label.toLowerCase()} en ${z.name}`,
    hora: `Hace ${Math.floor(1+Math.random()*5)}h`
  }));

  const handleSave = () => {
    setProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 anim-up max-w-2xl mx-auto">
      <div>
        <h2 className="font-display text-4xl font-semibold text-[#f4ebe1]">{t.profile}</h2>
        <p className="text-[#d9cda1] text-sm mt-1">{followedZones.length} {t.followedZones.toLowerCase()} · {favoriteSpecies.length} {t.favoriteSpecies.toLowerCase()}</p>
      </div>

      {/* Notificaciones */}
      <section className="glass rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center gap-2">
          {IC.bell} <h3 className="font-medium text-[#f4ebe1]">{t.notifications}</h3>
          {notifications.length > 0 && <span className="ml-auto text-xs px-2 py-0.5 bg-emerald-500 text-white rounded-full">{notifications.length}</span>}
        </div>
        <div className="divide-y divide-white/[0.04]">
          {notifications.length === 0 ? (
            <p className="p-5 text-[#f4ebe1]/40 text-sm">{t.sin_notif}</p>
          ) : notifications.map(n => (
            <div key={n.id} className="p-4 flex items-start gap-3">
              <span className="text-[#d9cda1] mt-0.5">{IC.pin}</span>
              <div>
                <p className="text-[#f4ebe1] text-sm">{n.msg}</p>
                <p className="text-[#f4ebe1]/40 text-xs mt-0.5">{n.hora}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Datos personales */}
      <section className="glass rounded-2xl p-5">
        <h3 className="font-medium text-[#f4ebe1] mb-5">{t.datosPer}</h3>
        <div className="space-y-4">
          {[
            { label: t.nombrePer, key: 'name', type: 'text' },
            { label: t.emailPer, key: 'email', type: 'email' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-[#d9cda1] text-xs uppercase tracking-wide block mb-1.5">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-white/[0.04] rounded-xl px-4 py-2.5 text-[#f4ebe1] text-sm outline-none transition-colors placeholder-[#f4ebe1]/20" />
            </div>
          ))}
          <button onClick={handleSave}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${saved ? 'bg-emerald-600 text-white' : 'bg-[#887b4b] hover:bg-[#a0834d] text-white'}`}>
            {saved ? '✓ Guardado' : t.handleSave}
          </button>
        </div>
      </section>

      {/* Idioma */}
      <section className="glass rounded-2xl p-5">
        <h3 className="font-medium text-[#f4ebe1] mb-4">{t.idioma}</h3>
        <div className="grid grid-cols-3 gap-3">
          {[['es', '🇪🇸 Castellano'], ['ca', '🏴 Català'], ['en', '🇬🇧 English']].map(([code, label]) => (
            <button key={code} onClick={() => setLang(code)}
              className={`py-3 rounded-xl text-sm font-medium transition-all ${lang === code ? 'bg-[#887b4b]/10 text-[#c4a06b]' : 'glass text-[#f4ebe1]/60 hover:text-[#f4ebe1]'}`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 text-center">
          <div className="font-display text-4xl font-bold text-yellow-400">{followedZones.length}</div>
          <div className="text-[#f4ebe1]/50 text-sm mt-1">{t.followedZones}</div>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <div className="font-display text-4xl font-bold text-red-400">{favoriteSpecies.length}</div>
          <div className="text-[#f4ebe1]/50 text-sm mt-1">{t.favoriteSpecies}</div>
        </div>
      </div>
    </div>
  );
}

