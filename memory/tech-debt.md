# Tech Debt Audit — Fungus

**Fecha:** abril 2026  
**Repo:** `fungus` (React + Vite frontend / FastAPI backend)  
**Metodología:** Priority = (Impact + Risk) × (6 − Effort), donde Effort invertido significa que un fix fácil sube el score.

---

## Resumen ejecutivo

El repo tiene una arquitectura sólida y bien estructurada, pero acumula deuda en cuatro áreas críticas: datos duplicados entre frontend y backend, dos sistemas de migración paralelos sin un claro ganador, el directorio `build/` commiteado, y un fichero `helpers.jsx` que ha crecido hasta convertirse en un cajón de sastre de 508 líneas. La cobertura de tests en frontend es cero y en backend es mínima.

---

## Deuda priorizada

### 🔴 Prioridad alta (score ≥ 25)

#### 1. Mapa `PROVINCE_TO_CCAA` duplicado — Score: 28
**Tipo:** Code debt  
**Impact:** 3 | **Risk:** 4 | **Effort:** 2

El mismo mapa provincia→CCAA existe en `src/services/apiService.js` y en `src/data/zones.js`. Si se añade una provincia o se corrige un nombre en uno de los dos sitios, el otro queda desactualizado silenciosamente, produciendo inconsistencias en los filtros de la UI.

**Fix:** Extraer el mapa a `src/lib/constants.js` (ya existe el fichero) e importarlo desde ambos sitios. 1–2 horas.

---

#### 2. Dos sistemas de migración sin un propietario claro — Score: 28
**Tipo:** Architecture debt + Documentation debt  
**Impact:** 3 | **Risk:** 4 | **Effort:** 2

El repo tiene 49 ficheros `.sql` en `migrations/` (raíz del proyecto) y además un sistema Alembic en `backend/migrations/versions/` con 9 versiones. No queda claro cuál es la fuente de verdad. Los SQL manuales tienen numeración inconsistente (`015_sesion_b.sql`, `015_sesion_b_1.sql`, `015_sesion_b2.sql`…) lo que sugiere que se aplicaron manualmente en producción.

**Fix:** Documentar en `migrations/README.md` cuál es el sistema activo (Alembic) y si los `.sql` ya están absorbidos en él o son una fuente independiente. Si están obsoletos, moverlos a `migrations/archive/`. 2–4 horas.

---

#### 3. `backend/build/` commiteado en git — Score: 25
**Tipo:** Infrastructure debt  
**Impact:** 2 | **Risk:** 3 | **Effort:** 1

El directorio `backend/build/` contiene una copia completa de toda la app Python (routers, services, models…). Si se modifica `app/` sin hacer build, `build/` queda desactualizado y puede confundir a cualquier herramienta o deploy que lo tome como fuente. También infla el repo y dificulta los diffs.

**Fix:** Añadir `backend/build/` a `.gitignore` y eliminarlo del índice de git con `git rm -r --cached backend/build/`. 30 minutos.

---

### 🟡 Prioridad media (score 15–24)

#### 4. `helpers.jsx` — God File de 508 líneas — Score: 21
**Tipo:** Code debt  
**Impact:** 4 | **Risk:** 3 | **Effort:** 3

`helpers.jsx` mezcla tres tipos de cosas completamente distintas: iconos SVG inline (`IC`), funciones utilitarias puras (`slugify`, `resolveUrl`, `getEdibilityColor`), y micro-componentes React (`EdibilityTag`, `SpeciesCard`…). Cualquier cambio en iconos obliga a abrir el mismo fichero que para cambiar lógica de negocio.

**Fix:** Dividir en tres módulos:
- `src/lib/icons.jsx` — el objeto `IC` con todos los SVGs
- `src/lib/utils.js` — funciones puras (slugify, resolveUrl, formatters)
- `src/lib/ui.jsx` — micro-componentes React

Los imports actuales de `@/lib/helpers` se pueden mantener temporalmente re-exportando desde el fichero original. 3–5 horas.

---

#### 5. Cobertura de tests backend — Score: 21
**Tipo:** Test debt  
**Impact:** 3 | **Risk:** 4 | **Effort:** 3

Solo existe un fichero de test: `backend/tests/unit/test_scoring.py`. No hay tests para auth, zonas, species, weather ni ninguno de los routers. El backend tiene ya la infraestructura de pytest y `.pytest_cache`.

**Fix:** Añadir al menos tests de contrato para los routers más críticos: `auth.py` (login/register) y `zones.py`. Estimar 1 día para una cobertura mínima razonable del 60%.

---

#### 6. Inline SVGs en lugar de `lucide-react` — Score: 16
**Tipo:** Code debt  
**Impact:** 2 | **Risk:** 1 | **Effort:** 2

`lucide-react` ya está en `package.json` y se usa en algunas páginas de admin, pero `helpers.jsx` tiene sus propios SVGs inline para los iconos de navegación. Esto duplica mantenimiento y produce inconsistencias de tamaño/trazo.

**Fix:** Sustituir el objeto `IC` por imports directos de `lucide-react`. Muchos ya tienen equivalente exacto. 2–3 horas.

---

#### 7. `standalone/` — codebase paralela sin documentar — Score: 16
**Tipo:** Documentation debt + Architecture debt  
**Impact:** 2 | **Risk:** 2 | **Effort:** 2

`standalone/` contiene una versión completamente diferente de la app (HTML + JS plano, sin React) con su propio archivo de versiones hasta la `v2.8.0`. No queda claro si se mantiene activamente, si se genera desde el código principal, o si es un artefacto histórico.

**Fix:** Añadir un `standalone/README.md` explicando el propósito. Si está deprecado, moverlo a un branch archivado. 1–2 horas.

---

### 🟢 Prioridad baja (score < 15)

#### 8. `backend/app/routers/species.py` — 519 líneas — Score: 15
**Tipo:** Code debt  
**Impact:** 3 | **Risk:** 2 | **Effort:** 3

El router de species mezcla endpoints públicos y admin en el mismo fichero a 519 líneas.

**Fix:** Extraer los endpoints admin (`/visual-prompt`, `/images`) a `routers/species_admin.py`. 2–3 horas.

---

#### 9. Cero tests en frontend — Score: 16 (esfuerzo alto)
**Tipo:** Test debt  
**Impact:** 4 | **Risk:** 4 | **Effort:** 5

No hay ningún test en el frontend. El riesgo principal es en la lógica de filtrado de `useSpecies.js` y en el scoring de condiciones meteorológicas.

**Fix:** Configurar Vitest (viene con Vite) y añadir tests unitarios para `slugify`, `normalizeScore`, `normalizeZone` y el hook `useSpecies`. Estimar 1–2 días.

---

#### 10. `AppContext.jsx` — God Context — Score: 10
**Tipo:** Architecture debt  
**Impact:** 3 | **Risk:** 2 | **Effort:** 4

El contexto global gestiona i18n, auth, modal stack, follows y favoritos. Cualquier actualización de estado provoca re-render de todos los consumidores.

**Fix:** Dividir en `AuthContext`, `ModalContext` e `i18nContext`. Baja urgencia, pero a tener en cuenta si la app crece. 1–2 días.

---

## Plan de remediación por fases

### Fase 1 — Quick wins (~1 día en total)
1. Eliminar `backend/build/` del repositorio
2. Consolidar `PROVINCE_TO_CCAA` en `src/lib/constants.js`
3. Documentar qué sistema de migraciones es el activo

### Fase 2 — Refactors estructurales (en paralelo al feature work)
4. Dividir `helpers.jsx` en tres módulos
5. Sustituir SVGs inline por `lucide-react`
6. Documentar o archivar `standalone/`
7. Extraer endpoints admin de `species.py`

### Fase 3 — Tests (10–20% de cada sprint)
8. Tests de routers backend: auth + zones como primera iteración
9. Configurar Vitest y cubrir lógica pura del frontend
10. Evaluar si vale la pena dividir `AppContext`

---

## Métricas actuales

| Área | Indicador | Estado |
|------|-----------|--------|
| Frontend tests | Ficheros de test | 0 |
| Backend tests | Ficheros de test | 1 (solo scoring) |
| Fichero más grande (frontend) | `helpers.jsx` | 508 líneas |
| Fichero más grande (backend) | `routers/species.py` | 519 líneas |
| Migraciones SQL manuales | Count | 49 ficheros |
| Migraciones Alembic | Count | 9 versiones |
| Datos duplicados identificados | PROVINCE_TO_CCAA | 2 copias |
