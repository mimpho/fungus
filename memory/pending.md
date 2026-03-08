# Tareas Pendientes y Revisiones Abiertas

Los ítems completados se eliminan de este archivo — el historial vive en `CHANGELOG.md`.

---

## ✅ Completado — v4.6.4

- Filtros comarca + CCAA en página Zonas
- `no_comestible` en todos los selectores de comestibilidad
- Restyling `ConfusionesBlock` al estilo items de familia
- Comarca en hero del ZoneModal
- Padding mobile reducido en ZoneModal + SpeciesModal
- Datos confusiones: Amanitaceae, Cantharellaceae, Russulaceae, Cortinariaceae
- Gap fix Agaricus campestris

---

## 🔜 Próximo — v4.7 i18n / Traducciones

Sin rama activa todavía.

**Alcance previsto:**
- Traducción completa del frontend: strings ES/CA/EN (la infraestructura i18n ya existe en `AppContext` y `src/data/i18n.js`)
- Auditoría de strings hardcoded en componentes y páginas
- Posible impacto en BD: campos de texto en zonas/especies que pueden necesitar variantes por idioma
- Scope concreto a definir en tarea específica antes de arrancar

---

## 🗂 Backlog — v5 Auth + favoritos en BD

**Alcance previsto:**
- Auth: JWT (registro/login), middleware de protección de rutas
- Favoritos: zonas y especies en BD por usuario (reemplaza localStorage)
- Google login reservado para v5.1

---

## 🟡 Backlog — mejoras frontend (sin prioridad activa)

### Imágenes placeholder pendientes de reemplazar

Detectadas por hash MD5 idéntico — los archivos son literalmente copias:
- **esp-066 *A. gemmata***: las 3 fotos (main, foto1, foto2) son copias de esp-056 *A. muscaria*
- **esp-019 *N. luridiformis***: foto principal idéntica a esp-014 *N. erythropus*

Solución: sustituir los archivos de imagen en `assets/images/content/species/` con fotos reales de cada especie.

### Revisión general del catálogo de especies
- Verificar que `forestTypes` y `fruitingMonths` sean correctos para todas las especies
- Añadir más especies representativas de cada tipo de bosque
- Valorar tipos adicionales: abetosas, coníferas mixtas, etc.

### Zonas sin especies en temporada
Si no hay especies que coincidan con una zona/mes, el score meteorológico queda sin ajustar. Considerar penalización por "zona sin interés micológico este mes".

### `speciesScore` en ZoneModal
El campo `speciesScore` (SQS) se calcula pero no se muestra en la UI. Candidato a indicador adicional en la ficha de zona.

### Meteocat API para zonas catalanas
Requiere API key. Híbrido: Meteocat para zonas catalanas, Open-Meteo para el resto.

### Zonas personalizadas
Permitir al usuario añadir y guardar puntos propios en el mapa.
