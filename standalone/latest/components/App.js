// ==================== APP ====================
function App() {
  const [view, setView] = useState('dashboard');
  const [lang, setLang] = useState('es');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [lightbox, setLightbox] = useState(null); // { photos, index }
  const [followedZones, setFollowedZones] = useState([]);
  const [favoriteSpecies, setFavoriteSpecies] = useState([]);
  const [profile, setProfile] = useState({ name: 'Mycologist', email: 'user@fungus.app' });

  const t = i18n[lang];

  useEffect(() => {
    const s = localStorage.getItem('fungus_v3');
    if (s) {
      const d = JSON.parse(s);
      setFollowedZones(d.zonas || [mockZones[0], mockZones[1]]);
      setFavoriteSpecies(d.favoritos || []);
      if (d.profile) setProfile(d.profile);
      if (d.lang) setLang(d.lang);
    } else {
      setFollowedZones([mockZones[0], mockZones[1]]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fungus_v3', JSON.stringify({ zonas: followedZones, favoritos: favoriteSpecies, profile, lang }));
  }, [followedZones, favoriteSpecies, profile, lang]);

  const toggleFollow = useCallback((zone) => {
    setFollowedZones(prev => prev.some(z => z.id === zone.id) ? prev.filter(z => z.id !== zone.id) : [...prev, zone]);
  }, []);

  const toggleFavorite = useCallback((species) => {
    setFavoriteSpecies(prev => prev.some(e => e.id === species.id) ? prev.filter(e => e.id !== species.id) : [...prev, species]);
  }, []);

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: IC.chart },
    { id: 'zonas', label: t.zonas, icon: IC.pin, badge: followedZones.length },
    { id: 'especies', label: t.especies, icon: IC.mushroom },
    { id: 'profile', label: t.profile, icon: IC.user },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2b3529 0%, #3d4536 50%, #43421c 100%)' }}>
      {/* HEADER */}
      <header className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 anim-right cursor-pointer" onClick={() => setView('dashboard')}>
            <img src="assets/images/logoFungus.png" alt="Fungus" className="h-16 w-auto object-contain" />
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ id, label, icon, badge }) => (
              <button key={id} onClick={() => setView(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${view === id ? 'bg-[#d9cea1]/10 text-[#d9cea1] shadow-inner' : 'text-[#f4ebe1] hover:bg-white/[0.05]'}`}>
                {icon} {label}
                {badge > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">{badge}</span>}
              </button>
            ))}
          </nav>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/10 text-[#f4ebe1]/70 transition-colors">
            {mobileMenuOpen ? IC.close : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-3 flex flex-col gap-1 anim-up">
            {navItems.map(({ id, label, icon, badge }) => (
              <button key={id} onClick={() => { setView(id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${view === id ? 'bg-[#d9cea1]/10 text-[#d9cea1]' : 'text-[#f4ebe1] hover:bg-white/[0.05]'}`}>
                {icon} {label}
                {badge > 0 && <span className="ml-auto px-2 py-0.5 bg-emerald-500 text-white rounded-full text-xs font-bold">{badge}</span>}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'dashboard' && <Dashboard t={t} setView={setView} setSelectedZone={setSelectedZone} setSelectedSpecies={setSelectedSpecies} followedZones={followedZones} toggleFollow={toggleFollow} favoriteSpecies={favoriteSpecies} />}
        {view === 'zonas' && <Zones t={t} followedZones={followedZones} toggleFollow={toggleFollow} setSelectedZone={setSelectedZone} />}
        {view === 'especies' && <Species t={t} favoriteSpecies={favoriteSpecies} toggleFavorite={toggleFavorite} setSelectedSpecies={setSelectedSpecies} setSelectedFamily={setSelectedFamily} />}
        {view === 'profile' && <Profile t={t} lang={lang} setLang={setLang} profile={profile} setProfile={setProfile} followedZones={followedZones} favoriteSpecies={favoriteSpecies} />}
      </main>

      {/* MODALS */}
      {selectedZone && (
        <ZoneModal t={t} zone={selectedZone} onClose={() => setSelectedZone(null)}
          isFollowed={followedZones.some(z => z.id === selectedZone.id)}
          onToggleFollow={() => toggleFollow(selectedZone)}
          onViewSpecies={(e) => { setSelectedZone(null); setSelectedSpecies(e); }} />
      )}
      {selectedSpecies && (
        <SpeciesModal t={t} species={selectedSpecies} onClose={() => setSelectedSpecies(null)}
          isFav={favoriteSpecies.some(e => e.id === selectedSpecies.id)}
          onToggleFav={() => toggleFavorite(selectedSpecies)}
          onViewFamily={(f) => { setSelectedFamily(f); setSelectedSpecies(null); }}
          onOpenLightbox={(fotos, index) => setLightbox({ fotos, index })}
          onViewZone={(z) => { setSelectedSpecies(null); setSelectedZone(z); }}
          onViewSpecies={(e) => setSelectedSpecies(e)} />
      )}
      {selectedFamily && (
        <FamilyModal t={t} family={selectedFamily} onClose={() => setSelectedFamily(null)}
          onViewSpecies={(e) => { setSelectedSpecies(e); setSelectedFamily(null); }} />
      )}
      {lightbox && (
        <Lightbox fotos={lightbox.fotos} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

// ==================== RENDER ====================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
