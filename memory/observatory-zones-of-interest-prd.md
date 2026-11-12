# PRD — Zones of interest: public corners created by the administrator (`epic/observatory-zones-of-interest`)

> Product Requirements Document. Written before the first feature branch.
> Once all Open questions are resolved and DoD is written, development can start.
> Last updated: 2026-11-12
>
> Status: **order and two decisions approved by Marcos on 2026-11-12 (pins; cut in two); the rest of the open questions are pending.** Item 3 of `memory/pending.md`. Its entry point is the **Zonas** tab of `epic/observatory-navigation` (merged, v7.4.0), whose row «Zonas de interés» is inert with «Pronto».
> **Replaces** sections 6.2 (own table `points_of_interest`) and 6.3 (API) of the draft PRD «El Observatorio como página principal» kept in the Fungus Project (not in the repo). It keeps 6.1 (a short curated list, 10–15 places) and 6.4 (every place inside the cells already loaded).
> Related: [`observatory-species-filter-prd.md`](observatory-species-filter-prd.md) (defines the species filter; this PRD applies it to the zones of interest).
> Order in the roadmap (decided 2026-11-12): species filter → rain (`epic/observatory-meteo`) → zones of interest.
> **Marked in the text:** «Decided» = said by Marcos on 2026-11-12. «Proposal» = proposed by Claude, to be confirmed.

---

## Problem / Why

The Observatory already scores any coordinate, but a new user sees an empty map of Catalonia and does not know where to tap. The Zones page (a list of static zones) is being retired in favour of the Observatory, and the only thing it gave was a **guided entry point**: named places to look at.

Zones of interest fill that gap: named map points, curated by the administrator and visible to everyone.

**Core idea (decided):** a zone of interest **is a corner, but public**. The only difference is who creates it and who sees it. Reusing the corners' model avoids opening a divergence with the public zones each time the corners change (new fields, tags, photos).

---

## Phasing (decided 2026-11-12)

This is the full-stack epic (migration, endpoint, permissions), so it is cut in two to be merged into `main` on the cadence:

| Cut | Content |
|---|---|
| **1** | Visibility column and permissions on the server (with the privacy test); endpoint by bbox; the administrator creates, edits and deletes from the interface; **pins** on the map and the «Zonas de interés» row with its list; the point card with *Observar* and *Añadir como rincón*; 10–15 zones created from the interface |
| **2** | Photos of public zones (signed URL for any signed-in user, Q6); species tags as «seen here»; the dynamic species filter; clustering (Q8) |

**Pins, not outlines (decided 2026-11-12):** a zone of interest is drawn as a pin. This **corrects rule 5 of the navigation PRD** («Zonas de interés (dashed outline)»), which was written before the model of a public corner existed.

---

## Model

**Decided: a single table (`saved_points`) with a visibility field.**

| | Private (corner) | Public (zone of interest) |
|---|---|---|
| Who creates, edits and deletes it | The owner | **The administrator only** |
| Who sees it | Its owner only | Everyone, read-only |
| Fields | Name, kind, tagged species, notes, photos, coordinates | The same |
| Species tags and photos | The owner | The administrator |

This changes what the draft PRD of the base map foresaw (an own table because of the account-deletion policy). That reason is solved with a deletion rule (see Q2).

---

## Scope

### In — must ship

| Feature | Notes |
|---|---|
| Visibility field on `saved_points` | **Private** by default; everything existing stays private. Reversible migration. |
| Permissions on the server | Only the admin role (`users.role = 'admin'`) creates, edits or deletes public rows; checked in the back end, not only in the interface. Users see public rows read-only. |
| Privacy of the queries | Every query for a user's own corners always filters by user **and** private. A mistake there would expose private corners, so it has its own test. |
| Zones-of-interest endpoint | `GET` of the public rows inside the visible area (bbox), with the same authentication as the rest of the Observatory (`fetchPointsOfInterest(bbox)` of item 3 in `pending.md`). |
| Actions of the zone to observe | **Decided: two actions**, *Observar* and *Añadir como rincón*. There is no third action for zones of interest. |
| Private / Public switch | **Decided:** only the administrator sees it, in the *Añadir como rincón* form. On «Pública» it becomes a zone of interest. A normal user has no switch: their corner is always private. |
| Notice when publishing | **Proposal:** text next to the switch («Visible to everyone as a zone of interest») and the button changes from «Guardar rincón» to «Guardar zona de interés». Turning a public one private asks for confirmation (it disappears for everyone). |
| Photos and species tags | **Cut 2.** **Decided:** the administrator can add and remove photos and tag species on a public zone, with the same flow as the corners. The tags are informative (see «Species filter»). |
| «Zonas de interés» row active | In the Zonas tab: checkbox + «Ver listado» with the count in the badge. The list reuses the corners' one (`SavedPointsList`, `ObsModal`); the administrator also sees edit and delete. |
| Markers on the map | Pins with their own style (in the navigation PRD's draw order: dashed outline). Tapping a pin opens the same point card, with the zone's name and description. |
| Species filter | **Cut 2.** Dynamic, see the next section. |
| Account deletion | Deleting an account removes only the user's **private** corners; public zones are kept (see Q2). |
| Per-user limits | Public zones **do not count** in the per-user caps (corners per day, photos, etc.). |
| Initial data | Between 10 and 15 zones, created by the administrator **from the interface itself**, not from a file in the repo (see Deployment readiness). |

### Out — explicitly excluded

| Feature | Reason / deferred to |
|---|---|
| Suggestions, ratings or comments by users on the zones | Not asked for; it opens moderation. |
| Own pages with editorial content | A public zone is a corner: name, short description, species, the administrator's photos. |
| Migrating the ~40 static zones as corners | Already out of scope in the base-map PRD. |
| Removing the `zones` table, the daily ingest or the `/zones` endpoints | Later phase, when nothing consumes them. |
| Top 10 calculation | Its own epic (7f). |
| Photo upload by normal users on public zones | Only the administrator manages photos on public ones. |

---

## Species filter

It relies on [`observatory-species-filter-prd.md`](observatory-species-filter-prd.md): with a species active on the map, the zones-of-interest row adapts.

**Decided on 2026-11-12: the filter is dynamic, based on the conditions.** It is computed with that species' score at the point (soil, forest, altitude and weather). It is an **index of favourable conditions, not a guarantee**, because whether there is mycelium is not known.

**The tags are informative.** They describe what the administrator has seen or wants to highlight («this species has been seen here»), and they do **not** filter. Mixing them with the score would mislead the user: the tag is a fact and the score is a prediction.

**How it is computed (to verify before planning an endpoint):** the conditions layer already holds the cell values of the chosen species and the front end can work out the score at any latitude and longitude (`pixelScore(reliefGrid(…), data, habitat, lat, lon)` is what the point card uses). Scoring 10–15 pins may therefore need **no new endpoint** and no call per zone; what each pin needs is its `habitat` (forest and soil at the point), which the class rasters give. Check it in the code at the start of cut 2.

**How the low-scoring ones are shown** (Marcos: «we fine-tune it when we build it»):
- **Proposal:** dim them and sort by score, with a configurable threshold to hide them only if wanted.

**Contrast with Mis rincones.** There the filter is by tag, because what is tagged is what the user has found. In the zones of interest it is dynamic. If «reference place for the porcini» is wanted later, the tags are there.

With no species, all of them are shown.

---

## User flows

**Flow 1 — The administrator creates a zone of interest**
1. Signed in as administrator, they tap some coordinates on the map.
2. In the point card they choose *Añadir como rincón*.
3. In the form they turn on the **Pública** switch (the notice appears and the button becomes «Guardar zona de interés»).
4. They enter a name and a short description, tag species and add photos, and save.
5. The zone appears for all users on the map and in the list.

**Flow 2 — A new user discovers a zone**
1. They open the Observatory and turn on Zonas › Zonas de interés (or use «Ver listado»).
2. They see the named pins. They tap one.
3. The card shows name, description and species; it offers *Observar* and *Añadir como rincón* (see Q4).
4. They press *Observar* and see the score, forecast and calendar of that point.

**Flow 3 — With a species active**
1. The user picks «Boletus edulis» in the search (see the other PRD).
2. The zones of interest are sorted by that species' score; the ones not in condition are dimmed.
3. The tags stay visible as «seen here».

**Flow 4 — The administrator unpublishes a zone**
1. They edit the zone and set the switch to **Privada**.
2. The confirmation appears («It disappears for all users»).
3. The zone becomes one of their own corners.

---

## Open questions

| # | Question | Owner | Answer |
|---|---|---|---|
| 1 | **A single table with a visibility field, or an own table?** | Marcos | ✅ **One table with a visibility field** (2026-11-12): it avoids divergences with the corners. |
| 2 | **Account deletion of the administrator.** The public zones should not disappear. | Marcos | ⬜ Pending. Proposal: deletion removes only private rows; public ones become owned by the system (owner null). There is only one administrator account, but it has to be defined. |
| 3 | **Threshold and presentation of the species filter** (dim, sort, hide). | Marcos | ⬜ «Fine-tune when building». Proposal: dim and sort; hide only with a configurable threshold. |
| 4 | **Can a normal user add a zone of interest as their own corner** (a private copy with name, coordinates and species)? | Marcos | ⬜ Pending. Proposal: yes, one gesture, and the copy remembers which zone it comes from so the pin is not drawn twice. |
| 5 | **Duplicate pin** if that copy exists. | Marcos | ⬜ Pending. Proposal: the public pin is marked as saved and the corner is not drawn on top. |
| 6 | **Photos of public zones.** Today the photos of a corner are seen only by its owner (signed URL). | Marcos | ⬜ Pending. Photos by the administrator: **decided**. How others see them is open (a signed URL for any signed-in user) and they must not count in the limits. |
| 7 | **Name and description in ES / CA / EN?** The base-map PRD foresaw it; corners carry free text in one language. | Marcos | ⬜ Pending. Proposal: a single text field at first; translations, if asked for, as an improvement. |
| 8 | **Clustering the pins** at low zoom. | Marcos | ⬜ Pending. The corners already use `leaflet.markercluster`; proposal: reuse it. |
| 9 | **Which 10–15 places**, with their names, coordinates and species. Five are already mentioned: Sercases, La Molina, El Brull, Fageda del Montseny and Puigcerdà. | Marcos | ⬜ Pending (Marcos provides the data). |
| 10 | **Administration:** is editing from the card and the list enough, or is a separate view needed? | Marcos | ⬜ Pending. Proposal: the list with edit and delete, no new view. |

---

## Deployment readiness

- **Migration:** a visibility column on `saved_points` (private by default); depending on Q2, the owner admits null (today it is a foreign key with cascade, which has to be rethought); depending on Q4, a column that remembers the zone a copy comes from; an index for the query by visibility and area. Reversible (the downgrade restores the previous state). Order: migration → back end → front end. Per the project rule, Marcos applies the migration and auto-migration runs only in production; the Supabase procedure is followed (read-only check first, copy of the affected rows, apply one by one, check after, commented rollback).
- **Environment variables:** none new expected.
- **Storage:** photos reuse the existing private bucket; how they are signed for other users is to be defined (Q6).
- **Licences and attributions:** no new sources.
- **Data:** (Marcos provides the places, Q9.) The zones are created **from the interface as administrator**, not with a data file in the repo, because **exact foraging coordinates never go into the repo or the Project**. The coordinates of a public zone are public by definition: it must be clear when the switch is turned on, and the administrator must not publish a place they want to keep secret.
- **Open-Meteo quota:** every zone must fall inside the cells already loaded, so a user's first tap does not spend quota (6.4 of the base-map PRD). **Dependency to check before starting:** the load of the 423 cells in production (`ingest_cells.py load`, item 4 of the v7.2 deploy block in `memory/pending.md`) and the daily `cell_refresh` running.
- **Rollback:** downgrade the migration and revert the merge; the public zones would become private rows of the administrator, nothing is lost.
- **To check after deploy:** that a normal user does not see other users' private corners and cannot create, edit or delete public ones (tested with two accounts); that the zones appear on phone and desktop; ES / CA / EN, light and dark.

---

## Definition of Done

- [ ] One table with visibility; everything previous stays private.
- [ ] Only the administrator creates, edits and deletes public rows, checked on the server with tests.
- [ ] A test that a private corner never leaks to another user or to the public list.
- [ ] The administrator's form has the Private / Public switch with notice, button change and confirmation when unpublishing.
- [ ] A normal user sees only *Observar* and *Añadir como rincón*, with no switch.
- [ ] The «Zonas de interés» row of the Zonas tab works: markers, card, list with counter.
- [ ] With a species active, the zones are sorted and dimmed by score; the tags are shown as informative data.
- [ ] Account deletion keeps the public ones; the public ones do not count in the per-user limits.
- [ ] Between 10 and 15 zones created from the interface, all inside the loaded cells.
- [ ] Open questions answered or consciously deferred, and written in `memory/decisions.md`.
- [ ] Deployment readiness checked.
- [ ] ES / CA / EN, light and dark, iOS Safari and Android Chrome checked.
- [ ] Branches squash-merged into the epic; retrospective done; `epic/observatory-zones-of-interest` merged to `main` with `--no-ff` and tagged.
