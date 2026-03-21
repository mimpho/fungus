import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { useSpecies } from '../hooks/useSpecies'
import { Tabs } from '../components/ui/Tabs'
import { IC, resolveUrl } from '../lib/helpers'

const PAGE_SIZE = 24
const H = '52px'

// ── GalleryCard — tarjeta de galería admin que abre el generador ──────────────
const EDIBILITY_DOT = {
  excelente:    'bg-emerald-500',
  bueno:        'bg-emerald-400',
  comestible:   'bg-amber-400',
  no_comestible:'bg-stone-400',
  precaucion:   'bg-orange-400',
  toxico:       'bg-red-500',
  mortal:       'bg-red-700',
}

function GalleryCard({ s, onOpen }) {
  const [imgError, setImgError] = useState(false)
  const dot = EDIBILITY_DOT[s.edibility] ?? 'bg-stone-400'

  return (
    <button
      onClick={() => onOpen(s)}
      className="group relative rounded-2xl overflow-hidden bg-white/[0.04] hover:ring-2 hover:ring-[#d9cda1]/40 transition-all text-left flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/[0.03]">
        {s.photo?.url && !imgError
          ? <img
              src={resolveUrl(s.photo.url)}
              alt={s.scientificName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          : <div className="w-full h-full flex items-center justify-center text-cream/10">
              {IC.mushroom}
            </div>
        }
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-white text-xs font-bold uppercase tracking-widest">Generar</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
        <div className="min-w-0">
          <p className="text-cream text-xs font-semibold italic truncate leading-tight">{s.scientificName}</p>
          <p className="text-cream/40 text-[10px] font-mono">{s.id}</p>
        </div>
      </div>
    </button>
  )
}

const EDIBILITY_OPTIONS = [
  { id: 'todas', label: 'Comestibilidad' },
  { id: 'excelente', label: 'Excelente' },
  { id: 'comestible', label: 'Comestible' },
  { id: 'no_comestible', label: 'No comestible' },
  { id: 'toxico', label: 'Tóxica' },
  { id: 'mortal', label: 'Mortal' },
]

const IconGrid = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
  </svg>
)
const IconCard = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 6a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm0 9a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3z" />
  </svg>
)
const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)
const ViewTabs = ({ view, setView }) => (
  <Tabs
    options={[{ id: 'card', label: IconCard }, { id: 'grid', label: IconGrid }]}
    selected={view}
    onChange={setView}
    size="sm"
  />
)

export default function AdminGallery() {
  const { t } = useApp()
  const { species, loading } = useSpecies()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [family, setFamily] = useState('todas')
  const [edibility, setEdibility] = useState('todas')
  const [view, setView] = useState('card')

  const page = Math.max(1, parseInt(searchParams.get('pagina') || '1', 10))
  const setPage = (n) =>
    setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('pagina', String(n)); return p }, { replace: true })
  const resetPage = () =>
    setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete('pagina'); return p }, { replace: true })

  useEffect(() => { resetPage() }, [query, family, edibility])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])

  const families = useMemo(() =>
    ['todas', ...Array.from(new Set(species.map(s => s.family))).sort()],
    [species]
  )

  const filtered = useMemo(() => {
    let r = [...species]
    if (family !== 'todas')
      r = r.filter(s => s.family === family)
    if (edibility === 'excelente')
      r = r.filter(s => s.edibility === 'excelente')
    else if (edibility === 'comestible')
      r = r.filter(s => ['bueno', 'comestible', 'precaucion'].includes(s.edibility))
    else if (edibility === 'no_comestible')
      r = r.filter(s => s.edibility === 'no_comestible')
    else if (edibility === 'toxico')
      r = r.filter(s => s.edibility === 'toxico')
    else if (edibility === 'mortal')
      r = r.filter(s => s.edibility === 'mortal')
    if (query.trim()) {
      const q = query.toLowerCase()
      r = r.filter(s =>
        s.scientificName.toLowerCase().includes(q) ||
        (s.commonNames ?? []).some(n => n.toLowerCase().includes(q)) ||
        s.id.toLowerCase().includes(q)
      )
    }
    return r
  }, [species, query, family, edibility])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const openInGenerator = (s) => navigate(`/admin/generator?especie=${s.id}`)

  const GridItem = ({ s }) => (
    <button
      onClick={() => openInGenerator(s)}
      className="group relative aspect-square rounded-xl overflow-hidden bg-white/[0.04] hover:ring-2 hover:ring-[#d9cda1]/40 transition-all"
      title={s.scientificName}
    >
      {s.photo?.url
        ? <img src={resolveUrl(s.photo.url)} alt={s.scientificName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
        : null}
      <div className="absolute inset-0 flex items-center justify-center text-cream/20"
        style={{ display: s.photo?.url ? 'none' : 'flex' }}>
        {IC.mushroom}
      </div>
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-2">
        <p className="text-cream text-[10px] italic text-center leading-tight line-clamp-2">{s.scientificName}</p>
        <p className="text-cream/50 text-[9px] mt-0.5">{s.id}</p>
      </div>
    </button>
  )

  return (
    <div className="space-y-6 anim-up pb-20">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">

        {/*
          Mobile:  [title + subtitle ········· view toggle]
          Desktop: [title + subtitle] (toggle moves to filter row)
        */}
        <div className="flex items-center justify-between gap-4 lg:shrink-0">
          <div>
            <h2 className="font-display text-4xl font-semibold text-cream">{t.adminGallery ?? 'Gallery'}</h2>
            <p className="text-muted text-sm mt-1">{loading ? '…' : `${filtered.length} especies`}</p>
          </div>
          <div className="shrink-0 lg:hidden">
            <ViewTabs view={view} setView={setView} />
          </div>
        </div>

        {/* Filter bar row (+ desktop toggle) */}
        <div className="flex flex-col lg:flex-row lg:items-center flex-1 gap-1 lg:gap-4">

          {/*
            ── Filter pill ──
            Mobile rows:
              Row 1 — Search     (ag-search → full pill)
              Row 2 — Family + Edibility  (ag-family + ag-edib → merged pill, gap-0)
            Desktop row:
              ag-search → left-rounded · ag-family → flat · ag-edib → right-rounded
              gap-1 between all three segments
          */}
          <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:gap-1">

            {/* Search */}
            <div className="ag-search glass relative flex flex-1 items-center" style={{ height: H }}>
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-cream/85 pointer-events-none z-10">
                {IC.search}
              </span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar especie…"
                className="w-full bg-transparent text-cream text-sm pl-12 pr-10 outline-none placeholder-cream/85"
                style={{ height: H }}
              />
              {query && (
                <button
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-cream/75 hover:text-cream hover:bg-white/10 transition-all"
                  style={{ width: 32, height: 32 }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Selects — gap-0 on mobile (merged pill), gap-1 on desktop */}
            <div className="flex gap-1">

              {/* Family */}
              <div className="ag-family glass relative flex flex-1 lg:flex-none items-center"
                style={{ height: H, paddingLeft: 20, paddingRight: 36 }}>
                <select
                  value={family}
                  onChange={e => setFamily(e.target.value)}
                  className="bg-transparent text-cream text-sm focus:outline-none appearance-none cursor-pointer"
                  style={{ height: H }}>
                  {families.map(f => (
                    <option key={f} value={f} className="bg-[#30372a]">
                      {f === 'todas' ? 'Familias' : f}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cream/50">
                  <ChevronDown />
                </span>
              </div>

              {/* Edibility */}
              <div className="ag-edib glass relative flex flex-1 lg:flex-none items-center"
                style={{ height: H, paddingLeft: 20, paddingRight: 50 }}>
                <select
                  value={edibility}
                  onChange={e => setEdibility(e.target.value)}
                  className="bg-transparent text-cream text-sm focus:outline-none appearance-none cursor-pointer"
                  style={{ height: H }}>
                  {EDIBILITY_OPTIONS.map(o => (
                    <option key={o.id} value={o.id} className="bg-[#30372a]">{o.label}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cream/50">
                  <ChevronDown />
                </span>
              </div>

            </div>
          </div>

          {/* Desktop-only view toggle */}
          <div className="hidden lg:block shrink-0">
            <ViewTabs view={view} setView={setView} />
          </div>

        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className={view === 'card'
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
          : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3'}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className={`${view === 'card' ? 'h-72' : 'aspect-square'} rounded-xl bg-white/[0.04] animate-pulse`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 flex flex-col items-center gap-3 text-cream/30">
          {IC.search}
          <p className="text-sm">Sin resultados</p>
        </div>
      ) : view === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginated.map((s) => (
            <GalleryCard key={s.id} s={s} onOpen={openInGenerator} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {paginated.map(s => <GridItem key={s.id} s={s} />)}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}
            className="p-2 rounded-lg text-cream/40 hover:text-cream hover:bg-white/[0.05] disabled:opacity-20 disabled:cursor-not-allowed transition-all">
            {IC.chevron('left')}
          </button>
          <span className="text-sm text-cream/50">{page} / {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page === totalPages}
            className="p-2 rounded-lg text-cream/40 hover:text-cream hover:bg-white/[0.05] disabled:opacity-20 disabled:cursor-not-allowed transition-all">
            {IC.chevron('right')}
          </button>
        </div>
      )}
    </div>
  )
}
