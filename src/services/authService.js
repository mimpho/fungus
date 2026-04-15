// =====================================================
// authService.js — Auth API calls + in-memory token management
//
// Access token lives in a module-level variable (never localStorage).
// This makes it immune to XSS attacks.
//
// Refresh token lives in an httpOnly cookie managed by the browser.
// It is sent automatically on POST /auth/refresh.
// =====================================================

import { API_BASE } from './apiService'

// ── In-memory token ────────────────────────────────────────────────────────────

let _accessToken = null

export function getAccessToken()        { return _accessToken }
export function setAccessToken(token)   { _accessToken = token }
export function clearAccessToken()      { _accessToken = null }

/** Headers to include in authenticated requests. */
export function authHeaders() {
  return _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function post(path, body, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
    credentials: 'include',  // send/receive httpOnly cookies
    body: body ? JSON.stringify(body) : undefined,
  })
  return res
}

async function del(path) {
  return fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'include',
  })
}

async function get(path) {
  return fetch(`${API_BASE}${path}`, {
    headers: authHeaders(),
    credentials: 'include',
  })
}

// ── Error translation ──────────────────────────────────────────────────────────

/**
 * Map an API `detail` string to a translated user-facing message.
 * Falls back to `detail` itself if no mapping found, or to `t.errRed` if detail is empty.
 *
 * @param {string} detail  — raw `data.detail` from the API response
 * @param {object} t       — i18n translation object from useApp()
 */
export function translateApiError(detail, t) {
  if (!detail) return t.errRed
  const map = {
    'Email already registered':         t.errEmailRegistrado,
    'Invalid email or password':        t.errCredenciales,
    'No refresh token':                 t.errCredenciales,
    'Invalid or expired refresh token': t.errCredenciales,
    'User not found':                   t.errCredenciales,
    'Failed to fetch':                  t.errRed,
    'NetworkError when attempting to fetch resource': t.errRed,
    'Load failed':                      t.errRed,  // Safari
  }
  return map[detail] ?? t.errRed ?? detail
}

// ── Auth endpoints ─────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @returns {{ user, access_token }} on success
 * @throws Error with message from API on failure
 */
export async function apiRegister(email, password, firstName, lastName, birthDate) {
  const res = await post('/auth/register', {
    email,
    password,
    first_name: firstName,
    last_name: lastName,
    ...(birthDate ? { birth_date: birthDate } : {}),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail ?? 'Register failed')
  setAccessToken(data.access_token)
  return data
}

/**
 * Log in with email + password.
 * @returns {{ user, access_token }} on success
 * @throws Error with message from API on failure
 */
export async function apiLogin(email, password) {
  const res = await post('/auth/login', { email, password })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail ?? 'Login failed')
  setAccessToken(data.access_token)
  return data
}

/**
 * Try to get a new access token using the httpOnly refresh cookie.
 * Call this on app boot to silently restore a session.
 * Returns the user object on success, null if no valid session.
 */
export async function apiRefresh() {
  try {
    const res = await post('/auth/refresh', null)
    if (!res.ok) return null
    const data = await res.json()
    setAccessToken(data.access_token)
    return data.user
  } catch {
    return null
  }
}

/**
 * Log in via Google Identity Services.
 * @param {string} idToken — Google ID token from GIS
 * @returns {{ user, access_token }} on success
 * @throws Error with message from API on failure
 *
 * Render free tier cold-start: the first request after inactivity returns 503
 * while the dyno wakes up (~30-50s). We retry once after a short delay so the
 * user doesn't see a hard error on the first sign-in of the day.
 */
export async function apiGoogleLogin(idToken) {
  const attempt = () => post('/auth/google', { id_token: idToken })

  let res = await attempt()

  if (res.status === 503) {
    // Clone before reading — body can only be consumed once
    const clone = res.clone()
    const body = await clone.json().catch(() => null)

    // App-level 503 (e.g. "Google login not configured") has a JSON detail field.
    // Render cold-start 503s have no valid JSON body — retry those only.
    if (!body?.detail) {
      await new Promise(resolve => setTimeout(resolve, 8000))
      res = await attempt()
    }
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail ?? 'Google login failed')
  setAccessToken(data.access_token)
  return data
}

/**
 * Log out — clears server-side refresh cookie + local token.
 */
export async function apiLogout() {
  try {
    await post('/auth/logout', null)
  } finally {
    clearAccessToken()
  }
}

// ── /me endpoints ──────────────────────────────────────────────────────────────

/**
 * PATCH /me/profile — update first_name, last_name, birth_date.
 * @returns updated UserOut on success
 * @throws Error with message from API on failure
 */
export async function apiUpdateProfile(firstName, lastName, birthDate) {
  const res = await fetch(`${API_BASE}/me/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    credentials: 'include',
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      ...(birthDate ? { birth_date: birthDate } : { birth_date: null }),
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail ?? 'Update failed')
  return data
}

/** GET /me/followed-zones → array of { zone_id } */
export async function apiGetFollowedZones() {
  const res = await get('/me/followed-zones')
  if (!res.ok) return []
  return res.json()
}

/** POST /me/followed-zones */
export async function apiFollowZone(zoneId) {
  await post('/me/followed-zones', { zone_id: zoneId })
}

/** DELETE /me/followed-zones/{zoneId} */
export async function apiUnfollowZone(zoneId) {
  await del(`/me/followed-zones/${encodeURIComponent(zoneId)}`)
}

/** GET /me/fav-species → array of { species_id } */
export async function apiGetFavSpecies() {
  const res = await get('/me/fav-species')
  if (!res.ok) return []
  return res.json()
}

/** POST /me/fav-species */
export async function apiFavSpecies(speciesId) {
  await post('/me/fav-species', { species_id: speciesId })
}

/** DELETE /me/fav-species/{speciesId} */
export async function apiUnfavSpecies(speciesId) {
  await del(`/me/fav-species/${encodeURIComponent(speciesId)}`)
}

export async function apiDeleteAccount() {
  const res = await fetch(`${API_BASE}/me/account`, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'include',
  })
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail ?? 'Delete failed')
  }
}

/**
 * After login/register, migrate localStorage follows + favs to the API.
 * Errors are silently ignored — the local state is always the source of truth
 * for the current session.
 *
 * @param {Array} localZones    — array of zone objects from localStorage
 * @param {Array} localSpecies  — array of species objects from localStorage
 */
export async function migrateLocalFavoritesToApi(localZones = [], localSpecies = []) {
  const calls = [
    ...localZones.map(z => apiFollowZone(z.id).catch(() => {})),
    ...localSpecies.map(s => apiFavSpecies(s.id).catch(() => {})),
  ]
  await Promise.allSettled(calls)
}
