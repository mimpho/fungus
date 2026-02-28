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
