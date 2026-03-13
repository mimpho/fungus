import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { SpeciesCard, SpeciesImg, EdibilityTag, getEdibilityColor, getScoreColor, slugify } from '../lib/helpers'
import { useSpecies } from '../hooks/useSpecies'
import { ZoneCard } from '../components/ui/ZoneCard'
import { LeafletMap } from '../components/map/LeafletMap'
import { mockArticles } from '../data/articles' // MOCK PERMANENTE — artículos son contenido JSX estático, sin backend (v4.5)
import { useZones } from '../hooks/useZones'
import '../articles/Micorrizas'
import '../articles/Esporas'
import '../articles/Venenos'
import '../articles/Recicladores'

function ArticleCard({ article, onSelect }) {
  const { t } = useApp()
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
            ? <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/10 text-cream/50">{t.proximamente}</span>
            : <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-f/20 text-lime-400">{t.nuevo}</span>
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
  const { t, lang, followedZones, toggleFollow, favoriteSpecies, setSelectedZone, setSelectedSpecies } = useApp()
  const navigate = useNavigate()
  const currentMonth = new Date().getMonth() + 1
  const dateLocale = { es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }[lang] || 'es-ES'
  const todayDate = new Date().toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })

  const [mapMode, setMapMode] = useState('markers')

  const openArticle = (article) => {
    if (article.status !== 'published') return
    navigate(`/micologia/${slugify(article.title)}`)
  }

  const { zones, conditionsMap, loading: weatherLoading } = useZones()

  const topZones = useMemo(() =>
    [...zones].sort((a, b) => (conditionsMap[b.id]?.overallScore ?? 0) - (conditionsMap[a.id]?.overallScore ?? 0)).slice(0, 3),
  [zones, conditionsMap])

  // Stats del panel Condiciones Generales — null si los datos del API no incluyen ese campo
  const topStats = useMemo(() => {
    if (!topZones.length) return { tempMedia: null, humMedia: null, lluviaMedia: null }
    const avg = (field) => {
      const vals = topZones.map(z => conditionsMap[z.id]?.[field]).filter(v => v != null)
      return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
    }
    return {
      tempMedia:   avg('temperature'),
      humMedia:    avg('humidity'),
      lluviaMedia: avg('rainfall14d'),
    }
  }, [topZones, conditionsMap])

  const { species } = useSpecies()
  const inSeasonSpecies = useMemo(() =>
    species.filter(e => e.fruitingMonths.includes(currentMonth)),
  [species, currentMonth])

  return (
    <>
    <div className="space-y-10 anim-up pb-20">
      {/* Header */}
      <div>
        <h2 className="font-display text-4xl font-semibold text-cream mb-1">{t.bienvenido}</h2>
        <p className="text-muted text-sm">
          Condiciones micológicas de hoy · {todayDate}
          {weatherLoading && <span className="ml-2 text-bar text-xs">{t.datosActualizando}</span>}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Condiciones Generales */}
        <div className="glass rounded-2xl p-6 hover-lift anim-up">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-muted uppercase tracking-wider mb-1">{t.condicionesGen}</div>
              <div className="font-display text-4xl font-bold text-emerald-400">
                {weatherLoading ? '–' : Math.round(topZones.reduce((acc, z) => acc + (conditionsMap[z.id]?.overallScore ?? 0), 0) / Math.max(topZones.length, 1))}
              </div>
              <div className="text-cream/70 text-xs mt-1">{t.promedioZonasTop}</div>
            </div>
            <img src="/assets/images/icons/temperature.png" alt="temperature" className="w-10 h-10 opacity-70" />
          </div>
          <div className="space-y-2 text-xs">
            {[
              [t.tempMedia,  weatherLoading ? '–' : (topStats.tempMedia   != null ? `${topStats.tempMedia}°C`   : '—')],
              [t.humMedia,   weatherLoading ? '–' : (topStats.humMedia    != null ? `${topStats.humMedia}%`     : '—')],
              [t.lluvia14d,  weatherLoading ? '–' : (topStats.lluviaMedia != null ? `${topStats.lluviaMedia}mm` : '—')],
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
              <div className="text-xs text-emerald-400 uppercase tracking-wider mb-1">🌟 {t.mejorZonaHoy}</div>
              <div className="font-display text-lg font-semibold text-cream truncate">{topZones[0]?.name}</div>
              <div className="text-muted text-xs mt-0.5">{topZones[0]?.province} · {topZones[0]?.elevation}m</div>
            </div>
            <div className="font-display text-3xl font-bold text-emerald-400">{conditionsMap[topZones[0]?.id]?.overallScore}</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-3">
            <div className="text-xs text-emerald-300 mb-1">{t.porQueEsMejor}</div>
            <div className="text-cream/80 text-xs leading-relaxed">
              {(() => {
                const c = conditionsMap[topZones[0]?.id]
                if (!c) return t.cargando
                const lluvia = c.rainfall14d != null ? (c.rainfall14d > 30 ? `Lluvia abundante (${c.rainfall14d}mm)` : `Lluvia moderada (${c.rainfall14d}mm)`) : null
                const temp   = c.temperature != null ? `temperatura óptima (${c.temperature}°C)` : null
                const hum    = c.humidity    != null ? `humedad alta (${c.humidity}%)` : null
                const parts  = [lluvia, temp, hum].filter(Boolean)
                return parts.length ? parts.join(', ') + '.' : `Score OI: ${c.overallScore}/100.`
              })()}
            </div>
          </div>
        </div>

        {/* Especies Activas */}
        <div className="glass rounded-2xl p-6 hover-lift anim-up" style={{ animationDelay: '0.16s' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-muted uppercase tracking-wider mb-1">{t.especiesActivas}</div>
              <div className="font-display text-4xl font-bold text-cream">{inSeasonSpecies.length}</div>
              <div className="text-cream/70 text-xs mt-1">{t.fructificandoMes}</div>
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
              <button onClick={() => navigate(`/especies?mes=${currentMonth}`)}
                className="w-full text-center text-xs text-muted hover:text-coffee-light transition-colors pt-1">
                {t.verTodas} ({inSeasonSpecies.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── ZONAS ─── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-green-f" />
          <h3 className="font-display text-2xl font-semibold text-cream">{t.zonas}</h3>
        </div>

        {/* Top zonas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted text-sm font-medium uppercase tracking-wider">🌟 {t.mejoresCondicionesHoy}</p>
            <button onClick={() => navigate('/zonas?vista=listado')} className="text-muted hover:text-coffee-light text-xs transition-colors">{t.verTodas}</button>
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
              <button onClick={() => navigate('/zonas?seguidas=1&vista=listado')} className="text-muted hover:text-coffee-light text-xs transition-colors">{t.verTodas}</button>
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
                      <div className="text-[10px] opacity-70 mt-0.5">{t[sc.tKey]}</div>
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
            <p className="text-muted text-sm font-medium uppercase tracking-wider">🗺️ {t.dondeRecolectarAhora}</p>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <LeafletMap
              zonas={zones}
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
                <span>{t.bueno}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: '#7a9e3a' }} />
                <span>{t.muyBueno}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ background: '#2d6640' }} />
                <span>{t.excelente}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── ESPECIES ─── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-bar" />
          <h3 className="font-display text-2xl font-semibold text-cream">{t.especies}</h3>
        </div>

        {inSeasonSpecies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted text-sm font-medium uppercase tracking-wider">🌱 {t.fructificandoMes}</p>
              <button onClick={() => navigate('/especies')} className="text-muted hover:text-coffee-light text-xs transition-colors">{t.verTodas}</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {inSeasonSpecies.slice(0, 4).map((e, i) => (
                <SpeciesCard key={e.id} species={e} onOpen={setSelectedSpecies} size="compact" animDelay={i * 0.06} />
              ))}
            </div>
          </div>
        )}

        {favoriteSpecies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted text-sm font-medium uppercase tracking-wider">❤️ {t.favoriteSpecies}</p>
              <button onClick={() => navigate('/especies')} className="text-muted hover:text-coffee-light text-xs transition-colors">{t.verTodas}</button>
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
                        {enTemporada && <span className="text-emerald-400 text-[9px] font-medium">{t.enTemporada}</span>}
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
          <h3 className="font-display text-2xl font-semibold text-cream">{t.micologia}</h3>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted text-sm font-medium uppercase tracking-wider">📖 {t.articulosRecientes}</p>
            <button onClick={() => navigate('/micologia')} className="text-muted hover:text-coffee-light text-xs transition-colors">{t.verTodas}</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockArticles.slice(0, 3).map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onSelect={openArticle} />
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
