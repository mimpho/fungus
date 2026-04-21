# Plan v8.0 — App Android

> Documento de planificación de la fase v8.0. Actualizado a medida que se toman decisiones.
> Documento de trabajo en español (per conventions).
> **Última actualización:** 2026-04-19

---

## Objetivo

Lanzar una app nativa Android para Fungus que permita al usuario consultar las condiciones micológicas de las zonas, explorar el catálogo de especies y ver las zonas en el mapa — todo desde el móvil con experiencia nativa.

---

## Estado actual (2026-04-19)

| Fase | Branch | Estado |
|---|---|---|
| Scaffold + API client + scoring | `feat/v8-0-expo-scaffold` | ✅ Mergeado en epic (#PR) |
| Nav restructure (4 tabs) + MushroomIcon | `feat/v8-0-nav-restructure` | ✅ Mergeado en epic |
| Design system (gradiente, tipografías, glass) | `feat/v8-0-design-system` | ✅ Mergeado en epic (#104) |
| **Zonas (lista + detalle + UI QA)** | `feat/v8-0-zones` + `feat/v8-0-species` | ✅ Mergeado en epic (2026-04-20) |
| **Light mode / semantic colour tokens** | `feat/v8-1-theming` | 🟡 Próximo — prerequisito para species y map |
| Especies (lista + detalle) | `feat/v8-0-species` | ⬜ Bloqueado por theming |
| Mapa nativo (MapLibre) | `feat/v8-0-map` | ⬜ Pendiente |
| Auth (login + registro + perfil) | `feat/v8-0-auth` | ⬜ Pendiente |
| Polish + icono + splash | `feat/v8-0-polish` | ⬜ Pendiente |
| EAS Build → APK | `feat/v8-0-eas-build` | ⬜ Pendiente |

---

## Alcance MVP (v8.0)

### Pantallas P0 — sin estas no hay v8.0

| Pantalla | Equivalente web | Estado |
|---|---|---|
| Zonas (lista) | `Zones.jsx` | 🟡 En progreso |
| Zona (detalle) | `ZoneModal.jsx` | 🟡 En progreso |
| Especies (lista) | `Species.jsx` | ⬜ Pendiente |
| Especie (detalle) | `SpeciesModal.jsx` | ⬜ Pendiente |

### Pantallas P1 — entran en v8.0 si no bloquean el lanzamiento

| Pantalla | Equivalente web | Estado |
|---|---|---|
| Mapa nativo | `LeafletMap.jsx` | ⬜ Pendiente — tab propio, MapLibre |
| Login / Registro | auth screens | ⬜ Pendiente — email+contraseña only |
| Perfil | `Profile.jsx` | ⬜ Pendiente — lang + seguidos + favoritos |

### Fuera de alcance v8.0

| Feature | Razón |
|---|---|
| Push notifications | Requiere backend adicional; pospuesto a v8.1 |
| Modo offline completo | Cache AsyncStorage (lectura) sí entra; descarga total no |
| Google OAuth | Requiere nuevo endpoint backend → v8.1 |
| iOS | Apple Developer $99/año — se reconsidera si hay ingresos |
| Custom zones | Web también en backlog |
| Heatmap | react-native-maps no lo soporta; v8.1 |
| Google Play Store | $25 one-time → v8.1; v8.0 distribuye APK directo |

---

## Decisiones técnicas — todas cerradas

| Decisión | Elección |
|---|---|
| Framework | Expo SDK 54, managed workflow |
| Navegación | expo-router v4 (file-based) |
| Estado global | Zustand (`useShallow` para selectores multi-valor) |
| Backend | `fungus-api.onrender.com` — sin endpoints nuevos en v8.0 |
| Auth tokens | `expo-secure-store` |
| Cache local | `@react-native-async-storage` (TTL 3h, CACHE_VERSION=3) |
| Build/distribución | EAS Build → APK directo (sin Google Play en v8.0) |
| Mapa | `@maplibre/maplibre-react-native` (sin API key) |
| Google OAuth | Diferido a v8.1 |
| Tipografías | Cormorant Garamond (display) + DM Sans (UI) vía `@expo-google-fonts` |
| Gradiente | `expo-linear-gradient` — `135deg` idéntico al de la web |

---

## Estructura real del repositorio (post-scaffold)

```
mobile/
├── app/
│   ├── _layout.tsx              ← Root: carga fonts, hydrate store, Background wrapper
│   ├── (tabs)/
│   │   ├── _layout.tsx          ← 4 tabs: Zonas · Mapa · Especies · Perfil
│   │   ├── index.tsx            ← Zonas lista (home tab)
│   │   ├── mapa.tsx             ← Mapa MapLibre
│   │   ├── especies.tsx         ← Catálogo de especies
│   │   └── perfil.tsx           ← Lang selector + auth state
│   ├── zona/[id].tsx            ← Detalle zona (modal)
│   ├── especie/[id].tsx         ← Detalle especie (fullScreenModal)
│   └── auth/
│       ├── login.tsx
│       └── register.tsx
├── components/
│   ├── icons/
│   │   └── MushroomIcon.tsx     ← SVG port de web (outline + filled)
│   └── ui/
│       └── Background.tsx       ← LinearGradient wrapper
├── constants/
│   └── Colors.ts                ← Tokens de color (espejo de styles.css)
├── lib/
│   ├── constants.ts             ← SEASONAL_FACTOR, EDIBILITY_SCORE, API_BASE_URL…
│   ├── scoring.ts               ← computeOverallScore + computeAdjustedScore
│   ├── i18n.ts                  ← ES/CA/EN (~50 keys)
│   └── theme.ts                 ← Font, Typography, Glass, Layout, Gradient
├── services/
│   └── api.ts                   ← apiFetch, cache (AsyncStorage), auth, zones, species
├── store/
│   └── useAppStore.ts           ← Zustand store (lang, profile, follows, favorites)
├── app.json                     ← scheme: "fungus", dark UI, splash #30372a
└── eas.json                     ← preview: apk, production: aab
```

---

## Integración con el backend

**Base URL:** `https://fungus-api.onrender.com/api/v1`

| Endpoint | Pantalla | Cache |
|---|---|---|
| `GET /zones` | Zonas lista | ✅ 3h |
| `GET /zones/{id}` | — (no se usa directamente) | — |
| `GET /weather/zones` | Zonas lista (scores) | ✅ 3h |
| `GET /weather/zones/{id}` | Zona detalle | ❌ tiempo real |
| `GET /species?lang=` | Especies lista | ✅ 3h (lang-keyed) |
| `GET /species/{id}?lang=` | Especie detalle | ❌ sin cache |
| `POST /auth/login` | Login | — |
| `POST /auth/register` | Registro | — |
| `GET /auth/me` | Perfil | — |

---

## Riesgos activos

| Riesgo | Estado |
|---|---|
| Render cold start → primera carga lenta | Mitigado con skeleton loaders + cache agresiva |
| Divergencia scoring web/mobile | Documentado en `memory/pending.md` — refactor shared package v9.0 |
| Google OAuth requiere endpoint nuevo | Descartado en v8.0, diferido a v8.1 |
| MapLibre rendering performance | A evaluar en `feat/v8-0-map` |
