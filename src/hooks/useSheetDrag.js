import { useEffect, useRef } from 'react'

// What a touch must not start a drag on: the thing under the finger is meant to be pressed
const CLICKABLE = 'button, a[href], input, select, textarea, label, summary, [role="button"], [role="switch"], [role="checkbox"], [role="slider"], [role="option"], [role="tab"], [data-no-sheet-drag]'
const SLOP = 8 // px of movement before a touch becomes a drag

function scrolledInside(from, root) {
  for (let e = from; e && e !== root; e = e.parentElement) {
    if (e.scrollTop > 0 && e.scrollHeight > e.clientHeight + 1) {
      const oy = getComputedStyle(e).overflowY
      if (oy === 'auto' || oy === 'scroll') return true
    }
  }
  return false
}

/**
 * A whole bottom sheet is its own drag handle: a touch anywhere on it that moves `direction` ('down' folds, 'up' opens)
 * becomes a drag, except when it starts on something clickable (buttons, links, fields, sliders, switches; the sheet's
 * handle and anything marked `data-drag-ok` still drag) or on content that is scrolled down (the content scrolls first).
 * A drag never ends in a click on what was under the finger.
 * `ref`: the sheet's element. `onStart()`, `onMove(dy)` and `onEnd(dy)`; dy is the finger's travel in px (signed).
 */
export function useSheetDrag(ref, { enabled = true, direction = 'down', onStart, onMove, onEnd } = {}) {
  const cb = useRef({})
  cb.current = { onStart, onMove, onEnd, direction, enabled }
  const attached = useRef({ el: null, off: null })

  function attach(el) {
    let startY = null
    let dragging = false
    let blocked = false
    let lastDy = 0
    const start = e => {
      blocked = e.touches.length !== 1 || cb.current.enabled === false
      const hit = e.target.closest?.(CLICKABLE)
      if (hit && el.contains(hit) && !hit.closest('[data-sheet-handle]') && !hit.hasAttribute('data-drag-ok')) blocked = true
      if (cb.current.direction === 'down' && scrolledInside(e.target, el)) blocked = true
      startY = e.touches[0].clientY
      dragging = false
      lastDy = 0
    }
    const move = e => {
      if (startY === null || blocked) return
      const dy = e.touches[0].clientY - startY
      if (!dragging) {
        if (Math.abs(dy) < SLOP) return
        const dir = cb.current.direction
        if ((dir === 'down' && dy < 0) || (dir === 'up' && dy > 0)) { blocked = true; return }
        dragging = true
        cb.current.onStart?.()
      }
      if (e.cancelable) e.preventDefault()
      lastDy = dy
      cb.current.onMove?.(dy)
    }
    const end = () => {
      if (dragging) {
        const swallow = ev => { ev.stopPropagation(); ev.preventDefault() }
        window.addEventListener('click', swallow, true)
        setTimeout(() => window.removeEventListener('click', swallow, true), 350)
        cb.current.onEnd?.(lastDy)
      }
      startY = null
      dragging = false
      blocked = false
    }
    el.addEventListener('touchstart', start, { passive: true })
    el.addEventListener('touchmove', move, { passive: false })
    el.addEventListener('touchend', end)
    el.addEventListener('touchcancel', end)
    return () => {
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchmove', move)
      el.removeEventListener('touchend', end)
      el.removeEventListener('touchcancel', end)
    }
  }

  // Runs after every render (the sheet's element may come and go) and only rewires when it changed
  useEffect(() => {
    const el = enabled ? ref.current : null
    if (attached.current.el === el) return
    attached.current.off?.()
    attached.current = { el, off: el ? attach(el) : null }
  })
  // StrictMode runs the cleanup and then the effect again: forget the element so the effect above wires it anew
  useEffect(() => () => { attached.current.off?.(); attached.current = { el: null, off: null } }, [])
}
