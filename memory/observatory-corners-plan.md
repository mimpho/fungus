# Observatory: «Mis rincones» (corners) — implementation plan

> Technical plan for turning saved points into **corners**: a manual kind, species tagged from the catalogue, up to five own photos and a map layer. Product design: the Claude Docs document «Observatorio: Mis rincones» (to be moved to `memory/product-ideas.md` when the work is integrated). Priority decided 2026-10-21: before the 7c–7f map layers.
> The name «rincón» is provisional; i18n keys are neutral (`obsCorner*`) so it can change in one place. The API route stays `/observatory/saved-points`.

## Decisions (2026-10-22)

1. **Only what the user writes and the coordinates are stored**, plus `elevation_m` (kept until the cards can read the elevation model). Everything a service or a model derives is computed when the corner is opened. Dropped from `saved_points`: `land_cover_*`, `forest_types`, `composition`, `toponym_*`, `cell_id`. Existing data in them is lost on purpose; the downgrade brings the columns back empty. This replaces the «composition stored with saved points» of `feat/observatory-composition` (5f).
2. **Kind** is a closed manual field, default `unspecified`: `unspecified`, `mushroom_site` (setal: mushrooms found, confirmed), `prospect` (paraje: potential or starting point, unconfirmed), `parking`. It is never computed; the UI only suggests switching to `mushroom_site` when a mushroom is tagged on an `unspecified` or `prospect` corner.
3. **Tagged species:** on the corner and on each photo, kept in step (2026-10-27): a species tagged on a photo is tagged on the corner; taken off a photo it leaves the corner unless another photo has it; taken off the corner it leaves every photo. Up to 50 per corner (abuse guard). Unknown ids are a 422.
4. **Photos:** at most 5 per corner; no format or resolution restriction on the client (HEIC accepted through `pillow-heif`); the original is used only to generate the copies and discarded; WebP in two sizes (thumbnail ≈600 px, large ≈1200 px on the long side, as the catalogue); EXIF orientation applied and EXIF (GPS included) removed; private Supabase Storage bucket, served with short-lived signed URLs. Deleting a corner or the account must delete the objects too (the DB cascade does not).
5. **Abuse controls instead of a total limit** (configurable, 0 = off): upload size 15 MB, pixel limit, photo uploads per user and day (30), new corners per user and day (50). No limit on total corners.
6. **Map layer «Mis rincones»:** on by default, independent of the probability layer, pins per kind (hex colours: Leaflet draws outside React) with `leaflet.markercluster`; a click opens the corner. The current list button stays and the profile gets the same list: a «Mis rincones» card in its «Siguiendo» tab opens the same dialog (changed 2026-10-29: it was to be a tab; a tab that only opened a dialog was not worth it, and four tabs do not fit a phone).
7. Supabase free plan: 1 GB storage, 5 GB egress, 50 MB per file; image transformations are not used (resizing happens in the backend). Keep an eye on the 1 GB / 5 GB if the Observatory spreads.

## Branches (cut from `epic/observatory`, squashed into it; the human does the git writes)

From branch 2 on each one is vertical (API + interface) so it can be reviewed on screen.

1. ✅ (integrated in `epic/observatory`, #142) `feat/observatory-corners-model` — migration 020 (`kind`; `saved_point_species`, `saved_point_photos`, `saved_point_photo_species`; the dropped columns), model, store, schemas, router (`kind` and `species_ids` on POST/PATCH, `all_species_ids` on reads), dead code of the author's forest types removed from `observatory.py`, tests. Frontend: the card no longer reads the stored toponym. The photo tables are created now; their endpoints come in branch 3.
2. ✅ (2026-10-23, reviewed on screen; mobile pass pending) `feat/observatory-corners-ui` — kind selector in the form, multiple species picker with cards (extracted from `SpeciesLayerPicker`; lazy images, capped results), copy «Guardar / Editar / Quitar rincón» in ES/CA/EN, the «Mis rincones» layer (in `MapLayersBox`), pins and clusters.
2b. `feat/observatory-ui-polish` (2026-10-23) — interface improvements made after branch 2 (charts, columns, buttons); no new feature. See `CHANGELOG.md`.
2c. `feat/observatory-ui-polish-2` (2026-10-24) — score breakdown with points per factor, corner cards scored by their tagged mushroom, zone subtitle with icons. See `CHANGELOG.md` and `decisions.md`.
3. ✅ (2026-10-24, first iteration; to refine on screen) `feat/observatory-corners-photos` — Supabase Storage client behind a protocol with a fake for tests, Pillow + `pillow-heif`, upload/list/tag/delete endpoints, signed URLs (1 h), species per photo, limits counted in `corner_usage_events` (migration 021: 30 uploads and 50 new corners per user and UTC day; 5 photos per corner; 15 MB; 60 Mpx), object cleanup on photo, corner and account deletion, uploader and viewer (a section of the edit dialog and of the corner card). A dev bucket, because the local `.env` points at production. Needs `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in Render (never in the front end). Details: `CHANGELOG.md`, `decisions.md`. Second iteration (2026-10-27): several uploads at once and drag and drop, full-screen viewer with tag and delete overlays, tag pills, species mirrored with the photos, edit dialog as a bottom sheet on phones, `no-store` for corners.
4. ✅ (2026-10-29, built, to verify on screen) `feat/profile-corners-tab` — the «Mis rincones» dialog is one list for the Observatory and the profile: search (name or toponym), filters (kind, comarca, forest) and order, no «apply»; a «Mis rincones» card in the profile's «Siguiendo» tab opens it. Front end only; place, forest and score are asked from the browser (`useCornerInsights`). Details: `CHANGELOG.md`, `decisions.md`.

## Open

- Photos: staged upload in the create dialog (today photos come after saving); several tagged species vs the corner card's single-species score; photo count in the saved list.
- Check the weight of `photo_url` in the species list on the real database (generated images may be `data:` URIs, see `decisions.md`).
- How «rincón» sounds in Catalan and English.
- Future idea, out of scope: join a parking corner and mushroom sites in a route.
