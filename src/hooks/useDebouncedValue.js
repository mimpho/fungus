import { useEffect, useState } from 'react'

/** `value` after it has stopped changing for `ms` (the first value is returned at once). */
export function useDebouncedValue(value, ms = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return debounced
}
