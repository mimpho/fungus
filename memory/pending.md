# Tareas Pendientes y Revisiones Abiertas

Los ítems completados se eliminan de este archivo — el historial vive en `CHANGELOG.md`.

---

## 🚀 Próximo — v5.4 Rediseño generador admin (galería-first)

**Motivación:** el flujo actual del generador tiene bugs acumulados difíciles de aislar y una UX poco coherente con el objetivo real de la herramienta (gestionar imágenes de especies del catálogo). Se rediseña desde cero reutilizando los bloques ya construidos.

**Alcance:**

- **Entrada: AdminGallery como pantalla principal** de `/admin/generator`. Sin `?especie=` → galería con buscador + filtros ya existentes. Con `?especie=XXX` → abre modal de esa especie directamente.
- **Modal de especie** (nuevo componente): clic en tarjeta de galería → modal con miniaturas de todas las fotos de la especie + lightbox navegable entre fotos. Dos acciones: "Reordenar" y "Generar imagen".
- **Modo reordenar**: el modal cambia a DnD con el `CatalogImagesModal` ya existente. "Reordenar" → "Guardar orden".
- **Vista generador simplificada**: selector de especie + input ID eliminados → título con nombre de la especie. Se mantienen los desplegables de ajustes de escena. Se elimina el bloque "Imágenes en catálogo" del sidebar (redundante — acceso desde galería). Se eliminan los botones "Nuevo" y "Cargar CSV". "Capturar espécimen" → "Generar imagen". Panel derecho (visor + historial + consola) sin cambios.
- **Reutilizar sin reescribir**: `AdminGallery` + `GalleryCard`, `CatalogImagesModal` (DnD), panel derecho del generador, lógica de generación (`generateImage`, `callImagen3`, `callGeminiRefine`), consola de estado.

**Nueva branch:** `feat/v5.4-generator-redesign` desde `main` tras mergear `fix/generator-apikey-cache`.

---

## 🚀 Siguiente — v6.0 Social login (Google)

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

## 🗂 Sin fecha — Hardening: API keys del generador al backend

Deuda técnica documentada en `memory/decisions.md` (sección "Generador de imágenes — Monorepo vs Microservicio").

Actualmente `VITE_GEMINI_API_KEY` está expuesta en el bundle del frontend. Aceptable mientras el acceso sea exclusivamente por `AdminGuard`, pero la solución correcta a largo plazo es:

- Backend: endpoint `POST /api/v1/admin/generate-image` — recibe parámetros del prompt, llama a Imagen 4 / Gemini server-side, devuelve imagen en base64
- Las API keys de Google dejan de estar en el cliente
- `ImageGenerator.jsx` pasa a llamar al endpoint FastAPI en lugar de llamar directamente a Google AI SDK
- Auth: el endpoint ya tiene acceso al JWT — verificar `role = 'admin'` en el middleware, sin cambios en `AdminGuard`

**Cuándo priorizar:** si hay señales de que la key está siendo usada fuera del panel admin (monitoring de quotas), o si el número de admins crece y la key necesita rotarse sin redesploy del frontend.

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
