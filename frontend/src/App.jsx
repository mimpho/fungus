// App.jsx - Main MicoMapa Application
import React, { useState, useEffect } from 'react';
import { MapPin, Cloud, Droplets, Wind, AlertCircle, TrendingUp, Calendar, Search, Filter, Bell } from 'lucide-react';
import mockAPIService, { delay, mockEspecies } from './mockData';
import { ZonaModalMejorado } from './ZonaModalMejorado';

// Configuración de API
const USE_MOCK_DATA = true; // Cambiar a false para usar API real
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Componente principal
export default function MicoMapaApp() {
  const [view, setView] = useState('dashboard'); // dashboard, zonas, especies, buscar
  const [zonas, setZonas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [mejoresOportunidades, setMejoresOportunidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZona, setSelectedZona] = useState(null);
  const [selectedEspecie, setSelectedEspecie] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [zonasSeguidas, setZonasSeguidas] = useState([]);
  const [filters, setFilters] = useState({
    provincia: '',
    minScore: 70
  });

  // Fetch inicial de datos
  useEffect(() => {
    fetchDashboardData();
    // Cargar zonas seguidas del localStorage
    const savedZonas = localStorage.getItem('micomapa_seguimiento');
    if (savedZonas) {
      setZonasSeguidas(JSON.parse(savedZonas));
    } else {
      // Zonas de ejemplo si está vacío
      setZonasSeguidas([
        { ...mockZonas[0], id: 'seg-1', fecha_agregado: new Date().toISOString() },
        { ...mockZonas[1], id: 'seg-2', fecha_agregado: new Date().toISOString() }
      ]);
    }
  }, []);

  // Guardar zonas seguidas en localStorage cuando cambien
  useEffect(() => {
    if (zonasSeguidas.length > 0) {
      localStorage.setItem('micomapa_seguimiento', JSON.stringify(zonasSeguidas));
    }
  }, [zonasSeguidas]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        // Usar datos mockeados
        const [zonasData, especiesData, oportunidadesData] = await Promise.all([
          mockAPIService.getZonas({ limit: 20 }),
          mockAPIService.getEspecies({ limit: 10 }),
          mockAPIService.buscar({ min_score: 70, limit: 15 })
        ]);
        
        setZonas(zonasData);
        setEspecies(especiesData);
        setMejoresOportunidades(oportunidadesData);
      } else {
        // Usar API real
        const [zonasRes, especiesRes, oportunidadesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/zonas?limit=20`),
          fetch(`${API_BASE_URL}/especies?limit=10`),
          fetch(`${API_BASE_URL}/buscar?min_score=70&limit=15`)
        ]);

        setZonas(await zonasRes.json());
        setEspecies(await especiesRes.json());
        setMejoresOportunidades(await oportunidadesRes.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2b3529] via-[#3d4536] to-[#43421c]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        .font-display {
          font-family: 'Newsreader', serif;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 111, 71, 0.3); }
          50% { box-shadow: 0 0 30px rgba(139, 111, 71, 0.6); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }
        
        .pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .glass-effect {
          background: rgba(244, 235, 225, 0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(244, 235, 225, 0.15);
        }
        
        .score-ring {
          stroke-dasharray: 283;
          stroke-dashoffset: 283;
          transition: stroke-dashoffset 1s ease-out;
        }
      `}</style>

      {/* Header */}
      <Header view={view} setView={setView} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {loading ? (
          <LoadingState />
        ) : (
          <>
            {view === 'dashboard' && (
              <Dashboard 
                mejoresOportunidades={mejoresOportunidades}
                zonas={zonas}
                especies={especies}
                setSelectedZona={setSelectedZona}
              />
            )}
            {view === 'seguimiento' && (
              <SeguimientoView 
                zonasSeguidas={zonasSeguidas}
                setZonasSeguidas={setZonasSeguidas}
                setSelectedZona={setSelectedZona}
                todasLasZonas={zonas}
              />
            )}
            {view === 'zonas' && (
              <ZonasView zonas={zonas} setSelectedZona={setSelectedZona} zonasSeguidas={zonasSeguidas} setZonasSeguidas={setZonasSeguidas} />
            )}
            {view === 'especies' && (
              <EspeciesView especies={especies} />
            )}
            {view === 'buscar' && (
              <BuscarView filters={filters} setFilters={setFilters} />
            )}
          </>
        )}
      </main>

      {/* Modal de zona seleccionada */}
      {selectedZona && (
        <ZonaModalMejorado 
          zona={selectedZona} 
          onClose={() => setSelectedZona(null)}
          especiesCatalogo={especies}
        />
      )}
    </div>
  );
}


// ==================== COMPONENTES ====================

// Header
function Header({ view, setView }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="glass-effect border-b border-[#8b6f47]/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4 animate-slide-in">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8b6f47] to-[#4a7c59] flex items-center justify-center text-3xl shadow-lg">
              🍄
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-[#f4ebe1]">
                MicoMapa
              </h1>
              <p className="text-[#f4ebe1]/60 text-sm">Predicción micológica inteligente</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'seguimiento', label: 'Seguimiento', icon: Bell },
              { id: 'zonas', label: 'Zonas', icon: MapPin },
              { id: 'especies', label: 'Especies', icon: Filter },
              { id: 'buscar', label: 'Buscar', icon: Search }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`
                  px-5 py-2.5 rounded-xl font-medium transition-all duration-300
                  flex items-center gap-2
                  ${view === id 
                    ? 'bg-[#8b6f47] text-white shadow-lg scale-105' 
                    : 'text-[#f4ebe1]/80 hover:bg-white/10 hover:text-[#f4ebe1]'
                  }
                `}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button & Notifications */}
          <div className="flex items-center gap-2">
            <button className="relative p-3 rounded-full hover:bg-white/10 transition-colors">
              <Bell className="text-[#f4ebe1]" size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#d97706] rounded-full pulse-glow"></span>
            </button>

            {/* Hamburger Menu (Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-6 h-6 text-[#f4ebe1]"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 animate-fade-in">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'seguimiento', label: 'Seguimiento', icon: Bell },
              { id: 'zonas', label: 'Zonas', icon: MapPin },
              { id: 'especies', label: 'Especies', icon: Filter },
              { id: 'buscar', label: 'Buscar', icon: Search }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setView(id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full px-5 py-3 rounded-xl font-medium transition-all
                  flex items-center gap-3
                  ${view === id 
                    ? 'bg-[#8b6f47] text-white shadow-lg' 
                    : 'text-[#f4ebe1]/80 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}


// Dashboard View
function Dashboard({ mejoresOportunidades, zonas, especies, setSelectedZona }) {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<MapPin className="text-[#8b6f47]" size={24} />}
          value={zonas.length}
          label="Zonas Activas"
          trend="+3 esta semana"
        />
        <StatCard
          icon={<Filter className="text-[#4a7c59]" size={24} />}
          value={especies.length}
          label="Especies Catalogadas"
          trend="Base completa"
        />
        <StatCard
          icon={<TrendingUp className="text-[#059669]" size={24} />}
          value={mejoresOportunidades.filter(o => o.score_total >= 80).length}
          label="Oportunidades Excelentes"
          trend="Hoy"
        />
        <StatCard
          icon={<Cloud className="text-[#6b7280]" size={24} />}
          value="89%"
          label="Precisión IA"
          trend="Últimos 30 días"
        />
      </div>

      {/* Mejores Oportunidades */}
      <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl font-bold text-[#f4ebe1]">
            🌟 Mejores Oportunidades Hoy
          </h2>
          <span className="text-[#f4ebe1]/60 text-sm">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mejoresOportunidades.slice(0, 6).map((oportunidad, idx) => (
            <OportunidadCard
              key={idx}
              oportunidad={oportunidad}
              delay={idx * 0.1}
              onClick={() => setSelectedZona(oportunidad)}
            />
          ))}
        </div>
      </section>

      {/* Mapa de Zonas (Placeholder) */}
      <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h2 className="font-display text-3xl font-bold text-[#f4ebe1] mb-6">
          📍 Mapa de Zonas
        </h2>
        <div className="glass-effect rounded-2xl p-8 border border-[#8b6f47]/30 h-96 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto text-[#8b6f47] mb-4" size={48} />
            <p className="text-[#f4ebe1]/60">
              Mapa interactivo - Integrar con Leaflet/Mapbox
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


// Stat Card
function StatCard({ icon, value, label, trend }) {
  return (
    <div className="glass-effect rounded-2xl p-6 border border-[#8b6f47]/30 animate-fade-in hover:scale-105 transition-transform duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/10">
          {icon}
        </div>
      </div>
      <div className="font-display text-4xl font-bold text-[#f4ebe1] mb-2">
        {value}
      </div>
      <div className="text-[#f4ebe1]/80 font-medium mb-1">{label}</div>
      <div className="text-[#8b6f47] text-sm">{trend}</div>
    </div>
  );
}


// Oportunidad Card
function OportunidadCard({ oportunidad, delay, onClick }) {
  const scorePercentage = (oportunidad.score_total / 100) * 283;

  return (
    <div 
      onClick={onClick}
      className="glass-effect rounded-2xl p-6 border border-[#8b6f47]/30 hover:border-[#8b6f47]/60 transition-all duration-300 cursor-pointer hover:scale-105 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Score Circle */}
      <div className="relative w-20 h-20 mx-auto mb-4">
        <svg className="transform -rotate-90 w-20 h-20">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="rgba(244, 235, 225, 0.1)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke={oportunidad.score_total >= 85 ? '#059669' : oportunidad.score_total >= 70 ? '#8b6f47' : '#d97706'}
            strokeWidth="8"
            fill="none"
            className="score-ring"
            style={{
              strokeDashoffset: 283 - scorePercentage,
              strokeLinecap: 'round'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-2xl font-bold text-[#f4ebe1]">
            {Math.round(oportunidad.score_total)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="text-center mb-4">
        <h3 className="font-display text-xl font-bold text-[#f4ebe1] mb-2">
          {oportunidad.nombre_cientifico}
        </h3>
        <p className="text-[#8b6f47] text-sm font-medium mb-1">
          {oportunidad.zona_nombre}
        </p>
        <p className="text-[#f4ebe1]/60 text-xs">
          {oportunidad.provincia}
        </p>
      </div>

      {/* Probabilidad */}
      <div className={`
        px-4 py-2 rounded-full text-center font-semibold text-sm
        ${oportunidad.probabilidad === 'excelente' ? 'bg-[#059669]/20 text-[#059669]' :
          oportunidad.probabilidad === 'muy_alta' ? 'bg-[#8b6f47]/20 text-[#8b6f47]' :
          'bg-[#d97706]/20 text-[#d97706]'}
      `}>
        {oportunidad.probabilidad.replace('_', ' ').toUpperCase()}
      </div>

      {/* Días estimados */}
      {oportunidad.dias_estimados_fructificacion && (
        <div className="mt-4 text-center text-[#f4ebe1]/70 text-sm flex items-center justify-center gap-2">
          <Calendar size={16} />
          ~{oportunidad.dias_estimados_fructificacion} días
        </div>
      )}
    </div>
  );
}


// Loading State
function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-[#8b6f47]/30 border-t-[#8b6f47] rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-[#f4ebe1]/60 text-lg">Cargando datos micológicos...</p>
      </div>
    </div>
  );
}


// Zonas View
function ZonasView({ zonas, setSelectedZona, zonasSeguidas, setZonasSeguidas }) {
  const esSeguida = (zonaId) => {
    return zonasSeguidas.some(z => z.id === zonaId || z.zona_id === zonaId);
  };

  const toggleSeguimiento = (zona, e) => {
    e.stopPropagation(); // Evitar que se abra el modal
    
    if (esSeguida(zona.id)) {
      // Dejar de seguir
      setZonasSeguidas(zonasSeguidas.filter(z => z.id !== zona.id && z.zona_id !== zona.id));
    } else {
      // Empezar a seguir
      const nuevaZona = {
        ...zona,
        zona_id: zona.id,
        id: `seg-${Date.now()}`,
        fecha_agregado: new Date().toISOString()
      };
      setZonasSeguidas([...zonasSeguidas, nuevaZona]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl font-bold text-[#f4ebe1]">
          📍 Todas las Zonas
        </h2>
        <p className="text-[#f4ebe1]/60 text-sm">
          {zonasSeguidas.length} zonas seguidas
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zonas.map((zona, idx) => (
          <div
            key={zona.id}
            className="glass-effect rounded-2xl p-6 border border-[#8b6f47]/30 hover:border-[#8b6f47]/60 transition-all duration-300 relative"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {/* Botón de seguir/dejar de seguir */}
            <button
              onClick={(e) => toggleSeguimiento(zona, e)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                esSeguida(zona.id)
                  ? 'bg-[#059669] text-white hover:bg-[#059669]/80'
                  : 'bg-white/10 text-[#f4ebe1]/60 hover:bg-white/20 hover:text-[#f4ebe1]'
              }`}
              title={esSeguida(zona.id) ? 'Dejar de seguir' : 'Seguir zona'}
            >
              {esSeguida(zona.id) ? (
                <span className="text-xl">⭐</span>
              ) : (
                <span className="text-xl">☆</span>
              )}
            </button>

            <div 
              onClick={() => setSelectedZona(zona)}
              className="cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4 pr-10">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#f4ebe1] mb-1">
                    {zona.nombre}
                  </h3>
                  <p className="text-[#8b6f47] text-sm">{zona.comarca}</p>
                </div>
                <span className="px-3 py-1 bg-[#4a7c59]/20 text-[#4a7c59] rounded-full text-xs font-semibold">
                  {zona.provincia}
                </span>
              </div>

              <div className="space-y-2 text-sm text-[#f4ebe1]/70">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#8b6f47]" />
                  {zona.latitud.toFixed(4)}, {zona.longitud.toFixed(4)}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#8b6f47]" />
                  {zona.altitud}m · {zona.tipo_bosque}
                </div>
              </div>

              <div className="mt-4 text-[#f4ebe1]/60 text-sm text-right">
                Click para ver calendario de especies →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// Especies View
function EspeciesView({ especies }) {
  const [selectedEspecie, setSelectedEspecie] = useState(null);

  const getComestibilidadColor = (comestibilidad) => {
    switch(comestibilidad) {
      case 'excelente':
      case 'bueno':
        return 'bg-[#059669]/20 text-[#059669]';
      case 'precaucion':
        return 'bg-[#d97706]/20 text-[#d97706]';
      case 'toxico':
      case 'mortal':
        return 'bg-[#dc2626]/20 text-[#dc2626]';
      default:
        return 'bg-[#6b7280]/20 text-[#6b7280]';
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <h2 className="font-display text-3xl font-bold text-[#f4ebe1] mb-6">
          🍄 Catálogo de Especies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {especies.map((especie, idx) => (
            <div
              key={especie.id}
              onClick={() => setSelectedEspecie(especie)}
              className="glass-effect rounded-2xl p-6 border border-[#8b6f47]/30 hover:border-[#8b6f47]/60 transition-all duration-300 cursor-pointer hover:scale-105"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl">🍄</div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-2">
                    {especie.nombre_cientifico}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {especie.nombres_comunes.map((nombre, i) => (
                      <span key={i} className="text-[#8b6f47] text-sm">
                        {nombre}{i < especie.nombres_comunes.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getComestibilidadColor(especie.comestibilidad)}`}>
                    {especie.comestibilidad.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-[#f4ebe1]/60 text-sm text-right">
                Click para ver ficha completa →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Ficha Técnica */}
      {selectedEspecie && (
        <EspecieModal especie={selectedEspecie} onClose={() => setSelectedEspecie(null)} />
      )}
    </>
  );
}


// Buscar View
function BuscarView({ filters, setFilters }) {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        const data = await mockAPIService.buscar({
          min_score: filters.minScore,
          provincia: filters.provincia || undefined
        });
        setResultados(data);
      } else {
        const queryParams = new URLSearchParams({
          min_score: filters.minScore,
          ...(filters.provincia && { provincia: filters.provincia })
        });

        const response = await fetch(`${API_BASE_URL}/buscar?${queryParams}`);
        const data = await response.json();
        setResultados(data);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [filters]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-display text-3xl font-bold text-[#f4ebe1] mb-6">
        🔍 Buscar Oportunidades
      </h2>

      {/* Filters */}
      <div className="glass-effect rounded-2xl p-6 border border-[#8b6f47]/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[#f4ebe1]/80 text-sm font-medium mb-2">
              Provincia
            </label>
            <select
              value={filters.provincia}
              onChange={(e) => setFilters({ ...filters, provincia: e.target.value })}
              className="w-full bg-white/10 border border-[#8b6f47]/30 rounded-xl px-4 py-3 text-[#f4ebe1] focus:outline-none focus:border-[#8b6f47] transition-colors"
            >
              <option value="">Todas</option>
              <option value="Barcelona">Barcelona</option>
              <option value="Girona">Girona</option>
              <option value="Lleida">Lleida</option>
              <option value="Tarragona">Tarragona</option>
            </select>
          </div>

          <div>
            <label className="block text-[#f4ebe1]/80 text-sm font-medium mb-2">
              Score Mínimo: {filters.minScore}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minScore}
              onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-[#8b6f47] hover:bg-[#8b6f47]/80 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resultados.map((resultado, idx) => (
            <OportunidadCard
              key={idx}
              oportunidad={resultado}
              delay={idx * 0.05}
              onClick={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}


// Seguimiento View (Zonas Seguidas)
function SeguimientoView({ zonasSeguidas, setZonasSeguidas, setSelectedZona, todasLasZonas }) {
  const eliminarZona = (zonaId, e) => {
    e.stopPropagation();
    setZonasSeguidas(zonasSeguidas.filter(z => z.id !== zonaId));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-[#f4ebe1] mb-2">
            ⭐ Mis Zonas Seguidas
          </h2>
          <p className="text-[#f4ebe1]/60">
            Zonas que sigues para conocer las mejores condiciones de recolección
          </p>
        </div>
      </div>

      {zonasSeguidas.length === 0 ? (
        <div className="glass-effect rounded-2xl p-12 border border-[#8b6f47]/30 text-center">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-3">
            No sigues ninguna zona todavía
          </h3>
          <p className="text-[#f4ebe1]/70 mb-6 max-w-md mx-auto">
            Ve a la sección de Zonas y haz click en la estrella (☆) para empezar a seguir zonas que te interesen.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {zonasSeguidas.map((zona, idx) => (
            <ZonaSeguida
              key={zona.id}
              zona={zona}
              onEliminar={eliminarZona}
              onClick={() => setSelectedZona(zona)}
              delay={idx * 0.1}
            />
          ))}
        </div>
      )}

      {/* Info box */}
      {zonasSeguidas.length > 0 && (
        <div className="bg-[#4a7c59]/10 border border-[#4a7c59]/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-[#4a7c59] mb-2">
                Consejo: Mantén tus zonas actualizadas
              </h4>
              <p className="text-[#f4ebe1]/80 text-sm">
                Haz click en cualquier zona para ver sus condiciones actuales, el termómetro de recolección 
                y qué setas están disponibles ahora mismo. Los datos se actualizan en tiempo real.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Componente de Zona Seguida (Card con preview de condiciones)
function ZonaSeguida({ zona, onEliminar, onClick, delay }) {
  // Generar datos de ejemplo (en producción vendrían de la API)
  const condicionesActuales = {
    temperatura: (12 + Math.random() * 8).toFixed(1),
    precipitacion_14d: (30 + Math.random() * 50).toFixed(1),
    humedad: (70 + Math.random() * 20).toFixed(0),
    dias_sin_lluvia: Math.floor(Math.random() * 5),
    score_general: Math.floor(70 + Math.random() * 25)
  };

  const getEstadoColor = (score) => {
    if (score >= 85) return 'text-[#059669]';
    if (score >= 70) return 'text-[#8b6f47]';
    if (score >= 55) return 'text-[#d97706]';
    return 'text-[#dc2626]';
  };

  const getEstadoTexto = (score) => {
    if (score >= 85) return 'Excelente';
    if (score >= 70) return 'Muy bueno';
    if (score >= 55) return 'Bueno';
    return 'Regular';
  };

  return (
    <div
      className="glass-effect rounded-2xl p-6 border border-[#8b6f47]/30 hover:border-[#8b6f47] cursor-pointer transition-all duration-300 hover:scale-105 animate-fade-in relative"
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      {/* Botón eliminar */}
      <button
        onClick={(e) => onEliminar(zona.id, e)}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-[#dc2626]/20 text-[#f4ebe1]/60 hover:text-[#dc2626] transition-colors"
        title="Dejar de seguir"
      >
        <span className="text-lg">×</span>
      </button>

      {/* Header */}
      <div className="mb-4 pr-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⭐</span>
          <h3 className="font-display text-xl font-bold text-[#f4ebe1]">
            {zona.nombre}
          </h3>
        </div>
        <p className="text-[#8b6f47] text-sm">{zona.provincia} · {zona.tipo_bosque}</p>
      </div>

      {/* Termómetro simplificado */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#f4ebe1]/70 text-sm">Estado actual:</span>
          <span className={`font-bold ${getEstadoColor(condicionesActuales.score_general)}`}>
            {getEstadoTexto(condicionesActuales.score_general)}
          </span>
        </div>
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              condicionesActuales.score_general >= 85 ? 'bg-[#059669]' :
              condicionesActuales.score_general >= 70 ? 'bg-[#8b6f47]' :
              condicionesActuales.score_general >= 55 ? 'bg-[#d97706]' :
              'bg-[#dc2626]'
            }`}
            style={{ width: `${condicionesActuales.score_general}%` }}
          />
        </div>
      </div>

      {/* Condiciones resumidas */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Cloud size={16} className="text-[#8b6f47]" />
            <span className="text-[#f4ebe1]/60 text-xs">Temperatura</span>
          </div>
          <div className="text-[#f4ebe1] font-semibold">{condicionesActuales.temperatura}°C</div>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Droplets size={16} className="text-[#4a7c59]" />
            <span className="text-[#f4ebe1]/60 text-xs">Precip. 14d</span>
          </div>
          <div className="text-[#f4ebe1] font-semibold">{condicionesActuales.precipitacion_14d}mm</div>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Wind size={16} className="text-[#6b7280]" />
            <span className="text-[#f4ebe1]/60 text-xs">Humedad</span>
          </div>
          <div className="text-[#f4ebe1] font-semibold">{condicionesActuales.humedad}%</div>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={16} className="text-[#d97706]" />
            <span className="text-[#f4ebe1]/60 text-xs">Sin lluvia</span>
          </div>
          <div className="text-[#f4ebe1] font-semibold">{condicionesActuales.dias_sin_lluvia} días</div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-[#f4ebe1]/60 text-sm text-center pt-3 border-t border-[#8b6f47]/20">
        Click para ver detalles completos →
      </div>
    </div>
  );
}


// Especie Modal (Ficha Técnica Completa)
function EspecieModal({ especie, onClose }) {
  const getComestibilidadInfo = (comestibilidad) => {
    switch(comestibilidad) {
      case 'excelente':
        return {
          color: 'text-[#059669]',
          bg: 'bg-[#059669]/10',
          border: 'border-[#059669]',
          icon: '✓✓✓',
          texto: 'EXCELENTE COMESTIBLE',
          descripcion: 'Seta de altísima calidad gastronómica. Muy apreciada en cocina.'
        };
      case 'bueno':
        return {
          color: 'text-[#4a7c59]',
          bg: 'bg-[#4a7c59]/10',
          border: 'border-[#4a7c59]',
          icon: '✓✓',
          texto: 'BUEN COMESTIBLE',
          descripcion: 'Seta comestible de buena calidad. Apta para consumo.'
        };
      case 'comestible':
        return {
          color: 'text-[#8b6f47]',
          bg: 'bg-[#8b6f47]/10',
          border: 'border-[#8b6f47]',
          icon: '✓',
          texto: 'COMESTIBLE',
          descripcion: 'Comestible pero de menor interés culinario.'
        };
      case 'precaucion':
        return {
          color: 'text-[#d97706]',
          bg: 'bg-[#d97706]/10',
          border: 'border-[#d97706]',
          icon: '⚠',
          texto: 'PRECAUCIÓN',
          descripcion: 'Requiere preparación específica o identificación experta. Puede causar molestias.'
        };
      case 'toxico':
        return {
          color: 'text-[#dc2626]',
          bg: 'bg-[#dc2626]/10',
          border: 'border-[#dc2626]',
          icon: '✗',
          texto: 'TÓXICA',
          descripcion: 'NO CONSUMIR. Causa intoxicación. Puede requerir atención médica.'
        };
      case 'mortal':
        return {
          color: 'text-[#dc2626]',
          bg: 'bg-[#dc2626]/20',
          border: 'border-[#dc2626]',
          icon: '☠',
          texto: 'MORTAL',
          descripcion: 'EXTREMADAMENTE PELIGROSA. Puede causar la muerte. Nunca consumir.'
        };
      default:
        return {
          color: 'text-[#6b7280]',
          bg: 'bg-[#6b7280]/10',
          border: 'border-[#6b7280]',
          icon: '?',
          texto: 'SIN INFORMACIÓN',
          descripcion: 'Consultar con experto antes de consumir.'
        };
    }
  };

  const getMorfologia = (especie) => {
    // Basado en el nombre científico, devuelve características morfológicas
    const nombre = especie.nombre_cientifico.toLowerCase();
    
    if (nombre.includes('boletus')) {
      return {
        sombrero: 'Hemisférico cuando joven, convexo después. 8-30 cm diámetro. Superficie lisa o ligeramente aterciopelada.',
        color_sombrero: 'Marrón claro a oscuro, ocasionalmente con tonos rojizos.',
        himenio: 'Poros (tubos) en lugar de láminas. Blancos cuando joven, amarillos después.',
        pie: 'Robusto, cilíndrico, a veces ensanchado en la base. 8-25 cm altura. Con retículo (red) fino.',
        carne: 'Blanca, firme, no cambia de color al corte. Olor agradable a avellana.',
        esporada: 'Marrón olivácea',
        ilustracion_tipo: 'sombrero_convexo_poros_pie_reticulo'
      };
    } else if (nombre.includes('lactarius')) {
      return {
        sombrero: 'Convexo, después aplanado o deprimido. 4-14 cm. Zonas concéntricas más oscuras.',
        color_sombrero: 'Naranja zanahoria con zonas concéntricas verdosas.',
        himenio: 'Láminas decurrentes (bajan por el pie), apretadas, frágiles.',
        pie: 'Cilíndrico, frágil, hueco. 3-8 cm. Color similar al sombrero con pequeñas fositas.',
        carne: 'Naranja, frágil. Exuda látex naranja que se vuelve verde al aire. Sabor dulce.',
        esporada: 'Crema amarillenta',
        ilustracion_tipo: 'sombrero_deprimido_laminas_decurrentes_latex'
      };
    } else if (nombre.includes('cantharellus')) {
      return {
        sombrero: 'Forma de embudo irregular. 2-12 cm. Margen ondulado, lobulado.',
        color_sombrero: 'Amarillo huevo uniforme, a veces con tonos anaranjados.',
        himenio: 'Pliegues (no láminas verdaderas), gruesos, espaciados, decurrentes.',
        pie: 'Macizo, adelgazándose hacia la base. 3-8 cm. Mismo color que el sombrero.',
        carne: 'Blanca-amarillenta, compacta, elástica. Olor afrutado (albaricoque).',
        esporada: 'Amarillo pálido',
        ilustracion_tipo: 'sombrero_embudo_pliegues_pie_macizo'
      };
    } else if (nombre.includes('amanita caesarea')) {
      return {
        sombrero: 'Hemisférico, después convexo. 8-20 cm. Sin restos de velo (escamas).',
        color_sombrero: 'Naranja vivo a rojo anaranjado brillante.',
        himenio: 'Láminas libres (no tocan el pie), apretadas, amarillo dorado.',
        pie: 'Cilíndrico con anillo amplio, estriado. 8-15 cm. Amarillo. Volva blanca amplia en la base.',
        carne: 'Blanca bajo la cutícula, amarilla cerca de las láminas. Olor suave.',
        esporada: 'Blanca',
        ilustracion_tipo: 'sombrero_convexo_laminas_libres_anillo_volva'
      };
    } else if (nombre.includes('amanita muscaria')) {
      return {
        sombrero: 'Globoso, después convexo-aplanado. 8-20 cm. Escamas blancas (restos del velo).',
        color_sombrero: 'Rojo brillante, a veces anaranjado. Las escamas pueden lavarse con lluvia.',
        himenio: 'Láminas libres, blancas, apretadas.',
        pie: 'Cilíndrico con anillo blanco membranoso. 10-20 cm. Blanco con restos de velo.',
        carne: 'Blanca, amarilla bajo la cutícula. Olor dulzón.',
        esporada: 'Blanca',
        ilustracion_tipo: 'sombrero_convexo_laminas_libres_anillo_escamas'
      };
    } else if (nombre.includes('amanita phalloides')) {
      return {
        sombrero: 'Hemisférico, después aplanado. 5-15 cm. Liso, sedoso, con fibras radiales.',
        color_sombrero: 'Verde oliva a amarillo verdoso, a veces casi blanco. Centro más oscuro.',
        himenio: 'Láminas libres, blancas, apretadas.',
        pie: 'Cilíndrico, adelgazado arriba. 8-15 cm. Blanco con bandas verdosas. Anillo amplio blanco. Volva sacciforme blanca.',
        carne: 'Blanca, inmutable. Olor dulzón inicialmente, después desagradable (cadavérico).',
        esporada: 'Blanca',
        ilustracion_tipo: 'sombrero_aplanado_laminas_libres_anillo_volva'
      };
    } else {
      return {
        sombrero: 'Variable según la especie. Consultar guía especializada.',
        color_sombrero: 'Variable',
        himenio: 'Puede tener láminas, poros, pliegues o aguijones según especie.',
        pie: 'Morfología variable',
        carne: 'Características variables',
        esporada: 'Color variable según especie',
        ilustracion_tipo: 'generico'
      };
    }
  };

  // Obtener sinónimos regionales (nombres coloquiales)
  const getSinonimos = (especie) => {
    const nombre = especie.nombre_cientifico.toLowerCase();
    
    if (nombre.includes('boletus edulis')) {
      return ['Hongo', 'Calabaza', 'Panza', 'Seta de calabaza', 'Cep (francés)', 'Porcino (italiano)', 'Sureny (catalán)'];
    } else if (nombre.includes('lactarius deliciosus')) {
      return ['Pinetell (catalán)', 'Esne-ziza (euskera)', 'Mízcalo', 'Guíscano', 'Pinatel'];
    } else if (nombre.includes('cantharellus')) {
      return ['Camagroc (catalán)', 'Chantarela', 'Ziza-hori (euskera)', 'Angula de monte', 'Cantarela'];
    } else if (nombre.includes('amanita caesarea')) {
      return ['Ou de reig (catalán)', 'Kuleto (euskera)', 'Amanita de los césares', 'Ovolo'];
    } else if (nombre.includes('amanita muscaria')) {
      return ['Reig vermell (catalán)', 'Kuleto falsoa (euskera)', 'Falsa oronja', 'Matamoscas', 'Reig bord'];
    } else if (nombre.includes('amanita phalloides')) {
      return ['Oronja verda (catalán)', 'Kuleto berdea (euskera)', 'Canaleja', 'Hongo de la muerte', 'Cicuta verde'];
    } else if (nombre.includes('macrolepiota')) {
      return ['Cogomella (catalán)', 'Galanperna', 'Cucurril', 'Apagallums', 'Paraguas'];
    } else if (nombre.includes('tricholoma')) {
      return ['Fredolic (catalán)', 'Zorrotz (euskera)', 'Capuchina', 'Ratón'];
    } else if (nombre.includes('pleurotus')) {
      return ['Gírgola (catalán)', 'Betazun (euskera)', 'Seta de cardo'];
    } else {
      return especie.nombres_comunes || [];
    }
  };

  const comestibilidadInfo = getComestibilidadInfo(especie.comestibilidad);
  const morfologia = getMorfologia(especie);
  const sinonimos = getSinonimos(especie);
  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <div
          className="glass-effect rounded-3xl border border-[#8b6f47]/30 max-w-5xl w-full p-8 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-6xl">🍄</div>
                <div>
                  <h2 className="font-display text-4xl font-bold text-[#f4ebe1] mb-2">
                    {especie.nombre_cientifico}
                  </h2>
                  <p className="text-[#8b6f47] text-lg italic mb-3">
                    Familia: {especie.familia || 'No especificada'}
                  </p>
                  
                  {/* Sinónimos regionales */}
                  {sinonimos.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[#f4ebe1]/70 text-sm mb-2">También conocida como:</p>
                      <div className="flex flex-wrap gap-2">
                        {sinonimos.map((sin, i) => (
                          <span key={i} className="px-3 py-1 bg-[#8b6f47]/20 text-[#8b6f47] rounded-full text-sm">
                            {sin}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Badge de comestibilidad GRANDE */}
              <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl border-2 ${comestibilidadInfo.border} ${comestibilidadInfo.bg}`}>
                <span className="text-3xl">{comestibilidadInfo.icon}</span>
                <div>
                  <div className={`font-bold text-xl ${comestibilidadInfo.color}`}>
                    {comestibilidadInfo.texto}
                  </div>
                  <div className={`text-sm ${comestibilidadInfo.color}`}>
                    {comestibilidadInfo.descripcion}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
            >
              <span className="text-[#f4ebe1] text-3xl">×</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna Izquierda: Morfología y Especificaciones Técnicas */}
            <div className="space-y-6">
              {/* Descripción General */}
              {especie.descripcion && (
                <section>
                  <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-4">
                    📖 Descripción General
                  </h3>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-[#f4ebe1]/80 leading-relaxed">
                      {especie.descripcion}
                    </p>
                  </div>
                </section>
              )}

              {/* Especificaciones Técnicas (Ilustración) */}
              <section>
                <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-4 flex items-center gap-2">
                  🔬 Especificaciones Técnicas
                </h3>

                {/* Placeholder para ilustración técnica */}
                <div className="bg-white/5 rounded-xl p-6 mb-4 border-2 border-dashed border-[#8b6f47]/30">
                  <div className="text-center text-[#f4ebe1]/60 mb-4">
                    <p className="text-sm mb-2">Ilustración técnica:</p>
                    <div className="text-6xl mb-2">🍄</div>
                    <p className="text-xs italic">
                      Tipo: {morfologia.ilustracion_tipo?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs mt-2 text-[#8b6f47]">
                      (Aquí iría ilustración técnica con partes señaladas)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold text-[#8b6f47] mb-2">Sombrero (Píleo)</h4>
                    <p className="text-[#f4ebe1]/80 text-sm mb-2">{morfologia.sombrero}</p>
                    <p className="text-[#f4ebe1]/60 text-sm">
                      <span className="font-medium">Color:</span> {morfologia.color_sombrero}
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold text-[#8b6f47] mb-2">Himenio (Parte fértil)</h4>
                    <p className="text-[#f4ebe1]/80 text-sm">{morfologia.himenio}</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold text-[#8b6f47] mb-2">Pie (Estípite)</h4>
                    <p className="text-[#f4ebe1]/80 text-sm">{morfologia.pie}</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold text-[#8b6f47] mb-2">Carne</h4>
                    <p className="text-[#f4ebe1]/80 text-sm">{morfologia.carne}</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold text-[#8b6f47] mb-2">Esporada</h4>
                    <p className="text-[#f4ebe1]/80 text-sm">{morfologia.esporada}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Columna Derecha: Ecología y Época */}
            <div className="space-y-6">
              {/* Hábitat */}
              <section>
                <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-4 flex items-center gap-2">
                  🌲 Hábitat y Ecología
                </h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <div>
                    <span className="text-[#8b6f47] font-medium">Tipo de bosque:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {especie.tipos_bosque?.map((bosque, i) => (
                        <span key={i} className="px-3 py-1 bg-[#4a7c59]/20 text-[#4a7c59] rounded-full text-sm">
                          {bosque.charAt(0).toUpperCase() + bosque.slice(1)}
                        </span>
                      )) || <span className="text-[#f4ebe1]/60 text-sm">Variable</span>}
                    </div>
                  </div>
                  
                  {/* Tipo de suelo */}
                  {especie.tipo_suelo && (
                    <div>
                      <span className="text-[#8b6f47] font-medium">Tipo de suelo:</span>
                      <span className="text-[#f4ebe1]/80 ml-2">{especie.tipo_suelo}</span>
                    </div>
                  )}

                  {especie.altitud_min && especie.altitud_max && (
                    <div>
                      <span className="text-[#8b6f47] font-medium">Altitud:</span>
                      <span className="text-[#f4ebe1]/80 ml-2">{especie.altitud_min} - {especie.altitud_max} m.s.n.m.</span>
                    </div>
                  )}

                  {especie.ph_suelo_min && especie.ph_suelo_max && (
                    <div>
                      <span className="text-[#8b6f47] font-medium">pH del suelo:</span>
                      <span className="text-[#f4ebe1]/80 ml-2">{especie.ph_suelo_min} - {especie.ph_suelo_max} (acidez)</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Época de Fructificación (NO recolección) */}
              <section>
                <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-4 flex items-center gap-2">
                  📅 Época de Fructificación
                </h3>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="grid grid-cols-6 gap-2">
                    {mesesNombres.map((mes, idx) => (
                      <div
                        key={idx}
                        className={`
                          text-center py-2 rounded-lg text-sm font-medium transition-all
                          ${especie.meses_fructificacion?.includes(idx + 1)
                            ? 'bg-[#059669] text-white shadow-lg'
                            : 'bg-white/5 text-[#f4ebe1]/40'
                          }
                        `}
                      >
                        {mes}
                      </div>
                    ))}
                  </div>
                  <p className="text-[#f4ebe1]/60 text-sm mt-4 text-center">
                    Meses en verde: período de fructificación
                  </p>
                </div>
              </section>

              {/* Condiciones Óptimas */}
              {(especie.temp_optima_min || especie.precip_14dias_min) && (
                <section>
                  <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-4 flex items-center gap-2">
                    🌡️ Condiciones Óptimas
                  </h3>
                  <div className="bg-white/5 rounded-xl p-4 space-y-3">
                    {especie.temp_optima_min && (
                      <div>
                        <span className="text-[#8b6f47] font-medium">Temperatura:</span>
                        <span className="text-[#f4ebe1]/80 ml-2">
                          {especie.temp_optima_min}°C - {especie.temp_optima_max}°C
                        </span>
                      </div>
                    )}
                    
                    {especie.precip_14dias_min && (
                      <div>
                        <span className="text-[#8b6f47] font-medium">Precipitación (14 días previos):</span>
                        <span className="text-[#f4ebe1]/80 ml-2">
                          {especie.precip_14dias_min}mm - {especie.precip_14dias_max}mm
                        </span>
                      </div>
                    )}

                    {especie.humedad_min && (
                      <div>
                        <span className="text-[#8b6f47] font-medium">Humedad relativa:</span>
                        <span className="text-[#f4ebe1]/80 ml-2">
                          &gt; {especie.humedad_min}%
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Advertencia si es tóxica o mortal */}
          {(especie.comestibilidad === 'toxico' || especie.comestibilidad === 'mortal') && (
            <div className="mt-8 bg-[#dc2626]/20 border-2 border-[#dc2626] rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-4xl flex-shrink-0">⚠️</span>
                <div>
                  <h4 className="text-[#dc2626] font-bold text-xl mb-2">
                    ADVERTENCIA IMPORTANTE
                  </h4>
                  <p className="text-[#f4ebe1]/90 leading-relaxed">
                    Esta especie es <strong>{especie.comestibilidad === 'mortal' ? 'MORTAL' : 'TÓXICA'}</strong>. 
                    Nunca la consumas bajo ninguna circunstancia. Incluso pequeñas cantidades pueden causar 
                    {especie.comestibilidad === 'mortal' ? ' daños hepáticos irreversibles y la muerte' : ' intoxicación grave'}.
                    Si has consumido esta seta accidentalmente, acude inmediatamente a urgencias.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer con disclaimer */}
          <div className="mt-8 pt-6 border-t border-[#8b6f47]/30">
            <p className="text-[#f4ebe1]/60 text-sm text-center">
              ⚠️ Esta ficha es orientativa. Consulta siempre con un micólogo experto antes de consumir cualquier seta silvestre. 
              MicoMapa no se responsabiliza de intoxicaciones por identificación errónea.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
    switch(comestibilidad) {
      case 'excelente':
        return {
          color: 'text-[#059669]',
          bg: 'bg-[#059669]/10',
          border: 'border-[#059669]',
          icon: '✓✓✓',
          texto: 'EXCELENTE COMESTIBLE',
          descripcion: 'Seta de altísima calidad gastronómica. Muy apreciada en cocina.'
        };
      case 'bueno':
        return {
          color: 'text-[#4a7c59]',
          bg: 'bg-[#4a7c59]/10',
          border: 'border-[#4a7c59]',
          icon: '✓✓',
          texto: 'BUEN COMESTIBLE',
          descripcion: 'Seta comestible de buena calidad. Apta para consumo.'
        };
      case 'comestible':
        return {
          color: 'text-[#8b6f47]',
          bg: 'bg-[#8b6f47]/10',
          border: 'border-[#8b6f47]',
          icon: '✓',
          texto: 'COMESTIBLE',
          descripcion: 'Comestible pero de menor interés culinario.'
        };
      case 'precaucion':
        return {
          color: 'text-[#d97706]',
          bg: 'bg-[#d97706]/10',
          border: 'border-[#d97706]',
          icon: '⚠',
          texto: 'PRECAUCIÓN',
          descripcion: 'Requiere preparación específica o identificación experta. Puede causar molestias.'
        };
      case 'toxico':
        return {
          color: 'text-[#dc2626]',
          bg: 'bg-[#dc2626]/10',
          border: 'border-[#dc2626]',
          icon: '✗',
          texto: 'TÓXICA',
          descripcion: 'NO CONSUMIR. Causa intoxicación. Puede requerir atención médica.'
        };
      case 'mortal':
        return {
          color: 'text-[#dc2626]',
          bg: 'bg-[#dc2626]/20',
          border: 'border-[#dc2626]',
          icon: '☠',
          texto: 'MORTAL',
          descripcion: 'EXTREMADAMENTE PELIGROSA. Puede causar la muerte. Nunca consumir.'
        };
      default:
        return {
          color: 'text-[#6b7280]',
          bg: 'bg-[#6b7280]/10',
          border: 'border-[#6b7280]',
          icon: '?',
          texto: 'SIN INFORMACIÓN',
          descripcion: 'Consultar con experto antes de consumir.'
        };
    }
  };

  const getMorfologia = (especie) => {
    // Basado en el nombre científico, devuelve características morfológicas
    const nombre = especie.nombre_cientifico.toLowerCase();
    
    if (nombre.includes('boletus')) {
      return {
        sombrero: 'Hemisférico cuando joven, convexo después. 8-30 cm diámetro. Superficie lisa o ligeramente aterciopelada.',
        color_sombrero: 'Marrón claro a oscuro, ocasionalmente con tonos rojizos.',
        himenio: 'Poros (tubos) en lugar de láminas. Blancos cuando joven, amarillos después.',
        pie: 'Robusto, cilíndrico, a veces ensanchado en la base. 8-25 cm altura. Con retículo (red) fino.',
        carne: 'Blanca, firme, no cambia de color al corte. Olor agradable a avellana.',
        esporada: 'Marrón olivácea'
      };
    } else if (nombre.includes('lactarius')) {
      return {
        sombrero: 'Convexo, después aplanado o deprimido. 4-14 cm. Zonas concéntricas más oscuras.',
        color_sombrero: 'Naranja zanahoria con zonas concéntricas verdosas.',
        himenio: 'Láminas decurrentes (bajan por el pie), apretadas, frágiles.',
        pie: 'Cilíndrico, frágil, hueco. 3-8 cm. Color similar al sombrero con pequeñas fositas.',
        carne: 'Naranja, frágil. Exuda látex naranja que se vuelve verde al aire. Sabor dulce.',
        esporada: 'Crema amarillenta'
      };
    } else if (nombre.includes('cantharellus')) {
      return {
        sombrero: 'Forma de embudo irregular. 2-12 cm. Margen ondulado, lobulado.',
        color_sombrero: 'Amarillo huevo uniforme, a veces con tonos anaranjados.',
        himenio: 'Pliegues (no láminas verdaderas), gruesos, espaciados, decurrentes.',
        pie: 'Macizo, adelgazándose hacia la base. 3-8 cm. Mismo color que el sombrero.',
        carne: 'Blanca-amarillenta, compacta, elástica. Olor afrutado (albaricoque).',
        esporada: 'Amarillo pálido'
      };
    } else if (nombre.includes('amanita caesarea')) {
      return {
        sombrero: 'Hemisférico, después convexo. 8-20 cm. Sin restos de velo (escamas).',
        color_sombrero: 'Naranja vivo a rojo anaranjado brillante.',
        himenio: 'Láminas libres (no tocan el pie), apretadas, amarillo dorado.',
        pie: 'Cilíndrico con anillo amplio, estriado. 8-15 cm. Amarillo. Volva blanca amplia en la base.',
        carne: 'Blanca bajo la cutícula, amarilla cerca de las láminas. Olor suave.',
        esporada: 'Blanca'
      };
    } else if (nombre.includes('amanita muscaria')) {
      return {
        sombrero: 'Globoso, después convexo-aplanado. 8-20 cm. Escamas blancas (restos del velo).',
        color_sombrero: 'Rojo brillante, a veces anaranjado. Las escamas pueden lavarse con lluvia.',
        himenio: 'Láminas libres, blancas, apretadas.',
        pie: 'Cilíndrico con anillo blanco membranoso. 10-20 cm. Blanco con restos de velo.',
        carne: 'Blanca, amarilla bajo la cutícula. Olor dulzón.',
        esporada: 'Blanca'
      };
    } else if (nombre.includes('amanita phalloides')) {
      return {
        sombrero: 'Hemisférico, después aplanado. 5-15 cm. Liso, sedoso, con fibras radiales.',
        color_sombrero: 'Verde oliva a amarillo verdoso, a veces casi blanco. Centro más oscuro.',
        himenio: 'Láminas libres, blancas, apretadas.',
        pie: 'Cilíndrico, adelgazado arriba. 8-15 cm. Blanco con bandas verdosas. Anillo amplio blanco. Volva sacciforme blanca.',
        carne: 'Blanca, inmutable. Olor dulzón inicialmente, después desagradable (cadavérico).',
        esporada: 'Blanca'
      };
    } else {
      return {
        sombrero: 'Variable según la especie. Consultar guía especializada.',
        color_sombrero: 'Variable',
        himenio: 'Puede tener láminas, poros, pliegues o aguijones según especie.',
        pie: 'Morfología variable',
        carne: 'Características variables',
        esporada: 'Color variable según especie'
      };
    }
  };

  const comestibilidadInfo = getComestibilidadInfo(especie.comestibilidad);
  const morfologia = getMorfologia(especie);
  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="glass-effect rounded-3xl border border-[#8b6f47]/30 max-w-5xl w-full my-8 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">🍄</div>
              <div>
                <h2 className="font-display text-4xl font-bold text-[#f4ebe1] mb-2">
                  {especie.nombre_cientifico}
                </h2>
                <p className="text-[#8b6f47] text-lg italic">
                  Familia: {especie.familia || 'No especificada'}
                </p>
              </div>
            </div>
            
            {/* Nombres comunes */}
            <div className="flex flex-wrap gap-2 mb-4">
              {especie.nombres_comunes.map((nombre, i) => (
                <span key={i} className="px-4 py-2 bg-[#4a7c59]/20 text-[#4a7c59] rounded-full text-sm font-medium">
                  {nombre}
                </span>
              ))}
            </div>

            {/* Badge de comestibilidad */}
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl border-2 ${comestibilidadInfo.border} ${comestibilidadInfo.bg}`}>
              <span className="text-2xl">{comestibilidadInfo.icon}</span>
              <div>
                <div className={`font-bold text-lg ${comestibilidadInfo.color}`}>
                  {comestibilidadInfo.texto}
                </div>
                <div className={`text-sm ${comestibilidadInfo.color}`}>
                  {comestibilidadInfo.descripcion}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
          >
            <span className="text-[#f4ebe1] text-3xl">×</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna Izquierda: Morfología */}
          <div className="space-y-6">
            <section>
              <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-4 flex items-center gap-2">
                🔬 Morfología
              </h3>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="font-semibold text-[#8b6f47] mb-2">Sombrero (Píleo)</h4>
                  <p className="text-[#f4ebe1]/80 text-sm mb-2">{morfologia.sombrero}</p>
                  <p className="text-[#f4ebe1]/60 text-sm">
                    <span className="font-medium">Color:</span> {morfologia.color_sombrero}
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="font-semibold text-[#8b6f47] mb-2">Himenio (Parte fértil)</h4>
                  <p className="text-[#f4ebe1]/80 text-sm">{morfologia.himenio}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="font-semibold text-[#8b6f47] mb-2">Pie (Estípite)</h4>
                  <p className="text-[#f4ebe1]/80 text-sm">{morfologia.pie}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="font-semibold text-[#8b6f47] mb-2">Carne</h4>
                  <p className="text-[#f4ebe1]/80 text-sm">{morfologia.carne}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="font-semibold text-[#8b6f47] mb-2">Esporada</h4>
                  <p className="text-[#f4ebe1]/80 text-sm">{morfologia.esporada}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Columna Derecha: Ecología y Época */}
          <div className="space-y-6">
            {/* Hábitat */}
            <section>
              <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-4 flex items-center gap-2">
                🌲 Hábitat
              </h3>
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <div>
                  <span className="text-[#8b6f47] font-medium">Tipo de bosque:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {especie.tipos_bosque?.map((bosque, i) => (
                      <span key={i} className="px-3 py-1 bg-[#4a7c59]/20 text-[#4a7c59] rounded-full text-sm">
                        {bosque.charAt(0).toUpperCase() + bosque.slice(1)}
                      </span>
                    )) || <span className="text-[#f4ebe1]/60 text-sm">Variable</span>}
                  </div>
                </div>
                
                {especie.altitud_min && especie.altitud_max && (
                  <div>
                    <span className="text-[#8b6f47] font-medium">Altitud:</span>
                    <span className="text-[#f4ebe1]/80 ml-2">{especie.altitud_min} - {especie.altitud_max} m</span>
                  </div>
                )}

                {especie.ph_suelo_min && especie.ph_suelo_max && (
                  <div>
                    <span className="text-[#8b6f47] font-medium">pH del suelo:</span>
                    <span className="text-[#f4ebe1]/80 ml-2">{especie.ph_suelo_min} - {especie.ph_suelo_max}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Época de Recolección */}
            <section>
              <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-4 flex items-center gap-2">
                📅 Época de Recolección
              </h3>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="grid grid-cols-6 gap-2">
                  {mesesNombres.map((mes, idx) => (
                    <div
                      key={idx}
                      className={`
                        text-center py-2 rounded-lg text-sm font-medium transition-all
                        ${especie.meses_fructificacion?.includes(idx + 1)
                          ? 'bg-[#059669] text-white shadow-lg'
                          : 'bg-white/5 text-[#f4ebe1]/40'
                        }
                      `}
                    >
                      {mes}
                    </div>
                  ))}
                </div>
                <p className="text-[#f4ebe1]/60 text-sm mt-4 text-center">
                  Meses destacados en verde
                </p>
              </div>
            </section>

            {/* Condiciones Óptimas */}
            {(especie.temp_optima_min || especie.precip_14dias_min) && (
              <section>
                <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-4 flex items-center gap-2">
                  🌡️ Condiciones Óptimas
                </h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  {especie.temp_optima_min && (
                    <div>
                      <span className="text-[#8b6f47] font-medium">Temperatura:</span>
                      <span className="text-[#f4ebe1]/80 ml-2">
                        {especie.temp_optima_min}°C - {especie.temp_optima_max}°C
                      </span>
                    </div>
                  )}
                  
                  {especie.precip_14dias_min && (
                    <div>
                      <span className="text-[#8b6f47] font-medium">Precipitación (14 días):</span>
                      <span className="text-[#f4ebe1]/80 ml-2">
                        {especie.precip_14dias_min}mm - {especie.precip_14dias_max}mm
                      </span>
                    </div>
                  )}

                  {especie.humedad_min && (
                    <div>
                      <span className="text-[#8b6f47] font-medium">Humedad relativa:</span>
                      <span className="text-[#f4ebe1]/80 ml-2">
                        &gt; {especie.humedad_min}%
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Descripción */}
            {especie.descripcion && (
              <section>
                <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-4">
                  📖 Descripción
                </h3>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-[#f4ebe1]/80 leading-relaxed">
                    {especie.descripcion}
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Advertencia si es tóxica o mortal */}
        {(especie.comestibilidad === 'toxico' || especie.comestibilidad === 'mortal') && (
          <div className="mt-8 bg-[#dc2626]/20 border-2 border-[#dc2626] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">⚠️</span>
              <div>
                <h4 className="text-[#dc2626] font-bold text-xl mb-2">
                  ADVERTENCIA IMPORTANTE
                </h4>
                <p className="text-[#f4ebe1]/90 leading-relaxed">
                  Esta especie es <strong>{especie.comestibilidad === 'mortal' ? 'MORTAL' : 'TÓXICA'}</strong>. 
                  Nunca la consumas bajo ninguna circunstancia. Incluso pequeñas cantidades pueden causar 
                  {especie.comestibilidad === 'mortal' ? ' daños hepáticos irreversibles y la muerte' : ' intoxicación grave'}.
                  Si has consumido esta seta accidentalmente, acude inmediatamente a urgencias.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer con disclaimer */}
        <div className="mt-8 pt-6 border-t border-[#8b6f47]/30">
          <p className="text-[#f4ebe1]/60 text-sm text-center">
            ⚠️ Esta ficha es orientativa. Consulta siempre con un micólogo experto antes de consumir cualquier seta silvestre. 
            MicoMapa no se responsabiliza de intoxicaciones por identificación errónea.
          </p>
        </div>
      </div>
    </div>
  );
}


// Zona Modal (Calendario de Especies por Mes)
function ZonaModal({ zona, onClose }) {
  const [especiesZona, setEspeciesZona] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEspeciesZona();
  }, [zona]);

  const fetchEspeciesZona = async () => {
    try {
      if (USE_MOCK_DATA) {
        // Filtrar especies compatibles con el tipo de bosque de la zona
        await delay(400);
        
        const especiesCompatibles = mockEspecies.filter(especie => 
          especie.tipos_bosque && especie.tipos_bosque.includes(zona.tipo_bosque)
        );
        
        setEspeciesZona(especiesCompatibles);
      } else {
        // Llamada a API real (futuro)
        const response = await fetch(`${API_BASE_URL}/zonas/${zona.id}/especies`);
        const data = await response.json();
        setEspeciesZona(data);
      }
    } catch (error) {
      console.error('Error fetching especies:', error);
    } finally {
      setLoading(false);
    }
  };

  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const mesesCompletos = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Verificar si una especie fructifica en un mes específico
  const fructificaEnMes = (especie, mes) => {
    return especie.meses_fructificacion && especie.meses_fructificacion.includes(mes);
  };

  // Obtener color según comestibilidad
  const getColorComestibilidad = (comestibilidad) => {
    switch(comestibilidad) {
      case 'excelente':
        return 'bg-[#059669] text-white';
      case 'bueno':
        return 'bg-[#4a7c59] text-white';
      case 'comestible':
        return 'bg-[#8b6f47] text-white';
      case 'precaucion':
        return 'bg-[#d97706] text-white';
      case 'toxico':
      case 'mortal':
        return 'bg-[#dc2626] text-white';
      default:
        return 'bg-[#6b7280] text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="glass-effect rounded-3xl border border-[#8b6f47]/30 max-w-7xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#f4ebe1] mb-2">
              📅 Calendario Micológico
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl text-[#8b6f47] font-semibold">
                {zona.nombre}
              </h3>
              <span className="px-3 py-1 bg-[#4a7c59]/20 text-[#4a7c59] rounded-full text-sm font-semibold">
                {zona.provincia}
              </span>
            </div>
            <p className="text-[#f4ebe1]/60 mt-2">
              🌲 {zona.tipo_bosque.charAt(0).toUpperCase() + zona.tipo_bosque.slice(1)} · 
              ⛰️ {zona.altitud}m
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
          >
            <span className="text-[#f4ebe1] text-3xl">×</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#8b6f47]/30 border-t-[#8b6f47] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#f4ebe1]/60">Cargando calendario...</p>
          </div>
        ) : (
          <>
            {especiesZona.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#f4ebe1]/60 text-lg">
                  No hay especies catalogadas para este tipo de bosque ({zona.tipo_bosque})
                </p>
              </div>
            ) : (
              <>
                {/* Información de la leyenda */}
                <div className="mb-6 flex flex-wrap gap-3 items-center justify-center md:justify-start">
                  <span className="text-[#f4ebe1]/80 text-sm font-medium">Leyenda:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#059669]"></div>
                    <span className="text-[#f4ebe1]/70 text-sm">Época óptima</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-white/5"></div>
                    <span className="text-[#f4ebe1]/70 text-sm">Fuera de temporada</span>
                  </div>
                </div>

                {/* Tabla de calendario - Vista Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="text-left p-4 text-[#f4ebe1] font-semibold border-b border-[#8b6f47]/30 sticky left-0 bg-[#1a3a2e] z-10">
                          Especie
                        </th>
                        {mesesNombres.map((mes, idx) => (
                          <th 
                            key={idx} 
                            className="p-3 text-center text-[#f4ebe1]/80 text-sm font-medium border-b border-[#8b6f47]/30"
                          >
                            {mes}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {especiesZona.map((especie, idx) => (
                        <tr 
                          key={especie.id}
                          className="border-b border-[#8b6f47]/20 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4 sticky left-0 bg-[#1a3a2e] z-10">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🍄</span>
                              <div>
                                <div className="font-semibold text-[#f4ebe1] mb-1">
                                  {especie.nombre_cientifico}
                                </div>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {especie.nombres_comunes.slice(0, 2).map((nombre, i) => (
                                    <span key={i} className="text-[#8b6f47] text-xs">
                                      {nombre}
                                    </span>
                                  ))}
                                </div>
                                <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getColorComestibilidad(especie.comestibilidad)}`}>
                                  {especie.comestibilidad === 'excelente' ? '⭐ Excelente' :
                                   especie.comestibilidad === 'bueno' ? '✓ Bueno' :
                                   especie.comestibilidad === 'toxico' ? '⚠ Tóxico' :
                                   especie.comestibilidad === 'mortal' ? '☠ Mortal' :
                                   especie.comestibilidad}
                                </div>
                              </div>
                            </div>
                          </td>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mes => (
                            <td 
                              key={mes}
                              className={`p-3 text-center transition-all ${
                                fructificaEnMes(especie, mes)
                                  ? 'bg-[#059669] hover:bg-[#059669]/80'
                                  : 'bg-white/5 hover:bg-white/10'
                              }`}
                            >
                              {fructificaEnMes(especie, mes) && (
                                <span className="text-white font-bold text-lg">●</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vista Mobile - Cards por especie */}
                <div className="md:hidden space-y-4">
                  {especiesZona.map((especie) => (
                    <div 
                      key={especie.id}
                      className="bg-white/5 rounded-xl p-4 border border-[#8b6f47]/30"
                    >
                      {/* Header de la especie */}
                      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-[#8b6f47]/20">
                        <span className="text-3xl">🍄</span>
                        <div className="flex-1">
                          <div className="font-semibold text-[#f4ebe1] mb-1">
                            {especie.nombre_cientifico}
                          </div>
                          <div className="text-[#8b6f47] text-sm mb-2">
                            {especie.nombres_comunes.join(', ')}
                          </div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getColorComestibilidad(especie.comestibilidad)}`}>
                            {especie.comestibilidad === 'excelente' ? '⭐ Excelente' :
                             especie.comestibilidad === 'bueno' ? '✓ Bueno' :
                             especie.comestibilidad === 'toxico' ? '⚠ Tóxico' :
                             especie.comestibilidad === 'mortal' ? '☠ Mortal' :
                             especie.comestibilidad}
                          </div>
                        </div>
                      </div>

                      {/* Calendario móvil */}
                      <div className="grid grid-cols-4 gap-2">
                        {mesesNombres.map((mes, idx) => (
                          <div
                            key={idx}
                            className={`
                              text-center py-3 rounded-lg text-xs font-medium transition-all
                              ${fructificaEnMes(especie, idx + 1)
                                ? 'bg-[#059669] text-white shadow-lg'
                                : 'bg-white/5 text-[#f4ebe1]/40'
                              }
                            `}
                          >
                            {mes}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen de especies por mes */}
                <div className="mt-8 pt-6 border-t border-[#8b6f47]/30">
                  <h4 className="font-display text-xl font-bold text-[#f4ebe1] mb-4">
                    📊 Resumen por mes
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {mesesCompletos.map((mes, idx) => {
                      const especiesEnMes = especiesZona.filter(e => fructificaEnMes(e, idx + 1));
                      const hayEspecies = especiesEnMes.length > 0;
                      
                      return (
                        <div 
                          key={idx}
                          className={`
                            p-4 rounded-xl text-center transition-all
                            ${hayEspecies 
                              ? 'bg-[#4a7c59]/20 border-2 border-[#4a7c59]' 
                              : 'bg-white/5 border border-[#8b6f47]/20'
                            }
                          `}
                        >
                          <div className={`text-sm font-semibold mb-1 ${hayEspecies ? 'text-[#4a7c59]' : 'text-[#f4ebe1]/60'}`}>
                            {mes}
                          </div>
                          <div className={`text-2xl font-bold ${hayEspecies ? 'text-[#f4ebe1]' : 'text-[#f4ebe1]/40'}`}>
                            {especiesEnMes.length}
                          </div>
                          <div className={`text-xs ${hayEspecies ? 'text-[#4a7c59]' : 'text-[#f4ebe1]/40'}`}>
                            {especiesEnMes.length === 1 ? 'especie' : 'especies'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mejor época del año */}
                <div className="mt-6 bg-[#059669]/10 border border-[#059669]/30 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">🌟</span>
                    <div>
                      <h4 className="font-bold text-[#059669] text-lg mb-2">
                        Mejor época para visitar esta zona
                      </h4>
                      <p className="text-[#f4ebe1]/80 mb-3">
                        Basado en la mayor diversidad de especies disponibles:
                      </p>
                      {(() => {
                        // Calcular mes con más especies
                        const especiesPorMes = mesesCompletos.map((mes, idx) => ({
                          mes,
                          idx: idx + 1,
                          cantidad: especiesZona.filter(e => fructificaEnMes(e, idx + 1)).length
                        }));
                        const mejorMes = especiesPorMes.reduce((max, current) => 
                          current.cantidad > max.cantidad ? current : max
                        );
                        
                        return (
                          <div className="text-[#f4ebe1]">
                            <span className="font-bold text-xl text-[#059669]">{mejorMes.mes}</span>
                            <span className="text-[#f4ebe1]/80 ml-2">
                              con {mejorMes.cantidad} especies disponibles
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#8b6f47]/30">
          <p className="text-[#f4ebe1]/60 text-sm text-center">
            💡 Tip: Las épocas pueden variar según las condiciones climáticas de cada año. 
            Consulta los scores en tiempo real para mayor precisión.
          </p>
        </div>
      </div>
    </div>
  );
}
