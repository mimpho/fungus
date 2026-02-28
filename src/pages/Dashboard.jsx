import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { mockZones } from '../data/zones'
import { mockSpecies } from '../data/species'
import { SpeciesCard, SpeciesImg, EdibilityTag, getEdibilityColor, getScoreColor } from '../lib/helpers'
import { ZoneCard } from '../components/ui/ZoneCard'
import { LeafletMap } from '../components/map/LeafletMap'
import { mockArticles } from '../data/articles'
import { ArticleModal } from '../components/modals/ArticleModal'
import { useAllZoneConditions } from '../hooks/useWeatherConditions'
import '../articles/Micorrizas'
import '../articles/Esporas'
import '../articles/Venenos'

function ArticleCard({ article, onSelect }) {
  const isPublished = article.status === 'published'
  return (
    <div
      onClick={() => isPublished && onSelect(article)}
      className={`glass rounded-2xl overflow-hidden transition-all duration-200 ${isPublished ? 'hover-lift cursor-pointer border border-green-f/20' : 'opacity-60 border border-white/[0.05]'}`}>
      <div className="h-44 relative overflow-hidden">
        {article.heroImage
          ? <img src={article.heroImage} className="w-full h-full object-cover" alt={article.title} />
          : <div className="w-full h-full bg-white/[0.03] flex items-center justify-center text-4xl">{article.emoji || '🍄'}</div>
        }
        <div className="absolute top-3 right-3">
          {!isPublished
            ? <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/10 text-cream/50">Próximamente</span>
            : <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-f/20 text-lime-400">Nuevo</span>
          }
        </div>
      </div>
      <div className="px-4 pb-4 pt-3">
        <h4 className="font-display text-base text-cream leading-snug mb-1">{article.title}</h4>
        <p className="text-xs text-muted/60 leading-relaxed line-clamp-2">{article.summary}</p>
        <div className="flex items-center gap-2 mt-3">
          {article.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
          {article.readingTime && (
            <span className="text-[10px] text-cream/25 ml-auto">{article.readingTime} min</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { t, followedZones, toggleFollow, favoriteSpecies, setSelectedZone, setSelectedSpecies } = useApp()
  const navigate = useNavigate()
  const currentMonth = new Date().getMonth() + 1
  const todayDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  const [mapMode, setMapMode] = useState('markers')
  const [selectedArticleSlug, setSelectedArticleSlug] = useState(null)

  const { conditionsMap, loading: weatherLoading } = useAllZoneConditions(mockZones)

  const topZones = useMemo(() =>
    [...mockZones].sort((a, b) => (conditionsMap[b.id]?.overallScore ?? 0) - (conditionsMap[a.id]?.overallScore ?? 0)).slice(0, 3),
  [conditionsMap])

  const inSeasonSpecies = useMemo(() =>
    mockSpecies.filter(e => e.fruitingMonths.includes(currentMonth)).slice(0, 4),
  [currentMonth])

  return (
    <>
    {selectedArticleSlug && (
      <ArticleModal slug={selectedArticleSlug} onClose={() => setSelectedArticleSlug(null)} />
    )}
    <div className="space-y-10 anim-up pb-20">
      {/* Header */}
      <div>
        <h2 className="font-display text-4xl font-semibold text-cream mb-1">Bienvenido</h2>
        <p className="text-muted text-sm">
          Condiciones micológicas de hoy · {todayDate}
          {weatherLoading && <span className="ml-2 text-bar text-xs">· actualizando datos reales…</span>}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Condiciones Generales */}
        <div className="glass rounded-2xl p-6 hover-lift anim-up">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-muted uppercase tracking-wider mb-1">Condiciones Generales</div>
              <div className="font-display text-4xl font-bold text-emerald-400">
                {weatherLoading ? '–' : Math.round(topZones.reduce((acc, z) => acc + (conditionsMap[z.id]?.overallScore ?? 0), 0) / Math.max(topZones.length, 1))}
              </div>
              <div className="text-cream/70 text-xs mt-1">Promedio zonas top</div>
            </div>
            <img src="/assets/images/icons/temperature.png" alt="temperature" className="w-10 h-10 opacity-70" />
          </div>
          <div className="space-y-2 text-xs">
            {[
              ['Temperatura media', weatherLoading ? '–' : `${Math.round(topZones.reduce((acc, z) => acc + (conditionsMap[z.id]?.temperature ?? 0), 0) / Math.max(topZones.length, 1))}°C`],
              ['Humedad media',     weatherLoading ? '–' : `${Math.round(topZones.reduce((acc, z) => acc + (conditionsMap[z.id]?.humidity ?? 0), 0) / Math.max(topZones.length, 1))}%`],
              ['Lluvia últimos 14d',weatherLoading ? '–' : `${Math.round(topZones.reduce((acc, z) => acc + (conditionsMap[z.id]?.rainfall14d ?? 0), 0) / Math.max(topZones.length, 1))}mm`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-cream/60">{label}</span>
                <span className="text-cream font-medium">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mejor Zona del Día */}
        <div className="glass rounded-2xl p-6 hover-lift anim-up cursor-pointer"
          style={{ animationDelay: '0.08s' }}
          onClick={() => setSelectedZone(topZones[0])}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-emerald-400 uppercase tracking-wider mb-1">🌟 Mejor Zona Hoy</div>
              <div className="font-display text-lg font-semibold text-cream truncate">{topZones[0]?.name}</div>
              <div className="text-muted text-xs mt-0.5">{topZones[0]?.province} · {topZones[0]?.elevation}m</div>
            </div>
            <div className="font-display text-3xl font-bold text-emerald-400">{conditionsMap[topZones[0]?.id]?.overallScore}</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-3">
            <div className="text-xs text-emerald-300 mb-1">¿Por qué es la mejor?</div>
            <div className="text-cream/80 text-xs leading-relaxed">
              {conditionsMap[topZones[0]?.id]?.rainfall14d > 30 ? `Lluvia abundante (${conditionsMap[topZones[0]?.id]?.rainfall14d}mm), ` : 'Lluvia moderada, '}
              temperatura óptima ({conditionsMap[topZones[0]?.id]?.temperature}°C), humedad alta ({conditionsMap[topZones[0]?.id]?.humidity}%).
            </div>
          </div>
        </div>

        {/* Especies Activas */}
        <div className="glass rounded-2xl p-6 hover-lift anim-up" style={{ animationDelay: '0.16s' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-muted uppercase tracking-wider mb-1">Especies Activas</div>
              <div className="font-display text-4xl font-bold text-cream">{inSeasonSpecies.length}</div>
              <div className="text-cream/70 text-xs mt-1">Fructificando este mes</div>
            </div>
            <img src="/assets/images/icons/mushroom.png" alt="season" className="w-10 h-10 opacity-70" />
          </div>
          <div className="space-y-2">
            {inSeasonSpecies.slice(0, 3).map(e => (
              <div key={e.id}
                className="flex items-center gap-2 bg-white/[0.03] rounded-lg p-2 cursor-pointer hover:bg-white/[0.06] transition-colors"
                onClick={() => setSelectedSpecies(e)}>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getEdibilityColor(e.edibility).dot}`} />
                <div className="font-display text-xs text-cream truncate">{e.scientificName}</div>
              </div>
            ))}
            {inSeasonSpecies.length > 3 && (
              <button onClick={() => navigate('/especies')}
                className="w-full text-center text-xs text-muted hover:text-coffee-light transition-colors pt-1">
                Ver todas las {inSeasonSpecies.length} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── ZONAS ─── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-green-f" />
          <h3 className="font-display text-2xl font-semibold text-cream">Zonas</h3>
        </div>

        {/* Top zonas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted text-sm font-medium uppercase tracking-wider">🌟 Mejores condiciones hoy</p>
            <button onClick={() => navigate('/zonas')} className="text-muted hover:text-coffee-light text-xs transition-colors">Ver todas →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topZones.map(z => (
              <ZoneCard key={z.id} zone={z}
                isFollowed={followedZones.some(fz => fz.id === z.id)}
                onToggle={() => toggleFollow(z)}
                onClick={() => setSelectedZone(z)}
                condOverride={conditionsMap[z.id]} />
            ))}
          </div>
        </div>

        {/* Zonas seguidas */}
        {followedZones.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted text-sm font-medium uppercase tracking-wider">⭐ {t.followedZones}</p>
              <button onClick={() => navigate('/zonas')} className="text-muted hover:text-coffee-light text-xs transition-colors">Ver todas →</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {followedZones.slice(0, 4).map(z => {
                const cond = conditionsMap[z.id] ?? { overallScore: 0, temperature: '–', humidity: '–', rainfall14d: '–' }
                const sc   = getScoreColor(cond.overallScore)
                return (
                  <div key={z.id} onClick={() => setSelectedZone(z)}
                    className="glass rounded-xl p-4 flex items-center gap-4 hover-lift cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-cream text-sm truncate">{z.name}</div>
                      <div className="text-muted text-xs">{z.province} · {z.forestType} · {z.elevation}m</div>
                      <div className="mt-2 progress-bar">
                        <div className={`progress-fill ${sc.bar}`} style={{ width: `${cond.overallScore}%` }} />
                      </div>
                    </div>
                    <div className={`text-right ${sc.text} shrink-0`}>
                      <div className="text-sm font-semibold">{cond.overallScore}<span className="text-xs font-normal opacity-60">/100</span></div>
                      <div className="text-[10px] opacity-70 mt-0.5">{sc.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {/* Mapa */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted text-sm font-medium uppercase tracking-wider">🗺️ Dónde recolectar ahora</p>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <LeafletMap
              zonas={mockZones}
              onZoneClick={setSelectedZone}
              height="420px"
              mode={mapMode}
              onModeChange={setMapMode}
              title="Zonas micológicas" />
          </div>
          {mapMode === 'heatmap' && (
            <div className="mt-3 flex items-center justify-center gap-6 text-xs text-cream/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: '#d97706' }} />
                <span>Bueno</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: '#7a9e3a' }} />
                <span>Muy bueno</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: '#2d6640' }} />
                <span>Excelente</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── ESPECIES ─── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-bar" />
          <h3 className="font-display text-2xl font-semibold text-cream">Especies</h3>
        </div>

        {inSeasonSpecies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted text-sm font-medium uppercase tracking-wider">🌱 Fructificando este mes</p>
              <button onClick={() => navigate('/especies')} className="text-muted hover:text-coffee-light text-xs transition-colors">Ver catálogo →</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {inSeasonSpecies.map((e, i) => (
                <SpeciesCard key={e.id} species={e} onOpen={setSelectedSpecies} size="compact" animDelay={i * 0.06} />
              ))}
            </div>
          </div>
        )}

        {favoriteSpecies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted text-sm font-medium uppercase tracking-wider">❤️ {t.favoriteSpecies}</p>
              <button onClick={() => navigate('/especies')} className="text-muted hover:text-coffee-light text-xs transition-colors">Ver todas →</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {favoriteSpecies.slice(0, 6).map(e => {
                const enTemporada = e.fruitingMonths.includes(currentMonth)
                return (
                  <div key={e.id} onClick={() => setSelectedSpecies(e)}
                    className="flex items-center gap-3 glass rounded-xl px-3 py-2.5 cursor-pointer hover-lift transition-all">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                      <SpeciesImg localSrc={e.photo?.url} scientificName={e.scientificName} className="w-full h-full opacity-80" objectFit="cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm text-cream truncate max-w-[120px]">{e.scientificName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <EdibilityTag edibility={e.edibility} variant="glass" showDot className="text-[9px] px-0 bg-transparent" />
                        {enTemporada && <span className="text-emerald-400 text-[9px] font-medium">EN TEMPORADA</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── MICOLOGÍA ─── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-coffee/60" />
          <h3 className="font-display text-2xl font-semibold text-cream">Micología</h3>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted text-sm font-medium uppercase tracking-wider">📖 Artículos recientes</p>
            <button onClick={() => navigate('/micologia')} className="text-muted hover:text-coffee-light text-xs transition-colors">Ver todos →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockArticles.slice(0, 3).map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onSelect={a => setSelectedArticleSlug(a.slug)} />
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
