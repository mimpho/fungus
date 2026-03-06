# Tareas Pendientes y Revisiones Abiertas

Los ítems completados se eliminan de este archivo — el historial vive en `CHANGELOG.md`.

---

## 🗂 Próximo — v4.5 Auditoría mock → API

Verificar que ningún componente del frontend importe datos de `src/data/` directamente en producción. Cerrar cualquier import mock residual conectándolo al backend.

Alcance:
- Auditar todos los componentes y páginas buscando imports de `mockZones`, `mockSpecies`, `mockFamilies`, `mockOpportunities`, `mockArticles`
- Los que sean fallback explícito: documentar y mantener
- Los que sean datos de producción: reemplazar por llamada a la API
- Verificar que `useZones` y `useSpecies` sean los únicos puntos de entrada de datos de catálogo

---

## 🗂 Backlog — v4.6 Auth/social

JWT, favoritos reales en BD, avistamientos comunitarios. Sin rama activa todavía.

Alcance previsto:
- Auth: JWT (login/registro), middleware de protección de rutas
- Favoritos: zonas y especies en BD por usuario (reemplaza localStorage)
- Avistamientos: `POST /api/v1/sightings` — foto, zona, especie, fecha, usuario

---

## 🟡 Backlog — v3.x (sin prioridad activa)

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
