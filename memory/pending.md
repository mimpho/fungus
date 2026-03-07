# Tareas Pendientes y Revisiones Abiertas

Los ítems completados se eliminan de este archivo — el historial vive en `CHANGELOG.md`.

---

## 🗂 Pendiente — v4.6.x Confusiones (datos restantes)

PR #28 mergeada y desplegada en prod. Pendiente poblar más familias:

- [ ] **Datos: confusiones Amanitaceae** — *Amanita phalloides*, *A. muscaria*, *A. caesarea*, *A. vaginata* y similares
- [ ] **Datos: confusiones Cantharellaceae** — *Cantharellus cibarius* vs *Omphalotus olearius*
- [ ] **Datos: confusiones Russulaceae** — *Russula* spp., *Lactarius* spp.
- [ ] **Datos: confusiones Cortinariaceae** — *Cortinarius* spp. (muchos tóxicos)

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
