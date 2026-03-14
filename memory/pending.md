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

## 🗂 Backlog — v4.7.1 i18n contenido editorial

Arquitectura lista (backend `_extra_str(lang)` + frontend `i18n()` helper). Solo falta contenido.

### Migraciones SQL (via Gemini, por familias)

- `description_ca/en` — **en curso**: Boletaceae aplicado, resto de familias pendiente
- `cond_temp/precip/suelo/req` en ES/CA/EN — **202/202 especies migradas, contenido verificado** ✅. Frontend actualizado (`SpeciesModal.jsx` sin `if/else`, backend `_extra_str` + schemas). Sesión D completada (`018`): corrección `cond_req` ecológico para 28 especies.
- Morfología (`cap`, `stem`, `flesh`) en CA/EN — después de descriptions
- Confusiones (`diff`) en CA/EN — traducción opcional, después de morfología

### Código (sesión Cowork)

- Artículos (`Micorrizas.jsx`, `Esporas.jsx`, `Venenos.jsx`) en CA/EN — extraer texto a claves `i18n.js` (Option A). JSX queda como plantilla estructural. Gemini traduce los valores de las claves.

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
