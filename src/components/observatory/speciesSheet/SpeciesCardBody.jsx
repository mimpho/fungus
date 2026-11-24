import { ChevronDown, X } from 'lucide-react'
import { useApp } from '../../../contexts/AppContext'
import { IC, getEdibilityColor, resolveUrl } from '../../../lib/helpers'
import { LEGEND_BANDS } from '../../../lib/layerColors'
import { LayerLegend } from '../nav/LayerLegend'
import { SeasonStrip } from './SeasonStrip'

const SCALE = { colors: LEGEND_BANDS.map(b => b.hex), stepped: true }

/**
 * What the species' card says: photo, names, edibility, the safety line the season, the legend of the layer being looked at and,
 * at the foot, «Ver ficha» and «Guardar seta» (as the point's card has «Observar zona» and «Guardar rincón»). `onClear`: the «Eliminar filtro» pill under the title. `onLower`: desktop's chevron
 * that folds the card (the phone folds with the handle). `titleRef`: where the focus goes when the card opens.
 */
export function SpeciesCardBody({ row, species, lens, onLower = null, onClear, removeLabel, onView, titleRef }) {
  const { t, favoriteSpecies, toggleFavorite } = useApp()
  const saved = Boolean(species) && favoriteSpecies.some(f => f.id === species.id)
  const edib = getEdibilityColor(row.edibility)
  const warn = row.edibility === 'mortal' ? t.obsSpSheetWarnMortal : row.edibility === 'toxico' ? t.obsSpSheetWarnToxic : null
  const legend = lens === 'habitat'
    ? { low: t.obsHabLow, high: t.obsHabHigh, note: t.obsHabNoDate }
    : lens === 'conditions' ? { low: t.obsLayLow, high: t.obsLayHigh, note: null } : null
  return (
    <div className="space-y-3">
      {/* The title and, on desktop, the chevron that folds the card. The pill that takes the filter off sits at the right of the photo and name */}
      <div>
        <div className="flex items-center justify-between gap-2 min-h-[28px]">
          <p className="text-[11px] uppercase tracking-[0.04em] text-cream">{t.obsSpSheetMapBy}</p>
          {onLower && (
            <button
              type="button"
              onClick={e => onLower(e.detail === 0)}
              aria-label={t.obsSpSheetLower}
              title={t.obsSpSheetLower}
              className="-my-2 -mr-2 w-[40px] h-[40px] flex items-center justify-center rounded-xl text-cream hover:bg-cream/10 outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
            ><ChevronDown size={20} aria-hidden="true" /></button>
          )}
        </div>
      </div>
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden bg-cream/[0.08]">
          {row.photo && <img src={resolveUrl(row.photo)} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.visibility = 'hidden' }} />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 ref={titleRef} tabIndex={-1} className="font-display text-[22px] leading-tight text-cream break-words outline-none">{row.name}</h2>
          <p className="text-[13px] italic text-cream truncate">{row.scientific}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-[3px] rounded-full bg-white/[0.08] text-white"><span aria-hidden="true" className={`w-[8px] h-[8px] rounded-full ${edib.solidBg}`} />{t[edib.tKey]}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label={removeLabel}
          title={removeLabel}
          className="shrink-0 flex items-center gap-1.5 min-h-[32px] rounded-full bg-black/25 pl-3.5 pr-2.5 text-[14px] text-cream hover:bg-black/35 outline-none focus-visible:ring-2 focus-visible:ring-cream/60"
        >{t.obsSpSheetRemoveFilter}<X size={14} aria-hidden="true" /></button>
      </div>
      {warn && <p role="note" className="text-[12px] rounded-lg px-3 py-2 border border-red-500/50 bg-red-500/10 text-cream">{warn}</p>}
      <SeasonStrip months={species?.fruitingMonths} />
      {legend && (
        <div>
          <LayerLegend scale={SCALE} lowLabel={legend.low} highLabel={legend.high} className="[&_div]:!text-cream" />
          {legend.note && <p className="text-[11px] text-cream mt-1">{legend.note}</p>}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onView}
          disabled={!species}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 min-h-[44px] rounded-xl bg-white text-[var(--nav-active)] text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
            <path d="M9 13h6M9 17h6" />
          </svg>
          {t.obsSpSheetFull}
        </button>
        <button
          type="button"
          onClick={() => toggleFavorite(species)}
          disabled={!species}
          aria-pressed={saved}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 min-h-[44px] rounded-xl border border-cream/60 text-cream text-sm font-medium hover:bg-cream/10 outline-none focus-visible:ring-2 focus-visible:ring-cream/60 disabled:opacity-60"
        >
          <span aria-hidden="true" className="[&>svg]:w-4 [&>svg]:h-4">{IC.heart(saved)}</span>
          {saved ? t.obsSpSheetSaved : t.obsSpSheetSave}
        </button>
      </div>
    </div>
  )
}
