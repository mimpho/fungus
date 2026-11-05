// Catalonia's bounding box. Mirrors backend/app/services/geo_bounds.py (the API answers 422
// for a point outside it). The Observatory covers only Catalonia in v1.
export const CATALONIA_BOUNDS = { lat: [40.5, 42.9], lon: [0.15, 3.35] }

export function isInCatalonia(lat, lon) {
  return (
    Number.isFinite(lat) && Number.isFinite(lon) &&
    lat >= CATALONIA_BOUNDS.lat[0] && lat <= CATALONIA_BOUNDS.lat[1] &&
    lon >= CATALONIA_BOUNDS.lon[0] && lon <= CATALONIA_BOUNDS.lon[1]
  )
}
