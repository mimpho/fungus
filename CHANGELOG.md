# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

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
