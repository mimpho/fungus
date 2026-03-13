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

## 🔜 En curso — v4.7 i18n / Traducciones

Rama activa: `feat/v4-7-i18n-sync`

**Completado:**
- Auditoría completa de strings hardcoded en todos los componentes
- `i18n.js` expandido (~110 claves por idioma, ES/CA/EN)
- Todos los componentes UI traducidos: Dashboard, Zones, Species, ZoneModal, SpeciesModal, FamilyModal, ZoneCard, Profile, helpers (EdibilityTag, TaxonomyBlock, ConfusionesBlock)
- Build verificado: 0 errores

**Completado (DB layer):**
- Backend `/species` con `?lang=es|ca|en`, fallback automático a ES
- `useSpecies` cache por idioma, reactivo al cambio de lang
- Migración `013_common_names_i18n.sql` — `commonNames_ca` + `commonNames_en` para 202 especies

**Pendiente para cerrar v4.7:**
- Aplicar `013_common_names_i18n.sql` en Supabase (producción)
- Testing manual en los tres idiomas — verificar que los nombres comunes cambian al cambiar lang en Perfil
- Commit + merge a main + tag v4.7.0
- `description_ca/en` y morfología → v4.7.1 (contenido editorial, no arquitectura)

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
