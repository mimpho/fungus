# Gotchas y Restricciones Conocidas

Trampas y errores que ya hemos encontrado. Consultar antes de tocar estas áreas.

---

## API Open-Meteo

### ⚠️ `soil_temperature_0cm` solo en `hourly`
Añadirlo a `current` devuelve HTTP 400. Siempre fetch en `hourly` y leer el índice horario más cercano a `new Date().getHours()`.

```js
// ✅ Correcto
hourly: 'soil_temperature_0cm'

// ❌ Rompe la API
current: 'temperature_2m,soil_temperature_0cm'
```

---

## Leaflet

### ⚠️ `window.L = L` antes del import dinámico de leaflet.heat
`leaflet.heat` es un plugin CommonJS que busca `L` en el scope global durante su inicialización. Si se hace el `import('leaflet.heat')` antes de que `window.L` esté asignado, falla silenciosamente o lanza error.

```js
// En LeafletMap.jsx, a nivel de módulo (fuera de cualquier función):
import L from 'leaflet'
window.L = L  // ← DEBE ir aquí, antes de cualquier import() dinámico

// Dentro del componente, solo cuando se activa heatmap:
const heat = await import('leaflet.heat')
```

### ⚠️ `FOREST_COLORS` y colores Leaflet → siempre hex, nunca CSS vars
Los markers SVG y los popups HTML de Leaflet se renderizan fuera del DOM de React. Las CSS custom properties (`var(--color-coffee)`) no se resuelven en ese contexto. Usar siempre valores hex literales.

```js
// constants.js
export const FOREST_COLORS = {
  pinar:   '#4a7c59',  // ⚠️ hex obligatorio — Leaflet SVG no resuelve CSS vars
  hayedo:  '#6b7c3e',
  // ...
}
```

---

## Sistema de Colores

### ⚠️ `ArticleCallout` color prop → siempre hex
El componente construye el color de fondo como `color + '18'` (sufijo de opacidad hex). Si se pasa `var(--color-coffee)`, la concatenación da `var(--color-coffee)18`, que no es un color válido.

```jsx
// ✅ Correcto
<ArticleCallout color="#8b6f47">...</ArticleCallout>

// ❌ No funciona
<ArticleCallout color="var(--color-coffee)">...</ArticleCallout>
```

### ⚠️ No usar `bg-mid` ni `green-dark` — fueron renombrados
- `bg-mid` → eliminado (no existía realmente como token)
- `green-dark` → renombrado a `green-f`

---

## React / Hooks

### ⚠️ React StrictMode monta efectos dos veces en desarrollo
Los `useEffect` se ejecutan doble en dev. Los guards con `useRef` no funcionan bien aquí porque la referencia se reinicia. Solución: caché de promesas en vuelo a nivel de módulo en `weatherService.js` (`_allZonesPromise`, `_singlePromises`).

### ⚠️ `conditionsMap` empieza como objeto vacío `{}`
Siempre usar optional chaining al acceder:
```js
// ✅
conditionsMap[zone.id]?.overallScore ?? 0

// ❌ Crash en el render inicial
conditionsMap[zone.id].overallScore
```

### ⚠️ `useMemo` en Dashboard/Zones depende de `conditionsMap`
El mapa se rellena de forma asíncrona. Los `useMemo` que derivan datos de él deben incluirlo en sus dependencias o no verán las actualizaciones.

---

## Caché de Meteo

### ⚠️ Incrementar `CACHE_VERSION` al cambiar el algoritmo de scoring
La caché en localStorage se invalida por versión. Si se cambia `calculateOverallScore` o la formula del species modifier sin subir `CACHE_VERSION`, los usuarios verán scores antiguos durante 3 horas.

**Versión actual:** `CACHE_VERSION = 3` (en `weatherService.js`)

### ℹ️ El species modifier NO está en la caché
`applySpeciesModifier` se aplica en el hook tras leer la caché, no en `weatherService`. Esto es intencionado: permite cambiar los pesos de comestibilidad sin invalidar la caché meteorológica.

---

## Migración de colores (script automático)

### ⚠️ El script de migración sobrescribió `FOREST_COLORS` con CSS vars
Al ejecutar la migración automática de hexadecimales → tokens, `FOREST_COLORS` fue modificado incorrectamente. Fue revertido manualmente a hex. Si se vuelve a correr algún script de sustitución de colores, excluir explícitamente `FOREST_COLORS` y el template HTML de Leaflet.

---

## Edición de archivos

### ℹ️ Leer el archivo antes de usar `Edit`
La herramienta `Edit` falla si el archivo no ha sido leído en la misma sesión. Siempre usar `Read` antes de editar, especialmente tras un `Write` previo.

### ⚠️ No añadir `className` duplicado en JSX
Al editar con sed o reemplazos de texto, comprobar que no quede un atributo `className` duplicado en el mismo elemento. React lanza warning y usa solo el último.

---

## Routing de Modales (React Router v6)

### ⚠️ `navigate()` nunca dentro de un modal — solo `setSelected*()`
Los modales no llaman a `navigate()` directamente. Solo actualizan estado del contexto (`setSelectedSpecies`, etc.) y `ModalRenderer` reacciona navegando. Llamar `navigate()` desde un modal rompe el historial y hace que ESC no vuelva al sitio correcto. Ver `memory/decisions.md` → "ModalRenderer como única autoridad".

### ⚠️ `navigate('/ruta', { replace: true })` entre modales rompe el Back button
Si al abrir un modal B desde el modal A se hace `navigate('/ruta-base', { replace: true })`, se reemplaza la entrada del modal A en el historial. ESC desde B ya no puede volver a A. La solución es no navegar manualmente — dejar que ModalRenderer empuje la nueva entrada con `navigate(target)` (sin replace).

### ⚠️ Guard anti-bucle obligatorio en ModalRenderer
Sin el guard `if (location.pathname === target) return`, el `useEffect` de ModalRenderer puede dispararse infinitamente al cambiar `selectedSpecies` mientras ya estás en `/especies/:slug`. Siempre comparar antes de navegar.

---

## URLs de Assets en Rutas Anidadas

### ⚠️ Imágenes con rutas relativas se rompen en `/especies/:id`, `/familia/:slug`, etc.
Los datos mock usan rutas como `assets/images/species/esp-001.jpg` (sin `/` inicial). Cuando la URL del browser es `/especies/boletus-edulis`, el browser resuelve la ruta relativa como `/especies/assets/...` → 404.

**Solución:** `resolveUrl()` en `helpers.jsx`. Usar siempre en `<img src>` de modales, galerías y artículos:

```js
import { resolveUrl } from '../../lib/helpers'
<img src={resolveUrl(foto.url)} />   // garantiza /assets/... nunca assets/...
```

**Componentes donde ya está aplicado:** `SpeciesModal` (GallerySection), `FamilyModal` (thumbnails), `Lightbox` (main image + thumbnails).

---

## React Router v6 — Comportamiento de Instancias de Componentes

### ℹ️ Rutas distintas que renderizan el mismo componente crean instancias separadas
`/especies` y `/especies/:id` usan `<Species />` en rutas distintas → React crea una nueva instancia al navegar entre ellas (no reutiliza). Los refs empiezan a `false`/`null` en cada instancia nueva. Esto es relevante para el patrón two-effect de reset de paginador.

### ℹ️ `Family.jsx` renderiza `<Species />` como hijo → instancia diferente a la de `/especies`
Al navegar de `/familia/:slug` a `/especies/:id`, React desmonta la Species de Family y monta una nueva Species independiente. No hay reutilización de instancia entre rutas de diferente profundidad de árbol.
