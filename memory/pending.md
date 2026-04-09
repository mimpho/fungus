# Tareas Pendientes y Revisiones Abiertas

Los ítems completados se eliminan de este archivo — el historial vive en `CHANGELOG.md`.

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

### Auditoría morfológica orientada a identificación (ALTA PRIORIDAD cuando se aborde)
Las descripciones actuales de `cap`, `stem`, `flesh` están redactadas como fichas enciclopédicas. Para que sean útiles en identificación de campo (y para el generador de imágenes), cada especie debería tener:
- **Rasgos diagnósticos explicitados** — los 1-3 rasgos que la distinguen de todas las demás, marcados con `RASGO DIAGNÓSTICO:` para que el morfologyBlock del generador los detecte y los priorice.
- **Rasgos de confusión negativos** — lo que NO tiene (ej. "SIN rosado en la carne, SIN volva membranosa"), especialmente respecto a sus especies de confusión del `ConfusionesBlock`.
- **Escala y prominencia** — no "apéndices pendulares" sino "fragmentos de 1-3 cm, conspicuos, imposibles de ignorar". Los modelos de imagen (y los recolectores novatos) necesitan vocabulario de magnitud.

Alcance: 202 especies en BD + `species.js`. El trabajo debería hacerse directamente en Supabase (SQL batch por familia) más actualización paralela en `species.js`. Ver patrón ya aplicado en `esp-062` (*Amanita ovoidea*) como referencia.

### Zonas sin especies en temporada
Si no hay especies que coincidan con una zona/mes, el score meteorológico queda sin ajustar. Considerar penalización por "zona sin interés micológico este mes".

### `speciesScore` en ZoneModal
El campo `speciesScore` (SQS) se calcula pero no se muestra en la UI. Candidato a indicador adicional en la ficha de zona.

### Meteocat API para zonas catalanas
Requiere API key. Híbrido: Meteocat para zonas catalanas, Open-Meteo para el resto.

### Zonas personalizadas
Permitir al usuario añadir y guardar puntos propios en el mapa.
