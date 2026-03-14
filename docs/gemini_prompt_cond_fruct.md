# Prompt Gemini — Generación de `cond_fruct` por especie

> **Uso**: pegar este prompt en Gemini Advanced. Sustituir la sección `## INPUT` con los datos
> de la familia a procesar. Procesar una familia por sesión para mantener la coherencia de tono.

---

## INSTRUCCIONES

Eres un experto en micología y ecología fúngica. Tu tarea es generar cuatro textos descriptivos
sobre las condiciones de fructificación para cada especie de seta que se te proporcione.

Los textos se almacenarán en la base de datos de la aplicación **Fungus** (app web de predicción
micológica para Cataluña/España) y se mostrarán a usuarios aficionados a la recolección.

### Los cuatro campos que debes generar por especie

| Campo | Título en UI | Descripción |
|---|---|---|
| `cond_temp` | Temperatura | Rango e interpretación de las temperaturas óptimas de fructificación |
| `cond_precip` | Precipitación | Necesidades de lluvia acumulada en los días previos y patrón hídrico |
| `cond_suelo` | Suelo | Tipo de sustrato, pH, horizonte orgánico y asociación simbiótica o trófica |
| `cond_req` | Requisitos especiales | Factores diferenciales: choque térmico, relación con árboles, estacionalidad específica, etc. |

Cada campo debe generarse en **tres idiomas**: español (`_es`), catalán (`_ca`) e inglés (`_en`).
Total: 12 textos por especie.

### Reglas de redacción

- **Longitud**: 1–2 frases por campo (máximo ~250 caracteres). Conciso y directo.
- **Especificidad**: el texto debe ser específico para esa especie, NO genérico de familia.
  Usa los valores numéricos reales (°C, mm, días) pero expresa la información de forma natural.
- **Tono**: divulgativo y accesible. No excessivamente técnico, pero preciso.
- **`cond_req`**: incluye si es micorrizógena/saprófita/parásita, árbol(es) huésped concreto(s),
  si requiere helada previa o choque térmico, y cualquier peculiaridad ecológica destacable.
- **Catalán**: variedad estándar (IEC). Términos micológicos en catalán cuando existan.
- **No repetir** el nombre científico ni el nombre del campo en el texto.

### Formato de salida

Para cada especie genera un bloque SQL listo para ejecutar en Supabase SQL Editor:

```sql
-- esp-XXX  Nombre científico
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "...",
  "cond_temp_ca": "...",
  "cond_temp_en": "...",
  "cond_precip_es": "...",
  "cond_precip_ca": "...",
  "cond_precip_en": "...",
  "cond_suelo_es": "...",
  "cond_suelo_ca": "...",
  "cond_suelo_en": "...",
  "cond_req_es": "...",
  "cond_req_ca": "...",
  "cond_req_en": "..."
}'::jsonb
WHERE id = 'esp-XXX';
```

Devuelve **un bloque por especie**, en el mismo orden que el INPUT. Sin texto adicional entre bloques.

---

## EJEMPLO (referencia de tono y formato)

### Datos de entrada

```
id: esp-001
scientific_name: Boletus edulis
family: Boletaceae
edibility: excelente
temp_min_c: 12.0 | temp_opt_c: 15.0 | temp_max_c: 18.0
rain_min_mm: 30 | rain_opt_mm: 80 | cycle_days: 7
forest_types: pinar, hayedo, robledal, encinar
fruiting_months: [8, 9, 10, 11]
elevation_min_m: 400 | elevation_max_m: 2000
requiere_helada: false | requiere_choque_termico: true
humedad_min: 70 | humedad_optima: 80
ph_suelo_min: 5.5 | ph_suelo_max: 6.5
```

### Salida esperada

```sql
-- esp-001  Boletus edulis
UPDATE species
SET extra_data = extra_data || '{
  "cond_temp_es": "Temperaturas frescas entre 12–18°C. El primer choque térmico otoñal (bajada brusca nocturna) es el principal detonante de la fructificación.",
  "cond_temp_ca": "Temperatures fresques entre 12–18°C. El primer xoc tèrmic de tardor (baixada brusca nocturna) és el principal detonant de la fructificació.",
  "cond_temp_en": "Cool temperatures between 12–18°C. The first autumn thermal shock (sharp overnight drop) is the main fruiting trigger.",
  "cond_precip_es": "Necesita al menos 30mm acumulados en los 14 días previos; la fructificación óptima se produce 7–10 días después de una lluvia significativa (≥15mm en 24h).",
  "cond_precip_ca": "Necessita almenys 30mm acumulats en els 14 dies previs; la fructificació òptima es produeix 7–10 dies després d'una pluja significativa (≥15mm en 24h).",
  "cond_precip_en": "Requires at least 30mm accumulated over the previous 14 days; optimal fruiting occurs 7–10 days after a significant rain event (≥15mm in 24h).",
  "cond_suelo_es": "Suelos ácidos a ligeramente ácidos (pH 5.5–6.5), bien drenados, con horizonte orgánico rico. Forma micorriza con pinos, hayas, robles y abetos.",
  "cond_suelo_ca": "Sòls àcids a lleugerament àcids (pH 5.5–6.5), ben drenats, amb horitzó orgànic ric. Forma micorriza amb pins, faigs, roures i avets.",
  "cond_suelo_en": "Acidic to slightly acidic soils (pH 5.5–6.5), well-drained with a rich organic horizon. Forms mycorrhiza with pines, beeches, oaks and firs.",
  "cond_req_es": "Especie ectomicorrizógena estricta; no fructifica sin árbol huésped adulto. El choque térmico otoñal es determinante. Aparece desde cotas medias (400m) hasta el límite del bosque (2000m).",
  "cond_req_ca": "Espècie ectomicorrizògena estricta; no fructifica sense arbre hoste adult. El xoc tèrmic de tardor és determinant. Apareix des de cotes mitjanes (400m) fins al límit del bosc (2000m).",
  "cond_req_en": "Strict ectomycorrhizal species; will not fruit without a mature host tree. Autumn thermal shock is key. Found from mid-elevations (400m) up to the treeline (2000m)."
}'::jsonb
WHERE id = 'esp-001';
```

---

## INPUT

Procesa las siguientes especies de la familia **[FAMILIA]**.
Genera el SQL para cada una siguiendo exactamente el formato del ejemplo.

```
[PEGAR AQUÍ LOS DATOS DE LAS ESPECIES EN FORMATO CSV O JSON]
```

### Formato de los datos de entrada

Cada especie tiene estos campos:

```
id: esp-XXX
scientific_name: Nombre especie
family: Familia
edibility: excelente | bueno | comestible | precaucion | toxico | mortal | no_comestible
temp_min_c: N | temp_opt_c: N | temp_max_c: N        ← °C
rain_min_mm: N | rain_opt_mm: N | cycle_days: N       ← mm y días hasta fructificación
forest_types: [lista]                                  ← pinar | hayedo | robledal | encinar
fruiting_months: [lista 1–12]
elevation_min_m: N | elevation_max_m: N               ← metros
requiere_helada: true/false
requiere_choque_termico: true/false
humedad_min: N | humedad_optima: N                    ← %
ph_suelo_min: N | ph_suelo_max: N
```

---

## CÓMO EXTRAER LOS DATOS DE ENTRADA (para Marcos)

Consulta en Supabase SQL Editor para obtener los datos de una familia:

```sql
SELECT
  id,
  scientific_name,
  family,
  edibility,
  temp_min_c, temp_opt_c, temp_max_c,
  rain_min_mm, rain_opt_mm, cycle_days,
  forest_types,
  fruiting_months,
  elevation_min_m, elevation_max_m,
  extra_data->>'requiere_helada'        AS requiere_helada,
  extra_data->>'requiere_choque_termico' AS requiere_choque_termico,
  extra_data->>'humedad_min'            AS humedad_min,
  extra_data->>'humedad_optima'         AS humedad_optima,
  extra_data->>'ph_suelo_min'           AS ph_suelo_min,
  extra_data->>'ph_suelo_max'           AS ph_suelo_max
FROM species
WHERE family = 'Boletaceae'   -- ← cambiar por la familia a procesar
ORDER BY id;
```

Copia el resultado (tabla o JSON), sustitúyelo en la sección `## INPUT` y envía el prompt.

> ⚠️ **Límite de contexto**: el JSON de Supabase es verboso. Mantener cada sesión
> por debajo de ~20 especies para evitar truncados. Ver tabla de sesiones abajo.

### Sesiones completadas y pendientes

| Sesión | Familias | Especies | WHERE clause | Estado |
|--------|----------|----------|--------------|--------|
| 1 | Boletaceae | 21 | `family = 'Boletaceae'` | ✅ `004_cond_fruct_boletaceae.sql` |
| 2 | Amanitaceae | 15 | `family = 'Amanitaceae'` | ✅ |
| 3 | Russulaceae | 22 | `family = 'Russulaceae'` | ✅ |
| 4 | Cantharellaceae | 7 | `family = 'Cantharellaceae'` | ✅ |
| 5 | Morchellaceae | 4 | `family = 'Morchellaceae'` | ✅ |
| 6 | Pleurotaceae | 5 | `family = 'Pleurotaceae'` | ✅ |
| A1 | Agaricaceae + Tricholomataceae | 23 | `family IN ('Agaricaceae','Tricholomataceae')` | 🔲 |
| A2 | Strophariaceae + Polyporaceae + Cortinariaceae | 27 | `family IN ('Strophariaceae','Polyporaceae','Cortinariaceae')` | 🔲 |
| A3 | Hygrophoraceae + Physalacriaceae + Psathyrellaceae | 20 | `family IN ('Hygrophoraceae','Physalacriaceae','Psathyrellaceae')` | 🔲 |
| B1 | Entolomataceae + Hymenogastraceae + Bankeraceae | 15 | `family IN ('Entolomataceae','Hymenogastraceae','Bankeraceae')` | 🔲 |
| B2 | Phallaceae + Helvellaceae + Tuberaceae + Mycenaceae | 14 | `family IN ('Phallaceae','Helvellaceae','Tuberaceae','Mycenaceae')` | 🔲 |
| C | Resto (familias de 1–2 sp, ~20 familias) | ~43 | ver query C abajo | 🔲 |

**Query C** (familias pequeñas):
```sql
WHERE family NOT IN (
  'Boletaceae','Amanitaceae','Russulaceae','Cantharellaceae',
  'Morchellaceae','Pleurotaceae','Agaricaceae','Tricholomataceae',
  'Strophariaceae','Polyporaceae','Cortinariaceae','Hygrophoraceae',
  'Physalacriaceae','Psathyrellaceae','Entolomataceae',
  'Hymenogastraceae','Bankeraceae','Phallaceae','Helvellaceae',
  'Tuberaceae','Mycenaceae'
)
```

> ⚠️ La sesión C tiene ~43 especies. Si Gemini se trunca, dividir en C1/C2 por tamaño.

### Tras recibir el SQL de Gemini

1. Revisar una muestra (2–3 especies) para verificar tono y datos numéricos
2. Acumular el SQL en `migrations/005_cond_fruct_resto.sql` (un bloque por sesión, separados por comentario `-- Sesión A1`, `-- Sesión A2`, etc.)
3. Ejecutar en Supabase SQL Editor al completar todas las sesiones (o por bloques si se prefiere ir validando)
4. Actualizar `migrations/README.md` con el nuevo fichero
