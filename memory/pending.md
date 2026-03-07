# Tareas Pendientes y Revisiones Abiertas

Los ítems completados se eliminan de este archivo — el historial vive en `CHANGELOG.md`.

---

## 🚧 En curso — v4.6.2 Confusiones (PR #28 abierta)

Backend completo. Frontend pendiente.

- [ ] **Frontend: `ConfusionesBlock`** — leer `species.confusions` de la API en lugar de `CONFUSIONES_POR_FAMILIA`
  - `species.confusions` llega como `[{with_species_id, diff}]` desde el endpoint
  - Buscar la seta referenciada por `with_species_id` en `allSpecies` para obtener `scientificName` y `edibility`
  - Derivar `icon` / `borderColor` / `nameColor` en frontend a partir de `edibility` (igual que `EdibilityTag`)
  - Si `species.confusions` es `null` o vacío, no renderizar el bloque
- [ ] **Frontend: eliminar agrupación por familia** — `CONFUSIONES_POR_FAMILIA` deja de usarse; se puede deprecar/eliminar de `helpers.jsx` una vez el frontend esté migrado
- [ ] **Datos: poblar confusiones restantes** — SQL migrations para las demás familias (Amanitaceae, Cantharellaceae, Russulaceae, Cortinariaceae, etc.)
- [ ] **Merge PR #28** cuando el frontend esté listo

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
