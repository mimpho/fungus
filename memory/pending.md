# Tareas Pendientes y Revisiones Abiertas

---

## 🚧 En curso — Weather Phase 1 (4.4.1)
- WeatherCache DB model, migraciones y endpoints iniciales (backend)
- Skeleton de servicio y doc-sync (CLAUDE ↔ OpenCode)
- Update de CHANGELOG y Unreleased para 4.4.1
---

---

## 🚧 En curso — v4.3 (rama: `chore/fixes-and-improvements`)

### ✅ Integración frontend → API (zonas + especies)
Reemplazados imports mock + llamadas Open-Meteo directas por llamadas al backend:
- `useZones` hook: consume `/api/v1/zones` (scores cacheados en BD, sin 429s)
- `useSpecies` hook: consume `/api/v1/species` con paginación cursor
- `SpeciesModal`: lazy-load de detalle completo (cap/stem/flesh/photos) cuando `_partial=true`
- Fallback a mock data si el backend no responde

### ⏳ Auth + social (siguiente bloque)
JWT, favoritos reales en BD, avistamientos comunitarios.

---

## ✅ Completado — Nuevo artículo: Recicladores (2026-03-03)

- Añadido artículo "Los recicladores del bosque" en `src/articles/Recicladores.jsx`
- Imágenes: recicladores-tronco.webp, recicladores-infografia.webp, recicladores-corteza.webp
- Actualizado en CHANGELOG.md

---

## ✅ Completado — v4.2.0 (2026-03-02)

1. ✅ `HEAD /api/v1/health` — probe sin DB query (UptimeRobot)
2. ✅ Seed script corregido y probado — 200 zonas, 201 especies en Supabase
3. ✅ `GET /api/v1/species` y `GET /api/v1/species/{id}` — catálogo servido desde BD
4. ✅ Zonas con campo `description` (migración 002)

**Pendiente de deploy**: ejecutar `alembic upgrade head` + `python -m scripts.seed_catalog` en producción tras merge del PR.

---

## ✅ Completado — Deploy v4.1.0 en producción (2026-03-02)

- **API**: `https://fungus-api.onrender.com` (Render free tier)
- **BD**: Supabase PostgreSQL + PostGIS (Ireland)
- **Merge**: `epic/v4-backend` → `main` con `--no-ff`, tag `v4.1.0`
- **Keep-alive**: UptimeRobot monitor activo en `/api/v1/health`

---

## ✅ Completado — v4.1 pre-merge checklist (2026-03-02)

Todo commiteado y pusheado en `epic/v4-backend`. Pendiente: deploy manual (Supabase + Render) siguiendo `docs/deploy.md`, y merge a `main` tras el deploy.

### 1. ✅ API design conventions (`docs/conventions.md`)
Formato de respuestas, errores, paginación cursor-based, HTTP codes, cache headers, datetimes UTC, snake_case.

### 2. ✅ Local dev setup
`backend/docker-compose.yml` (PostgreSQL 16 + PostGIS 3.4), `.env.example` actualizado, `docs/local_dev.md` con guía completa.

### 3. ✅ Testing strategy + primeros tests
`docs/conventions.md` sección Testing. `backend/tests/unit/test_scoring.py` — 41 tests del algoritmo OI, todos en verde.

### 4. ✅ Secrets y gestión de entornos
`docs/environments.md` — catálogo completo de variables, flujo local/Render/CI.

### 5. ✅ CI/CD + guía de deploy
`.github/workflows/ci.yml` (unit + integration + lint). `docs/deploy.md` — checklist paso a paso para Supabase + Render.

---

## ✅ Completado — Revisión de edibilidad (2026-02-28)

### Revisión de edibilidad de todas las especies
**Estado:** Completado. 14 cambios aplicados en `src/data/species.js`.

**Cambios aplicados** (fuente: Wikipedia, MushroomExpert, First Nature, Ultimate Mushroom, Galloway Wild Foods):

| Especie | Nombre común | Antes | Ahora | Motivo |
|---|---|---|---|---|
| *Imleria badia* | Boleto bayo / Cep bru | `bueno` | `excelente` | "Choice", comparable a B. edulis en sabor |
| *Cantharellus aurora* | Rossinyol daurat | `bueno` | `excelente` | "Culinariamente igual que sus parientes grandes" |
| *Craterellus lutescens* | Camagroc / Rossinyolic | `bueno` | `excelente` | Muy cotizado, aroma frutal intenso, todas las fuentes top |
| *Craterellus tubaeformis* | Cantarel·la d'hivern | `bueno` | `excelente` | "Edible and excellent", muy popular en Escandinavia |
| *Hydnum repandum* | Peu de rata / Llengua de vaca | `bueno` | `excelente` | 4/5, vendido en mercados junto a rebozuelos en Francia |
| *Hydnum rufescens* | Pou de rata rojenc | `bueno` | `excelente` | Misma calidad que H. repandum |
| *Morchella importuna* | Colmenilla importuna | `bueno` | `excelente` | "Highly priced", misma categoría que todas las colmenillas |
| *Pleurotus pulmonarius* | Gírgola de pulmó | `bueno` | `excelente` | "Equally edible as P. ostreatus" (que ya era excelente) |
| *Butyriboletus regius* | Cep reial / Royal bolete | `bueno` | `excelente` | "Same culinary league as Ceps (B. edulis)" |
| *Leccinum versipelle* | Llenega taronja | `comestible` | `bueno` | "Good edible", superior al L. scabrum |
| *Gyroporus cyanescens* | Giropor blau | `comestible` | `bueno` | "Choice" en varias fuentes |
| *Gyroporus castaneus* | Giropor castany | `comestible` | `bueno` | "Choice edible" confirmado |
| *Gomphus clavatus* | Gomfo amorat | `comestible` | `bueno` | "Choice" en guías europeas, cuidado con ejemplares viejos |
| *Tricholoma terreum* | Ratolí / Fredolic gris | `bueno` | `precaucion` | Triterpenoides tóxicos aislados (2014), relación con rabdomiólisis |

**Nota Tricholoma equestre:** ya estaba como `precaucion`, se confirma correcta (casos de rabdomiólisis, 20% mortalidad en brotes franceses). La investigación reciente sugiere que algunos casos podrían haberse confundido con T. terreum.

**Impacto en scoring:** el species modifier no está en caché → cambios visibles inmediatamente, sin necesidad de subir `CACHE_VERSION`.

---

## 🟡 Backlog — v3.x (sin prioridad activa)

### Revisión general del catálogo de especies
- Verificar que `forestTypes` y `fruitingMonths` sean correctos para todas las especies
- Añadir más especies si faltan representativas de cada tipo de bosque
- Comprobar si hay especies con `forestType: 'mixto'` que deberían cubrirse en las zonas actuales (las zonas solo tienen: pinar, hayedo, robledal, encinar)
- Valorar otros tipos como abetosas, coníferas (mixtos), etc

### Zonas sin especies en temporada
Actualmente si no hay especies que coincidan con una zona/mes, el score meteorológico queda sin ajustar. Considerar si esto es correcto o si debería haber una penalización por "zona sin interés micológico este mes".

### `speciesScore` en la UI de ZoneModal
El campo `speciesScore` (SQS) se calcula y se añade al objeto conditions, pero no se muestra en ningún sitio. Podría ser útil mostrarlo como indicador adicional en la ficha de zona.

### Meteocat API para zonas catalanas
Requiere API key. Híbrido: Meteocat para zonas catalanas, Open-Meteo para el resto.

### Zonas personalizadas
Permitir al usuario añadir y guardar puntos propios en el mapa.
