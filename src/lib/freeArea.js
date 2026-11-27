// =====================================================
// Where on the map something fits best, given what covers it (pure, no React, no Leaflet)
//
// What the interface leaves free is not a rectangle (on desktop a panel at the top right and cards at the
// bottom left leave an «L» and worse). Every rectangle bounded by the edges of the map and of the covers is
// tried, and the one that shows the given shape largest wins. With a handful of covers it is a few hundred
// comparisons.
// =====================================================

/** The first figure that differs decides. */
function better(a, b) {
  const i = a.findIndex((v, n) => v !== b[n])
  return i >= 0 && a[i] > b[i]
}

const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

/**
 * The free rectangle { left, top, right, bottom } (px) of a `size` { x, y } map where a `shape` { w, h }
 * can be drawn largest, clear of every rectangle in `covers`. `level(scale)` says which scales look the
 * same (the map's zoom goes by steps): among those, the widest rectangle wins, then the most central, so
 * that a few pixels more never push the shape to one side. Null when no free rectangle has at least
 * `minSide` px each way.
 */
export function bestFreeRect(size, covers, shape, { minSide = 160, level = scale => scale } = {}) {
  // whole pixels, each cover rounded outwards: a free rectangle's edges are theirs, and a cover's half pixel
  // would otherwise make the rectangle beside it count as under it
  const inside = covers
    .map(c => ({
      left: Math.max(0, Math.floor(c.left)), top: Math.max(0, Math.floor(c.top)),
      right: Math.min(size.x, Math.ceil(c.right)), bottom: Math.min(size.y, Math.ceil(c.bottom)),
    }))
    .filter(c => c.right > c.left && c.bottom > c.top)
  const edges = values => [...new Set(values)].sort((a, b) => a - b)
  const xs = edges([0, size.x, ...inside.flatMap(c => [c.left, c.right])])
  const ys = edges([0, size.y, ...inside.flatMap(c => [c.top, c.bottom])])
  let best = null
  for (let i = 0; i < xs.length; i++) {
    for (let j = i + 1; j < xs.length; j++) {
      const width = xs[j] - xs[i]
      if (width < minSide) continue
      for (let k = 0; k < ys.length; k++) {
        for (let l = k + 1; l < ys.length; l++) {
          const height = ys[l] - ys[k]
          if (height < minSide) continue
          const rect = { left: xs[i], top: ys[k], right: xs[j], bottom: ys[l] }
          if (inside.some(c => overlaps(rect, c))) continue
          const scale = Math.min(width / shape.w, height / shape.h)
          const off = Math.hypot((rect.left + rect.right - size.x) / 2, (rect.top + rect.bottom - size.y) / 2)
          const score = [level(scale), width * height, -off]
          if (!best || better(score, best.score)) {
            best = { rect, score }
          }
        }
      }
    }
  }
  return best?.rect ?? null
}
