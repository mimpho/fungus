import { useRef } from 'react'

/**
 * `value`, held at what it was when `hold` turned on, for as long as `hold` is on; when it turns off the live value comes back.
 * The observed zone uses it: the zone changes the active species while the map lies under it, and the map must not repaint
 * for each change; it takes the final one when the zone closes.
 */
export function useHeldWhile(hold, value) {
  const held = useRef(value)
  if (!hold) held.current = value
  return held.current
}
