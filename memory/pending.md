# Tareas Pendientes y Revisiones Abiertas

Los ítems completados se eliminan de este archivo — el historial vive en `CHANGELOG.md`.

---

## 🚀 Próximo — v5.2 Generador: mejoras de flujo

**Alcance previsto:**

- **Overwrite modal**: al intentar guardar como imagen `main` una especie que ya tiene imágenes en BD, mostrar un modal de comparación con las 4 imágenes (nueva generada, main actual, foto 1, foto 2). El usuario asigna posición (main | 1 | 2 | eliminar) a cada una mediante una lista ordenable. Requiere:
  - Backend: endpoint `PATCH /api/v1/species/{id}/images` — acepta imagen en base64, actualiza slots en BD
  - Frontend: `ImageOverwriteModal` con previsualización de 4 imágenes y selector de slot por imagen

- **Gallery click → Generador**: click en un item de `AdminGallery` abre el generador con la especie pre-cargada y la imagen actual visible como referencia. El flujo sería: galería → generador (especie + imagen actual en panel) → instrucciones de refinamiento → imagen nueva → confirmación de reemplazo.
  - El refinador actual (`callGeminiRefine`) no toma la imagen existente como input real — genera desde cero con instrucciones. Evaluar si suficiente o si se requiere img2img real.

---

## 🗂 Backlog — v6.0 Social login (Google)

(Era v5.2 — movido a v6 para priorizar mejoras del generador)

**Alcance previsto:**
- Google OAuth2 — gratis, sin coste, mayor reducción de fricción
- DB: `auth_provider` (`"local"` | `"google"`) + `provider_id` en tabla `users`; `password_hash` pasa a nullable
- Backend: verificación de ID token con Google → emite nuestro propio JWT (el sistema de sesiones no cambia)
- Librería: `authlib` o `google-auth` para FastAPI
- Frontend: Google Identity Services (script oficial, One Tap)

---

## 🗂 Backlog — v6.1 Confirmación de email

(Era v5.3 — movido a v6.x)

**Alcance previsto:**
- Enviar email de verificación al registrar una cuenta nueva
- Token de un solo uso (corta expiración, ej. 24h) almacenado en BD
- Endpoint `GET /auth/verify-email?token=...` que activa la cuenta
- Campo `email_verified: bool = False` en tabla `users`
- Frontend: mostrar banner "Verifica tu email" en perfil si `!email_verified`
- Proveedor: Resend o SendGrid (cheap/free tier suficiente para volumen inicial)

**Decisión:** postergar hasta después de v6.0. Sin proveedor de email configurado todavía.

---

## 🗂 Sin fecha — v7.0 App Android

- React Native + Expo — APK, mapa nativo, notificaciones push
- **Condicionado a monetización previa** (costes de desarrollo y distribución)
- iOS eliminado del roadmap — requiere Apple Developer ($99/año) + Apple Sign In; se reconsiderará si hay ingresos

---

## 🗂 Backlog — v8 SEO

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
