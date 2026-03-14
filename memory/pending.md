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

### Migraciones SQL — estado y próximos pasos

> ⚠️ Lección aprendida: delegar a Gemini SQL con IDs de BD es arriesgado (alucinación de IDs, contenido morfológico en lugar de ecológico). Para el contenido restante, **generarlo directamente en Claude** a partir de queries a la BD. Ver retrospectiva en `decisions.md`.

- `cond_temp/precip/suelo/req` en ES/CA/EN — **✅ COMPLETO** (202/202 especies, migraciones 004–018). Frontend y backend actualizados.

- `description_ca/en` — 🔲 **PRÓXIMO BLOQUE**. Arquitectura lista (`_extra_str`). Boletaceae ya aplicado (migración anterior). Resto de familias pendiente (~180 especies). Hacerlo directamente en Claude por familias (~40sp/sesión).

- `confusions` (`diff_ca/en`) — 🔲 Traducción del campo `diff` (texto diferenciación de confusiones). Actualmente solo ES. Hacer después de `description_ca/en`.

- Morfología (`cap_ca/en`, `stem_ca/en`, `flesh_ca/en`) — 🔲 Opcional, baja prioridad. Después de descriptions y confusiones.

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
