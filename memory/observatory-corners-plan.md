# Observatory: «Mis rincones» (corners) — implementation plan

> Technical plan for turning saved points into **corners**: a manual kind, species tagged from the catalogue, up to five own photos and a map layer. Product design: the Claude Docs document «Observatorio: Mis rincones» (to be moved to `memory/product-ideas.md` when the work is integrated). Priority decided 2026-10-21: before the 7c–7f map layers.
> The name «rincón» is provisional; i18n keys are neutral (`obsCorner*`) so it can change in one place. The API route stays `/observatory/saved-points`.

## Decisions (2026-10-22)

1. **Only what the user writes and the coordinates are stored**, plus `elevation_m` (kept until the cards can read the elevation model). Everything a service or a model derives is computed when the corner is opened. Dropped from `saved_points`: `land_cover_*`, `forest_types`, `composition`, `toponym_*`, `cell_id`. Existing data in them is lost on purpose; the downgrade brings the columns back empty. This replaces the «composition stored with saved points» of `feat/observatory-composition` (5f).
2. **Kind** is a closed manual field, default `unspecified`: `unspecified`, `mushroom_site` (setal: mushrooms found, confirmed), `prospect` (paraje: potential or starting point, unconfirmed), `parking`. It is never computed; the UI only suggests switching to `mushroom_site` when a mushroom is tagged on an `unspecified` or `prospect` corner.
3. **Tagged species:** on the corner and on each photo. The corner's species list is the union, once each. Up to 50 per corner (abuse guard). Unknown ids are a 422.
4. **Photos:** at most 5 per corner; no format or resolution restriction on the client (HEIC accepted through `pillow-heif`); the original is used only to generate the copies and discarded; WebP in two sizes (thumbnail ≈600 px, large ≈1200 px on the long side, as the catalogue); EXIF orientation applied and EXIF (GPS included) removed; private Supabase Storage bucket, served with short-lived signed URLs. Deleting a corner or the account must delete the objects too (the DB cascade does not).
5. **Abuse controls instead of a total limit** (configurable, 0 = off): upload size 15 MB, pixel limit, photo uploads per user and day (30), new corners per user and day (50). No limit on total corners.
6. **Map layer «Mis rincones»:** on by default, independent of the probability layer, pins per kind (hex colours: Leaflet draws outside React) with `leaflet.markercluster`; a click opens the corner. The current list button stays; a «Mis rincones» tab is added to the profile.
7. Supabase free plan: 1 GB storage, 5 GB egress, 50 MB per file; image transformations are not used (resizing happens in the backend). Keep an eye on the 1 GB / 5 GB if the Observatory spreads.

## Branches (cut from `epic/observatory`, squashed into it; the human does the git writes)

From branch 2 on each one is vertical (API + interface) so it can be reviewed on screen.

1. 🔶 `feat/observatory-corners-model` — migration 020 (`kind`; `saved_point_species`, `saved_point_photos`, `saved_point_photo_species`; the dropped columns), model, store, schemas, router (`kind` and `species_ids` on POST/PATCH, `all_species_ids` on reads), dead code of the author's forest types removed from `observatory.py`, tests. Frontend: the card no longer reads the stored toponym. The photo tables are created now; their endpoints come in branch 3.
2. `feat/observatory-corners-ui` — kind selector in the form, multiple species picker with cards (extracted from `SpeciesLayerPicker`; lazy images, capped results), copy «Guardar / Editar / Quitar rincón» in ES/CA/EN, the «Mis rincones» layer (in `MapLayersBox`), pins and clusters.
3. `feat/observatory-corners-photos` — Supabase Storage client behind a protocol with a fake for tests (a dev bucket, because the local `.env` points at production), Pillow + `pillow-heif`, upload/delete endpoints, signed URLs, tagging species per photo, anti-abuse limits, object cleanup on corner and account deletion, uploader and viewer. Needs `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in Render (never in the frontend).
4. `feat/profile-corners-tab` — «Mis rincones» tab in the profile with a filter by kind.

## Open

- Check the weight of `photo_url` in the species list on the real database (generated images may be `data:` URIs, see `decisions.md`).
- How «rincón» sounds in Catalan and English.
- Future idea, out of scope: join a parking corner and mushroom sites in a route.
