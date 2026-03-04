# Technical Rules

## Open-Meteo API

- **`soil_temperature_0cm` only in `hourly`**, never in `current` — API returns 400 error
- Fetch params: `current`, `hourly`, `daily` with `past_days: 14`, `forecast_days: 1`, `timezone: Europe/Madrid`

## Leaflet Map

- **`window.L = L`** must be executed before dynamic `import('leaflet.heat')`
- Leaflet.heat is CommonJS and looks for global `L` at initialization

## React Patterns

- **`conditionsMap` starts empty** — always use `?.` or `??` to avoid crashes
- Use `useMemo` for derived calculations from `conditionsMap` (map updates async)
- React StrictMode mounts effects twice — use promise cache, not `useRef` guards

## Modal Navigation

- **Only `ModalRenderer` controls modal navigation** — never call `navigate()` directly from within a modal
- When opening a modal from another modal, only call `setSelected*(item)`, not `navigate()`
- Modals with lightbox must unregister ESC listener while lightbox is open

## Images

- Always use `resolveUrl()` for `<img src>` in modals and articles — relative paths break in nested routes like `/especies/boletus-edulis`

## Scoring

- **`CACHE_VERSION`** in `weatherService.js` must be incremented when changing the scoring algorithm (invalidates user cache)

## Safety

- Always show disclaimer for toxic/mortal species
