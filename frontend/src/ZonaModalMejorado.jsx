// ZonaModalMejorado.jsx - Modal de Zona con Pestañas: Tiempo Real, Calendario, Disponibles

import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, AlertCircle, MapPin, TrendingUp, Calendar } from 'lucide-react';

const USE_MOCK_DATA = true;

// Importar funciones helper (deberían estar disponibles desde App.jsx)
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export function ZonaModalMejorado({ zona, onClose, especiesCatalogo }) {
  const [tabActiva, setTabActiva] = useState('tiempo-real'); // tiempo-real, calendario, disponibles
  const [especiesZona, setEspeciesZona] = useState([]);
  const [condicionesActuales, setCondicionesActuales] = useState(null);
  const [especiesDisponibles, setEspeciesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatosZona();
  }, [zona]);

  const fetchDatosZona = async () => {
    setLoading(true);
    try {
      await delay(400);
      
      // 1. Filtrar especies compatibles
      const especiesCompatibles = especiesCatalogo.filter(especie => 
        especie.tipos_bosque && especie.tipos_bosque.includes(zona.tipo_bosque)
      );
      setEspeciesZona(especiesCompatibles);

      // 2. Generar condiciones actuales (mock data)
      const condiciones = {
        temperatura: (12 + Math.random() * 8).toFixed(1),
        temp_suelo: (11 + Math.random() * 7).toFixed(1),
        precipitacion_14d: (30 + Math.random() * 50).toFixed(1),
        precipitacion_total_hoy: (Math.random() * 10).toFixed(1),
        humedad: (70 + Math.random() * 20).toFixed(0),
        viento: (5 + Math.random() * 15).toFixed(0),
        dias_sin_lluvia: Math.floor(Math.random() * 5),
        score_general: Math.floor(70 + Math.random() * 25),
        ultima_actualizacion: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };
      setCondicionesActuales(condiciones);

      // 3. Generar especies disponibles (con score > 60)
      const mesActual = new Date().getMonth() + 1;
      const disponibles = especiesCompatibles
        .filter(e => e.meses_fructificacion?.includes(mesActual))
        .map(e => ({
          ...e,
          score: Math.floor(60 + Math.random() * 35),
          dias_estimados: Math.floor(4 + Math.random() * 8)
        }))
        .sort((a, b) => b.score - a.score);
      
      setEspeciesDisponibles(disponibles);
      
    } catch (error) {
      console.error('Error fetching zona data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <div
          className="glass-effect rounded-3xl border border-[#8b6f47]/30 max-w-7xl w-full p-6 md:p-8 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#f4ebe1] mb-2">
                {zona.nombre}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-[#4a7c59]/20 text-[#4a7c59] rounded-full text-sm font-semibold">
                  {zona.provincia}
                </span>
                <span className="text-[#f4ebe1]/60 text-sm">
                  🌲 {zona.tipo_bosque} · ⛰️ {zona.altitud}m
                </span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
            >
              <span className="text-[#f4ebe1] text-3xl">×</span>
            </button>
          </div>

          {/* Pestañas */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setTabActiva('tiempo-real')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                tabActiva === 'tiempo-real'
                  ? 'bg-[#8b6f47] text-white shadow-lg'
                  : 'bg-white/5 text-[#f4ebe1]/70 hover:bg-white/10'
              }`}
            >
              <Cloud size={20} />
              Tiempo Real
            </button>
            <button
              onClick={() => setTabActiva('calendario')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                tabActiva === 'calendario'
                  ? 'bg-[#8b6f47] text-white shadow-lg'
                  : 'bg-white/5 text-[#f4ebe1]/70 hover:bg-white/10'
              }`}
            >
              <Calendar size={20} />
              Calendario
            </button>
            <button
              onClick={() => setTabActiva('disponibles')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                tabActiva === 'disponibles'
                  ? 'bg-[#8b6f47] text-white shadow-lg'
                  : 'bg-white/5 text-[#f4ebe1]/70 hover:bg-white/10'
              }`}
            >
              <span className="text-xl">🍄</span>
              Disponibles Ahora
              {especiesDisponibles.length > 0 && (
                <span className="px-2 py-1 bg-[#059669] text-white rounded-full text-xs">
                  {especiesDisponibles.length}
                </span>
              )}
            </button>
          </div>

          {/* Contenido de las pestañas */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#8b6f47]/30 border-t-[#8b6f47] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#f4ebe1]/60">Cargando datos...</p>
            </div>
          ) : (
            <>
              {tabActiva === 'tiempo-real' && (
                <TiempoRealTab condiciones={condicionesActuales} zona={zona} />
              )}
              {tabActiva === 'calendario' && (
                <CalendarioTab especiesZona={especiesZona} />
              )}
              {tabActiva === 'disponibles' && (
                <DisponiblesTab especiesDisponibles={especiesDisponibles} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== PESTAÑA 1: TIEMPO REAL ==========
function TiempoRealTab({ condiciones, zona }) {
  if (!condiciones) return null;

  const getEstadoTermometro = (score) => {
    if (score >= 85) return {
      color: 'bg-[#059669]',
      emoji: '🟢',
      texto: 'EXCELENTE momento para recolectar',
      recomendacion: '¡Ve ahora! Las condiciones son óptimas.'
    };
    if (score >= 70) return {
      color: 'bg-[#8b6f47]',
      emoji: '🟡',
      texto: 'MUY BUEN momento para recolectar',
      recomendacion: 'Buenas condiciones. Vale la pena planificar una salida.'
    };
    if (score >= 55) return {
      color: 'bg-[#d97706]',
      emoji: '🟠',
      texto: 'Momento REGULAR para recolectar',
      recomendacion: 'Podrías encontrar algo, pero no es el mejor momento.'
    };
    return {
      color: 'bg-[#dc2626]',
      emoji: '🔴',
      texto: 'MAL momento para recolectar',
      recomendacion: 'Espera a que mejoren las condiciones climáticas.'
    };
  };

  const estado = getEstadoTermometro(condiciones.score_general);

  return (
    <div className="space-y-6">
      {/* Termómetro de Recolección GRANDE */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-8 border-2 border-[#8b6f47]/30">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">📊</span>
          <div>
            <h3 className="font-display text-2xl font-bold text-[#f4ebe1]">
              Termómetro de Recolección
            </h3>
            <p className="text-[#f4ebe1]/60 text-sm">
              Basado en condiciones actuales y especies de la zona
            </p>
          </div>
        </div>

        {/* Barra de progreso grande */}
        <div className="relative h-16 bg-white/10 rounded-full overflow-hidden mb-6 shadow-inner">
          <div 
            className={`h-full ${estado.color} transition-all duration-1000 flex items-center justify-end pr-6`}
            style={{ width: `${condiciones.score_general}%` }}
          >
            <span className="text-white font-bold text-3xl">{condiciones.score_general}</span>
          </div>
        </div>

        {/* Estado y recomendación */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{estado.emoji}</span>
            <div>
              <div className={`font-bold text-2xl mb-1 ${estado.color.replace('bg-', 'text-')}`}>
                {estado.texto}
              </div>
              <p className="text-[#f4ebe1]/80 text-lg">
                {estado.recomendacion}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Condiciones Actuales */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl font-bold text-[#f4ebe1]">
            Condiciones Actuales
          </h3>
          <span className="text-[#f4ebe1]/60 text-sm">
            Actualizado: {condiciones.ultima_actualizacion}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CondicionCard
            icon={<Cloud size={24} className="text-[#8b6f47]" />}
            label="Temperatura"
            value={`${condiciones.temperatura}°C`}
            sublabel="Aire"
          />
          <CondicionCard
            icon={<TrendingUp size={24} className="text-[#4a7c59]" />}
            label="Temp. Suelo"
            value={`${condiciones.temp_suelo}°C`}
            sublabel="Estimada 10cm"
          />
          <CondicionCard
            icon={<Droplets size={24} className="text-[#4a7c59]" />}
            label="Precipitación"
            value={`${condiciones.precipitacion_14d}mm`}
            sublabel="Últimos 14 días"
          />
          <CondicionCard
            icon={<Droplets size={24} className="text-[#6b7280]" />}
            label="Lluvia hoy"
            value={`${condiciones.precipitacion_total_hoy}mm`}
            sublabel="Acumulada"
          />
          <CondicionCard
            icon={<Wind size={24} className="text-[#6b7280]" />}
            label="Humedad"
            value={`${condiciones.humedad}%`}
            sublabel="Relativa"
          />
          <CondicionCard
            icon={<Wind size={24} className="text-[#8b6f47]" />}
            label="Viento"
            value={`${condiciones.viento} km/h`}
            sublabel="Actual"
          />
          <CondicionCard
            icon={<AlertCircle size={24} className="text-[#d97706]" />}
            label="Sin lluvia"
            value={`${condiciones.dias_sin_lluvia} días`}
            sublabel="Consecutivos"
          />
          <CondicionCard
            icon={<MapPin size={24} className="text-[#4a7c59]" />}
            label="Altitud"
            value={`${zona.altitud}m`}
            sublabel="Zona"
          />
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-[#4a7c59]/10 border border-[#4a7c59]/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-[#4a7c59] mb-2">
              Interpretación del termómetro
            </h4>
            <p className="text-[#f4ebe1]/80 text-sm mb-3">
              El termómetro de recolección combina múltiples factores: temperatura del aire y suelo, 
              precipitación acumulada, humedad relativa, y la compatibilidad con las especies de la zona. 
              Un score alto indica que las condiciones son favorables para la fructificación.
            </p>
            <p className="text-[#f4ebe1]/80 text-sm">
              <strong>Recuerda:</strong> Las condiciones pueden cambiar rápidamente. Consulta la previsión 
              meteorológica antes de planificar tu salida.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CondicionCard({ icon, label, value, sublabel }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-[#8b6f47]/20 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[#f4ebe1]/70 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[#f4ebe1] mb-1">
        {value}
      </div>
      <div className="text-[#f4ebe1]/50 text-xs">
        {sublabel}
      </div>
    </div>
  );
}

// ========== PESTAÑA 2: CALENDARIO ==========
function CalendarioTab({ especiesZona }) {
  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const mesesCompletos = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const fructificaEnMes = (especie, mes) => {
    return especie.meses_fructificacion && especie.meses_fructificacion.includes(mes);
  };

  const getColorComestibilidad = (comestibilidad) => {
    switch(comestibilidad) {
      case 'excelente':
        return 'bg-[#059669] text-white';
      case 'bueno':
        return 'bg-[#4a7c59] text-white';
      case 'comestible':
        return 'bg-[#8b6f47] text-white';
      case 'toxico':
      case 'mortal':
        return 'bg-[#dc2626] text-white';
      default:
        return 'bg-[#6b7280] text-white';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-display text-2xl font-bold text-[#f4ebe1]">
        📅 Calendario de Fructificación
      </h3>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 items-center text-sm">
        <span className="text-[#f4ebe1]/80 font-medium">Leyenda:</span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#059669]"></div>
          <span className="text-[#f4ebe1]/70">Época óptima</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-white/5"></div>
          <span className="text-[#f4ebe1]/70">Fuera de temporada</span>
        </div>
      </div>

      {/* Tabla Desktop */}
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
            {especiesZona.map((especie) => (
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
                        {especie.nombres_comunes?.slice(0, 2).map((nombre, i) => (
                          <span key={i} className="text-[#8b6f47] text-xs">
                            {nombre}
                          </span>
                        ))}
                      </div>
                      <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getColorComestibilidad(especie.comestibilidad)}`}>
                        {especie.comestibilidad === 'excelente' ? '⭐' :
                         especie.comestibilidad === 'bueno' ? '✓' :
                         especie.comestibilidad === 'toxico' ? '⚠' :
                         especie.comestibilidad === 'mortal' ? '☠' :
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

      {/* Cards Mobile */}
      <div className="md:hidden space-y-4">
        {especiesZona.map((especie) => (
          <div 
            key={especie.id}
            className="bg-white/5 rounded-xl p-4 border border-[#8b6f47]/30"
          >
            <div className="flex items-start gap-3 mb-4 pb-4 border-b border-[#8b6f47]/20">
              <span className="text-3xl">🍄</span>
              <div className="flex-1">
                <div className="font-semibold text-[#f4ebe1] mb-1">
                  {especie.nombre_cientifico}
                </div>
                <div className="text-[#8b6f47] text-sm mb-2">
                  {especie.nombres_comunes?.join(', ')}
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getColorComestibilidad(especie.comestibilidad)}`}>
                  {especie.comestibilidad.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {mesesNombres.map((mes, idx) => (
                <div
                  key={idx}
                  className={`text-center py-3 rounded-lg text-xs font-medium transition-all ${
                    fructificaEnMes(especie, idx + 1)
                      ? 'bg-[#059669] text-white shadow-lg'
                      : 'bg-white/5 text-[#f4ebe1]/40'
                  }`}
                >
                  {mes}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {mesesCompletos.map((mes, idx) => {
          const especiesEnMes = especiesZona.filter(e => fructificaEnMes(e, idx + 1));
          const hayEspecies = especiesEnMes.length > 0;
          
          return (
            <div 
              key={idx}
              className={`p-4 rounded-xl text-center transition-all ${
                hayEspecies 
                  ? 'bg-[#4a7c59]/20 border-2 border-[#4a7c59]' 
                  : 'bg-white/5 border border-[#8b6f47]/20'
              }`}
            >
              <div className={`text-sm font-semibold mb-1 ${hayEspecies ? 'text-[#4a7c59]' : 'text-[#f4ebe1]/60'}`}>
                {mesesNombres[idx]}
              </div>
              <div className={`text-2xl font-bold ${hayEspecies ? 'text-[#f4ebe1]' : 'text-[#f4ebe1]/40'}`}>
                {especiesEnMes.length}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========== PESTAÑA 3: DISPONIBLES AHORA ==========
function DisponiblesTab({ especiesDisponibles }) {
  const getProbabilidadColor = (score) => {
    if (score >= 85) return 'text-[#059669] bg-[#059669]/10';
    if (score >= 70) return 'text-[#8b6f47] bg-[#8b6f47]/10';
    if (score >= 60) return 'text-[#d97706] bg-[#d97706]/10';
    return 'text-[#dc2626] bg-[#dc2626]/10';
  };

  const getProbabilidadTexto = (score) => {
    if (score >= 85) return 'Excelente';
    if (score >= 70) return 'Muy alta';
    if (score >= 60) return 'Alta';
    return 'Moderada';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-2xl font-bold text-[#f4ebe1] mb-2">
          🍄 Setas Disponibles en Este Momento
        </h3>
        <p className="text-[#f4ebe1]/60">
          Basado en las condiciones actuales y la época del año
        </p>
      </div>

      {especiesDisponibles.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-[#8b6f47]/30">
          <div className="text-6xl mb-4">🍂</div>
          <h4 className="font-semibold text-xl text-[#f4ebe1] mb-2">
            No hay especies disponibles ahora
          </h4>
          <p className="text-[#f4ebe1]/60 max-w-md mx-auto">
            La época actual no coincide con los períodos de fructificación de las especies de esta zona. 
            Consulta el calendario para ver cuándo volverán a estar disponibles.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {especiesDisponibles.map((especie, idx) => (
            <div
              key={especie.id}
              className="bg-white/5 rounded-xl p-6 border border-[#8b6f47]/30 hover:border-[#8b6f47] transition-all hover:scale-102"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl">🍄</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-display text-xl font-bold text-[#f4ebe1] mb-1">
                        {especie.nombre_cientifico}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-sm text-[#8b6f47]">
                        {especie.nombres_comunes?.slice(0, 3).map((nombre, i) => (
                          <span key={i}>{nombre}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-[#f4ebe1] mb-1">
                        {especie.score}
                      </div>
                      <div className={`text-sm font-semibold px-3 py-1 rounded-full ${getProbabilidadColor(especie.score)}`}>
                        {getProbabilidadTexto(especie.score)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-[#f4ebe1]/60 text-xs mb-1">Días estimados</div>
                      <div className="text-[#f4ebe1] font-semibold">
                        ~{especie.dias_estimados} días
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-[#f4ebe1]/60 text-xs mb-1">Comestibilidad</div>
                      <div className={`font-semibold ${
                        especie.comestibilidad === 'excelente' ? 'text-[#059669]' :
                        especie.comestibilidad === 'bueno' ? 'text-[#4a7c59]' :
                        especie.comestibilidad === 'toxico' ? 'text-[#dc2626]' :
                        'text-[#f4ebe1]'
                      }`}>
                        {especie.comestibilidad === 'excelente' ? '⭐ Excelente' :
                         especie.comestibilidad === 'bueno' ? '✓ Bueno' :
                         especie.comestibilidad === 'toxico' ? '⚠ Tóxica' :
                         especie.comestibilidad}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-[#f4ebe1]/60 text-xs mb-1">Hábitat</div>
                      <div className="text-[#f4ebe1] font-semibold text-sm">
                        {especie.tipos_bosque?.[0] || 'Variable'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ZonaModalMejorado;
