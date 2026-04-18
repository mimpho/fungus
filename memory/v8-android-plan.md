# Plan v8.0 — App Android

> Documento de planificación de la fase v8.0. Se actualizará a medida que se tomen decisiones.
> Documento de trabajo en español (per conventions).

---

## Objetivo

Lanzar una app nativa Android para Fungus que permita al usuario consultar las condiciones micológicas de las zonas, explorar el catálogo de especies y recibir alertas cuando las condiciones sean buenas — todo desde el móvil y con una experiencia nativa.

---

## Alcance MVP (v8.0)

### Pantallas confirmadas (P0 — sin estas no hay v8.0)

| Pantalla | Equivalente web | Notas |
|---|---|---|
| Zonas (lista) | `Zones.jsx` | Home tab. Filtros por provincia/tipo de bosque |
| Zona (detalle) | `ZoneModal.jsx` | Condiciones meteorológicas + score |
| Especies (lista) | `Species.jsx` | Filtros por familia/comestibilidad |
| Especie (detalle) | `SpeciesModal.jsx` | Galería, confusiones, condiciones |

### Pantallas de alta prioridad (P1 — entran en v8.0 si no bloquean el lanzamiento)

| Pantalla | Equivalente web | Notas |
|---|---|---|
| Mapa nativo | `LeafletMap.jsx` | Tab propio al mismo nivel que lista. Markers coloreados por score. Mismo destino (zona detalle) vía interacción distinta |
| Login / Registro | auth screens | Email+contraseña + Google OAuth |
| Perfil | `Profile.jsx` | Lang, zonas seguidas, favoritos |

### Fuera de alcance v8.0 (→ v8.1 o posterior)

| Feature | Razón del aplazamiento |
|---|---|
| Push notifications (alertas de condiciones) | Requiere backend adicional para envío, complejo de testear |
| Modo offline completo | AsyncStorage cache de lectura sí entra; descarga de catálogo completo no |
| Mapa heatmap | react-native-maps no soporta heatmap nativo; requiere biblioteca adicional |
| iOS | Apple Developer $99/año — se reconsidera si hay ingresos |
| Custom zones | Funcionalidad web también en backlog |

---

## Decisiones técnicas tomadas

| Decisión | Elección | Estado |
|---|---|---|
| Framework | Expo SDK 52, managed workflow | ✅ Decidido |
| Navegación | expo-router v4 (file-based) | ✅ Decidido |
| Backend | Mismo `fungus-api.onrender.com` | ✅ Decidido (sin endpoints nuevos en v8.0) |
| Auth tokens | `expo-secure-store` para JWT | ✅ Decidido |
| Cache local | `@react-native-async-storage` | ✅ Decidido |
| Build/distribución | EAS Build → APK directo (sin Google Play en v8.0) | ✅ Decidido |
| Librería de mapa | `@maplibre/maplibre-react-native` (sin API key, libre) | ✅ Decidido |
| Google OAuth | Diferido a v8.1 — v8.0 solo email/password | ✅ Decidido |

## Decisiones técnicas abiertas

| Decisión | Opciones | Impacto | Prioridad |
|---|---|---|---|
| Estado global | **Zustand** — suscripciones selectivas, mejor DX en native | ✅ Decidido |
| Push notifications | Expo Push vs Firebase Cloud Messaging | Arquitectura backend adicional | Baja — fuera de MVP v8.0 |
| Heatmap en mapa | diferir a v8.1 | — | Baja |

---

## Estructura del repositorio

```
fungus/
├── src/           ← web (sin tocar)
├── backend/       ← FastAPI (sin tocar)
└── mobile/        ← NUEVO — Expo app
    ├── app/                    ← expo-router screens
    │   ├── _layout.tsx         ← Root layout (auth guard + tab navigator)
    │   ├── (tabs)/
    │   │   ├── _layout.tsx     ← Tab bar
    │   │   ├── index.tsx       ← Dashboard
    │   │   ├── zonas.tsx       ← Zones list
    │   │   ├── especies.tsx    ← Species list
    │   │   ├── mapa.tsx        ← Map
    │   │   └── perfil.tsx      ← Profile
    │   ├── zona/[id].tsx       ← Zone detail (bottom sheet modal)
    │   ├── especie/[id].tsx    ← Species detail (bottom sheet modal)
    │   └── auth/
    │       ├── login.tsx
    │       └── register.tsx
    ├── components/
    │   ├── ui/                 ← ScoreBar, EdibilityTag, ZoneCard, SpeciesCard
    │   ├── ZoneDetail.tsx
    │   └── SpeciesDetail.tsx
    ├── services/
    │   ├── api.ts              ← Base client (fetch + JWT headers)
    │   ├── weatherService.ts   ← Score calculation (port from web)
    │   ├── zonesService.ts
    │   └── speciesService.ts
    ├── hooks/
    │   ├── useZoneConditions.ts
    │   └── useSpecies.ts
    ├── lib/
    │   ├── constants.ts        ← Seasonal factors, colors (fork de src/lib/constants.js)
    │   ├── scoring.ts          ← Port de weatherService scoring functions
    │   └── i18n.ts             ← Translations (ES/CA/EN, fork de web i18n)
    ├── store/
    │   └── AppContext.tsx      ← Global state (lang, profile, favorites)
    ├── app.json                ← Expo config
    ├── eas.json                ← EAS Build profiles (development, preview, production)
    ├── tsconfig.json
    └── package.json
```

---

## Estrategia de integración con el backend

La app móvil es un **nuevo cliente del mismo backend**. No se añade ningún endpoint nuevo en v8.0.

- **Base URL**: `https://fungus-api.onrender.com/api/v1`
- **Auth**: JWT en header `Authorization: Bearer <token>`. Token almacenado en SecureStore.
- **Cache**: AsyncStorage con TTL de 3h (mismo criterio que web, `CACHE_VERSION` compartida conceptualmente).
- **Google OAuth en móvil**: `expo-auth-session` con Google provider. El código de autorización se intercambia en el backend (`/auth/google/callback`). Si el backend no tiene ese endpoint, hay que añadirlo — **bloqueante para feat/auth con Google**.

### Endpoints que usará la app (todos ya existentes)

| Endpoint | Pantalla |
|---|---|
| `GET /zones` | Dashboard, Zonas lista |
| `GET /zones/{id}` | Zona detalle |
| `GET /zones/map-scores` | Mapa |
| `GET /species?lang=` | Especies lista |
| `GET /species/{id}?lang=` | Especie detalle |
| `GET /weather/zones` | Dashboard scores |
| `GET /weather/zones/{id}` | Zona detalle condiciones |
| `POST /auth/login` | Login |
| `POST /auth/register` | Registro |
| `GET /auth/me` | Perfil |

### Posible endpoint nuevo (a confirmar)

| Endpoint | Razón | Prioridad |
|---|---|---|
| `GET /auth/google/mobile-callback` | Google OAuth en móvil usa PKCE, distinto flujo al web | Solo si se implementa Google OAuth en v8.0 |

---

## i18n

Los textos de UI se portan desde el sistema existente en la web. Se crea `mobile/lib/i18n.ts` con las mismas 3 lenguas (ES/CA/EN). No se comparte el archivo directamente (rutas distintas, posible divergencia) — fork sincronizado manualmente.

Selector de lengua: en la pantalla Perfil, igual que la web.

---

## Cronograma orientativo de features

```
Fase A — Fundación (bloqueante para todo lo demás)
  feat/v8-0-expo-scaffold      → Init Expo + expo-router + tab navigator + TypeScript
  feat/v8-0-api-service        → Cliente API base + AsyncStorage cache + scoring port

Fase B — Contenido (paralelas entre sí)
  feat/v8-0-dashboard          → Dashboard screen con scores por zona
  feat/v8-0-zones              → Lista + detalle de zona
  feat/v8-0-species            → Catálogo + detalle de especie

Fase C — Experiencia avanzada
  feat/v8-0-map                → Mapa nativo con markers (requiere decisión de librería)
  feat/v8-0-auth               → Login + registro + perfil + Google OAuth (opcional)

Fase D — Cierre
  feat/v8-0-polish             → Splash screen, icono, design review
  feat/v8-0-eas-build          → EAS Build config, APK de producción, distribución
```

---

## Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Render cold start (backend free tier) causa UX lenta en primera carga | Alta | Medio | Skeleton loaders + cache agresiva |
| Google OAuth móvil requiere endpoint backend nuevo | Media | Alto | Implementar solo email/password en MVP; Google OAuth en v8.1 |
| react-native-maps requiere Google Maps API key con quota | Media | Medio | Evaluar MapLibre como alternativa |
| Expo managed workflow limita customización nativa | Baja | Bajo | Si se necesita en el futuro, migrar a bare con `expo prebuild` |
| Diferencias de scoring entre web y port móvil | Baja | Alto | Extraer scoring a shared package en v8.1 si la app crece |

---

## Próximos pasos (antes de desarrollo)

- [x] ~~Decidir librería de mapa~~ → MapLibre
- [x] ~~Decidir distribución inicial~~ → APK directo
- [x] ~~Confirmar Google OAuth~~ → diferido a v8.1
- [ ] Revisar diagrama de navegación (`mobile_navigation.mermaid`) — confirmar flujos
- [ ] Revisar diagrama de stack (`mobile_stack.mermaid`) — confirmar capas
- [ ] Confirmar alcance P1 (mapa, auth, perfil entran en v8.0 o solo P0)
- [ ] Crear `epic/v8-android` en git cuando planificación esté cerrada
- [ ] Arrancar `feat/v8-0-expo-scaffold` (primera feature, bloqueante para el resto)
