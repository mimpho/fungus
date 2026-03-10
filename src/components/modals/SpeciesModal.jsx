import { useState, useMemo, useEffect, useRef } from 'react'
import { useApp } from '../../contexts/AppContext'
import { mockFamilies } from '../../data/families' // MOCK PERMANENTE — sin endpoint de familias planificado (v4.5)
import { IC, EdibilityTag, SpeciesImg, getScoreColor, TaxonomyBlock, ConfusionesBlock, resolveUrl } from '../../lib/helpers'
import { useZones } from '../../hooks/useZones'
import { useSpecies } from '../../hooks/useSpecies'
import { fetchSpeciesDetail } from '../../services/apiService'
import { MODAL, MONTHS } from '../../lib/constants'
import { LeafletMap } from '../map/LeafletMap'

// ─────────────────────────────────────────────────────────────────────────────
// GallerySection — muestra la galería de fotos de una especie.
// Rastrea el estado de carga de cada imagen en tiempo real:
//   • Si todas las imágenes fallan (404 / error de red) → se oculta la sección
//   • Si al menos una carga → muestra la galería normalmente
// ─────────────────────────────────────────────────────────────────────────────
function GallerySection({ species, onOpenLightbox }) {
  const mainPhoto = species.photo?.url
    ? { url: species.photo.largeUrl || species.photo.url, caption: species.scientificName }
    : null
  const extraPhotos = species.photos || []
  const allPhotos = [...(mainPhoto ? [mainPhoto] : []), ...extraPhotos]
  const total = allPhotos.length

  const [errored, setErrored] = useState(0)
  const onErr = () => setErrored(n => n + 1)

  // Nada que mostrar, o todas las imágenes han fallado
  if (total === 0 || errored >= total) return null

  const mainUrl = resolveUrl(species.photo?.largeUrl || species.photo?.url)

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-3">
        Galería ({total} {total === 1 ? 'foto' : 'fotos'})
      </h3>
      <div className={`grid gap-2 ${
        extraPhotos.length === 0 ? 'grid-cols-1'
        : extraPhotos.length === 1 ? 'grid-cols-2'
        : extraPhotos.length === 2 ? 'grid-cols-2 sm:grid-cols-4 sm:grid-rows-2 w-full sm:aspect-[2/1] sm:overflow-hidden'
        : 'grid-cols-4'
      }`}>
        {/* Foto principal */}
        <div
          className={`gallery-thumb group relative overflow-hidden rounded-lg cursor-pointer${extraPhotos.length === 2 ? ' col-span-2 sm:col-span-3 sm:row-span-2' : ''}`}
          style={extraPhotos.length === 2 ? { minHeight: 0 } : { aspectRatio: '4/3' }}
          onClick={() => onOpenLightbox(allPhotos, 0)}>
          <img
            src={mainUrl}
            alt={species.scientificName}
            className="w-full h-full object-cover object-top"
            onError={onErr}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center rounded-lg">
            <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[9px] text-white/80 truncate rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
            {species.scientificName}
          </div>
        </div>

        {/* Fotos extra */}
        {extraPhotos.map((foto, i) => (
          <div key={i}
            className={`gallery-thumb group relative cursor-pointer overflow-hidden rounded-lg${extraPhotos.length === 2 ? ' col-span-1 row-span-1' : ''}`}
            style={extraPhotos.length === 2 ? { minHeight: 0 } : { aspectRatio: '4/3' }}
            onClick={() => onOpenLightbox(allPhotos, i + 1)}>
            <img
              src={resolveUrl(foto.url)}
              alt={foto.caption || ''}
              className="w-full h-full object-cover"
              onError={onErr}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
            {foto.caption && (
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[9px] text-white/80 truncate rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                {foto.caption}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-cream/30 text-[11px] mt-2 text-center">
        Haz clic en cualquier imagen para verla a pantalla completa · ← → para navegar
      </p>
    </section>
  )
}

export function SpeciesModal({ species, onClose }) {
  const { t, favoriteSpecies, toggleFavorite, setSelectedFamily, setSelectedSpecies, setSelectedZone, setLightbox, lightbox } = useApp()
  const isFav = favoriteSpecies.some(f => f.id === species.id)
  const family = mockFamilies[species.family]
  const [scrolled, setScrolled] = useState(false)
  const modalRef = useRef(null)
  const heroRef = useRef(null)

  // Detalle enriquecido cargado de forma lazy (cap, stem, photos…)
  // Mientras carga, usamos el species del prop (que tiene los campos básicos)
  const [detail, setDetail] = useState(species)
  const [detailLoading, setDetailLoading] = useState(true)

  useEffect(() => {
    // Siempre fetch el detalle — mockSpecies no tiene _partial, así que no podemos
    // confiar en ese flag. _detailCache evita peticiones duplicadas.
    let cancelled = false
    setDetail(species)
    setDetailLoading(true)
    fetchSpeciesDetail(species.id)
      .then(full => { if (!cancelled) { setDetail(full); setDetailLoading(false) } })
      .catch(() => { if (!cancelled) setDetailLoading(false) }) // fallback: usar lo que hay
    return () => { cancelled = true }
  }, [species.id])  // eslint-disable-line react-hooks/exhaustive-deps

  // Hooks de datos
  const { zones } = useZones()
  const { species: allSpecies } = useSpecies()

  // Referencia estable a onClose para usarla en el listener de teclado
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  const compatZones = useMemo(() => {
    if (detail.distributionZones?.length > 0) {
      return zones.filter(z => detail.distributionZones.includes(z.id))
    }
    return zones.filter(z => detail.forestTypes?.includes(z.forestType))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.id, zones])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ESC cierra el modal — desactivado mientras el lightbox esté abierto
  // (el lightbox tiene su propio listener; si ambos estuvieran activos
  //  el ESC cerraría el lightbox Y el modal al mismo tiempo)
  useEffect(() => {
    if (lightbox) return  // el lightbox se ocupa del ESC
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox])  // se registra/desregistra cuando cambia el estado del lightbox

  useEffect(() => {
    if (modalRef.current) modalRef.current.scrollTop = 0
    setScrolled(false)
  }, [species.id])

  const handleOpenLightbox = (photos, index) => {
    setLightbox({ photos, index })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center modal-outer"
      style={{ background: MODAL.overlay, backdropFilter: 'blur(8px)', overflowY: 'auto' }} onClick={onClose}>
      <div
        ref={modalRef}
        onScroll={() => setScrolled((modalRef.current?.scrollTop ?? 0) > (heroRef.current?.offsetHeight ?? 224) * 0.85)}
        className="sm:my-8 rounded-2xl max-w-4xl w-full anim-scale modal-inner"
        style={{ background: MODAL.bg }}
        onClick={e => e.stopPropagation()}>

        {/* Mini-barra sticky */}
        <div className={`glass-olive sticky top-0 z-20 flex items-center gap-3 px-4 overflow-hidden transition-all duration-200 sm:rounded-t-2xl ${scrolled ? 'max-h-20 py-3 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'}`}
          style={{ borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div className="flex-1 min-w-0">
            <p className="font-display text-xl font-semibold text-cream truncate">{detail.scientificName}</p>
            <p className="text-muted/80 text-xs truncate">{detail.commonNames?.[0]}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => toggleFavorite(species)}
              className={`p-2 rounded-xl transition-all ${isFav ? 'text-red-400' : 'text-cream/50 hover:text-red-400'}`}>
              {IC.heart(isFav)}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">{IC.close}</button>
          </div>
        </div>

        {/* Hero foto */}
        <div ref={heroRef} className="relative min-h-[50vh] aspect-video w-full overflow-hidden sm:rounded-t-2xl modal-header">
          <SpeciesImg localSrc={detail.photo?.largeUrl || detail.photo?.url} scientificName={detail.scientificName} className="w-full h-full" objectFit="cover" objectPosition="top" />
          <div className="absolute inset-0 bg-gradient-to-t from-modal via-modal/0 to-transparent" />
          <div className="absolute bottom-0 left-6 right-6">
            <h2 className="font-display text-4xl font-semibold text-cream drop-shadow-lg">{detail.scientificName}</h2>
            <p className="text-muted text-sm mt-1">{detail.family} · {detail.commonNames?.[0]}</p>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => toggleFavorite(species)}
              className={`p-2 rounded-xl transition-all ${isFav ? 'bg-red-500/20 text-red-400' : 'bg-black/40 text-white/50 hover:text-red-400'}`}>
              {IC.heart(isFav)}
            </button>
            <button onClick={onClose} className="p-2 rounded-xl bg-black/40 text-white/80 hover:text-white transition-all">{IC.close}</button>
          </div>
        </div>

        <div className="px-4 py-6 sm:px-6 space-y-8" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
          {/* Comestibilidad + familia */}
          <div className="flex flex-wrap gap-3 items-center">
            <EdibilityTag edibility={detail.edibility} variant="glass" showDot={true} className="px-4 py-2 rounded-xl text-sm font-semibold" />
            {family && (
              <button onClick={() => {
                // Mismo patrón que abrir modal de zona desde aquí:
                // dejar que ModalRenderer navegue a /familia/:slug
                // sin alterar el historial previo → ESC/Back vuelve a esta seta
                setSelectedSpecies(null)
                setSelectedFamily(family)
              }}
                className="glass px-4 py-2 rounded-xl text-sm text-muted hover:text-coffee-light transition-colors">
                🔬 {t.ver_familia}: {detail.family}
              </button>
            )}
          </div>

          {detail.edibility === 'mortal' && (
            <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-red-500/40 bg-red-500/10">
              {IC.warning}
              <div>
                <div className="font-bold text-red-400 mb-1">ESPECIE MORTAL — PELIGRO EXTREMO</div>
                <p className="text-red-300/80 text-sm">Esta especie puede causar la muerte. NUNCA la consumas. En caso de ingestión, contacta inmediatamente con Urgencias (112) o el Centro Toxicológico (91 562 04 20).</p>
              </div>
            </div>
          )}

          {/* Nombres comunes + Taxonomía */}
          {detail.commonNames?.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-3">{t.tambienConocida}</h3>
              <div className="flex flex-wrap gap-2">
                {detail.commonNames.map((n, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-bar/15 text-coffee-light text-sm">{n}</span>
                ))}
              </div>
              <TaxonomyBlock species={detail} />
            </section>
          )}

          {/* Descripción */}
          {detail.description && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-3">{t.descripcion}</h3>
              <p className="text-cream/70 text-sm leading-relaxed">{detail.description}</p>
            </section>
          )}

          {/* Hábitat + altitud */}
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-3">{t.habitat}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {detail.forestTypes?.map((b, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-green-f/15 text-green-400/80 text-sm">🌲 {b}</span>
              ))}
            </div>
            {detail.elevationMin != null && (
              <div className="text-xs text-cream/50">⛰️ Altitud: {detail.elevationMin}–{detail.elevationMax}m s.n.m.</div>
            )}
          </section>

          {/* Fructificación */}
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-3">{t.fructificacion}</h3>
            <div className="grid grid-cols-12 gap-1.5">
              {MONTHS.map((m, i) => (
                <div key={i} className={`text-center py-2 rounded-lg text-[10px] font-medium ${detail.fruitingMonths?.includes(i + 1) ? 'bg-emerald-500/25 text-emerald-400' : 'bg-white/[0.03] text-cream/50'}`}>{m}</div>
              ))}
            </div>
          </section>

          {/* Galería de fotos */}
          <GallerySection species={detail} onOpenLightbox={handleOpenLightbox} />

          {/* Condiciones de fructificación */}
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-4">Condiciones de fructificación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/[0.03] rounded-xl p-4 flex items-start gap-3">
                <div className="shrink-0">
                  <img src="/assets/images/icons/temperature.png" alt="Temperatura" height="36" width="36" />
                </div>
                <div>
                  <h4 className="text-coffee-light font-medium text-xs uppercase tracking-wide mb-1">Temperatura</h4>
                  <p className="text-cream/70 text-sm leading-relaxed">
                    {detail.family === 'Amanitaceae' && detail.edibility === 'excelente'
                      ? 'Noches frescas (8–14°C) con días cálidos. Requiere oscilación térmica diaria mínima de 15°C para estimular la fructificación.'
                      : detail.family === 'Morchellaceae'
                        ? 'Primavera temprana, entre 10–18°C de temperatura diurna. Tolerante a heladas nocturnas.'
                        : detail.family === 'Pleurotaceae'
                          ? 'Temperaturas bajas de otoño-invierno (2–15°C). Alta resistencia al frío.'
                          : 'Temperaturas frescas a moderadas (8–18°C). Mejor tras el primer frío otoñal.'}
                  </p>
                </div>
              </div>

              <div className="bg-white/[0.03] rounded-xl p-4 flex items-start gap-3">
                <div className="shrink-0">
                  <img src="/assets/images/icons/cloudy-sun.png" alt="Precipitación" height="36" width="36" />
                </div>
                <div>
                  <h4 className="text-coffee-light font-medium text-xs uppercase tracking-wide mb-1">Precipitación</h4>
                  <p className="text-cream/70 text-sm leading-relaxed">
                    {detail.family === 'Cantharellaceae'
                      ? 'Mínimo 30–50mm en los 14 días previos. Prefiere periodos húmedos prolongados con buena infiltración.'
                      : detail.family === 'Morchellaceae'
                        ? 'Suelos húmedos por deshielo o lluvias primaverales. Evita encharcamientos.'
                        : '25–60mm en los 10–14 días previos. Fructificación óptima 5–10 días tras lluvia significativa.'}
                  </p>
                </div>
              </div>

              <div className="bg-white/[0.03] rounded-xl p-4 flex items-start gap-3">
                <div className="text-2xl shrink-0">🌱</div>
                <div>
                  <h4 className="text-coffee-light font-medium text-xs uppercase tracking-wide mb-1">Suelo</h4>
                  <p className="text-cream/70 text-sm leading-relaxed">
                    {detail.family === 'Boletaceae'
                      ? 'Suelos ácidos a neutros, bien drenados. Prefiere substrato orgánico rico con pH 5–6.5. Micorriza con coníferas y caducifolios.'
                      : detail.family === 'Russulaceae'
                        ? 'Suelos forestales con horizonte orgánico bien desarrollado. pH ligeramente ácido (5–6).'
                        : detail.family === 'Amanitaceae'
                          ? 'Suelos calcáreos o silíceos según la especie. Requiere horizonte orgánico maduro y presencia de árboles huésped.'
                          : 'Suelos forestales húmedos con buena materia orgánica y drenaje moderado.'}
                  </p>
                </div>
              </div>

              <div className="bg-white/[0.03] rounded-xl p-4 flex items-start gap-3">
                <div className="shrink-0">
                  <img src="/assets/images/icons/search.png" alt="Requisitos especiales" height="36" width="36" />
                </div>
                <div>
                  <h4 className="text-coffee-light font-medium text-xs uppercase tracking-wide mb-1">Requisitos especiales</h4>
                  <p className="text-cream/70 text-sm leading-relaxed">
                    {detail.scientificName === 'Amanita caesarea'
                      ? 'Requiere choque térmico pronunciado. Sensible a heladas. Aparece tras tormentas de verano en zonas templadas mediterráneas.'
                      : detail.scientificName === 'Morchella esculenta'
                        ? 'Choque térmico primaveral esencial. Favorecida por incendios previos o zonas de remoción del suelo. Cocinar siempre.'
                        : detail.scientificName === 'Pleurotus ostreatus'
                          ? 'Especie lignícola saprófita. No requiere árboles vivos. Tolera heladas. Mayor producción con días cortos (otoño-invierno).'
                          : detail.family === 'Cantharellaceae'
                            ? 'Imposibles de cultivar. Requieren micorriza con árboles vivos. Indicadoras de bosques maduros con buena salud ecológica.'
                            : 'Especie micorrizógena. Requiere presencia de árboles huésped adultos. Las condiciones óptimas varían por elevación y orientación.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Tolerancia frío', value: detail.family === 'Pleurotaceae' || detail.family === 'Morchellaceae' ? 90 : detail.family === 'Amanitaceae' && detail.edibility === 'excelente' ? 30 : 60, icon: '❄️' },
                { label: 'Necesidad lluvia', value: detail.family === 'Cantharellaceae' ? 85 : detail.family === 'Boletaceae' ? 70 : 65, icon: '💧' },
                { label: 'Altitud óptima', value: Math.round((((detail.elevationMax ?? 0) - (detail.elevationMin ?? 0)) / 2400) * 100), icon: '⛰️' },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <div className="text-sm mb-1">{m.icon}</div>
                  <div className="progress-bar mb-1">
                    <div className="progress-fill bg-bar" style={{ width: `${m.value}%` }} />
                  </div>
                  <div className="text-cream/40 text-xs">{m.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Morfología técnica */}
          {(detail.cap || detail.stem || detail.flesh) && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-4">{t.morfologia}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {detail.cap && (
                  <div className="bg-white/[0.03] rounded-xl p-4">
                    <div className="text-center mb-3">
                      <svg width="60" height="40" viewBox="0 0 60 40" className="mx-auto">
                        <ellipse cx="30" cy="35" rx="28" ry="5" fill="rgba(139,111,71,0.3)" />
                        <path d="M5,32 Q15,10 30,8 Q45,10 55,32" fill="rgba(139,111,71,0.6)" stroke="rgba(196,160,107,0.5)" strokeWidth="1" />
                        <ellipse cx="30" cy="32" rx="27" ry="4" fill="rgba(139,111,71,0.4)" />
                      </svg>
                    </div>
                    <h4 className="text-coffee-light font-medium text-xs uppercase tracking-wide mb-2 text-center">Sombrero</h4>
                    <div className="space-y-1.5 text-xs text-cream/60">
                      <div><span className="text-cream/40">Forma:</span> {detail.cap.forma}</div>
                      <div><span className="text-cream/40">Color:</span> {detail.cap.color}</div>
                      <div><span className="text-cream/40">Diámetro:</span> {detail.cap.diametro}</div>
                      <div><span className="text-cream/40">Superficie:</span> {detail.cap.superficie}</div>
                    </div>
                  </div>
                )}
                {detail.stem && (
                  <div className="bg-white/[0.03] rounded-xl p-4">
                    <div className="text-center mb-3">
                      <svg width="30" height="60" viewBox="0 0 30 60" className="mx-auto">
                        <rect x="10" y="5" width="10" height="45" rx="4" fill="rgba(139,111,71,0.5)" stroke="rgba(196,160,107,0.4)" strokeWidth="1" />
                        <ellipse cx="15" cy="52" rx="14" ry="5" fill="rgba(139,111,71,0.25)" />
                      </svg>
                    </div>
                    <h4 className="text-coffee-light font-medium text-xs uppercase tracking-wide mb-2 text-center">Pie</h4>
                    <div className="space-y-1.5 text-xs text-cream/60">
                      <div><span className="text-cream/40">Forma:</span> {detail.stem.forma}</div>
                      <div><span className="text-cream/40">Color:</span> {detail.stem.color}</div>
                      <div><span className="text-cream/40">Altura:</span> {detail.stem.altura}</div>
                      <div><span className="text-cream/40">Diámetro:</span> {detail.stem.diametro}</div>
                    </div>
                  </div>
                )}
                {detail.flesh && (
                  <div className="bg-white/[0.03] rounded-xl p-4">
                    <div className="text-center mb-3">
                      <svg width="50" height="50" viewBox="0 0 50 50" className="mx-auto">
                        <circle cx="25" cy="25" r="22" fill="none" stroke="rgba(139,111,71,0.5)" strokeWidth="1.5" strokeDasharray="4 2" />
                        <circle cx="25" cy="25" r="16" fill="rgba(244,235,225,0.08)" />
                        <path d="M10,25 Q25,10 40,25 Q25,40 10,25" fill="rgba(139,111,71,0.2)" />
                      </svg>
                    </div>
                    <h4 className="text-coffee-light font-medium text-xs uppercase tracking-wide mb-2 text-center">Carne</h4>
                    <div className="space-y-1.5 text-xs text-cream/60">
                      <div><span className="text-cream/40">Color:</span> {detail.flesh.color}</div>
                      <div><span className="text-cream/40">Textura:</span> {detail.flesh.textura}</div>
                      <div><span className="text-cream/40">Olor:</span> {detail.flesh.olor}</div>
                      <div><span className="text-cream/40">Sabor:</span> {detail.flesh.sabor}</div>
                    </div>
                  </div>
                )}
              </div>
              {detail.sporePrint && (
                <div className="mt-3 flex items-center gap-2 text-xs text-cream/50 bg-white/[0.03] rounded-lg px-4 py-2">
                  <span className="text-cream/30">Esporada:</span> {detail.sporePrint}
                </div>
              )}
            </section>
          )}

          {/* Posibles Confusiones — solo si la API devuelve datos */}
          {detail.confusions?.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-3">⚠️ Posibles confusiones</h3>
              <ConfusionesBlock species={detail} onViewSpecies={setSelectedSpecies} allSpecies={allSpecies} />
            </section>
          )}

          {/* Dónde encontrarla */}
          {compatZones.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-1">{t.dondeEncontrar}</h3>
              <p className="text-cream/50 text-xs mb-3">{compatZones.length} zonas compatibles · Pulsa un marcador para ver su ficha</p>
              <LeafletMap
                zonas={compatZones}
                onZoneClick={setSelectedZone}
                height="300px"
                title={`Disponibilidad de ${detail.scientificName}`} />
            </section>
          )}
        </div>

        <div className="h-6" />
      </div>
    </div>
  )
}
