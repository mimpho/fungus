// Domain constants — ported from src/lib/constants.js
// Keep in sync manually when web constants change.

// Monthly seasonal factor (1-based month index)
// Represents the real mycological activity across the year (gastronomic species)
export const SEASONAL_FACTOR: Record<number, number> = {
  1: 15, 2: 20, 3: 38, 4: 58,  5: 62,
  6: 28, 7: 18, 8: 48, 9: 80, 10: 100, 11: 88, 12: 42,
}

// Edibility weights for SQS calculation
export const EDIBILITY_SCORE: Record<string, number> = {
  excelente: 100,
  bueno: 20,
  comestible: 5,
  precaucion: 0,
  toxico: 0,
  mortal: 0,
}

// Edibility values that require a safety disclaimer in the UI
export const DANGEROUS_EDIBILITY = ['precaucion', 'toxico', 'mortal']

// Forest type values
export const FOREST_TYPES = ['pinar', 'hayedo', 'robledal', 'encinar'] as const
export type ForestType = typeof FOREST_TYPES[number]

// Supported languages
export const LANGS = ['es', 'ca', 'en'] as const
export type Lang = typeof LANGS[number]

// API
export const API_BASE_URL = 'https://fungus-api.onrender.com/api/v1'

// Cache
export const CACHE_VERSION = 3   // Increment when scoring algorithm changes
export const CACHE_TTL_MS = 3 * 60 * 60 * 1000  // 3 hours
