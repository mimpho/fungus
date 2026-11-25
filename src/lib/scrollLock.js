// The one way to stop the page behind from scrolling. Several things can ask at once (the Observatory's map,
// the mobile menu) and let go in any order: the page scrolls again when the last one has. Each one saving and
// restoring `overflow` by itself left the page locked when the older one let go first.
let locks = 0
let before = null

/** Locks the page's scroll and the pull past its edges. Returns the function that lets go (once). */
export function lockScroll() {
  const { body, documentElement: root } = document
  if (locks === 0) before = { overflow: body.style.overflow, overscroll: root.style.overscrollBehavior }
  locks += 1
  body.style.overflow = 'hidden'
  root.style.overscrollBehavior = 'none'
  let held = true
  return () => {
    if (!held) return
    held = false
    locks -= 1
    if (locks > 0) return
    body.style.overflow = before.overflow
    root.style.overscrollBehavior = before.overscroll
  }
}
