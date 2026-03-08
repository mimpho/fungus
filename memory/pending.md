# Tareas Pendientes y Revisiones Abiertas

Los ítems completados se eliminan de este archivo — el historial vive en `CHANGELOG.md`.

---

## 🚧 En curso — v4.6.4 (rama `feat/v4-6-4`)

Mejoras UX commitadas (pendiente push + PR):
- [x] Filtros comarca + CCAA en página Zonas
- [x] `no_comestible` en todos los selectores de comestibilidad
- [x] Restyling `ConfusionesBlock` al estilo items de familia
- [x] Comarca en hero del ZoneModal
- [x] Padding mobile reducido en ZoneModal + SpeciesModal

Datos de confusiones — migraciones escritas, pendiente ejecutar en Supabase:
- [x] `006_confusions_amanitaceae.sql` — 13 especies (caesarea, muscaria, phalloides, verna, virosa, pantherina, rubescens, ovoidea, spissa, citrina, excelsa + cross: silvicola, leucothites)
- [x] `007_confusions_cantharellaceae.sql` — 6 especies + cross: Omphalotus olearius
- [x] `008_confusions_russulaceae.sql` — 14 especies (Russula: virescens, cyanoxantha, delica, emetica, aurea, vesca, foetens, nigricans, laurocerasi + Lactarius: deliciosus, sanguifluus, deterrimus, volemus + Lactifluus: piperatus, vellereus)
- [x] `009_confusions_cortinariaceae.sql` — 9 especies + cross: Inocybe erubescens
- [x] `010_confusions_agaricus_campestris.sql` — gap fix: campestris ↔ phalloides/verna/xanthodermus + silvicola ↔ campestris/xanthodermus
- [ ] **Ejecutar `010` en Supabase** (006–009 ya aplicadas con overwrite pattern — datos correctos, no requieren reejecutar)

---

## 🗂 Próximo — v4.7 Auth/social

JWT, favoritos reales en BD, avistamientos comunitarios. Sin rama activa todavía.

Alcance previsto:
- Auth: JWT (login/registro), middleware de protección de rutas
- Favoritos: zonas y especies en BD por usuario (reemplaza localStorage)
- Avistamientos: `POST /api/v1/sightings` — foto, zona, especie, fecha, usuario

---

## 🟡 Backlog — mejoras frontend (sin prioridad activa)

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
