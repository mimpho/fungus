# Tareas Pendientes y Revisiones Abiertas

---

## ✅ Completado — Revisión de edibilidad (2026-02-28)

### Revisión de edibilidad de todas las especies
**Estado:** Completado. 14 cambios aplicados en `src/data/species.js`.

**Cambios aplicados** (fuente: Wikipedia, MushroomExpert, First Nature, Ultimate Mushroom, Galloway Wild Foods):

| Especie | Nombre común | Antes | Ahora | Motivo |
|---|---|---|---|---|
| *Imleria badia* | Boleto bayo / Cep bru | `bueno` | `excelente` | "Choice", comparable a B. edulis en sabor |
| *Cantharellus aurora* | Rossinyol daurat | `bueno` | `excelente` | "Culinariamente igual que sus parientes grandes" |
| *Craterellus lutescens* | Camagroc / Rossinyolic | `bueno` | `excelente` | Muy cotizado, aroma frutal intenso, todas las fuentes top |
| *Craterellus tubaeformis* | Cantarel·la d'hivern | `bueno` | `excelente` | "Edible and excellent", muy popular en Escandinavia |
| *Hydnum repandum* | Peu de rata / Llengua de vaca | `bueno` | `excelente` | 4/5, vendido en mercados junto a rebozuelos en Francia |
| *Hydnum rufescens* | Peu de rata rojenc | `bueno` | `excelente` | Misma calidad que H. repandum |
| *Morchella importuna* | Colmenilla importuna | `bueno` | `excelente` | "Highly priced", misma categoría que todas las colmenillas |
| *Pleurotus pulmonarius* | Gírgola de pulmó | `bueno` | `excelente` | "Equally edible as P. ostreatus" (que ya era excelente) |
| *Butyriboletus regius* | Cep reial / Royal bolete | `bueno` | `excelente` | "Same culinary league as Ceps (B. edulis)" |
| *Leccinum versipelle* | Llenega taronja | `comestible` | `bueno` | "Good edible", superior al L. scabrum |
| *Gyroporus cyanescens* | Giropor blau | `comestible` | `bueno` | "Choice" en varias fuentes |
| *Gyroporus castaneus* | Giropor castany | `comestible` | `bueno` | "Choice edible" confirmado |
| *Gomphus clavatus* | Gomfo amorat | `comestible` | `bueno` | "Choice" en guías europeas, cuidado con ejemplares viejos |
| *Tricholoma terreum* | Ratolí / Fredolic gris | `bueno` | `precaucion` | Triterpenoides tóxicos aislados (2014), relación con rabdomiólisis |

**Nota Tricholoma equestre:** ya estaba como `precaucion`, se confirma correcta (casos de rabdomiólisis, 20% mortalidad en brotes franceses). La investigación reciente sugiere que algunos casos podrían haberse confundido con T. terreum.

**Impacto en scoring:** el species modifier no está en caché → cambios visibles inmediatamente, sin necesidad de subir `CACHE_VERSION`.

---

## 🟡 Mejoras pendientes (v3.x)

### Revisión general del catálogo de especies
- Verificar que `forestTypes` y `fruitingMonths` sean correctos para todas las especies
- Añadir más especies si faltan representativas de cada tipo de bosque
- Comprobar si hay especies con `forestType: 'mixto'` que deberían cubrirse en las zonas actuales (las zonas solo tienen: pinar, hayedo, robledal, encinar)
- Valorar otros tipos como abetosas, coníferas (mixtos), etc

### Zonas sin especies en temporada
Actualmente si no hay especies que coincidan con una zona/mes, el score meteorológico queda sin ajustar. Considerar si esto es correcto o si debería haber una penalización por "zona sin interés micológico este mes".

### `speciesScore` en la UI de ZoneModal
El campo `speciesScore` (SQS) se calcula y se añade al objeto conditions, pero no se muestra en ningún sitio. Podría ser útil mostrarlo como indicador adicional en la ficha de zona.

### Meteocat API para zonas catalanas
Requiere API key. Híbrido: Meteocat para zonas catalanas, Open-Meteo para el resto.

### Zonas personalizadas
Permitir al usuario añadir y guardar puntos propios en el mapa.

---

## 🟢 Roadmap (v4.0)

- Backend propio (FastAPI) + PostgreSQL
- Autenticación real de usuarios
- App móvil (React Native)
- Fotografías comunitarias de avistamientos
- Notificaciones push reales
- Exportar calendario a PDF
