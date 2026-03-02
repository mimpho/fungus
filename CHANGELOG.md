# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

---

## [4.1.0] - 2026-03-02 — Backend scaffold + Outbreak Index · **desplegado en producción**

### Contexto
Inicio de la era v4 (backend). v4.1 es la primera fase: scaffold FastAPI + PostgreSQL + PostGIS, motor de ingesta meteorológica server-side con Open-Meteo y el algoritmo Outbreak Index. El catálogo (zonas, especies) sigue siendo mock en el frontend hasta v4.2.

### Añadido
- `backend/` — proyecto FastAPI completo con pyproject.toml, Dockerfile y Alembic
- `backend/app/models/` — 5 modelos SQLAlchemy 2.x async: `Zone`, `Species`, `ClimateHistory`, `ScoresCache`, `WeatherStation`
- `backend/migrations/versions/001_initial_schema.py` — migración inicial con PostGIS (`geom` GENERATED ALWAYS AS desde lat/lon)
- `backend/app/connectors/open_meteo.py` — conector P3, server-side, con retry/backoff (tenacity). Agrega datos horarios a diarios.
- `backend/app/services/scoring.py` — algoritmo Outbreak Index (OI): PA21 × 0.30 + Thermal × 0.25 + Seasonal × 0.25 + Ripening × 0.12 + Humidity × 0.08
- `backend/app/services/ingest.py` — ingesta diaria concurrente (semáforo 6), upsert idempotente con upgrade rule de fuentes, refresh de scores_cache
- `backend/app/routers/health.py` — `GET /api/v1/health`
- `backend/app/routers/zones.py` — `GET /api/v1/zones`, `GET /api/v1/zones/map-scores`, `GET /api/v1/zones/{id}`
- `backend/app/main.py` — FastAPI + CORS + Cache-Control middleware + APScheduler cron (05:00 UTC)
- `backend/scripts/backfill.py` — backfill histórico hasta 2 años vía Open-Meteo
- `backend/scripts/seed_catalog.py` — preparado para v4.2: importa mock JS → PostgreSQL
- `docs/conventions.md` — política de idiomas, versionado semántico, git branching, formato de commits
- `CLAUDE.md` actualizado con sección completa del backend

### Decisiones
- **Infraestructura objetivo**: Render (API) + Supabase (PostgreSQL + PostGIS)
- **Conector activo**: solo Open-Meteo (P3) hasta disponer de API key de Meteocat (v4.1.x)
- **Código en inglés**: identificadores, comentarios, commits, nombres de tablas/columnas. Ver `docs/conventions.md`
- **Versionado**: major=generación, minor=fase, patch=tarea. Sin etiquetas "-faseN" en versiones. Ver `docs/conventions.md`
- **Rama**: `epic/v4-backend` agrupa todas las fases del backend (v4.1, v4.2, v4.3) antes de mergear a `main`

### Deploy
- **API**: `https://fungus-api.onrender.com` (Render free tier, Frankfurt)
- **BD**: Supabase PostgreSQL + PostGIS (Ireland)
- **Frontend**: `https://fungus-ashen.vercel.app` (Vercel, apunta a `main`)
- **Keep-alive**: UptimeRobot monitor en `/api/v1/health` (14 min interval)
- **Pendiente**: health endpoint debe aceptar HEAD para que UptimeRobot no genere falsos incidentes

---

## [3.0.0-fase5] - 2026-02-26 — Migración a Vite + React Router (Fase 5: Mapa Leaflet + Micología)

### Contexto
Quinta fase: la migración a Vite está completa. Mapa Leaflet interactivo en todos los puntos de la app, página Micología funcional con ArticleModal y sistema de artículos, y code splitting que reduce el bundle principal de 617KB a 133KB.

### Añadido
- `src/components/map/LeafletMap.jsx` — mapa Leaflet vanilla con modo markers (marcadores 🍄 por forestType) y modo heatmap meteórico sintético (grid de España con `leaflet.heat`), botón pantalla completa con portal, zoom control, popups dark
- `src/components/modals/ArticleModal.jsx` — modal de artículos con hero foto, mini-barra sticky, ARTICLE_REGISTRY pattern; exporta helpers `ArticleSection`, `ArticleP`, `ArticleCallout`, `ArticleInfographic`
- `src/articles/Micorrizas.jsx` — artículo completo con 3 infografías SVG (intercambio de nutrientes, Ecto vs Endo, tabla especie-árbol), 5 secciones y fuentes bibliográficas
- `src/pages/Micologia.jsx` — página real con artículo destacado (hero imagen + texto) y grid de cards (publicados/próximamente)

### Modificado
- `src/pages/Zones.jsx` — tab Mapa ahora usa `<LeafletMap>` real (antes placeholder)
- `src/components/modals/ZoneModal.jsx` — sección Ubicación usa `<LeafletMap singleZone>` (antes placeholder)
- `src/components/modals/SpeciesModal.jsx` — sección Dónde encontrarla usa `<LeafletMap zonas>` (antes placeholder)
- `src/components/Layout.jsx` — navegación mobile cambiada de bottom tab bar a hamburguesa ☰ desplegable (alineado con standalone)
- `vite.config.js` — `manualChunks` para code splitting: bundle principal 617KB → 133KB; chunks separados para react-vendor, leaflet-vendor, data-species, data-zones

### Instalado
- `leaflet.heat` — plugin de mapa de calor para Leaflet

---

## [3.0.0-fase4] - 2026-02-26 — Migración a Vite + React Router (Fase 4: Modales)

### Contexto
Cuarta fase: todos los modales (ZoneModal, SpeciesModal, FamilyModal, Lightbox) están portados a componentes React con imports ES module. El stack modal completo funciona desde AppContext sin props drilling.

### Añadido
- `src/components/modals/Lightbox.jsx` — visor de fotos full-screen con nav por teclado (← → Esc), swipe táctil, thumbnails en desktop, dots en mobile, portal a `document.body`
- `src/components/modals/FamilyModal.jsx` — ficha de familia con descripción, características y listado de especies de la familia
- `src/components/modals/ZoneModal.jsx` — ficha de zona: hero foto, mini-barra sticky al scroll, termómetro con 6 métricas, especies disponibles ahora, calendario de fructificación con filtros, placeholder mapa (Fase 5)
- `src/components/modals/SpeciesModal.jsx` — ficha de especie: hero foto, comestibilidad + enlace familia, aviso mortal, nombres comunes, TaxonomyBlock, descripción, hábitat, calendario 12 meses, galería con lightbox, condiciones de fructificación, morfología (cap/stem/flesh), ConfusionesBlock, placeholder mapa distribución (Fase 5)
- `src/components/modals/ModalRenderer.jsx` — renderiza el modal activo leyendo el estado de AppContext; montado en `App.jsx` fuera del árbol de rutas
- `src/lib/helpers.jsx` — añadidos `TaxonomyBlock`, `ConfusionesBlock`, `CONFUSIONES_POR_FAMILIA`, `CONFUSION_GENERICA`

### Modificado
- `src/App.jsx` — añadido `<ModalRenderer />` justo después de `<ScrollToTop />`

### Pendiente (próximas fases)
- Fase 5: Mapa Leaflet interactivo en ZoneModal y SpeciesModal, página Micología + ArticleModal

---

## [3.0.0-fase3] - 2026-02-26 — Migración a Vite + React Router (Fase 3: Páginas y Estado Global)

### Contexto
Tercera fase: las cuatro páginas principales tienen contenido real y el estado global está centralizado en React Context. La app Vite ya es navegable con datos reales.

### Añadido
- `src/contexts/AppContext.jsx` — estado global con React Context: `followedZones`, `favoriteSpecies`, `lang`, `profile`, modal stack (`selectedZone`, `selectedSpecies`, `selectedFamily`, `lightbox`). Persiste en `localStorage` con clave `fungus_v3` (compatible con el standalone)
- `src/components/ui/FilterPanel.jsx` — panel de filtros responsive: inline colapsable en desktop, bottom-sheet con drag-to-close en mobile
- `src/components/ui/SearchFilterBar.jsx` — barra de búsqueda con botón Filtrar integrado (variants: `full` / `split`)
- `src/components/ui/Tabs.jsx` — tabs reutilizables (variants: `default` / `compact`, sizes: `sm/md/lg`)
- `src/components/ui/ActiveFilterChip.jsx` — chip de filtro activo con botón de eliminar
- `src/components/ui/ZoneCard.jsx` — card de zona con condiciones mock, barra de score, icono de bosque
- `src/pages/Dashboard.jsx` — portado completo: stat cards, top zonas, zonas seguidas, especies en temporada, favoritas
- `src/pages/Species.jsx` — portado completo: búsqueda, filtros (edibilidad, familia, orden), grid paginado (24/pág), paginación con elipsis
- `src/pages/Zones.jsx` — portado completo: tabs mapa/listado, filtros (seguidas, lluvia, bosque, CCAA, orden), cards con condiciones
- `src/pages/Profile.jsx` — portado completo: notificaciones, datos personales, selector de idioma, stats
- `src/components/Layout.jsx` — añadida navegación mobile bottom bar con emojis + active state

### Pendiente (próximas fases)
- Fase 4: Modales + deep links (`/zonas/:id`, `/especies/:id`)
- Fase 5: Mapa Leaflet interactivo, Micología + ArticleModal

---

## [3.0.0-fase2] - 2026-02-26 — Migración a Vite + React Router (Fase 2: Datos y Helpers)

### Contexto
Segunda fase de la migración: los datos y las utilidades compartidas ya son módulos ES importables, desacoplados del scope global del standalone.

### Añadido
- `src/lib/constants.js` — fuente única de verdad para design tokens: `COLORS`, `MODAL`, `FOREST_COLORS`, `MONTHS`
- `src/lib/helpers.jsx` — helpers portados del standalone como named exports: `IC` (iconos SVG), `getEdibilityColor`, `EdibilityTag`, `SpeciesImg` (con fallback Wikipedia), `SpeciesCard`, `getScoreColor`, `fakeConditions`
- `src/data/zones.js` — 28 zonas como `export const mockZones`
- `src/data/species.js` — 27 especies (5218 líneas) como `export const mockSpecies`
- `src/data/families.js` — 8 familias como `export const mockFamilies`
- `src/data/i18n.js` — traducciones es/ca/en como `export const i18n`
- `src/data/articles.js` — artículos de micología como `export const mockArticles`
- `src/data/opportunities.js` — oportunidades mock como `export const mockOpportunities`

### Pendiente (próximas fases)
- Fase 3: Páginas con contenido real (Dashboard, Profile, Species, Zones)
- Fase 4: Modales + deep links (`/zonas/:id`, `/especies/:id`)
- Fase 5: Micología, ArticleModal, mapa Leaflet

---

## [3.0.0-fase1] - 2026-02-26 — Migración a Vite + React Router (Fase 1: Fundación)

### Contexto
Inicio de la migración de la arquitectura standalone (Babel en browser) a una app React moderna con bundler y routing real. El standalone permanece en `standalone/` como archivo funcional.

### Añadido
- **Vite 6** como bundler — reemplaza el CRA de `frontend/` (eliminado) y el transpilado Babel en browser
- **React Router v6** — routing basado en URL, reemplaza el `view` state manual
- **Tailwind CSS 3** instalado vía npm (postcss) — reemplaza el CDN
- **React Leaflet 4** instalado vía npm — reemplaza el CDN de Leaflet
- Estructura de directorios `src/` (pages/, components/, lib/, data/, articles/)
- Shell de rutas con 5 páginas placeholder: `/`, `/zonas`, `/especies`, `/micologia`, `/perfil`
- Rutas anidadas para deep linking: `/zonas/:id`, `/especies/:id`, `/micologia/:slug`
- `ScrollToTop` automático en cada cambio de ruta
- `vercel.json` con rewrites SPA para que React Router funcione en producción
- `public/assets/` con todos los recursos de imágenes (2.200+ ficheros)
- Design system en `tailwind.config.js` (colores, tipografías)
- `styles.css` con clases `.glass`, `.hover-lift`, `.anim-*`, `.modal-*` portadas del standalone

### Eliminado
- `frontend/` (CRA experimental, nunca en producción)

### Pendiente (próximas fases)
- Fase 2: Migración de datos y helpers (data/*.js → módulos ES, lib/helpers.jsx)
- Fase 3: Páginas (Dashboard, Profile, Species, Zones)
- Fase 4: Modales + deep links (/zonas/:id, /especies/:id)
- Fase 5: Micología, ArticleModal, Leaflet map

---

## [2.8.0] - 2026-02-18

### Añadido — Expansión masiva de datos
- **28 zonas** (antes 8, +250%): cobertura de toda España — Pirineos, Sistema Central, Sistema Ibérico, Cordillera Cantábrica, zona mediterránea
- **27 especies** (antes 7, +286%): nuevas especies comunes como Macrolepiota procera, Hydnum repandum, Calocybe gambosa, Craterellus cornucopioides, Lepista nuda, Hygrophorus marzuolus, entre otras
- Representación de todas las temporadas: invierno, primavera, verano y otoño
- Cobertura de 9 comunidades autónomas y 20 provincias

---

## [2.7.3] - 2026-02-18

### Añadido
- **Tabs de modo en modal fullscreen**: el selector "Zonas / Mapa de calor" ahora también aparece al expandir el mapa a pantalla completa
- **Dashboard inteligente**: rediseño completo de las stat cards con información accionable
  - Card "Condiciones Generales": score promedio de las top zonas + métricas climáticas agregadas
  - Card "Mejor Zona Hoy": recomendación con explicación dinámica del motivo, clickable
  - Card "Especies Activas": listado de las que fructifican este mes, clickable

---

## [2.7.2] - 2026-02-18

### Cambiado
- **Controles de zoom** movidos a `bottom-left` en todos los mapas (antes `top-left`)
- **Selector de modo** (Zonas/Mapa de calor) movido a `top-left` (antes `top-right`)
- Layout final sin solapamientos: modo (top-left) · zoom (bottom-left) · fullscreen (bottom-right)

---

## [2.7.1] - 2026-02-18

### Añadido
- **Componente `<Tabs>` reutilizable** con variants `md` y `sm/compact`
- **Selector de modo en mapa** integrado dentro del propio mapa (top-right), con fondo blur para legibilidad
- Etiquetas de texto claras: "Zonas" / "Mapa de calor" (antes iconos 📍🌡️)

---

## [2.5.1] - 2026-02-18

### Corregido
- **`BottomPillPortal`**: drawer de filtros refactorizado con `ReactDOM.createPortal` para renderizar en `document.body`
  - Backdrop ahora cubre toda la pantalla independientemente del scroll
  - Drawer siempre anclado al bottom del viewport (`position: fixed`)
  - Max-width 500px centrado en desktop
  - Z-index independiente del stacking context padre

---

## [2.3.0] - 2026-02-17

### Añadido

#### Sección Zonas (rediseñada)
- **Mapa Leaflet interactivo** con todas las zonas georreferenciadas
  - Marcadores por tipo de bosque con colores diferenciados
  - Popups informativos al clicar marcador
  - Tiles CartoDB Dark para coherencia visual
- **Subtabs**: Mapa / Mis Zonas / Todas las Zonas (integra el antiguo "Seguimiento")
- **Acceso rápido a zonas seguidas** desde subtab "Mis Zonas"
- Botón Seguir en cada ZonaCard

#### Ficha de Zona (rediseñada)
- **Diseño ancla** — toda la info en scroll continuo:
  1. Termómetro compacto tipo progress bar
  2. Grid de 6 condiciones actuales
  3. Especies disponibles ahora con score y días estimados
  4. Calendario de fructificación por especie
  5. Mapa de ubicación Leaflet
- **Botón Seguir / Siguiendo** en header del modal
- Descripción de la zona

#### Sección Especies (mejorada)
- Buscador por nombre científico o nombre común
- Filtro por familia con selector desplegable
- Ordenación: Alfabético / Por familia / Por comestibilidad
- Toggle para ver solo favoritos
- Paginación (8 por página) con navegación numérica
- Fotos reales en cards (Wikimedia Commons)

#### Ficha de Especie (rediseñada)
- Hero foto a todo ancho con nombre en overlay
- Badge de comestibilidad prominente (5 niveles incluyendo MORTAL)
- Aviso de peligro extremo con número de toxicología
- Morfología técnica con ilustraciones SVG (sombrero, pie, carne)
- Descripción extensa, nombres comunes con chips
- Hábitat + rango de altitud (min-max m.s.n.m.)
- Mapa de distribución con zonas donde encontrarla
- Botón de favorito (corazón) en header
- Acceso a Ficha de Familia

#### Nueva Ficha de Familia
- Modal accesible desde la ficha de especie
- Descripción y características de la familia
- Listado de especies con foto, nombres y badge
- Navegación directa a ficha de especie

#### Nueva Sección Perfil de Usuario
- Notificaciones de seguimiento de zonas
- Datos personales editables (nombre, email)
- Selector de idioma: Castellano / Català / English (interfaz completa)
- Resumen de zonas seguidas y especies favoritas

#### Datos Mock ampliados
- 25 especies (antes 5) con datos morfológicos completos, fotos y distribución
- 8 familias micológicas con descripción y características
- 8 zonas (antes 5)

### Cambiado
- Eliminada sección "Seguimiento" del nav → integrada en Zonas
- Ficha de zona: de pestañas a diseño ancla con scroll
- Termómetro: de barra grande a progress bar compacto
- Navegación: Dashboard / Zonas / Especies / Perfil
- Tipografía: Cormorant Garamond + DM Sans
- localStorage: clave `fungus_v3` (zonas, favoritos, perfil, lang)

---

## [2.0.0] - 2026-02-17

### Añadido
- Sección Seguimiento con zonas favoritas y localStorage
- Modal de Zona con 3 pestañas (Tiempo Real, Calendario, Disponibles)
- Termómetro de Recolección visual
- Botón Seguir Zonas con contador en header
- Fichas de Especies mejoradas con sinónimos regionales

---

## [1.0.0] - 2026-02-16

### Añadido
- Dashboard con StatCards y grid de oportunidades
- Vista de Zonas con modal de calendario
- Vista de Especies con badges de comestibilidad
- Sistema de Datos Mock: zonas, especies, oportunidades
- Diseño glass morphism, tema oscuro, responsive
- Versión Standalone HTML único sin dependencias

---

## [2.2.0] - 2026-02-17

### Añadido
- **Modal mapa pantalla completa**: botón "Pantalla completa" en todos los mapas Leaflet
  - Cubre toda la pantalla para máxima área funcional
  - Cierre con botón o tecla Escape
  - Título contextual (nombre de zona o "Mapa de zonas micológicas")
  - Disponible en: mapa principal de Zonas, mapa de ubicación en ficha de zona, mapa de distribución en ficha de especie
- **Galería de fotos en ficha de especie**:
  - Preview en grid (hasta 4 columnas) con efecto hover y lupa
  - Caption al pasar el ratón sobre cada miniatura
  - Contador de fotos disponibles
- **Lightbox fullscreen para galería**:
  - Imagen a pantalla completa al clicar miniatura
  - Navegación con flechas laterales o teclas ← →
  - Miniaturas clicables en la barra inferior
  - Caption de la foto activa
  - Cierre con X o tecla Escape
- **Múltiples fotos reales por especie** (Wikimedia Commons): 2-4 fotos por especie, 25 especies = ~70 fotos en total

---

## [2.3.0] - 2026-02-17

### Cambiado — UX y navegación

#### Modales
- **Fullscreen en mobile**: todos los modales (Zona, Especie, Familia) se abren a pantalla completa en móvil, deslizando desde la parte inferior (bottom sheet). En desktop mantienen el comportamiento centrado anterior
- **Header sticky**: la cabecera de cada modal queda fija mientras se hace scroll en el contenido

#### Ficha de Zona
- **Hero con foto**: el header ahora incluye una imagen de fondo (foto de una especie representativa del tipo de bosque). Diseño análogo a la ficha de especie
- **Descripción movida**: la descripción de la zona ya no está fija en el header — aparece en el área scrollable del contenido
- **Botón seguir rediseñado**: icono estrella sin texto, igual que el corazón de la ficha de especie
- **Items de setas clicables**: las filas de "Disponibles ahora" y el "Calendario de fructificación" son clicables y abren la ficha de dicha especie

#### Página de Especies
- **Card completamente clicable**: toda la surface de la card (foto + texto) abre la ficha de especie. El botón de favorito sigue siendo independiente (stopPropagation)

#### Ficha de Especie
- **Morfología reordenada**: la sección de morfología técnica (sombrero, pie, carne) se muestra ahora debajo de la galería de fotos
- **Mapa de distribución clicable**: los marcadores del mapa dentro de la ficha de especie son clicables y abren la ficha de la zona correspondiente

#### Página de Zonas
- **Solo 2 tabs**: Mapa y Listado (eliminadas las tabs "Mis zonas" y "Todas las zonas" redundantes)
- **Filtros en Listado**:
  - Toggle "Mis zonas / Todas" para ver solo las seguidas
  - Ordenamiento: Mejor condición (termómetro) · A–Z Nombre · Altitud
  - Condiciones estables entre ordenamientos (mismo fakeCond por zona)

### Eliminado
- Tabs "Mis zonas" y "Todas las zonas" de la sección Zonas (sustituidas por el filtro en Listado)
- Archivos de versiones anteriores (v2.2.0, v2.2.1 intermedios)
