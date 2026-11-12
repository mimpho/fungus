# PRD — One species filter for the whole map (`epic/observatory-species-filter`)

> Product Requirements Document. Written before the first feature branch.
> Once all Open questions are resolved and DoD is written, development can start.
> Last updated: 2026-11-12
>
> Status: **scope and order approved by Marcos on 2026-11-12** (phasing below; the UI questions still open are settled per task). Born from item 7 of `memory/pending.md` («One species filter for the whole map»), raised by Marcos on 2026-11-12 during T4 of `epic/observatory-navigation`, which is now merged into `main` (v7.4.0). Cut from `main`.
> Related: [`observatory-zones-of-interest-prd.md`](observatory-zones-of-interest-prd.md) (the zones' species filter depends on this one) and [`observatory-navigation-prd.md`](observatory-navigation-prd.md) (the Meteo / Zonas / Bosque tabs).
> Order in the roadmap (decided 2026-11-12): species filter → rain (`epic/observatory-meteo`) → zones of interest.
> **Marked in the text:** «Decided» = said by Marcos on 2026-11-12. «Proposal» = proposed by Claude, to be confirmed.

---

## Problem / Why

The species filter lives **inside the Meteo · Condiciones panel** («Filtrar por seta»). But the user's question crosses layers: *«where do I look for the porcini?»* affects the conditions, the forests where it grows, the best places and the corners where it has already been seen. With the filter inside one tab, the rest of the map ignores the chosen species.

The observed zone already works this way (its own species filter, which receives the map's species as `initialSpecies`). The map is what is missing.

**Principle (decided):** one species chosen for the whole map. **With a species, every layer adapts to it; with none, everything stays as it is today.**

---

## Phasing (decided 2026-11-12)

An epic of its own, `epic/observatory-species-filter`, front end only, in small tasks. Each UI task agrees its states and where each control sits on desktop and phone **in a table of options before coding** (retro of `epic/observatory-navigation`), and measures text contrast (≥ 4.5:1, light and dark) before it closes.

| Task | Content | Notes |
|---|---|---|
| T1 | Shared state for the active species (context/hook); the species field as the second half of the search bar (50 % / 50 %, a gap between them, the focused one takes the whole width; Q1); «Filtrar por seta» leaves the Meteo panel; Condiciones, Mis rincones (map and list) and the URL (`seta` no longer Meteo-only) use it; hand-off to the observed zone | No sheet: the field with its chosen species and a × is enough to read and clear the filter. Settles Q1 (states table) and Q3 |
| T2 | Bosque with a species: dim the classes where it does not grow, without overriding the ticks | The weights are estimates reviewed for few species and the rest fall back to groups: dimming, never hiding (Q4) |
| T3 | Sheet with the species' card and the fixed bar | **Optional**: only if the species field falls short. Needs Q2 and Q6 answered and the point-card work (item 6 of `memory/pending.md`) in sight |

### T1 — states of the search bar (Marcos, 2026-11-12; to be adjusted seeing it live)

| State | What is seen |
|---|---|
| Rest, no species | Two halves of the same height with an unpainted gap between them: place (magnifier, «Buscar lugar o coordenadas») and species (mushroom icon, «Buscar seta»). Same height as the search today |
| Rest, species chosen | The species half shows the chosen name and a **×** that **removes the filter**. This is the only place where the filter is cleared by the ×, so it is always visible when nothing is focused. **The × is drawn inside a semi-transparent circle** (it reads as «remove») |
| One field focused (with or without a species chosen) | That field takes the **whole width**; the other disappears. At its right, a **bare ×** (no circle: it reads as «close») that **closes the search** (back to rest, filter kept). The suggestions list takes the whole width too |
| Species focused with one already chosen | The list starts with a row «Sin filtro / Todas las setas» (the mean of the excellent ones) so the filter can be removed from there as well; the × only closes |
| Typing | Suggestions under the bar, each row with a **small photo** (thumbnail), the **common name and the scientific name** (italic, as today). Same card and cap on drawn rows as the corners' species picker (`CornerSpeciesPicker`, `withPhotos`), which already solves a long catalogue with photos.  **Focus out or Esc** closes the dropdown and drops the typed text, in the place search and in the species search alike: the bar goes back to rest and the chosen species is seen again |
| Keyboard | **Tab** goes from one field to the other while the place search has no results; **with results open, Tab goes to the results first** and the species field comes after them. Arrow keys inside a list, Esc closes (as the × does) |
| Desktop | The bar keeps today's width (it stops before the rail and an open panel); the same behaviour |

Two risks were raised and settled on 2026-11-12: (1) forgetting an active species while the place search is open: focus out or Esc closes its results and the species is seen again; (2) the same × meaning two things: **two looks**, a × inside a semi-transparent circle to **remove** the species filter and a bare × to **close** a dropdown (the place search or the species search), plus separate accessible names («Quitar filtro de seta» / «Cerrar búsqueda»). The circle must keep a 3:1 contrast against the bar (non-text) in both themes, and the difference never rests on colour alone.

---

## What each layer does

| Layer | With a species | Without | Status |
|---|---|---|---|
| Meteo · Condiciones | Colours of that species' conditions index | Mean of the excellent species (as today) | Built in this epic |
| Bosque | Only the forests where the species grows count (affinity per class) | All classes | Built in this epic (see Q4) |
| Mis rincones | Only the corners tagged with that species (`species_ids`, already stored) | All | Built in this epic |
| Top 10 | The 10 best zones for that species | The 10 best by the mean of the excellent species | **Wired in the Top 10 epic** (inert row today) |
| Zonas de interés | See the zones-of-interest PRD: dynamic filter by score | All | **Wired in the zones-of-interest epic** (inert row today) |
| Lluvia, Temperatura, Viento | No effect (they do not depend on species) | — | — |

The mean of the excellent species without a species is the same rule the thermometer and the map already use, so the Top 10 does not invent a new criterion.

---

## Scope

### In — must ship

| Feature | Notes |
|---|---|
| Species selector as the second half of the search bar | Live-filter search by common and scientific name over the ~202 catalogue species (today's selector of the conditions layer, moved). **Decided:** the search is split in two, place and species. |
| Sheet for the chosen species | **Decided:** choosing a species does not leave it only as text in the search (barely visible, above all on a phone): a bottom sheet opens with its card. On desktop, an equivalent card. |
| Fixed bar for the active species | **Proposal:** when the sheet is lowered, a small fixed bar stays with the name and a ×. Lowering the sheet does **not** clear the filter; only the × does. |
| Condiciones with the global species | «Filtrar por seta» leaves the Meteo panel. An empty field still means the mean of the excellent species. |
| Bosque filtered by species | Only the classes where the species grows count (highlighted). Uses `forest_affinity` (11 classes) and, when the species has no weights of its own, the fallback by groups `pinar` and `otro`. |
| Mis rincones filtered by species | Map and list. A corner passes if it has that species tagged. |
| State in the URL | `seta` stops being Meteo-only (Q3, answered): it **supersedes Q6 of the navigation PRD**. No change to the hand-off to the observed zone (`initialSpecies`). |
| Contract for the inert rows | A single shared state for the active species (context/hook) that the Top 10 and the zones of interest will read when they exist. Not testable on the rows themselves while they are inert: it is checked on the hook. |
| Accessibility | Selector as a `combobox` (listbox, arrows, Esc), chip and × reachable by keyboard and announced, touch targets ≥ 44 px, text contrast ≥ 4.5:1 in both themes (measured per task, not at the end). |

### Out — explicitly excluded

| Feature | Reason / deferred to |
|---|---|
| Top 10 calculation by species | Its own epic (7f). Only the contract is left here. |
| Species filter of the zones of interest | `observatory-zones-of-interest-prd.md`. |
| A second selector inside the Zonas panel | **Discarded** on 2026-11-12: two selectors that can disagree, two sources for the Top 10. |
| Filtering only in the corners list | **Discarded:** it already filters, but not the map. |
| Choosing several species at once | One species at a time (decision of 7b: the colour scale keeps meaning conditions, low to high). Comparing means switching species. |
| Changes to the scoring model | None. |

---

## User flows

**Flow 1 — Choose a species**
1. The user taps the species half of the search bar (it takes the whole width) and types «cep».
2. They pick one of the suggestions.
3. The map recolours with that species' conditions and a sheet opens with its card (photo, name, edibility, season, colour legend, «Quitar filtro»).

**Flow 2 — Keep looking with the species active**
1. The user lowers the sheet. The fixed bar stays with the species name and a ×.
2. They open Bosque: the forests where it grows are highlighted. They open Zonas: Mis rincones shows only the corners tagged with that species.
3. They tap a point: the point card gives the score for that species.

**Flow 3 — Clear the species**
1. The user taps the × of the bar (or «Quitar filtro» in the sheet).
2. Every layer goes back to its no-species state (mean of the excellent species, all forests, all corners).

**Flow 4 — Observe with a species active**
1. The user observes a point with a species active.
2. The observed zone opens with that species already chosen in its own filter, as it does today.

---

## Open questions

| # | Question | Owner | Answer |
|---|---|---|---|
| 1 | **Split search** (direction decided by Marcos on 2026-11-12; the states table below is agreed in T1 before coding). On a phone, two fields at 50 % leave about 170 px each and the scientific name is truncated. | Marcos | ✅ **Direction:** one bar, two fields in one visual element, 50 % place search and 50 % species search, like the search with its «Filtrar» button built in (Zonas, catálogo). Between them a small **gap, not a line**: a thick unpainted separator, the same as between the species search and «Filtrar» on the catalogue. **Focusing one field lets it use the whole width of the bar** (the other gives way). Replaces the proposal of a compact segment. The other field **disappears entirely** while one has the focus (so the suggestions list has the whole width); the × at the right of the focused field **closes that search**, it does not clear the species filter (see «T1 — states of the search bar»). The rest of the states are settled in T1, to be seen live. |
| 2 | **Coexistence with the point's sheet on a phone.** Today «one panel at a time» holds (Q5 of the navigation PRD) and the point's sheet reaches 80 %. | Marcos | ⬜ Pending. Proposal: the species card is transient; the fixed species bar always coexists with the point's sheet and with the tabs. |
| 3 | **Does the species stay active with Meteo off?** Today `seta` is written to the URL only while Meteo is on (Q6 of the navigation PRD). | Marcos | ✅ **Yes** (2026-11-12): the species belongs to the map, not to Meteo; `seta` leaves the Meteo-only rule (it supersedes that Q6; record it in `memory/decisions.md`). |
| 4 | **Bosque with a species: dim or hide the classes that do not fit?** And how it coexists with the legend's manual checkboxes. | Marcos | ✅ **Dim, without overriding what the user ticked**, in T2 (2026-11-12). The affinity weights are estimates and reviewed only for part of the catalogue; the fallback by groups is coarser. |
| 5 | **Mis rincones with a species: are untagged corners hidden or dimmed?** And corners with several tags (`/point/snapshot` still takes a single species, 2c). | Marcos | ⬜ Pending. Proposal: hide the ones not tagged with that species, as the current list does. |
| 6 | **Content of the sheet's card.** | Marcos | ⬜ Pending. Proposal: photo, common and scientific name, edibility, season, legend, «Quitar filtro» and a link to the species' full card. |
| 7 | **Species out of season:** the map turns grey. | Marcos | ⬜ Pending. Proposal: a notice in the sheet («Out of season: few favourable conditions»), so a grey map does not read as broken. |
| 8 | **Small epic or single task?** | Marcos | ✅ **Small epic, `epic/observatory-species-filter`, with the tasks of the phasing table** (2026-11-12). |

---

## Deployment readiness

- Front end only. No migration, no new environment variable, no back-end change, no new dependency.
- Deploys with Vercel on the merge into `main`; no ordering with Render.
- Rollback: revert the merge commit.
- To check after deploy: phone (iOS Safari and Android Chrome, including the fullscreen mode and the browser bars), ES / CA / EN, light and dark, browser back/forward with `seta` in the URL, keyboard on the selector and the bar.

---

## Definition of Done

- [ ] A species chosen in the search affects Condiciones, Bosque and Mis rincones.
- [ ] With no species, every layer behaves as today.
- [ ] The species sheet and the fixed bar work on phone and desktop; lowering the sheet does not clear the filter.
- [ ] The species state is in the URL as decided in Q3 and is handed over to the observed zone.
- [ ] The active species lives in one shared state (context/hook) ready for the Top 10 and Zonas de interés rows, which are still inert; checked on the hook.
- [ ] «Filtrar por seta» is no longer in the Meteo panel.
- [ ] Open questions answered or consciously deferred, and written in `memory/decisions.md`.
- [ ] ES / CA / EN, light and dark, text contrast ≥ 4.5:1 measured per task; iOS Safari and Android Chrome checked after the deploy.
- [ ] Branches squash-merged; retrospective done.
