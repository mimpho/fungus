# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

---

## [Unreleased]

### Añadido — v5.6 Generación masiva DNA Visual (en curso)

- Rama `feat/v5.6-dna-mass-generation` abierta para script de generación offline.

---

### Añadido — v5.5 Myco-Engine DNA Visual

- **`mushroom_visual_prompts` (migración 009)**: nueva tabla en Supabase con DNA Visual por especie — campos separados para píleo, estipe, himenio (lenguaje visual de imagen, no botánico raw), morfología extra imagen-safe, morfología para Gemini (interna/reacciones), sustrato, hábitat y fauna asociada. Campo `is_validated` para control de calidad.
- **`composition_notes`**: campo Text opcional por especie para reglas de composición (espécimen dominante, framing, elementos a evitar). Incluido en modelo, schema, endpoints, seed y frontend.
- **`MushroomVisualPrompt` (modelo SQLAlchemy)**: modelo async con FK a `species.id`, campos Text para todos los descriptores visuales, `is_validated: bool`, `updated_at` auto.
- **`VisualPromptData` + `VisualPromptUpsertBody` (schemas Pydantic)**: respuesta y body de upsert para el nuevo endpoint. `VisualPromptData` incluye `is_validated`.
- **`GET /species/{id}/visual-prompt`** (admin only): devuelve el DNA Visual estructurado o `null` si no hay entrada todavía. 200 + null = sin datos = fallback pipeline.
- **`PUT /species/{id}/visual-prompt`** (admin only): crea o reemplaza el DNA Visual de una especie. Semántica full-replace.
- **`scripts/seed_visual_prompts.py`**: script de seeding con 10 especies piloto cubriendo todos los tipos de himenio: Boletaceae (poros), Amanitaceae (láminas + volva), Cantharellaceae (pliegues), Morchellaceae (alveolada), Russulaceae (láminas frágiles), Hydnaceae, Bankeraceae (dientes), Hericiaceae (coral). Todas marcadas `is_validated=True`.
- **`docs/plan/seed_visual_prompts_009.sql`**: equivalente SQL del seed script para ejecutar en Supabase SQL Editor sin necesidad de shell de Render.
- **`ImageGenerator.jsx` — pipeline estructurado**: cuando el backend devuelve DNA Visual para la especie seleccionada, el generador usa el pipeline de 4 capas (Layer 0: anti-díptico → Layer 1: morfología validada de BD → Layer 3: óptica → output Gemini de solo escena). Gemini recibe morfología pre-ensamblada y solo genera la escena/atmósfera. Fallback automático al pipeline Gemini-interpreta-morfología cuando no hay datos en BD. Log muestra `🧬 DNA Visual en BD` vs `📝 Sin DNA Visual`.

### Corregido — v5.5

- **Encuadre alto (espécimen en tercio superior)**: `MANDATORY_PHOTO_PREFIX` actualizado con instrucción explícita de cámara a nivel del suelo — lente a 5–10 cm del suelo, ligeramente hacia arriba, base del estipe en tercio inferior, copa en tercio central, dosel con bokeh en el tercio superior.
- **Russula virescens renderizada con verrugas/volva (prior Amanita)**: descriptores de píleo reescritos para enfatizar superficie casi lisa con craquelado tipo cerámica (no baches 3D), estipe reescrito con cero indicación de bulbo/volva. `composition_notes` añadida especificando espécimen en suelo limpio sin emerge de huevo.

### Añadido — v5.4 Rediseño generador admin (galería-first)

- **`CatalogImagesModal.jsx`**: extraído de `ImageGenerator.jsx` a su propio archivo (`src/components/admin/`) para que pueda reutilizarse desde `SpeciesAdminModal` sin cargar el bundle completo del generador. Exports: `CatalogImagesModal` (default + named), `photoPosLabel`, `moveItem`.
- **`SpeciesAdminModal.jsx`**: nuevo modal de especie abierto desde la galería admin. Muestra miniaturas de todas las fotos con lightbox navegable (←/→, dots, ESC). Dos acciones: "Reordenar" (abre `CatalogImagesModal` DnD) y "Generar imagen" (navega al generador simplificado vía `?especie=XXX&generar=1`). Fetch del detalle raw al montar para alimentar `CatalogImagesModal`.
- **`AdminGeneratorHub.jsx`**: hub unificado para `/admin/generator`. Modo galería (default): renderiza `AdminGallery` + `SpeciesAdminModal` cuando hay `?especie=`. Modo generador: lazy-load de `ImageGenerator` cuando hay `?especie=XXX&generar=1`. Gestión URL: `replace: true` para modal open/close (no ensucia el historial), push para navegar al generador (back button funciona).

### Cambiado

- **`AdminGallery`**: acepta prop `onOpen` opcional. Cuando se provee (hub mode), lo usa en lugar de `navigate()`. Retrocompatible — sin prop, comportamiento anterior.
- **`ImageGenerator`**: modo gallery-first activado con `?generar=1`. Oculta selector de especie + campo ID, botones "Nuevo" y "Importar CSV", y bloque "Imágenes en catálogo" del sidebar. Muestra título con nombre científico + botón "← Galería" en su lugar. Botón principal renombrado a "Generar imagen". Elimina la definición inline de `CatalogImagesModal` y sus helpers; usa import de `./CatalogImagesModal`.
- **`App.jsx`**: ruta `/admin/generator` apunta a `AdminGeneratorHub` (lazy). Ruta `/admin/gallery` redirige a `/admin/generator` (redirect permanente). Eliminado el lazy de `ImageGenerator` del router raíz — ahora está dentro del hub.

---

## [5.3.1] - 2026-03-22 — Bug fixes: caché fotos, generador admin

### Corregido

- **Fotos desactualizadas en `SpeciesModal` y lightbox**: eliminada la caché TTL de detalle de especie (`_detailRawCache`). Cada apertura del modal hace un fetch fresco al backend (`cache: 'no-store'`), garantizando que los cambios del admin son inmediatamente visibles sin recargar la página.
- **Lista de especies no se actualizaba tras guardar desde admin**: `invalidateSpeciesListCache()` ahora emite un evento `fungus:species-list-invalidated` via `window.dispatchEvent`. `useSpecies` escucha el evento y fuerza un re-fetch del catálogo completo sin necesidad de navegar.
- **`largeUrl` se perdía al guardar con `set-order`**: `buildInitialPhotos` en el generador admin almacenaba las URLs ya procesadas por `resolveUrl()` (con `/` delantero), pero el backend `set-order` las busca en `meta_by_url` tal cual están en DB (sin prefijo). Se eliminó `resolveUrl` de `buildInitialPhotos`; ahora se aplica solo en el `src` de las imágenes renderizadas.
- **`Cache-Control` del backend exponía `/species` con `max-age=3600`**: el middleware ahora devuelve `no-store` para todas las rutas `/species`, permitiendo que el frontend siempre reciba datos frescos.
- **`set-order` del backend solo preservaba `caption`, perdía `largeUrl` y otros metadatos**: el dict `meta_by_url` ahora captura todos los campos excepto `url` — incluido `largeUrl`, `caption`, etc. El reorden por DnD ya no descarta la URL de alta resolución.
- **Fotos duplicadas en galería `SpeciesModal`**: `allPhotos` en `GallerySection` ahora aplica deduplicación por URL (`findIndex`) antes de construir el array final.
- **`Regenerar` generaba imagen con ID incorrecto**: `settings.specimenId` se limpia a `''` tras cada generación. `generateImage()` ahora usa `activeSettings = viewedItem.settings` cuando se llama sin args (Regenerar), evitando que el ID calculado sea siempre `000`.
- **Refinar usaba modelo `gemini-2.0-flash-exp-image-generation` (deprecated)**: actualizado a `gemini-2.0-flash-preview-image-generation`. Fijado `responseModalities: ['IMAGE', 'TEXT']` (mayúsculas, ambas modalidades requeridas por el nuevo contrato de API). Ampliada la detección de modelo no disponible (`400`, `INVALID_ARGUMENT`, `deprecated`, `unavailable`). Cuando el fallback a Imagen 4 text-to-image se activa, se muestra un aviso ámbar visible al usuario en lugar de solo loguear en el panel de estado.

---

## [5.3.0] - 2026-03-22 — Generador: fotos ilimitadas, DnD insertion-style, galería dinámica

### Añadido

- **`POST /api/v1/species/{id}/images/set-order`** (backend): nuevo endpoint admin-only. Acepta `{"photos": ["url1", "url2", ...]}` — lista ordenada de URLs. Escribe `extra_data.photo.url = photos[0]` y `extra_data.photos = [{url, caption}...]`. Soporta fotos ilimitadas (sin límite de 3 slots). Preserva captions existentes por URL. Schema `SetPhotosOrderBody` en `backend/app/schemas/species.py`.
- **Modal unificado `CatalogImagesModal`**: reemplaza `OverwriteSlotPicker` + el modal de guardado antiguo. Props: `newImageDataUrl?`, `newImageMimeType?`. Si se proporciona imagen nueva, aparece prepended en posición 0. Siempre usa `POST /images/set-order`. Un solo flujo para guardar y reorganizar.
- **DnD insertion-style con `framer-motion layout`**: al arrastrar una tarjeta, las demás se deslizan suavemente para hacer hueco en tiempo real (spring animation). Modelo: `visualPhotos = moveItem(photos, dragIdx, hoverIdx)` — framer-motion anima las transiciones de posición con `key` URL estable.
- **Galería dinámica en `SpeciesModal`**: `GallerySection` adapta el layout según el número de fotos — 1 foto (ancho completo 16:9), 2 fotos (50/50), 3 fotos (layout clásico grande + 2 pequeñas), 4 fotos (cuadrícula 2×2), 5+ fotos (cuadrícula 2×2 con `+N` en la última celda, click abre lightbox).

### Corregido

- **DnD fiabilidad**: `_dropFiredRef` hace `handleDrop` idempotente; `onDrop` en tarjeta Y rejilla (belt-and-suspenders); `_hoverIdxRef` evita closure stale en el handler del drop; `_resetDragState()` limpia refs y estado atómicamente.
- **Cache HTTP bypass**: `cache: 'no-store'` en `fetchSpeciesDetail` — el orden de fotos se mantiene correcto tras recargar la página (ya no lo sirve el `Cache-Control: public, max-age=3600` del backend).
- **Gate clave API en producción**: reemplazado botón sin efecto por input `type="password"` con `getApiKey()` helper (fallback env var → input en runtime).

---

## [5.2.0] - 2026-03-22 — Generador: flujo de guardado en catálogo + Gallery → Generador

### Añadido

- **`PATCH /api/v1/species/{id}/images`** (backend): nuevo endpoint admin-only. Acepta `slot` (`main`|`photo1`|`photo2`), `image_base64` y `mime_type`. Almacena la imagen como `data:` URI en `extra_data` JSONB. Usa `flag_modified` para que SQLAlchemy detecte el cambio en JSONB. Requiere `get_admin_user` dependency.
- **`POST /api/v1/species/{id}/images/reorder`** (backend): nuevo endpoint admin-only. Acepta mapping `{main, photo1, photo2}` indicando qué slot actual pasa a cada posición. Reasigna URLs (estáticas o `data:` URI) sin recodificar. Schema `SlotReorderBody` en `backend/app/schemas/species.py`.
- **`SpeciesImageUpdate`** y **`SlotReorderBody`** schemas en `backend/app/schemas/species.py`.
- **Gallery → Generador**: clic en cualquier especie de `AdminGallery` navega a `/admin/generator?especie=<id>` en lugar de abrir el `SpeciesModal`. Nueva tarjeta `GalleryCard` (componente local) con hover overlay "Generar" y dot de comestibilidad.
- **Pre-carga por URL**: `ImageGenerator` lee `?especie=` al montar, rellena los campos ID y Nombre Científico, y obtiene el detalle completo de la especie (con `extra_data.photos`) para mostrar el panel de referencia.
- **Panel de referencia siempre fresco**: el sidebar re-sincroniza `referenceSpecies` desde la API cada vez que cambia `settings.specimenId` (con `AbortController` para cancelar peticiones obsoletas). Al abrir el modal de guardado, siempre se hace un fetch previo al DB para garantizar el estado más reciente.
- **Panel de referencia**: sección en el sidebar del generador que muestra las 3 imágenes actuales del catálogo (principal, foto 1, foto 2) para cualquier especie seleccionada.
- **Botón "Guardar"**: visible siempre que haya imagen generada y `specimenId` relleno — independiente de si la especie viene de `?especie=`.
- **`OverwriteSlotPicker`** (dos pestañas) + modal de gestión de catálogo: pestaña "Nueva imagen" llama a `PATCH /species/{id}/images`; pestaña "Reorganizar" llama a `POST /species/{id}/images/reorder`. Ambas actualizan el panel de referencia sin recargar.
- **Bloqueo de navegación**: `useBlocker` (React Router v6.28) muestra diálogo de confirmación al intentar salir con imagen generada sin guardar. `beforeunload` protege el cierre de pestaña/ventana.

---

## [5.1.0] - 2026-03-21 — Admin: Image Generator + Gallery

### Añadido

**Generador de imágenes (`/admin/generator`)**
- **`ImageGenerator`**: migración completa desde AI Studio a componente Vite/React en `src/components/admin/ImageGenerator.jsx`. Ruta protegida por `AdminGuard` (`role === 'admin'`).
- **Imagen 4** via endpoint `:predict` (`imagen-4.0-generate-001`) para generación. **Gemini 2.5 Flash** para descripción/traducción de texto.
- **Refinador real** (`callGeminiRefine`): edición imagen-a-imagen con `gemini-2.0-flash-exp-image-generation` — envía la imagen actual como `inlineData` + instrucción de texto, obtiene imagen editada. Fallback a Imagen 4 text-to-image si el modelo no está disponible.
- **Dimensiones fijas**: 1376×768 (large) y 688×384 (small), via `processImage` con `targetWidth`/`targetHeight`.
- **Selector de especies desde API**: eliminado array hardcoded `MUSHROOM_SPECIES_DATA` (200 entradas). Reemplazado por `useSpecies()` + `useMemo` con `FOREST_TYPE_LABELS` mapping.

**Navegación admin**
- **`isAdminView`** en `AppContext`: toggle de modo navegación (user ↔ admin) sin recarga.
- **Toggle Público/Admin** en `Profile.jsx` via `Tabs` — visible solo para `role === 'admin'`.
- **Layout split**: `userNavItems` (Dashboard, Zonas, Especies, Micología) vs `adminNavItems` (Generator, Gallery). Perfil siempre visible. Las secciones se alternan, no se suman.
- **Rutas admin** en inglés: `/admin/generator`, `/admin/gallery`. `AdminGuard` en `App.jsx`.
- **`IC.wand`** — nuevo icono SVG de varita mágica en `helpers.jsx`.
- **i18n**: claves `adminGenerator`, `adminGallery`, `modoPublico`, `modoAdmin` en ES/CA/EN.

**Galería admin (`/admin/gallery`)**
- **`AdminGallery`**: nueva página con catálogo de 202 especies desde API.
- **Vista card** (por defecto): usa `SpeciesCard` igual que `/especies`.
- **Vista grid**: cuadrícula 8 columnas con hover overlay (nombre científico + id).
- **Filtros**: búsqueda de texto + selector familia + selector comestibilidad.
- **Connected filter pill**: `ag-search` / `ag-family` / `ag-edib` en `styles.css` — redondeado solo en extremos, plano entre segmentos, gap 4px como `SearchFilterBar`.
- **Responsive**: mobile = título + toggle en misma fila · búsqueda en fila 1 · selectores como pill única en fila 2 (gap-0). Desktop = todo en una fila horizontal.
- **Paginación** con `?pagina=N` sincronizado en URL (PAGE_SIZE = 24).

**Auth UX (post-v5.0)**
- **Campos de perfil en registro**: Nombre, Apellidos y Fecha de nacimiento (opcional) en `AuthModal` y backend (`RegisterRequest`, migración 007).
- **`PATCH /me/profile`**: endpoint para editar nombre, apellidos y fecha de nacimiento. Email inmutable.
- **`DELETE /me/account`**: eliminación permanente con CASCADE.
- **`EditProfileModal`**: pre-rellena datos, muestra ✓ Cambios guardados, cierra automáticamente.
- **Perfil UX**: saludo `Hola, {nombre}`, iniciales en avatar, deep links "Ver todas →" a zonas/favoritos.
- **Cookie notice** en `AuthModal` al pie del formulario.
- **`IC.pencil`** — icono de lápiz en `helpers.jsx`.
- **URL sync completo** en `Zones.jsx` y `Species.jsx` — todos los filtros en URL.
- **Hero de `SpeciesModal` abre lightbox** al clicar.
- **i18n**: claves `hola`, `nombre`, `apellidos`, `fechaNacimiento`, `editarPerfil`, `cambioGuardado`, `guardar`, `eliminarCuenta`, `confirmarEliminar`, `cookieInfo`, `sinZonasSeguidas`, `sinEspeciesFavoritas`, `mas` en ES/CA/EN.

### Corregido
- **`setRecentBatchIds([])`** — llamadas sin argumento causaban `TypeError` al acceder a `.includes()` sobre `undefined`.
- **`SameSite=None`** en cookie de refresh para producción (Vercel → Render cross-site).
- **CORS**: `PATCH` añadido a `allow_methods` — `PATCH /me/profile` bloqueado por preflight.
- **`translateApiError`**: mapea `'Failed to fetch'` / `'Load failed'` (Safari) / `'NetworkError'` (Firefox) a `errRed`.
- **ruff UP045**: `Optional[X]` → `X | None` en `me.py` y `schemas/auth.py`.
- `stopPropagation` en botón de favorito del hero de `SpeciesModal`.
- **Hover-lift en cards de especies** — `anim-up` dividido en dos keyframes.

---

## [5.0.0] - 2026-03-16 — Auth JWT + user accounts + favoritos en BD

### Añadido
- **Backend Auth**: endpoints `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`. JWT clásico: access token (1h) + refresh token (30d, httpOnly cookie). `secure=settings.is_production` para compatibilidad local/producción.
- **Tabla `users`**: email, password_hash (bcrypt), `plan` (`"free"`|`"premium"`), `plan_expires_at`, `created_at`. Campo `plan` preparado para monetización futura.
- **Tablas `user_followed_zones` y `user_fav_species`**: FK a `users`, `zones` y `species` con CASCADE. Migración 006.
- **Endpoints `/me`**: `GET/POST/DELETE /me/followed-zones` y `GET/POST/DELETE /me/fav-species`. Idempotentes (POST no falla si ya existe).
- **`authService.js`**: token de acceso en memoria JS (XSS-safe), todas las llamadas auth/me/favoritos, migración de localStorage a API al hacer login.
- **`AuthModal`**: tabs login/registro con underline activo, imagotipo centrado, colores MODAL.overlay+MODAL.bg consistentes con el resto de modales, close button absolute.
- **`AppContext`**: estado auth (`user`, `authLoading`, `authModal`), `login`/`register`/`logout`, restauración silenciosa de sesión en mount, auth gate en `toggleFollow`/`toggleFavorite`.
- **`Profile`**: 3 estados — cargando / unauthenticated CTA / perfil completo con badge de plan, stats y logout.
- **i18n**: claves de auth para ES/CA/EN (`iniciarSesion`, `registrarse`, `cerrarSesion`, `contrasena`, `minPass`, `authHintLogin`, `authHintRegister`, `authCta`).

### Corregido
- `pydantic[email]` añadido a deps — `EmailStr` requería `email-validator` no incluido.
- `passlib` sustituido por `bcrypt` directo — incompatibilidad con `bcrypt>=4.x` causaba 500 silencioso en `hash_password`.
- Timeout de 30s en engine de migraciones alembic para evitar cuelgue de startup si Supabase tarda en responder.
- Logging explícito en lifespan para que errores de migración aparezcan en Render logs.

---

## [4.7.1] - 2026-03-16 — i18n editorial completo (artículos + morfología + UI)

### Añadido
- i18n página Micología completa: metadata de los 5 artículos (`title_ca/en`, `subtitle_ca/en`, `summary_ca/en`, `tags_ca/en`) añadido a `articles.js`. Helper `getLocalizedArticle(article, lang)` exportado. 5 claves de UI (`micologiaDesc`, `masArticulos`, `articulosCadaMes`, `minLectura`, `contenidoNoDisp`) añadidas a los 3 bloques de `i18n.js`. `Micologia.jsx` renombrado a `Articles.jsx` y refactorizado para usar `t` y artículos localizados; routing basado en `article.slug` estático (independiente de idioma). `ArticleModal.jsx` usa `getLocalizedArticle` para localizar título/subtítulo/tags del header; locale de fecha dinámica (`es-ES`/`ca-ES`/`en-GB`); `t.minLectura` y `t.contenidoNoDisp`.
- i18n artículos: `Micorrizas.jsx`, `Esporas.jsx` y `Venenos.jsx` refactorizados como plantillas estructurales. Todos los textos visibles (títulos de sección, párrafos, callouts, listas, labels SVG, captions de figuras) extraídos a ~180 claves `art_*` en `i18n.js` con valores ES, CA y EN completos. `ArticleP` y `ArticleCallout` admiten nueva prop `html` para rich text con `dangerouslySetInnerHTML`. `ArticleInfographic` acepta `infografiaLabel` para traducción del label. Etiquetas SVG en Micorrizas traducidas via prop `t`. Arrays `FOTOS` movidos dentro del componente y computados desde `t` en Esporas y Venenos.
- Morfología trilingüe (`cap_ca/en`, `stem_ca/en`, `flesh_ca/en`, `sporePrint_ca/en`) para 202 especies. Migración `038_morphology_i18n.sql` generada (153 KB, ~1.250 valores traducidos a CA+EN). Fix en `apiService.js`: campos `cap`/`stem`/`flesh`/`sporePrint` pasan por el helper `i18n()` en `normalizeSpeciesDetail`.
- Header scroll de dos fases en `Layout.jsx`: Fase 1 (scroll ≤ headerH) — sube con el contenido de forma natural (`translateY(-scrollY)`, sin transición); Fase 2 — smart sticky: se pega al hacer scroll-up (snap animado), se oculta al bajar. Al volver a Fase 1 no hay salto brusco (`Math.max` evita el jump). Publica `--header-h` como CSS variable.
- Sticky search+filter bar en `/especies` y `/zonas` (solo vista listado): aparece a `top:24px` cuando el inline bar sale del viewport; desaparece cuando el inline bar vuelve a la vista o cuando el header aparece. En desktop el botón Filtrar despliega un dropdown también sticky; en mobile usa el bottom-sheet portal existente de `FilterPanel`. Sombra `drop-shadow` solo en variante sticky.
- Prop `hideDesktop` en `FilterPanel`: suprime el panel inline desktop cuando la sticky bar gestiona los filtros (evita doble apertura).
- Migraciones `019`–`029`: `description_ca/en` para las 181 especies restantes (todas las familias excepto Boletaceae, ya completada en `014`). Cierra la cobertura completa de 202/202 especies con descripción trilingüe ES/CA/EN.
- Migraciones `030`–`037`: `diff_ca/diff_en` para todas las entradas de confusiones en BD. Cobertura completa de 8 bloques taxonómicos: Morchellaceae+Boletaceae, Amanitaceae, Cantharellaceae, Russulaceae, Cortinariaceae, Agaricus, Neoboletus y Amanita gemmata.

### Cambiado
- Zonas: tab por defecto cambiado a `listado` (antes `mapa`).

### Corregido
- Sticky bar persistía cuando los resultados del filtro eran 0 o pocos y no había scroll en el body. Causa: el scroll listener no se dispara tras un scroll programático que termina sin evento adicional. Fix: `stickyUpdateRef` + `useEffect([filteredX.length])` re-evalúa la posición tras cada cambio de resultados.
- Sticky bar persistía cuando el usuario tenía el input con foco (`stickyFocused` sobreponía `searchBarInView`). Fix: `searchBarInView` es ahora la única autoridad — si el inline bar está a la vista, el sticky se oculta siempre, sin excepciones.
- Botón borrar (×) del input de búsqueda con `theme="light"` usaba un color distinto al del resto de iconos. Alineado a `search-light-text` con `opacity-60`.
- Eliminado hook `useScrollDir.js` huérfano (nunca llegó a usarse en la implementación final).

---

## [4.7.1-cond-fruct] - 2026-03-14 — Condiciones de fructificación trilingüe (202 especies)

### Añadido
- `cond_temp`, `cond_precip`, `cond_suelo`, `cond_req` como campos propios en `SpeciesDetail` schema — resueltos por idioma vía `_extra_str`
- `_to_detail()` en `routers/species.py` expone los 4 campos `cond_*` al frontend
- `_extra_str`/`_extra_list` buscan `{key}_es` antes del fallback unsuffixed, soportando claves con sufijo Gemini (`cond_temp_es`, etc.)
- Migraciones `cond_fruct` para las 202 especies del catálogo en ES/CA/EN (`004`–`018`): Boletaceae, Amanitaceae, Russulaceae, Cantharellaceae, Morchellaceae, Pleurotaceae, sesiones A–D + manual esp-086/esp-188
- `normalizeSpeciesDetail` en `apiService.js` mapea los 4 campos `cond_*` con helper `i18n()` para resolución CA/EN client-side desde `extra_data`
- `018_cond_fruct_sesion_d.sql` — corrección `cond_req` ecológico para 28 especies con contenido morfológico previo (Strophariaceae×9, Polyporaceae×9, Tricholomataceae×6, Agaricaceae×3, Pleurotaceae×1)

### Cambiado
- `SpeciesModal.jsx` — bloque condiciones fructificación reemplaza los `if/else` hardcodeados por familia con `detail.cond_*` desde API; sin datos hardcoded

---

## [4.7.0] - 2026-03-13 — i18n completo (UI + DB)

### Añadido
- i18n v4.7: expansión de `src/data/i18n.js` de ~25 a ~110 claves por idioma (ES/CA/EN), cubriendo todos los componentes del frontend
- i18n v4.7: `helpers.jsx` — `getEdibilityColor` y `getScoreColor` pasan a usar `tKey` en lugar de `label` hardcoded; `EdibilityTag`, `TaxonomyBlock`, `ConfusionesBlock` y `SpeciesImg` traducidos con `useApp()`
- i18n v4.7: `Dashboard.jsx` — todos los strings hardcoded reemplazados; fechas con locale dinámico (`es-ES` / `ca-ES` / `en-GB`)
- i18n v4.7: `Zones.jsx` — filtros comarca/CCAA/bosque, tabs, estados vacíos y chips de filtro traducidos
- i18n v4.7: `Species.jsx` — filtros de comestibilidad, familia, ordenación y chips de filtro activo traducidos; patrón `tKey` en `SHOW_FILTERS`
- i18n v4.7: `ZoneModal.jsx` — filtros de comestibilidad, métricas meteorológicas, OI description y estados vacíos traducidos; patrón `tKey` en `EDIBILITY_FILTERS`
- i18n v4.7: `SpeciesModal.jsx` — galería, aviso mortal, condiciones fructificación, barras de progreso, morfología completa (sombrero/pie/carne/esporada), confusiones, zonas compatibles y altitud traducidos
- i18n v4.7: `FamilyModal.jsx` — cabecera "Familia micológica", "Características" y estado vacío traducidos
- i18n v4.7: `ZoneCard.jsx` — "Cond. de recolección" y etiqueta de score traducidos; `useApp()` añadido
- i18n v4.7: `Profile.jsx` — "✓ Guardado" traducido
- i18n v4.7 DB: backend `/species` acepta `?lang=es|ca|en` — helpers `_extra_str`/`_extra_list` con fallback automático a ES
- i18n v4.7 DB: `fetchAllSpecies(lang)` y `fetchSpeciesDetail(id, lang)` pasan el idioma a la API; raw cache lang-independiente en detail
- i18n v4.7 DB: `useSpecies` con cache por idioma — reactivo al cambio de lang sin re-fetch innecesario
- i18n v4.7 DB: migración `013_common_names_i18n.sql` — `commonNames_ca` y `commonNames_en` para las 202 especies del catálogo

---

## [4.6.4] - 2026-03-08 — Confusiones familias restantes

### Añadido
- Migrations: `006_confusions_amanitaceae.sql` — 13 especies Amanitaceae + cross-familia (caesarea, muscaria, phalloides, verna, virosa, pantherina, rubescens, ovoidea, spissa, citrina, excelsa, Agaricus silvicola, Leucoagaricus leucothites); amatoxinas y retraso de síntomas en diffs
- Migrations: `007_confusions_cantharellaceae.sql` — Cantharellus cibarius/pallens/aurora, Craterellus tubaeformis/cornucopioides + cross: Omphalotus olearius (confusión más frecuente del rebozuelo)
- Migrations: `008_confusions_russulaceae.sql` — 14 especies Russula/Lactarius/Lactifluus: emetica vs comestibles, deliciosus vs torminosus/deterrimus/sanguifluus, vellereus vs piperatus; regla del sabor acre en diffs
- Migrations: `009_confusions_cortinariaceae.sql` — 9 Cortinarius (orellanus/rubellus/splendens mortales vs caperatus/praestans/violaceus) + cross: Inocybe erubescens; orellanina y retraso 2–3 semanas en todos los diffs
- Frontend: filtro de comarca en página Zonas — `<select>` contextual (se filtra por CCAA seleccionada), chip activo eliminable, reset automático al cambiar CCAA
- Frontend: `comunidadAutonoma` añadido a todas las zonas del mock (`src/data/zones.js`, 200 zonas) — desbloquea el filtro de CCAA que ya existía en código
- Frontend: filtro de comestibilidad (`availFilter`/`calFilter`) en secciones "Disponibles ahora" y "Calendario de fructificación" del ZoneModal; smart default excelente → comestible → todas
- Frontend: opción `no_comestible` añadida a todos los selectores de comestibilidad (ZoneModal y catálogo de especies)
- Frontend: `ConfusionesBlock` restyling — foto + nombre + `EdibilityTag` al estilo de items de familia; descripción full-width en columna derecha
- Frontend: padding mobile reducido en ZoneModal y SpeciesModal (`px-4 py-6 sm:px-6`)
- Migrations: `003_edibility_no_comestible_round2.sql` — correcciones de comestibilidad para *Pycnoporus cinnabarinus*, *Phlebia radiata*, *Hygrophorus pustulatus* (comestible → no_comestible) y *Lepista personata* (bueno → comestible); aplicar en Supabase
- Frontend: mock `species.js` actualizado con las mismas 4 correcciones de comestibilidad

---

## [4.6.2] - 2026-03-07 — Confusiones en BD

### Añadido
- Backend: schema `SpeciesConfusion` (`with_species_id: str`, `diff: str`) en `schemas/species.py`
- Backend: campo `confusions: list[SpeciesConfusion] | None` en `SpeciesDetail` (no en `SpeciesListItem`), leído de `extra_data.confusions` (JSONB)
- Backend: `_confusions(species)` helper en `routers/species.py` para extraer el campo del JSONB
- Backend: migración Alembic `005_confusions.py` (data-only, sin cambio de schema)
- Backend: `005_confusions_data.sql` — datos iniciales para Morchellaceae (*Morchella esculenta*, *M. importuna*, *M. elata*, *M. semilibera*, *Gyromitra esculenta*, *Helvella lacunosa*), *Boletus edulis* y boletos tóxicos (*Suillellus luridus*, *Neoboletus erythropus*, *Rubroboletus satanas*) con relaciones bidireccionales. Migración ejecutada en Supabase.
- Frontend: `edibilityStyle(edibility)` helper en `helpers.jsx` — deriva `icon`, `borderColor`, `nameColor` del valor de comestibilidad (sin almacenar presentación en BD)
- Frontend: `ConfusionesBlock` reescrito para leer `detail.confusions` de la API (eliminado `CONFUSIONES_POR_FAMILIA` y `CONFUSION_GENERICA`)
- Frontend: guard en `SpeciesModal` — sección "Posibles confusiones" (título incluido) solo se renderiza si `detail.confusions?.length > 0`

### Cambiado
- `description`, `synonyms` y `confusions` movidos de `SpeciesListItem` a `SpeciesDetail` — el endpoint de listado no los incluye; solo se cargan al abrir el modal

### Documentado
- `docs/deploy.md`: nota sobre trigger manual de deploy en Render free tier cuando el auto-deploy falla

### Cambiado
- **Auditoría de comestibilidad** — 16 especies pasan de `comestible` a `no_comestible`: Ganoderma lucidum, G. applanatum, Fomes fomentarius, Trametes versicolor, T. gibbosa, T. hirsuta, Daedalea quercina, Clathrus ruber, C. archeri, Mycena galericulata, M. haematopus, M. chlorophos, Xylaria hypoxylon, Hohenbuehelia petaloides, Rhodotus palmatus, Scleroderma citrinum (era `toxico`)
- **Nombres comunes catalanes corregidos** (eran catalanizaciones del castellano, no nombres populares reales):
  - *Lycoperdon perlatum*: "Bejí comú" → **"Pet de llop"**; añadido "Cuesco de lobo" (nombre ES correcto)
  - *Lycoperdon pyriforme*: "Bejí dels troncs" → **"Pet de llop piriforme"**
  - *Scleroderma citrinum*: "Cuesco de llop" → **"Pota de cavall"**; nombre ES: **"Escleroderma amarillo"** (no "Cuesco de lobo", que pertenece a L. perlatum)
  - *Laetiporus sulphureus*: "Bolet de mel" → **"Pollastre del bosc"**
  - *Trametes versicolor*: "Cua de faisan" → **"Cua de gall dindi"**
- URL Wikipedia rota en descripción de *Scleroderma citrinum* (es.wikipedia → en.wikipedia)

### Estructura
- Directorio `migrations/` creado para migraciones de datos SQL (INSERT/UPDATE/DELETE en Supabase), distinto de `backend/migrations/` (Alembic, schema)
- `migrations/001_esp202_chroogomphus_rutilus.sql` — seed *Chroogomphus rutilus*
- `migrations/002_edibility_audit_and_commonnames.sql` — auditoría comestibilidad + nombres comunes
- `docs/IMPLEMENTACION-COMPLETA.md`, `docs/MEJORAS-CHANGELOG.md`, `docs/README-MOCK-DATA.md` eliminados (documentos de planificación de la época v2.0, completamente obsoletos)

---

## [4.5.0] - 2026-03-07 — Auditoría mock → API

### Cambiado
- `useWeatherConditions.js`: eliminado import directo de `mockSpecies`. Ahora usa `useSpecies()` en `useZoneConditions` y `useAllZoneConditions`, obteniendo species data desde el hook con fallback automático a mockSpecies. Cierra el último import residual de datos de catálogo en hooks de lógica.
- `useAllZoneConditions`: marcada como `@deprecated` en JSDoc. Dashboard y Zones usan `useZones()` (backend) desde v4.3; esta función se mantiene como fallback si se necesita reactivar Open-Meteo directo.

### Documentado
- Imports de `mockArticles` (Dashboard, Micologia, ArticleModal) marcados como `// MOCK PERMANENTE` — artículos son contenido JSX estático sin endpoint de backend planificado.
- Imports de `mockFamilies` (SpeciesModal, Family.jsx) marcados como `// MOCK PERMANENTE` — catálogo de 8 familias estable, sin endpoint planificado.
- Resumen de auditoría: único import residual era `mockSpecies` en `useWeatherConditions.js`. Todos los demás mocks son fallbacks explícitos (useZones, useSpecies) o datos permanentemente estáticos (artículos, familias).

### Mejorado
- `fetchSpeciesDetail` en `apiService.js`: caché en memoria por ID (`_detailCache` Map + `_detailPromises` para promesas en vuelo). Segunda apertura del mismo SpeciesModal es instantánea sin request adicional al backend. Sin dependencias nuevas.

---

## [4.4.0] - 2026-03-06 — Weather cache BD server-side · **desplegado en producción**

### Añadido
- `WeatherCache` model + migración 003: tabla `weather_cache` (zone_id+provider_id PK, temp_min/max, humidity, rainfall14d, wind, TTL)
- `fetch_weather_for_zone()` — fetch Open-Meteo server-side con rango diario temp (min/max)
- `store_weather_cache()` + `get_latest_weather()` — caché BD con TTL 3h y validación de expiración
- `GET /api/v1/weather/zones/{id}` + `GET /api/v1/weather/zones` — endpoints weather con cache-first
- `GET /api/v1/zones` ahora incluye `weather: ZoneWeather` embebido en cada zona
- Warmup de weather_cache al arrancar (background task, batches de 10)
- Auto-migrate al arrancar: `await asyncio.to_thread(_run_db_migrations)` — no requiere shell
- `GET /api/v1/admin/trigger-backfill?days=N` — backfill sin acceso a shell (Render free tier)
- `VITE_API_BASE` configurable via env var en frontend (fallback a URL de producción)
- Artículo "Los recicladores del bosque" — nuevo contenido micológico (Recicladores.jsx)

### Cambiado
- `ZoneListItem` schema incluye campo `weather: ZoneWeather | None`
- `useApiZoneConditions`: `dryDays` ahora lee `score_detail.days_since_rain` (antes null)
- `ZoneCard` y `ZoneModal` muestran rango `tempMin–tempMax°C` desde weather_cache

### Corregido
- `asyncio.run()` en lifespan causaba `RuntimeError` → 500 + CORS error silencioso al arrancar
- CORS bloqueaba preview URLs de Vercel — resuelto con `allow_origin_regex`
- Float precision en `pa21_mm` y similares (`1.7999...` → `r1`/`r0` helpers)
- Doble fetch en React StrictMode — caché de promesas en vuelo `_apiZonePromises`

---

## [4.2.0] - 2026-03-02 — Catálogo en BD + endpoints de especies

### Añadido
- `GET /api/v1/species` — listado paginado con filtros por familia, edibilidad, tipo de bosque y mes de fructificación. Cursor-based pagination.
- `GET /api/v1/species/{id}` — detalle completo: params OI, morfología, fotos, confusiones (extra_data)
- `backend/app/schemas/species.py` — schemas Pydantic: `SpeciesListItem`, `SpeciesDetail`, `SpeciesOIParams`
- `backend/migrations/versions/002_zone_description.py` — columna `description TEXT` en tabla `zones`
- `HEAD /api/v1/health` — probe ligero para UptimeRobot sin query a BD (evita falsos incidentes)

### Cambiado
- `GET /api/v1/zones` y `GET /api/v1/zones/{id}` — ahora incluyen campo `description`
- `seed_catalog.py` — reescrito: mapping correcto de campos planos del mock (`temp_optima_min/max`, `precip_14dias_*`, `altitud_min/max`, `dias_hasta_fructificacion`); importaciones Node con `file://` absolutos; flag `--dry-run`

### Deploy
- Migración `002` ejecutada en Supabase (`alembic upgrade head`)
- Seed ejecutado con `python -m scripts.seed_catalog --mock-dir ../src/data` (200 zonas, 201 especies)

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

## [3.0.0] - 2026-02-26 — Migración completa a Vite + React Router

### Fase 5: Mapa Leaflet + Micología

#### Contexto
Quinta fase: la migración a Vite está completa. Mapa Leaflet interactivo en todos los puntos de la app, página Micología funcional con ArticleModal y sistema de artículos, y code splitting que reduce el bundle principal de 617KB a 133KB.

#### Añadido
- `src/components/map/LeafletMap.jsx` — mapa Leaflet vanilla con modo markers (marcadores 🍄 por forestType) y modo heatmap meteórico sintético (grid de España con `leaflet.heat`), botón pantalla completa con portal, zoom control, popups dark
- `src/components/modals/ArticleModal.jsx` — modal de artículos con hero foto, mini-barra sticky, ARTICLE_REGISTRY pattern; exporta helpers `ArticleSection`, `ArticleP`, `ArticleCallout`, `ArticleInfographic`
- `src/articles/Micorrizas.jsx` — artículo completo con 3 infografías SVG (intercambio de nutrientes, Ecto vs Endo, tabla especie-árbol), 5 secciones y fuentes bibliográficas
- `src/pages/Micologia.jsx` — página real con artículo destacado (hero imagen + texto) y grid de cards (publicados/próximamente)

#### Modificado
- `src/pages/Zones.jsx` — tab Mapa ahora usa `<LeafletMap>` real (antes placeholder)
- `src/components/modals/ZoneModal.jsx` — sección Ubicación usa `<LeafletMap singleZone>` (antes placeholder)
- `src/components/modals/SpeciesModal.jsx` — sección Dónde encontrarla usa `<LeafletMap zonas>` (antes placeholder)
- `src/components/Layout.jsx` — navegación mobile cambiada de bottom tab bar a hamburguesa ☰ desplegable (alineado con standalone)
- `vite.config.js` — `manualChunks` para code splitting: bundle principal 617KB → 133KB; chunks separados para react-vendor, leaflet-vendor, data-species, data-zones

#### Instalado
- `leaflet.heat` — plugin de mapa de calor para Leaflet

---

### Fase 4: Modales

#### Contexto
Cuarta fase: todos los modales (ZoneModal, SpeciesModal, FamilyModal, Lightbox) están portados a componentes React con imports ES module. El stack modal completo funciona desde AppContext sin props drilling.

#### Añadido
- `src/components/modals/Lightbox.jsx` — visor de fotos full-screen con nav por teclado (← → Esc), swipe táctil, thumbnails en desktop, dots en mobile, portal a `document.body`
- `src/components/modals/FamilyModal.jsx` — ficha de familia con descripción, características y listado de especies de la familia
- `src/components/modals/ZoneModal.jsx` — ficha de zona: hero foto, mini-barra sticky al scroll, termómetro con 6 métricas, especies disponibles ahora, calendario de fructificación con filtros, placeholder mapa (Fase 5)
- `src/components/modals/SpeciesModal.jsx` — ficha de especie: hero foto, comestibilidad + enlace familia, aviso mortal, nombres comunes, TaxonomyBlock, descripción, hábitat, calendario 12 meses, galería con lightbox, condiciones de fructificación, morfología (cap/stem/flesh), ConfusionesBlock, placeholder mapa distribución (Fase 5)
- `src/components/modals/ModalRenderer.jsx` — renderiza el modal activo leyendo el estado de AppContext; montado en `App.jsx` fuera del árbol de rutas
- `src/lib/helpers.jsx` — añadidos `TaxonomyBlock`, `ConfusionesBlock`, `CONFUSIONES_POR_FAMILIA`, `CONFUSION_GENERICA`

#### Modificado
- `src/App.jsx` — añadido `<ModalRenderer />` justo después de `<ScrollToTop />`

---

### Fase 3: Páginas y Estado Global

#### Contexto
Tercera fase: las cuatro páginas principales tienen contenido real y el estado global está centralizado en React Context. La app Vite ya es navegable con datos reales.

#### Añadido
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

---

### Fase 2: Datos y Helpers

#### Contexto
Segunda fase de la migración: los datos y las utilidades compartidas ya son módulos ES importables, desacoplados del scope global del standalone.

#### Añadido
- `src/lib/constants.js` — fuente única de verdad para design tokens: `COLORS`, `MODAL`, `FOREST_COLORS`, `MONTHS`
- `src/lib/helpers.jsx` — helpers portados del standalone como named exports: `IC` (iconos SVG), `getEdibilityColor`, `EdibilityTag`, `SpeciesImg` (con fallback Wikipedia), `SpeciesCard`, `getScoreColor`, `fakeConditions`
- `src/data/zones.js` — 28 zonas como `export const mockZones`
- `src/data/species.js` — 27 especies (5218 líneas) como `export const mockSpecies`
- `src/data/families.js` — 8 familias como `export const mockFamilies`
- `src/data/i18n.js` — traducciones es/ca/en como `export const i18n`
- `src/data/articles.js` — artículos de micología como `export const mockArticles`
- `src/data/opportunities.js` — oportunidades mock como `export const mockOpportunities`

---

### Fase 1: Fundación

#### Contexto
Inicio de la migración de la arquitectura standalone (Babel en browser) a una app React moderna con bundler y routing real. El standalone permanece en `standalone/` como archivo funcional.

#### Añadido
- **Vite 6** como bundler — reemplaza el CRA de `frontend/` (eliminado) y el transpilado Babel en browser
- **React Router v6** — routing basado en URL, reemplaza el `view` state manual
- **Tailwind CSS 3** instalado vía npm (postcss) — reemplaza el CDN
- **React Leaflet 4** instalado vía npm — reemplaza el CDN de Leaflet
- Estructura de directorios `src/` (pages/, components/, lib/, data/, articles/)
- Shell de rutas con 5 páginas placeholder: `/`, `/zonas`, `/especies`, `/micologia`, `/perfil`
- Rutas anidadas para deep linking: `/zonas/:id`, `/especies/:id`, `/micologia/:slug`
- `ScrollToTop` automático en cada cambio de ruta
- `vercel.json` con rewrites SPA para que React Router funcione en producción
- `public/assets/` con todos los recursos de imágenes (2.200+ ficheos)
- Design system en `tailwind.config.js` (colores, tipografías)
- `styles.css` con clases `.glass`, `.hover-lift`, `.anim-*`, `.modal-*` portadas del standalone

#### Eliminado
- `frontend/` (CRA experimental, nunca en producción)

---

## [2.8.0] - 2026-02-18 — Expansión masiva de datos

### Añadido
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

## [2.3.0] - 2026-02-17 — Rediseño completo UX

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

## [2.2.0] - 2026-02-17 — Modal pantalla completa y galería

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

## [2.0.0] - 2026-02-17 — Sistema de seguimiento

### Añadido
- Sección Seguimiento con zonas favoritas y localStorage
- Modal de Zona con 3 pestañas (Tiempo Real, Calendario, Disponibles)
- Termómetro de Recolección visual
- Botón Seguir Zonas con contador en header
- Fichas de Especies mejoradas con sinónimos regionales

---

## [1.0.0] - 2026-02-16 — Lanzamiento inicial

### Añadido
- Dashboard con StatCards y grid de oportunidades
- Vista de Zonas con modal de calendario
- Vista de Especies con badges de comestibilidad
- Sistema de Datos Mock: zonas, especies, oportunidades
- Diseño glass morphism, tema oscuro, responsive
- Versión Standalone HTML único sin dependencias
