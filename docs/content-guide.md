# Fungus — Content Addition Guide

Guide for adding new species and zones to the catalog.
Covers both the frontend mock (immediate) and the backend/Supabase sync (production).

> **Related**: for bulk image downloads, seed script, and other utility scripts, see [`docs/scripts-guide.md`](./scripts-guide.md).

---

## Image sources

### Species images

**Primary source: [iNaturalist](https://www.inaturalist.org/)**

Search by scientific name (e.g. `Chroogomphus rutilus`). Filter by:
- License: CC BY or CC BY-NC (both allow reuse with attribution)
- Quality: "Research Grade" observations only
- Photo type: pick the clearest cap + stem shots

Download the **original** resolution. We resize locally to two sizes:

| Variant | Filename pattern | Approx. dimensions | Usage |
|---|---|---|---|
| Thumbnail | `esp-XXX-main.jpg` | ~600×400 px | Card grid, modal header |
| Large | `esp-XXX-main-large.jpg` | ~1200×800 px | Lightbox, full-screen |
| Gallery 1 | `esp-XXX-foto1.jpg` / `esp-XXX-foto1-large.jpg` | same as above | Modal gallery tab |
| Gallery 2 | `esp-XXX-foto2.jpg` / `esp-XXX-foto2-large.jpg` | same as above | Modal gallery tab |

Place all files under:
```
public/assets/images/content/species/
```

**Attribution**: record the iNaturalist observation URL and author in a comment next to the species entry in `src/data/species.js` if the license requires attribution (CC BY does; CC BY-NC does too).

### Zone images

Not currently used. If added in the future, follow the same iNaturalist workflow, searching by location/habitat keywords.

---

## Data sources

### Species data

In order of preference:

1. **iNaturalist taxon page** (`inaturalist.org/taxa/<scientific-name>`) — range maps, observation counts, linked references.
2. **Wikipedia** (any language — EN, ES, CA) — morphology, habitat, edibility, confusions, synonyms. Catalan Wikipedia often has the best detail for Iberian species.
3. **MycoKey** (`mycokey.com`) — authoritative morphological keys, spore data.
4. **GBIF** (`gbif.org`) — distribution data, taxonomic backbone, accepted name vs. synonyms.
5. **Index Fungorum** (`indexfungorum.org`) — canonical taxonomy, basionym, all known synonyms.

### Zone data

1. **IGN / CNIG** (`ign.es`) — elevation, coordinates, official place names.
2. **OpenStreetMap** — forest type, administrative boundaries.
3. **MITECO forest map** — species composition, official forest type classification.

---

## Adding a new species — step by step

### Step 1 — Collect data

Before writing any code, gather:

- [ ] Accepted scientific name (verify on Index Fungorum or GBIF)
- [ ] All known synonyms (basionym + main combinations)
- [ ] Common names: at least ES + CA; EN if available
- [ ] Family (current accepted classification)
- [ ] Edibility: `excelente | bueno | comestible | precaucion | no_comestible | toxico | mortal`
- [ ] Fruiting months (1-based array, e.g. `[8,9,10,11]`)
- [ ] Forest types: `pinar | hayedo | robledal | encinar | mixto`
- [ ] Elevation range (min/max metres)
- [ ] Cap: shape, color, diameter, surface texture
- [ ] Stem: shape, color, height, diameter
- [ ] Flesh: color, texture, smell, taste
- [ ] Spore print color
- [ ] OI parameters: `temp_optima_min/max`, `humedad_min/optima`, `precip_14dias_min/max`, `requiere_helada`, `requiere_choque_termico`, `dias_hasta_fructificacion`
- [ ] Confusion species (especially any toxic/mortal lookalikes)
- [ ] Distribution (free-text array, e.g. `["Europa", "España", "pinares de la Península"]`)

### Step 2 — Get images

1. Go to `https://www.inaturalist.org/taxa/<scientific-name>` (replace spaces with `-`)
2. Open the **Photos** tab → filter by Research Grade + open license
3. Download 3 photos: one main (characteristic cap view), two gallery shots
4. Resize to thumbnail + large variants (see table above)
5. Name files following the pattern: `esp-XXX-main.jpg`, etc.
   - `XXX` = next available ID (check the last entry in `src/data/species.js`)
6. Place in `public/assets/images/content/species/`

### Step 3 — Add to frontend mock (`src/data/species.js`)

Append a new object to the `mockSpecies` array. Full field reference:

```js
{
  id: "esp-XXX",                        // sequential, check last entry
  scientificName: "Genus species",      // accepted name (verify on Index Fungorum)
  commonNames: ["Name ES", "Name CA"],  // Spanish first, Catalan second, English optional
  family: "Familyaceae",                // exact string — must match families.js and CONFUSIONES_POR_FAMILIA key
  edibility: "comestible",              // see Edibility values table below
  forestTypes: ["pinar"],               // array: pinar | hayedo | robledal | encinar | mixto
  fruitingMonths: [8,9,10,11],          // 1-based month numbers — see Fruiting calendar below
  description: "...",                   // 2–4 sentences: key ID features + safety note if toxic

  // Morphology — shown in the "Morphology" tab of SpeciesModal
  cap:   { forma: "...", color: "...", diametro: "X–Y cm", superficie: "..." },
  stem:  { forma: "...", color: "...", altura: "X–Y cm",   diametro: "X–Y cm" },
  flesh: { color: "...", textura: "...", olor: "...", sabor: "..." },
  sporePrint: "Color del depósito de esporas",  // critical for ID, especially Cortinarius vs. Chroogomphus

  // Distribution
  altitud_min: 200, altitud_max: 1500,    // metres
  distribucion: ["Europa", "España", "..."], // free-text array, shown as bullets in modal

  // Images — see Image sources section
  photo: { url: "assets/images/content/species/esp-XXX-main.jpg",
           largeUrl: "assets/images/content/species/esp-XXX-main-large.jpg" },
  photos: [
    { url: "assets/images/content/species/esp-XXX-foto1.jpg",
      largeUrl: "assets/images/content/species/esp-XXX-foto1-large.jpg" },
    { url: "assets/images/content/species/esp-XXX-foto2.jpg",
      largeUrl: "assets/images/content/species/esp-XXX-foto2-large.jpg" },
  ],

  // OI scoring parameters — used by the Outbreak Index algorithm
  temp_optima_min: 8.0,   temp_optima_max: 16.0,   // °C range where fruiting peaks
  humedad_min: 55.0,      humedad_optima: 70.0,     // % relative humidity
  precip_14dias_min: 20.0, precip_14dias_max: 60.0, // mm over 14 days
  requiere_helada: false,          // true if needs frost shock to trigger fruiting
  requiere_choque_termico: false,  // true if needs sharp temperature drop
  dias_hasta_fructificacion: 7,    // days from rain event to visible fruiting body
}
```

#### Edibility values

| Value | Label | Color | Use for |
|---|---|---|---|
| `excelente` | Excelente | emerald | Top-quality edibles (Boletus edulis, Cantharellus…) |
| `bueno` | Bueno | green | Good edibles (Macrolepiota procera…) |
| `comestible` | Comestible | lime | Edible but mediocre or requires prep (Chroogomphus rutilus…) |
| `precaucion` | Precaución | yellow | Edible only if cooked, or individual reactions (Armillaria mellea, Lactarius…) |
| `no_comestible` | No comestible | gray | No culinary value, not harmful |
| `toxico` | Tóxico | amber | Causes poisoning, not fatal (Amanita muscaria, Omphalotus…) |
| `mortal` | Mortal | red | Can cause death (Amanita phalloides, Cortinarius orellanus…) |

#### Fruiting calendar reference

`fruitingMonths` is a 1-based array of integers. Include every month where fruiting is likely, not just peak months.

| Season | Months | Typical species |
|---|---|---|
| Spring | 3,4,5 | Morchella, Calocybe gambosa, Marasmius oreades |
| Summer | 6,7,8 | Boletus reticulatus, Cantharellus (high altitude) |
| Autumn (main) | 8,9,10,11 | Boletus edulis, Lactarius, Russula, Chroogomphus rutilus |
| Winter / mild | 11,12,1,2 | Flammulina velutipes, Pleurotus ostreatus, Tuber melanosporum |
| Year-round | 1–12 | Ganoderma lucidum, Trametes versicolor |

Chroogomphus rutilus example: `[8,9,10,11]` — late summer through late autumn.

---

#### Synonyms (`SPECIES_SYNONYMS` in `src/data/species.js`)

Add to the object at the bottom of the file:

```js
'Genus species': ['OldGenus species Autor', 'Another oldname Autor'],
```

Use Index Fungorum to find the full list. Include basionym and main combinations. At minimum include the name by which the species was known in older field guides (most common source of confusion in synonym search).

---

#### Families (`src/data/families.js`)

If the species belongs to a family not yet in `mockFamilies`, add it:

```js
{
  id: "fam-XXX",           // sequential
  name: "Familyaceae",     // exact spelling — must match species.family
  description: "...",      // 1–2 sentences on the family's key traits
  // optional: knownSpecies, characteristics, habitat
}
```

Currently documented families: Boletaceae, Amanitaceae, Cantharellaceae, Russulaceae, Morchellaceae, Cortinariaceae, Tuberaceae, Agaricaceae, Strophariaceae, Entolomataceae, Hygrophoraceae, Gomphidiaceae, Tricholomataceae, Pleurotaceae.

---

#### Confusion species (`CONFUSIONES_POR_FAMILIA` in `src/lib/helpers.jsx`)

This object powers the **Confusions tab** in every SpeciesModal. It is keyed by family name. When a species is opened, the app loads its family's block and shows all entries **except the species itself**.

Entry format:

```js
{
  name: 'Scientific name',            // exact scientificName of the lookalike
  risk: 'mortal',                     // free text shown as badge — see Risk labels below
  icon: '☠️',                         // emoji prefix in the badge
  borderColor: 'border-red-500/50',   // Tailwind class for card border
  nameColor: 'text-red-400',          // Tailwind class for name text
  diff: 'Clave diferencial...',       // 1–3 sentences: HOW to tell them apart visually
}
```

**Risk → icon and color mapping:**

| Risk level | `risk` text | `icon` | `borderColor` | `nameColor` |
|---|---|---|---|---|
| Excelente / edible | `'excelente'` | `'⭐'` | `'border-emerald-500/30'` | `'text-emerald-400'` |
| Comestible | `'comestible'` | `'✅'` | `'border-emerald-500/20'` | `'text-emerald-300'` |
| Precaución | `'precaución'` | `'⚠️'` | `'border-amber-500/40'` | `'text-amber-400'` |
| Tóxico / sospechoso | `'tóxico en crudo'` etc. | `'⚠️'` | `'border-amber-500/40'` | `'text-amber-400'` |
| Mortal | `'mortal'` | `'☠️'` | `'border-red-500/50'` | `'text-red-400'` |
| Informativo | `'no comestible'` | `'ℹ️'` | `'border-blue-500/30'` | `'text-blue-400'` |

**Bidirectionality rule:** confusions must be entered in both directions.

- If species A (family X) can be confused with species B (family Y), add B's entry into family X's block AND A's entry into family Y's block.
- Example: Chroogomphus rutilus (Gomphidiaceae) ↔ Cortinarius orellanus (Cortinariaceae): entry exists in both `Gomphidiaceae` and `Cortinariaceae` blocks.
- If both species are in the same family, one block entry covers both (each sees the other automatically, since the app filters out the species being viewed).

**Fallback:** if a species' family has no block in `CONFUSIONES_POR_FAMILIA`, the UI shows `CONFUSION_GENERICA` — a generic warning about looking for lookalikes within the same genus. Always add a proper block for toxic or mortal families.

### Step 4 — Add to backend (Supabase) ⚠️ Bloqueante

The backend is the source of truth in production. **A species added only to the frontend mock will disappear from the catalog as soon as `useSpecies` finishes loading from the API** — this happens both in local dev and in production. Do not skip this step.

**For a single new species → Supabase SQL Editor (recommended)**

Create a file `migrations/NNN_esp-XXX_species_name.sql` and run it in the Supabase dashboard → SQL Editor. No need to touch `seed_catalog.py`. Use `ON CONFLICT (id) DO UPDATE` so it is safe to re-run.

Full field reference and a worked example: [`migrations/001_esp202_chroogomphus_rutilus.sql`](../migrations/001_esp202_chroogomphus_rutilus.sql)

```sql
-- ⚠️  common_names, description, oi_params are NOT columns.
-- OI params → individual columns (temp_min_c etc.)
-- Everything else → extra_data JSONB (see app/models/species.py)
INSERT INTO species (
  id, scientific_name, family, edibility,
  temp_min_c, temp_opt_c, temp_max_c,
  rain_min_mm, rain_opt_mm, cycle_days,
  forest_types, fruiting_months,
  elevation_min_m, elevation_max_m,
  extra_data
) VALUES (
  'esp-XXX', 'Genus species', 'Familyaceae', 'comestible',
  8.0, 12.0, 16.0,
  20, 60, 7,
  ARRAY['pinar'], ARRAY[9,10,11],
  200, 1500,
  '{
    "commonNames": ["Nombre ES", "Nombre CA"],
    "description": "Descripción completa...",
    "photo":  {"url":"assets/images/content/species/esp-XXX-main.jpg","largeUrl":"..."},
    "photos": [{"url":"...","largeUrl":"..."}],
    "cap":    {"forma":"...","color":"...","diametro":"X-Y cm","superficie":"..."},
    "stem":   {"forma":"...","color":"...","altura":"X-Y cm","diametro":"X-Y cm"},
    "flesh":  {"color":"...","textura":"...","olor":"...","sabor":"..."},
    "sporePrint": "...",
    "distribucion": ["Europa", "España", "..."],
    "synonyms": ["OldGenus species Autor"],
    "humedad_min": 55.0, "humedad_optima": 70.0,
    "requiere_helada": false, "requiere_choque_termico": false
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  scientific_name=EXCLUDED.scientific_name, family=EXCLUDED.family,
  edibility=EXCLUDED.edibility,
  temp_min_c=EXCLUDED.temp_min_c, temp_opt_c=EXCLUDED.temp_opt_c, temp_max_c=EXCLUDED.temp_max_c,
  rain_min_mm=EXCLUDED.rain_min_mm, rain_opt_mm=EXCLUDED.rain_opt_mm, cycle_days=EXCLUDED.cycle_days,
  forest_types=EXCLUDED.forest_types, fruiting_months=EXCLUDED.fruiting_months,
  elevation_min_m=EXCLUDED.elevation_min_m, elevation_max_m=EXCLUDED.elevation_max_m,
  extra_data=EXCLUDED.extra_data;
```

`extra_data` stores everything that isn't a dedicated column: nombres comunes, descripción, fotos, morfología (cap/stem/flesh), sinónimos, distribución y parámetros de humedad. El frontend lo desempaqueta en `normalizeSpeciesDetail()`. Ver schema completo en `app/models/species.py`.

> **For bulk re-sync** (e.g. after many mock changes or a first deploy): use `backend/scripts/seed_catalog.py` instead. It reads `mockSpecies` directly via Node.js and upserts everything in one pass. Requires the backend Python environment and `DATABASE_URL` — see `docs/scripts-guide.md`.

### Step 5 — Verify

- [ ] Species appears in `/especies` catalog
- [ ] SpeciesModal opens with correct morphological data
- [ ] Photos load (no 404 in browser Network tab)
- [ ] Family section visible in modal
- [ ] Confusion block shows correct lookalikes
- [ ] Synonyms appear in taxonomy section
- [ ] Species appears when filtering by its fruiting month

---

## Adding a new zone — step by step

### Step 1 — Collect data

- [ ] Official name
- [ ] Province + Comunidad Autónoma
- [ ] Comarca / region (informal name)
- [ ] Coordinates (lat/lng) — use IGN or Google Maps
- [ ] Elevation (metres) — use IGN viewer or topographic map
- [ ] Forest type: `pinar | hayedo | robledal | encinar | mixto`
- [ ] Short description (1–2 sentences about the area)

### Step 2 — Add to frontend mock (`src/data/zones.js`)

Append a new object to `mockZones` with the next sequential ID (`zone-XXX`).

### Step 3 — Add to backend (Supabase)

```sql
INSERT INTO zones (
  id, name, province, region,
  lat, lon, elevation_m, forest_type,
  description, active
) VALUES (
  'zone-029',
  'Hayedo de Montejo',
  'Madrid',
  'Sierra Norte de Madrid',
  41.0833, -3.5667,
  1300,
  'hayedo',
  'El hayedo más meridional de Europa...',
  true
);
-- geom column is generated automatically from lat/lon (PostGIS GENERATED ALWAYS AS)
-- Do NOT insert geom directly
```

### Step 4 — Verify

- [ ] Zone appears in `/zonas` map and list
- [ ] ZoneModal opens with correct data
- [ ] Weather data loads for the zone (backend fetches from Open-Meteo by coordinates)
- [ ] Zone appears in Dashboard top zones if conditions are good

---

## Pending content (known gaps)

| Item | Status | Notes |
|---|---|---|
| `esp-202` Chroogomphus rutilus images | ❌ Missing | iNaturalist blocked in VM — download manually: `https://www.inaturalist.org/taxa/chroogomphus-rutilus` → 3 fotos CC BY/CC BY-NC → resize → `public/assets/images/content/species/esp-202-{main,foto1,foto2}{,-large}.jpg` |
| `esp-202` backend sync | ❌ Missing | SQL ready in `migrations/001_esp202_chroogomphus_rutilus.sql` — run in Supabase dashboard |
| `esp-201` backend sync | ❓ Verify | Butyriboletus regius — confirm it's in Supabase |
