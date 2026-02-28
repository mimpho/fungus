import { useState, useMemo, useEffect, useRef } from 'react'
import { useApp } from '../../contexts/AppContext'
import { mockSpecies } from '../../data/species'
import { IC, EdibilityTag, getScoreColor } from '../../lib/helpers'
import { MODAL, MONTHS } from '../../lib/constants'
import { LeafletMap } from '../map/LeafletMap'
import { useZoneConditions } from '../../hooks/useWeatherConditions'

const CAL_FILTERS = [
  { id: 'todas',      label: 'Todas',       emoji: '🍄' },
  { id: 'excelente',  label: 'Excelentes',  emoji: '⭐' },
  { id: 'comestible', label: 'Comestibles', emoji: '✅' },
  { id: 'toxico',     label: 'Tóxicas',     emoji: '⚠️' },
  { id: 'mortal',     label: 'Mortales',    emoji: '☠️' },
]

export function ZoneModal({ zone, onClose }) {
  const { t, followedZones, toggleFollow, setSelectedSpecies } = useApp()
  const isFollowed = followedZones.some(z => z.id === zone.id)
  const zoneSpecies = mockSpecies.filter(e => e.forestTypes?.includes(zone.forestType))
  const { conditions: weatherConditions, loading: weatherLoading, updatedAt } = useZoneConditions(zone)
  // Mientras carga, usar valores neutros para no romper el UI
  const conditions = weatherConditions ?? { overallScore: 0, temperature: '–', soilTemp: '–', rainfall14d: '–', humidity: '–', wind: '–', dryDays: '–' }

  const updatedLabel = updatedAt
    ? `Actualizado el ${new Date(updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} a las ${new Date(updatedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    : 'Open-Meteo'
  const currentMonth = new Date().getMonth() + 1
  const sc = getScoreColor(conditions.overallScore)
  const [calFilter, setCalFilter] = useState('todas')
  const [scrolled, setScrolled] = useState(false)
  const modalRef = useRef(null)
  const heroRef = useRef(null)

  const available = useMemo(() =>
    zoneSpecies
      .filter(e => e.fruitingMonths?.includes(currentMonth))
      .map(e => ({ ...e, score: Math.floor(60 + Math.random() * 35), dias: Math.floor(3 + Math.random() * 8) }))
      .sort((a, b) => b.score - a.score),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zone.id]
  )

  // Imagen de paisaje por tipo de bosque (WebP, ~11 kB c/u)
  const ZONE_HERO = { pinar: '/assets/images/zones/pinar.webp', hayedo: '/assets/images/zones/hayedo.webp', robledal: '/assets/images/zones/robledal.webp', encinar: '/assets/images/zones/encinar.webp' }

  const filteredCalSpecies = useMemo(() => {
    if (calFilter === 'excelente') return zoneSpecies.filter(e => e.edibility === 'excelente')
    if (calFilter === 'comestible') return zoneSpecies.filter(e => ['bueno', 'comestible', 'precaucion'].includes(e.edibility))
    if (calFilter === 'toxico') return zoneSpecies.filter(e => e.edibility === 'toxico')
    if (calFilter === 'mortal') return zoneSpecies.filter(e => e.edibility === 'mortal')
    return zoneSpecies
  }, [calFilter, zoneSpecies])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center modal-outer"
      style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)', overflowY: 'auto' }} onClick={onClose}>
      <div
        ref={modalRef}
        onScroll={() => setScrolled((modalRef.current?.scrollTop ?? 0) > (heroRef.current?.offsetHeight ?? 176) * 0.85)}
        className="sm:my-8 rounded-2xl max-w-4xl w-full anim-scale modal-inner"
        style={{ background: MODAL.bg }}
        onClick={e => e.stopPropagation()}>

        {/* Mini-barra sticky */}
        <div className={`glass sticky top-0 z-20 flex items-center gap-3 px-4 overflow-hidden transition-all duration-200 sm:rounded-t-2xl ${scrolled ? 'max-h-20 py-3 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'}`}
          style={{ borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div className="flex-1 min-w-0">
            <p className="font-display text-xl font-semibold text-cream truncate">{zone.name}</p>
            <p className="text-muted/60 text-xs truncate">{zone.province} · {zone.forestType}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => toggleFollow(zone)}
              className={`p-2 rounded-xl transition-all ${isFollowed ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30' : 'text-white/50 hover:text-yellow-400 hover:bg-white/10'}`}>
              {IC.star(isFollowed)}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">{IC.close}</button>
          </div>
        </div>

        {/* Hero */}
        <div className="modal-header sm:rounded-t-2xl overflow-hidden" style={{ background: MODAL.bg }}>
          <div ref={heroRef} className="relative overflow-hidden" style={{ minHeight: '176px', height: '50vh' }}>
            <img
              src={ZONE_HERO[zone.forestType] || ZONE_HERO.pinar}
              alt={zone.forestType}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center', opacity: 0.75 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-modal via-modal/0 to-transparent" />
            <div className="absolute bottom-4 left-6 right-14">
              <h2 className="font-display text-3xl font-semibold text-cream drop-shadow-lg">{zone.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-green-f/30 text-green-300 text-xs font-medium">{zone.province}</span>
                <span className="flex items-center gap-1 text-cream/60 text-xs">
                  <img src={`/assets/images/icons/forest-type-${zone.forestType}.png`} alt={zone.forestType} height="14" width="14" />
                  {zone.forestType}
                </span>
                <span className="flex items-center gap-1 text-cream/60 text-xs">
                  <img src="/assets/images/icons/mountain.png" alt="elevation" height="14" width="14" />
                  {zone.elevation}m
                </span>
              </div>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => toggleFollow(zone)}
                className={`p-2.5 rounded-xl transition-all backdrop-blur-sm ${isFollowed ? 'bg-yellow-400/25 text-yellow-400' : 'bg-black/40 text-white/60 hover:text-yellow-400'}`}
                title={isFollowed ? t.siguiendo : t.seguir}>
                {IC.star(isFollowed)}
              </button>
              <button onClick={onClose} className="p-2.5 rounded-xl bg-black/40 text-white/60 hover:text-white transition-all backdrop-blur-sm">
                {IC.close}
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-8" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
          {zone.description && (
            <p className="text-cream/60 text-sm leading-relaxed border-l-2 border-muted/40 pl-4">{zone.description}</p>
          )}

          {/* Termómetro */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">{t.termometro}</h3>
            <p className="text-cream/40 text-xs mb-3 leading-relaxed">
              El índice pondera datos meteorológicos en tiempo real junto al factor estacional del mes actual para calcular las condiciones de recolección.
            </p>
            <div className="flex items-center gap-4 bg-white/[0.03] rounded-xl p-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-semibold ${sc.text}`}>{sc.label}</span>
                  <span className="font-display text-xl font-bold text-cream">{conditions.overallScore}<span className="text-xs text-cream/40 font-sans">/100</span></span>
                </div>
                <div className="progress-bar h-[8px]">
                  <div className={`progress-fill ${sc.bar}`} style={{ width: `${conditions.overallScore}%`, height: '8px' }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-3">
              {[
                { icon: 'temperature', l: 'Temperatura', v: `${conditions.temperature}°C` },
                { icon: 'soil-moisture', l: 'T. Suelo', v: `${conditions.soilTemp}°C` },
                { icon: 'accumulated-precipitation', l: 'Precipit. 14d', v: `${conditions.rainfall14d}mm` },
                { icon: 'humidity', l: 'Humedad', v: `${conditions.humidity}%` },
                { icon: 'wind', l: 'Viento', v: `${conditions.wind}km/h` },
                { icon: 'sunny', l: 'Sin lluvia', v: `${conditions.dryDays}d` },
              ].map((c, i) => (
                <div key={i} className="bg-white/[0.03] rounded-xl p-3 text-center">
                  <img className="m-auto mb-1" src={`/assets/images/icons/${c.icon}.png`} alt={c.l} height="36" width="36" />
                  <div className="text-cream/70 text-[11px] mb-1">{c.l}</div>
                  <div className="text-cream text-sm font-semibold">{c.v}</div>
                </div>
              ))}
            </div>
            {!weatherLoading && (
              <p className="text-cream/25 text-[11px] mt-2 text-right">{updatedLabel}</p>
            )}
          </section>

          {/* Disponibles ahora */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">{t.disponiblesAhora}</h3>
            {available.length === 0 ? (
              <div className="text-center py-8 text-cream/40 text-sm">No hay especies disponibles este mes.</div>
            ) : (
              <div className="space-y-2">
                {available.map(e => {
                  const ss = getScoreColor(e.score)
                  return (
                    <div key={e.id} onClick={() => setSelectedSpecies(e)}
                      className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3 hover:bg-white/[0.05] transition-all cursor-pointer group">
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={e.photo?.url} alt={e.scientificName}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          onError={ev => { ev.target.parentNode.style.background = 'rgba(139,111,71,0.15)'; ev.target.style.display = 'none' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-lg text-cream truncate group-hover:text-coffee-light transition-colors">{e.scientificName}</div>
                        <EdibilityTag edibility={e.edibility} variant="glass" />
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`font-semibold text-sm ${ss.text}`}>{e.score}</div>
                        <div className="text-cream/40 text-[10px]">~{e.dias} días</div>
                        <svg className="w-3 h-3 text-cream/20 group-hover:text-muted transition-colors ml-auto mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Calendario */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">{t.calendarioFruct}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {CAL_FILTERS.map(f => {
                const active = calFilter === f.id
                return (
                  <button key={f.id} onClick={() => setCalFilter(f.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${active ? 'bg-green-f/40 text-[#8fcc9a] border border-green-f/60' : 'bg-white/[0.04] text-cream/50 border border-white/[0.06] hover:bg-white/[0.08] hover:text-cream/80'}`}>
                    <span>{f.emoji}</span>{f.label}
                  </button>
                )
              })}
              <span className="ml-auto self-center text-cream/30 text-[11px]">
                {filteredCalSpecies.length} especie{filteredCalSpecies.length !== 1 ? 's' : ''}
              </span>
            </div>
            {filteredCalSpecies.length === 0 ? (
              <div className="text-center py-8 text-cream/40 text-sm">No hay especies de este tipo en esta zona.</div>
            ) : (
              <div className="space-y-3">
                {filteredCalSpecies.map(e => (
                  <div key={e.id} onClick={() => setSelectedSpecies(e)}
                    className="bg-white/[0.03] rounded-xl p-4 hover:bg-white/[0.05] transition-all cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-display text-lg text-cream group-hover:text-coffee-light transition-colors">{e.scientificName}</span>
                      <EdibilityTag edibility={e.edibility} variant="glass" className="ml-auto" />
                      <svg className="w-3 h-3 text-cream/20 group-hover:text-muted transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <div className="grid grid-cols-12 gap-1">
                      {MONTHS.map((m, i) => (
                        <div key={i} className={`text-center py-1.5 rounded text-[9px] font-medium ${e.fruitingMonths?.includes(i + 1) ? 'bg-emerald-500/25 text-emerald-400' : 'bg-white/[0.03] text-cream/20'}`}>{m}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Ubicación */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">{t.ubicacion}</h3>
            <LeafletMap singleZone={zone} height="280px" title={zone.name} />
            <div className="flex items-center gap-2 mt-2 text-cream/40 text-xs flex-wrap">
              <span className="flex items-center gap-1">{IC.pin} {zone.lat?.toFixed(4)}, {zone.lng?.toFixed(4)}</span>
              <span className="flex items-center gap-1">
                <img src="/assets/images/icons/mountain.png" alt="elevation" height="14" width="14" />
                {zone.elevation}m s.n.m.
              </span>
              <span className="flex items-center gap-1">
                <img src={`/assets/images/icons/forest-type-${zone.forestType}.png`} alt={zone.forestType} height="14" width="14" />
                {zone.forestType}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
