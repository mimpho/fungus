// API client — base fetch wrapper with JWT injection and AsyncStorage cache
// All requests go to fungus-api.onrender.com (same backend as web)

import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL, CACHE_VERSION, CACHE_TTL_MS } from '../lib/constants'

// expo-secure-store is not available on web — fall back to AsyncStorage
async function _getToken(): Promise<string | null> {
  if (Platform.OS === 'web') return AsyncStorage.getItem('fungus_jwt')
  return SecureStore.getItemAsync('fungus_jwt')
}
async function _saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') { await AsyncStorage.setItem('fungus_jwt', token); return }
  await SecureStore.setItemAsync('fungus_jwt', token)
}
async function _clearToken(): Promise<void> {
  if (Platform.OS === 'web') { await AsyncStorage.removeItem('fungus_jwt'); return }
  await SecureStore.deleteItemAsync('fungus_jwt')
}

// ── Error type ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Base fetch ────────────────────────────────────────────────────────────────

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await _getToken()

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, body || `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  ts: number     // Unix ms timestamp
  v: number      // CACHE_VERSION
  data: T
}

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (entry.v !== CACHE_VERSION) return null
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null
    return entry.data
  } catch {
    return null
  }
}

export async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { ts: Date.now(), v: CACHE_VERSION, data }
    await AsyncStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // Storage write failed — ignore
  }
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UserProfile {
  id: string
  email: string
  role: 'user' | 'admin'
  email_verified: boolean
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function register(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getMe(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/auth/me')
}

export async function saveToken(token: string): Promise<void> {
  await _saveToken(token)
}

export async function clearToken(): Promise<void> {
  await _clearToken()
}

// ── Zone endpoints ────────────────────────────────────────────────────────────

export interface Zone {
  id: string
  name: string
  province: string
  region: string
  lat: number
  lng: number
  elevation: number
  forestType: string
}

export async function fetchZones(): Promise<Zone[]> {
  const cacheKey = `fungus_zones_v${CACHE_VERSION}`
  const cached = await readCache<Zone[]>(cacheKey)
  if (cached) return cached
  const data = await apiFetch<Zone[]>('/zones')
  await writeCache(cacheKey, data)
  return data
}

// ── Weather endpoints ─────────────────────────────────────────────────────────

export interface ZoneConditions {
  temperature: number
  soilTemp: number
  rainfall14d: number
  humidity: number
  wind: number
  dryDays: number
  overallScore: number
  speciesScore?: number
}

export async function fetchAllWeather(): Promise<Record<string, ZoneConditions>> {
  const cacheKey = `fungus_weather_v${CACHE_VERSION}`
  const cached = await readCache<Record<string, ZoneConditions>>(cacheKey)
  if (cached) return cached
  const data = await apiFetch<Record<string, ZoneConditions>>('/weather/zones')
  await writeCache(cacheKey, data)
  return data
}

export async function fetchZoneWeather(zoneId: string): Promise<ZoneConditions> {
  return apiFetch<ZoneConditions>(`/weather/zones/${zoneId}`)
}

// ── Species endpoints ─────────────────────────────────────────────────────────

export interface Species {
  id: string
  scientificName: string
  commonNames: string[]
  commonNames_ca?: string[]
  commonNames_en?: string[]
  family: string
  edibility: string
  forestTypes: string[]
  fruitingMonths: number[]
  elevationMin?: number
  elevationMax?: number
  photo?: { url: string }
  photos?: { url: string; caption?: string }[]
  extra_data?: Record<string, unknown>
}

export async function fetchSpecies(lang: string = 'es'): Promise<Species[]> {
  const cacheKey = `fungus_species_${lang}_v${CACHE_VERSION}`
  const cached = await readCache<Species[]>(cacheKey)
  if (cached) return cached
  const data = await apiFetch<Species[]>(`/species?lang=${lang}`)
  await writeCache(cacheKey, data)
  return data
}

export async function fetchSpeciesById(id: string, lang: string = 'es'): Promise<Species> {
  return apiFetch<Species>(`/species/${id}?lang=${lang}`)
}
