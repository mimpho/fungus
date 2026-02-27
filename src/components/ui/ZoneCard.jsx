import { IC, getScoreColor } from '../../lib/helpers'

export function ZoneCard({ zone, isFollowed, onToggle, onClick, condOverride }) {
  const cond    = condOverride ?? null
  const loading = cond === null
  const sc      = getScoreColor(loading ? 0 : cond.overallScore)

  return (
    <div className="glass rounded-2xl hover-lift overflow-hidden relative">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
            <h3 className="font-display text-xl font-semibold text-[#f4ebe1] truncate">{zone.name}</h3>
            <p className="text-[#d9cda1] text-xs mt-0.5">{zone.region} · {zone.province}</p>
          </div>
          <button onClick={e => { e.stopPropagation(); onToggle() }}
            className={`ml-3 p-2 rounded-xl transition-all ${isFollowed ? 'text-yellow-400 hover:bg-yellow-400/20' : 'text-[#f4ebe1]/30 hover:text-yellow-400 hover:bg-yellow-400/10'}`}>
            {IC.star(isFollowed)}
          </button>
        </div>

        <div onClick={onClick} className="cursor-pointer relative z-[1]">
          <div className="flex items-center gap-3 text-xs text-[#f4ebe1]/70 mb-4">
            <span className="flex items-center gap-1.5">
              <img src={`/assets/images/icons/forest-type-${zone.forestType}.png`} alt={zone.forestType} height="16" width="16" />
              {zone.forestType}
            </span>
            <span className="flex items-center gap-1.5">
              <img src="/assets/images/icons/mountain.png" alt="elevation" height="16" width="16" />
              {zone.elevation}m
            </span>
          </div>

          {loading ? (
            /* Skeleton mientras cargan datos reales */
            <div className="space-y-2 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-3 w-28 bg-white/10 rounded" />
                <div className="h-3 w-14 bg-white/10 rounded" />
              </div>
              <div className="progress-bar">
                <div className="progress-fill bg-white/10" style={{ width: '0%' }} />
              </div>
              <div className="h-3 w-40 bg-white/10 rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#f4ebe1]/70 text-xs">Cond. de recolección</span>
                <span className={`text-xs font-semibold ${sc.text}`}>{sc.label}</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${sc.bar}`} style={{ width: `${cond.overallScore}%` }} />
              </div>
              <div className="flex gap-1.5 mt-1.5 text-[#f4ebe1]/35 text-xs flex-wrap">
                <span className="flex items-center gap-1">
                  <img src="/assets/images/icons/temperature.png" alt="temp" height="16" width="16" />
                  {cond.temperature}°C
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <img src="/assets/images/icons/accumulated-precipitation.png" alt="lluvia" height="16" width="16" />
                  {cond.rainfall14d}mm
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <img src="/assets/images/icons/humidity.png" alt="humedad" height="16" width="16" />
                  {cond.humidity}%
                </span>
              </div>
            </>
          )}
        </div>

        <img className="absolute bottom-0 right-1 opacity-25 pointer-events-none"
          src={`/assets/images/forest-type/${zone.forestType}.webp`}
          alt={zone.forestType} height="125" width="125" />
      </div>
    </div>
  )
}
