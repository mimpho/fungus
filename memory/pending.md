# Tareas Pendientes y Revisiones Abiertas

Los ítems completados se eliminan de este archivo — el historial vive en `CHANGELOG.md`.

---


## 🚀 Próximo — v5.1 Generador de Imágenes de Setas (Acceso Protegido)

**Alcance previsto:**
- Migración del componente `App.tsx` (AI Studio) a `src/components/admin/ImageGenerator.tsx`.
- Integración en Router con ruta `/admin/generator`.
- Seguridad: Acceso solo para `role === 'admin'`.
- Uso de `VITE_GEMINI_API_KEY` para integración con Gemini 1.5 Flash.

---

## 🗂 Backlog — v5.2 Social login (Google)

**Alcance previsto:**
- Google OAuth2 — gratis, sin coste, mayor reducción de fricción
- DB: `auth_provider` (`"local"` | `"google"`) + `provider_id` en tabla `users`; `password_hash` pasa a nullable
- Backend: verificación de ID token con Google → emite nuestro propio JWT (el sistema de sesiones no cambia)
- Librería: `authlib` o `google-auth` para FastAPI
- Frontend: Google Identity Services (script oficial, One Tap)

---

## 🗂 Backlog — v5.3 Confirmación de email

**Alcance previsto:**
- Enviar email de verificación al registrar una cuenta nueva
- Token de un solo uso (corta expiración, ej. 24h) almacenado en BD
- Endpoint `GET /auth/verify-email?token=...` que activa la cuenta
- Campo `email_verified: bool = False` en tabla `users`
- Frontend: mostrar banner "Verifica tu email" en perfil si `!email_verified`
- Proveedor: Resend o SendGrid (cheap/free tier suficiente para volumen inicial)

**Decisión:** postergar a después de v5.1. Social login (especialmente Apple) es blocker duro para App Store y tiene más impacto en conversión.

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
