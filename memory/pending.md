# Tareas Pendientes y Revisiones Abiertas

Los ítems completados se eliminan de este archivo — el historial vive en `CHANGELOG.md`.

---


## 🚀 Próximo — v5.1 Social login (Google + Apple)

**Alcance previsto:**
- Google OAuth2 — mayor reducción de fricción, prioritario
- Apple Sign In — obligatorio para App Store (v6.1 iOS)
- DB: `auth_provider` (`"local"` | `"google"` | `"apple"`) + `provider_id` en tabla `users`; `password_hash` pasa a nullable
- Backend: verificación de token con API de Google/Apple → emite nuestro propio JWT (el sistema de sesiones no cambia)
- Librería: `authlib` para FastAPI
- Frontend: Google Identity Services (script oficial), Apple JS SDK

**Decisión:** hacer antes de v6 para que las apps arranquen con social login desde el día 1.

---

## 🗂 Backlog — v7 SEO

- Prerendering estático en build time para rutas conocidas (`/especies/:id`, `/zonas/:id`, etc.)
- `react-helmet-async`: meta tags dinámicos por ruta (título, description, Open Graph)
- Revisión Core Web Vitals

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
