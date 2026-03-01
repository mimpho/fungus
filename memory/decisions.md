# Decisiones de Diseño y Arquitectura

Decisiones tomadas durante el desarrollo activo, con su razonamiento. Complementa CLAUDE.md.

---

## Sistema de Colores (migración v3.1)

**Decisión:** CSS custom properties en `:root` como fuente de verdad + tokens Tailwind en `tailwind.config.js`.

**Tokens actuales** (`styles.css` → `tailwind.config.js`):
| Token Tailwind | CSS var | Hex |
|---|---|---|
| `cream` | `--color-cream` | `#f4ebe1` |
| `muted` | `--color-muted` | `#d9cda1` |
| `coffee` | `--color-coffee` | `#8b6f47` |
| `coffee-light` | `--color-coffee-light` | `#a88b63` |
| `green-f` | `--color-green-f` | `#4a7c59` |
| `bar` | `--color-bar` | `#887b4b` |
| `bg-deep` | `--color-bg-deep` | `#30372a` |
| `modal` | `--color-modal` | `#1e2419` |

**Excepciones que NO usan CSS vars (siempre hex):**
- `FOREST_COLORS` en `constants.js` → Leaflet necesita hex para SVG fill/stroke
- `ArticleCallout` prop `color` → se usa como `color + '18'` (concatenación de opacidad hex), CSS var no funciona aquí
- Leaflet popup HTML template → mismo motivo que FOREST_COLORS

**Regla:** Usar `text-coffee`, `bg-modal`, etc. en JSX. Solo hex directo en las excepciones documentadas arriba.

---

## Sistema de Artículos

**Decisión:** Cada artículo es un componente JSX registrado en `ARTICLE_REGISTRY` (objeto en `ArticleModal.jsx`).

**Artículos publicados:**
| Slug | Componente | Estado |
|---|---|---|
| `micorrizas` | `Micorrizas.jsx` | published |
| `esporas` | `Esporas.jsx` | published |
| `toxinas` | `Venenos.jsx` | published |

**Componentes disponibles dentro de artículos:**
- `ArticleSection` — sección con título h2/h3, línea lateral coffee
- `ArticleCallout` — bloque destacado (color prop en hex, ver excepción arriba)
- `ArticleFigure` / `Fig` — figura con imagen y figcaption (overlay o debajo)
- `Lightbox` — galería modal, se activa via `setLightbox([{url,caption}])` desde AppContext

**Patrón de imágenes en artículos:**
- Fig única → ancho completo, height 220-260px, overlay caption
- Figs en pareja → grid 2 cols, height 260px, overlay caption (mismo estilo que fig única)
- Fig ilustrativa amplia → puede ir a ancho completo sin overlay

---

## ZoneModal — Timestamp de actualización

**Decisión:** Mostrar fecha/hora real de la caché de meteo en lugar de "Open-Meteo · actualizado ahora".

**Flujo:**
1. `getCacheTimestamp()` exportado desde `weatherService.js` — lee `ts` del localStorage sin revalidar TTL
2. `useZoneConditions` devuelve `updatedAt` (timestamp ms) tras resolver el fetch
3. `ZoneModal` formatea: `Actualizado el DD MMM a las HH:MM`
4. Timestamp aparece al final del bloque de condiciones (debajo de las cards de iconos), alineado a la derecha, `text-[11px] text-cream/25`

**Posición final del timestamp:** después del grid de 6 cards de parámetros climatológicos, DENTRO de `<section>` del termómetro.

---

## ZoneModal — Texto descriptivo del score

**Decisión:** Reemplazar el subtítulo técnico "Temperatura · Precipitación 14 días · Humedad del suelo" por una línea explicativa sin porcentajes.

**Texto actual:**
> "El índice pondera datos meteorológicos en tiempo real junto al factor estacional del mes actual para calcular las condiciones de recolección."

Posición: entre el título `{t.termometro}` y la barra de score. Clase: `text-cream/40 text-xs mb-3 leading-relaxed`.

---

## Dashboard — ArticleCard

**Decisión:** Replicar el estilo de cards de artículos de la página Micología (no-featured) en el Dashboard.

- Las cards NO-featured en Micología tienen: imagen hero, badge de familia, tags, tiempo de lectura
- En Dashboard se usa el mismo componente `ArticleCard` local con apertura de `ArticleModal` directa
- Sección "Especies" renombrada a "Catálogo" en Dashboard

---

## SpeciesModal vs ZoneModal — Hero gradient

**Decisión:** Reducir el gradiente del hero de ZoneModal para que sea consistente con SpeciesModal.

- Antes: `from-modal via-modal/40 to-transparent`
- Después: `from-modal via-modal/0 to-transparent` (igual que SpeciesModal)

---

## Sistema de Navegación de Modales (URL-driven, v3.1)

**Decisión:** Los modales están ligados a la URL. Abrir un modal = navegar a su slug. Cerrar = `navigate(-1)`.

### ModalRenderer como única autoridad de navegación

`ModalRenderer.jsx` es el único componente que llama a `navigate()` para modales. Los demás componentes solo llaman a `setSelected*(item)` y el `useEffect` de ModalRenderer reacciona navegando.

```
// ✅ Patrón correcto — desde cualquier componente/modal:
setSelectedSpecies(species)        // ModalRenderer navega a /especies/:slug

// ❌ Incorrecto — llamar navigate() directamente desde dentro de un modal:
navigate('/especies/boletus-edulis')
```

Mapeo de estados → rutas en ModalRenderer:
- `selectedZone` → `/zonas/{slugify(zone.name)}`
- `selectedSpecies` → `/especies/{slugify(species.scientificName)}`
- `selectedFamily` → `/familia/{slugify(family.nombre || family.name)}`
- Artículos → navegados directamente desde Micologia.jsx y Dashboard.jsx

### Patrón modal-from-modal

Cuando se abre un modal B desde dentro del modal A (ej: familia desde ficha de seta):

```js
// En SpeciesModal, botón "Ver familia":
setSelectedSpecies(null)   // cierra el modal A del estado
setSelectedFamily(family)  // abre el modal B
// ModalRenderer detecta selectedFamily y navega a /familia/:slug
// El historial queda: [..., /especies/boletus-edulis, /familia/amanitaceae]
// ESC/Back desde /familia/amanitaceae → vuelve a /especies/boletus-edulis ✓
```

**Anti-patrón:** hacer `navigate('/especies', { replace: true })` antes de abrir el modal B rompe el historial: ESC va al listado en vez de al modal anterior.

### Guard anti-bucle en ModalRenderer

Antes de navegar, siempre comprobar si ya estamos en la URL destino:

```js
const target = `/especies/${slugify(selectedSpecies.scientificName)}`
if (location.pathname === target) return   // evita bucle infinito
navigate(target)
```

### Sincronización URL → estado (páginas con useParams)

Las páginas leen `useParams` para sincronizar el modal al cargar la URL directamente (deep link / refresh):

```js
// En Species.jsx:
const { id: speciesSlug } = useParams()
useEffect(() => {
  if (speciesSlug) {
    const sp = mockSpecies.find(s => slugify(s.scientificName) === speciesSlug)
    setSelectedSpecies(sp || null)
  } else {
    setSelectedSpecies(null)
  }
  return () => setSelectedSpecies(null)
}, [speciesSlug])
```

---

## Patrón ESC + Lightbox en modales

**Problema:** Si un modal y el Lightbox que abre ambos tienen `document.addEventListener('keydown', ...)`, ESC cierra los dos a la vez.

**Solución:** El efecto de ESC del modal depende de `[lightbox]`. Cuando el lightbox está abierto, el listener del modal se desregistra.

```js
// En cualquier modal que pueda tener lightbox (SpeciesModal, ArticleModal):
const { lightbox } = useApp()
const onCloseRef = useRef(onClose)
useEffect(() => { onCloseRef.current = onClose }, [onClose])

useEffect(() => {
  if (lightbox) return  // el Lightbox maneja su propio ESC
  const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current() }
  document.addEventListener('keydown', onKey)
  return () => document.removeEventListener('keydown', onKey)
}, [lightbox])
```

El `onCloseRef` evita re-registrar el listener en cada render (la función `onClose` es nueva en cada render de ModalRenderer).

**Modales que aplican este patrón:** `SpeciesModal`, `ArticleModal`.
**Lightbox:** tiene su propio listener siempre activo. Cierra con ESC llamando a `setLightbox(null)`.

---

## GallerySection — Galería con tracking de errores

**Problema:** Las especies mock tienen `photo.url` definido aunque el archivo no existe. La galería aparecía aunque todas las imágenes dieran 404.

**Solución:** Componente `GallerySection` (module-level en `SpeciesModal.jsx`) con `useState(errored)`.

```js
function GallerySection({ species, onOpenLightbox }) {
  const [errored, setErrored] = useState(0)
  const onErr = () => setErrored(n => n + 1)
  // ...
  if (total === 0 || errored >= total) return null   // oculta si todas fallaron
  // Render gallery con onError={onErr} en cada <img>
}
```

**Regla:** usar `<img>` plano con `resolveUrl()` + `onError` en la galería, no `<SpeciesImg>`. `SpeciesImg` tiene fallback interno que no propaga el error hacia arriba.

---

## Paginador con URL (?pagina=N)

**Decisión:** El paginador de Species usa `useSearchParams` en vez de `useState`. La página actual vive en `?pagina=N`.

**Reset al cambiar filtros — patrón two-effect StrictMode-safe:**

React StrictMode ejecuta efectos dos veces (mount→cleanup→remount). Un `useRef(isFirstRender)` simple no funciona porque el ref persiste entre los dos mounts del StrictMode.

Solución con dos efectos:

```js
const filterResetReady = useRef(false)

// Efecto 1: su cleanup resetea el flag entre los dos mounts de StrictMode
useEffect(() => {
  return () => { filterResetReady.current = false }
}, [])

// Efecto 2: salta en el primer mount (flag=false), ejecuta en cambios reales
useEffect(() => {
  if (!filterResetReady.current) { filterResetReady.current = true; return }
  if (!location.pathname.startsWith('/especies')) return  // no contaminar /familia/
  setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('pagina', '1'); return p }, { replace: true })
}, [searchQuery, orden, showFilter, familyFilter])
```
