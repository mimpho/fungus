# Mobile Architecture — Fungus Android (v8.0)

> Technical architecture document for the Fungus Android app.
> Stack: React Native + Expo SDK 52 (managed workflow).

---

## Overview

The Fungus Android app is a native mobile client that consumes the same FastAPI backend as the web app. It introduces no new backend endpoints in v8.0. The app lives in the `mobile/` subdirectory of the existing monorepo.

The mobile app is architecturally independent from the web frontend (`src/`). Shared logic (scoring algorithm, constants, i18n keys) is forked rather than imported to avoid coupling a fast-moving native app to a web build pipeline.

---

## Repository structure

```
fungus/
├── src/                  ← Web app (Vite + React) — untouched
├── backend/              ← FastAPI — untouched
└── mobile/               ← NEW — React Native + Expo
    ├── app/              ← expo-router (file-based routing)
    ├── components/       ← Shared UI components
    ├── services/         ← API client + business logic
    ├── hooks/            ← Custom React hooks
    ├── lib/              ← Constants, scoring, i18n
    ├── store/            ← Global state (AppContext)
    ├── app.json          ← Expo configuration
    ├── eas.json          ← EAS Build profiles
    ├── tsconfig.json
    └── package.json
```

---

## Tech stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Runtime | React Native | 0.76+ (via Expo 52) | Cross-platform, same language as web |
| Framework | Expo (managed workflow) | SDK 52 | No Xcode/Android Studio needed for builds; EAS handles APK generation |
| Routing | expo-router | v4 | File-based routing, deep linking out-of-the-box, typed routes |
| Map | @maplibre/maplibre-react-native | latest | No API key, no quota, open-source vector tiles |
| Local storage | @react-native-async-storage | latest | Equivalent to web localStorage; TTL cache pattern |
| Secure storage | expo-secure-store | latest | JWT token storage; encrypted on device |
| Auth (OAuth) | expo-auth-session | latest | PKCE flow for Google OAuth on mobile |
| Language | TypeScript | 5.x | Type safety; no plain JS in mobile/ |
| Styling | StyleSheet + NativeWind (TBD) | — | StyleSheet always; NativeWind if Tailwind parity is desired |
| Build | EAS Build | latest | Cloud APK/AAB generation without local Android SDK |

### Why Expo managed workflow

- No native code changes required for v8.0 feature set.
- EAS Build generates APKs in the cloud — no Mac or Android Studio required.
- If native modules are needed post-v8.0, `expo prebuild` migrates to bare workflow without rewriting the app.

---

## Navigation architecture (expo-router v4)

expo-router uses a file-based system similar to Next.js. Each file in `app/` becomes a route.

```
mobile/app/
├── _layout.tsx               ← Root layout: auth guard, font loading, theme
├── (tabs)/
│   ├── _layout.tsx           ← Tab bar: Zones · Map · Species · Profile (no Dashboard)
│   ├── index.tsx             ← /          → Zones list (home tab)
│   ├── mapa.tsx              ← /mapa      → Native map (primary tab, same level as list)
│   ├── especies.tsx          ← /especies  → Species list
│   └── perfil.tsx            ← /perfil    → Profile
├── zona/
│   └── [id].tsx              ← /zona/:id  → Zone detail (bottom sheet modal)
├── especie/
│   └── [id].tsx              ← /especie/:id → Species detail (bottom sheet modal)
└── auth/
    ├── _layout.tsx           ← Auth group layout (unauthenticated only)
    ├── login.tsx             ← /auth/login
    └── register.tsx          ← /auth/register
```

### Screen presentation styles

| Route | Presentation | Reason |
|---|---|---|
| (tabs)/index | Standard tab | Zones list — home screen |
| (tabs)/mapa | Standard tab | Map — primary tab, same level as list. Both lead to zona/[id] via different interactions |
| (tabs)/especies | Standard tab | Species catalogue |
| (tabs)/perfil | Standard tab | Profile + lang selector |
| zona/[id] | Bottom sheet (modal) | Reachable from both list and map |
| especie/[id] | Full-screen modal | Species detail needs full height for gallery |
| auth/* | Stack (no tabs) | Auth flow isolated from main navigation |

**No Dashboard tab.** The Zones list sorted by score IS the home screen. A dedicated Dashboard adds no value at this stage. If a "today view" with geolocation is built in the future, it can be introduced then.

### Deep linking

expo-router enables deep linking automatically. The scheme `fungus://` maps to the file structure:
- `fungus://zona/zone-001` → opens Zone detail for zone-001
- `fungus://especie/boletus-edulis` → opens Species detail

---

## API integration

### Base client (`services/api.ts`)

```typescript
const BASE_URL = 'https://fungus-api.onrender.com/api/v1'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await SecureStore.getItemAsync('fungus_jwt')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) throw new ApiError(res.status, await res.text())
  return res.json()
}
```

### AsyncStorage cache strategy

Mirrors the web's localStorage cache pattern. TTL: 3 hours.

```typescript
interface CacheEntry<T> {
  ts: number      // Unix ms
  v: number       // CACHE_VERSION — invalidate on scoring algorithm changes
  data: T
}

const CACHE_VERSION = 3   // Keep in sync with web CACHE_VERSION
const CACHE_TTL_MS = 3 * 60 * 60 * 1000
```

Cache keys:
- `fungus_zones_v3` — all zones
- `fungus_weather_v3` — all zone weather conditions
- `fungus_species_v3` — full species catalogue (lang-specific: `fungus_species_es_v3`)

### Endpoints consumed (v8.0)

All endpoints already exist. No new backend endpoints required for the core v8.0 feature set.

| Endpoint | Consumer | Cached |
|---|---|---|
| `GET /zones` | Dashboard, Zones list | Yes (3h) |
| `GET /zones/{id}` | Zone detail | No |
| `GET /zones/map-scores` | Map | Yes (3h) |
| `GET /species?lang=` | Species list | Yes (3h) |
| `GET /species/{id}?lang=` | Species detail | No |
| `GET /weather/zones` | Dashboard | Yes (3h) |
| `GET /weather/zones/{zone_id}` | Zone detail | No |
| `POST /auth/login` | Login screen | No |
| `POST /auth/register` | Register screen | No |
| `GET /auth/me` | Profile, auth guard | No |

---

## Authentication

### JWT (email + password)

1. User submits credentials → `POST /auth/login` → receives `{ access_token, token_type }`.
2. Token stored in `expo-secure-store` under key `fungus_jwt`.
3. `apiFetch` reads token and injects `Authorization` header on every request.
4. Auth guard in `_layout.tsx` reads token on app start; redirects to `/auth/login` if absent or expired.

### Google OAuth (mobile PKCE flow) — deferred to v8.1

Google OAuth on mobile requires a new backend endpoint (`POST /auth/google/mobile`) that does not exist yet. To avoid blocking the v8.0 launch, **v8.0 ships with email/password only**. Google OAuth is planned for v8.1.

When implemented in v8.1, the flow will be:
1. App opens Google authorization URL via `expo-auth-session` (PKCE).
2. User authenticates in system browser.
3. Google redirects to `fungus://auth/callback`.
4. App exchanges code + code_verifier for a Fungus JWT via `POST /auth/google/mobile`.

---

## State management

Global state uses React Context (`store/AppContext.tsx`), mirroring the web's `AppContext.jsx`.

```typescript
interface AppState {
  lang: 'es' | 'ca' | 'en'
  profile: UserProfile | null
  followedZones: string[]       // zone IDs
  favoriteSpecies: string[]     // species IDs
  t: Translations               // translation object for current lang
}
```

Persistence: `lang` and `profile` persisted to AsyncStorage. `followedZones` and `favoriteSpecies` synced to backend when authenticated (same endpoints as web).

**Chosen: Zustand.** Each component subscribes only to the slice it needs, avoiding unnecessary re-renders in native (where render cost is more perceptible than on web). Better DevTools integration and less boilerplate than Context for a standalone native app.

---

## Scoring algorithm

The scoring algorithm (`weatherService.js` on web) is ported to `mobile/lib/scoring.ts`. The same weights and seasonal factors apply. This creates a fork — if the algorithm changes on web, the mobile port must be updated manually.

**Long-term**: extract scoring to a shared package (`packages/scoring`) consumed by both `src/` and `mobile/`. Deferred to post-v8.0 to avoid monorepo complexity during the initial build.

```typescript
// mobile/lib/scoring.ts
export const SEASONAL_FACTOR: Record<number, number> = {
  1: 15, 2: 20, 3: 38, 4: 58, 5: 62,
  6: 28, 7: 18, 8: 48, 9: 80, 10: 100, 11: 88, 12: 42,
}

export function computeOverallScore(params: WeatherParams): number {
  const month = new Date().getMonth() + 1
  return (
    (SEASONAL_FACTOR[month] / 100) * 0.40 +
    scoreRainfall(params.rainfall14d)      * 0.21 +
    scoreTemperature(params.temperature)   * 0.18 +
    scoreHumidity(params.humidity)         * 0.12 +
    scoreDryDays(params.dryDays)           * 0.09
  ) * 100
}
```

---

## Map

### Chosen: @maplibre/maplibre-react-native

- Open-source, no API key, no quota.
- Uses vector tiles — provider configurable (OpenStreetMap, Maptiler free tier, etc.).
- Renders markers coloured by `forestType` (same colour scheme as web Leaflet map).
- Heatmap mode deferred to v8.1 (requires additional layer support).

**Tile provider for v8.0:** OpenStreetMap raster tiles as fallback; evaluate Maptiler free tier (75k tiles/month) for vector quality.

**Discarded:** react-native-maps (Google Maps) — requires `GOOGLE_MAPS_API_KEY`, quota monitoring, and Google account dependency. No functional advantage over MapLibre for our use case.

---

## i18n

`mobile/lib/i18n.ts` exports translation objects for ES/CA/EN. Keys mirror the web's translation system. Maintained as a fork — synced manually when web adds new keys.

Language selection persisted to AsyncStorage. Default: device locale if ES/CA/EN, else ES.

---

## Build and distribution

### EAS Build

```json
// eas.json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": { "buildType": "apk" },
      "distribution": "internal"
    },
    "production": {
      "android": { "buildType": "aab" }
    }
  }
}
```

| Profile | Output | Use |
|---|---|---|
| `development` | Dev client | Local development with hot reload |
| `preview` | APK | Internal testing / direct distribution |
| `production` | AAB | Google Play submission |

### Distribution options (open decision)

**v8.0: APK direct download.** User enables "install from unknown sources" once. No store account required. Suitable for early testing and initial user base.

**v8.1+: Google Play Store** ($25 one-time registration). Enables automatic updates and broader distribution. Upgrade path does not require app changes — EAS Build `production` profile already outputs AAB.

| Option | Setup cost | UX |
|---|---|---|
| APK direct download ✅ v8.0 | Zero | User must enable "install from unknown sources" |
| Google Play (internal track) | $25 one-time | Controlled rollout, automatic updates |
| Google Play (production) | $25 one-time | Public listing, reviews, search visibility |

---

## Design system

The mobile design mirrors the web color palette but uses React Native `StyleSheet` (no CSS).

| Token | Hex | Usage |
|---|---|---|
| background | `#30372a` | Screen backgrounds |
| cream | `#f4ebe1` | Primary text |
| muted | `#d9cda1` | Secondary text |
| coffee | `#8b6f47` | Accent, borders |
| green | `#4a7c59` | Positive indicators |
| danger | `#dc2626` | Toxic/lethal species |
| warning | `#d97706` | Caution species |

Fonts: `Cormorant_Garamond` (display) + `DM_Sans` (body) via `expo-google-fonts`.

---

## Open decisions

| # | Decision | Status |
|---|---|---|
| 1 | Map library | ✅ MapLibre (`@maplibre/maplibre-react-native`) |
| 2 | Distribution channel | ✅ APK direct in v8.0; Google Play in v8.1+ |
| 3 | Google OAuth | ✅ Deferred to v8.1 |
| 4 | State management | ✅ Zustand — selective subscriptions, better DX in native |
