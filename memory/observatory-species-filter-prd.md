# PRD — One species filter for the whole map (`epic/observatory-species-filter`)

> Product Requirements Document. Written before the first feature branch.
> Once all Open questions are resolved and DoD is written, development can start.
> Last updated: 2026-11-13
>
> Status: **scope and order approved by Marcos on 2026-11-12; scope reworked on 2026-11-13** (the species is a *lens*, not a filter that hides things: Bosque, Mis rincones and Zonas de interés are not filtered; the Bosque tab becomes **Hábitat** and gets the species' habitat map; see `memory/decisions.md`, «Species filter: a lens, not a filter, and the Hábitat tab»). The technical plan is [`observatory-species-filter-plan.md`](observatory-species-filter-plan.md). Born from item 7 of `memory/pending.md` («One species filter for the whole map»), raised by Marcos on 2026-11-12 during T4 of `epic/observatory-navigation`, which is now merged into `main` (v7.4.0). Cut from `main`.
> Related: [`observatory-zones-of-interest-prd.md`](observatory-zones-of-interest-prd.md) (the zones' species filter depends on this one) and [`observatory-navigation-prd.md`](observatory-navigation-prd.md) (the Meteo / Zonas / Bosque tabs).
> Order in the roadmap (decided 2026-11-12): species filter → rain (`epic/observatory-meteo`) → zones of interest.
> **Marked in the text:** «Decided» = said by Marcos on 2026-11-12. «Proposal» = proposed by Claude, to be confirmed.

---

## Problem / Why

The species filter lives **inside the Meteo · Condiciones panel** («Filtrar por seta»). But the user's question crosses layers: *«where do I look for the porcini?»* affects the conditions, the places where it can grow and the best places. With the filter inside one tab, the rest of the map ignores the chosen species.

The observed zone already works this way (its own species filter, which receives the map's species as `initialSpecies`). The map is what is missing.

**Principle (decided 2026-11-13):** one species chosen for the whole map, used as a **lens, never as a filter that hides things**. The layers that *answer a question about the species* read it (Condiciones, the species' habitat, the Top 10); the layers that show *what exists* (forest classes, Mis rincones, Zonas de interés) are not filtered or dimmed, because hiding a forest class or a pin only because a species was chosen limits exploring. With none, everything stays as it is today.

*(Reworked from the 2026-11-12 principle «with a species, every layer adapts to it».)*

---

## Phasing (decided 2026-11-12)

An epic of its own, `epic/observatory-species-filter`, front end only, in small tasks. Each UI task agrees its states and where each control sits on desktop and phone **in a table of options before coding** (retro of `epic/observatory-navigation`), and measures text contrast (≥ 4.5:1, light and dark) before it closes.

| Task | Content | Notes |
|---|---|---|
| T1 | Shared state for the active species (hook); the species field as the second half of the search bar (50 % / 50 %, a gap between them, the focused one takes the whole width; Q1); «Filtrar por seta» leaves the Meteo panel; Condiciones and the URL (`seta` no longer Meteo-only) use it; hand-off to the observed zone and the point card | No sheet: the field with its chosen species and a × is enough to read and clear the filter. Settles Q1 (states table) and Q3. Bosque, Mis rincones and Zonas are **not** touched (Q5) |
| T2 | The Bosque tab becomes **Hábitat** (name, texts, ids); same panel under a segment «Bosques» | Rename only, no new logic; the storage keys keep their names |
| T3 | **Hábitat · De la seta**: the map of where the chosen species can grow (altitude × forest × soil, no weather, no date) | Replaces «Bosque dimmed» (Q4). While it is shown, Condiciones and the forest classes are not drawn. Data: the species block of the layer answer, no back-end change |
| T4 | Sheet with the species' card and the fixed bar | **Optional**: only if the species field and the habitat fall short. Needs Q2 and Q6 answered and the point-card work (item 6 of `memory/pending.md`) in sight |

### T1 — states of the search bar (Marcos, 2026-11-12; to be adjusted seeing it live)

| State | What is seen |
|---|---|
| Rest, no species | Two halves of the same height with an unpainted gap between them: place (magnifier, «Buscar lugar o coordenadas») and species (mushroom icon, «Buscar seta»). Same height as the search today |
| Rest, species chosen | The species half shows the chosen name and a **×** that **removes the filter**. This is the only place where the filter is cleared by the ×, so it is always visible when nothing is focused. **The × is drawn inside a semi-transparent circle** (it reads as «remove») |
| One field focused (with or without a species chosen) | That field takes the **whole width**; the other disappears. At its right, a **bare ×** (no circle: it reads as «close») that **closes the search** (back to rest, filter kept). The suggestions list takes the whole width too |
| Species focused with one already chosen | The list starts with a row «Sin filtro / Todas las setas» (the mean of the excellent ones) so the filter can be removed from there as well; the × only closes |
| Typing | Suggestions under the bar in the look of the observed zone's species panel (`SpeciesPanel`, decided 2026-11-13): an **edibility selector** (default «Excelente») above the list, and rows as cards with the **photo**, **common name**, **scientific name** (italic), edibility tag and a button that opens the species' sheet (no score, no details arrow). **The selector only works while exploring (empty field)**: with any text typed the search covers the whole catalogue and the selector is disabled («Todas las setas»), so a toxic species is always found. Opening the sheet does not close the dropdown nor drop the text.  **Focus out or Esc** closes the dropdown and drops the typed text, in the place search and in the species search alike: the bar goes back to rest and the chosen species is seen again |
| Keyboard | **Tab** goes from one field to the other while the place search has no results; **with results open, Tab goes to the results first** and the species field comes after them. Arrow keys inside a list, Esc closes (as the × does) |
| Desktop | The bar keeps today's width (it stops before the rail and an open panel); the same behaviour |

Two risks were raised and settled on 2026-11-12: (1) forgetting an active species while the place search is open: focus out or Esc closes its results and the species is seen again; (2) the same × meaning two things: **two looks**, a × inside a semi-transparent circle to **remove** the species filter and a bare × to **close** a dropdown (the place search or the species search), plus separate accessible names («Quitar filtro de seta» / «Cerrar búsqueda»). The circle must keep a 3:1 contrast against the bar (non-text) in both themes, and the difference never rests on colour alone.

---

## What each layer does

| Layer | With a species | Without | Status |
|---|---|---|---|
| Meteo · Condiciones | Colours of that species' conditions index | Mean of the excellent species (as today) | Built in this epic (T1) |
| Hábitat · Bosques | No effect: every checked class is drawn | Same | Not a lens; renamed in T2 |
| Hábitat · De la seta | Where the species can grow: altitude × forest × soil, no weather, no date | Segment disabled, «Elige una seta» | Built in this epic (T3) |
| Mis rincones | No effect: every corner is drawn | Same | Not a lens (Q5). A species filter inside the corners dialog is a possible follow-up, local to the list |
| Top 10 | The 10 best zones for that species | The 10 best by the mean of the excellent species | **Wired in the Top 10 epic** (inert row today) |
| Zonas de interés | No effect on which pins show; see the zones-of-interest PRD for anything per species | All | Adjust that PRD when it starts |
| Lluvia, Temperatura, Viento | No effect (they do not depend on species) | — | — |

The mean of the excellent species without a species is the same rule the thermometer and the map already use, so the Top 10 does not invent a new criterion.

---

## Scope

### In — must ship

| Feature | Notes |
|---|---|
| Species selector as the second half of the search bar | Live-filter search by common and scientific name over the ~202 catalogue species (today's selector of the conditions layer, moved). **Decided:** the search is split in two, place and species. |
| Sheet for the chosen species and fixed bar | **Optional (T4):** the field with its name and × is enough for T1; the sheet (bottom sheet on phone, card on desktop) and the fixed bar (name and ×, lowering the sheet does not clear the filter) are built only if it falls short. |
| Condiciones with the global species | «Filtrar por seta» leaves the Meteo panel. An empty field still means the mean of the excellent species. A line «Condiciones para {seta}» says which one. The day of the slider is kept when the species changes. |
| Hábitat tab | The Bosque tab is renamed **Hábitat** (T2); its panel has the segments **Bosques** (the classes, as today) and **De la seta** (T3). |
| Habitat map of the species | Where the chosen species can grow, from its altitude range, the forest classes with their weights and the soil pH fit. No weather, no date, no season. Reads the species block of the layer answer; no back-end change. Exclusion rule: while it is shown, Condiciones and the forest classes are not drawn. |
| State in the URL | `seta` stops being Meteo-only (Q3, answered): it **supersedes Q6 of the navigation PRD**. A link with only `seta` does not turn Meteo on. No change to the hand-off to the observed zone (`initialSpecies`), now also with Meteo off. |
| Contract for the inert rows | A single shared state for the active species (context/hook) that the Top 10 and the zones of interest will read when they exist. Not testable on the rows themselves while they are inert: it is checked on the hook. |
| Accessibility | Selector as a `combobox` (listbox, arrows, Esc), chip and × reachable by keyboard and announced, touch targets ≥ 44 px, text contrast ≥ 4.5:1 in both themes (measured per task, not at the end). |

### Out — explicitly excluded

| Feature | Reason / deferred to |
|---|---|
| Top 10 calculation by species | Its own epic (7f). Only the contract is left here. |
| Filtering or dimming Bosque classes, Mis rincones or Zonas de interés by species | **Discarded 2026-11-13:** hiding what exists only because a species is chosen limits exploring. A species filter inside the corners dialog may come later, local to that list. |
| Species filter of the zones of interest | `observatory-zones-of-interest-prd.md`. |
| A second selector inside the Zonas panel | **Discarded** on 2026-11-12: two selectors that can disagree, two sources for the Top 10. |
| Filtering only in the corners list | **Discarded:** it already filters, but not the map. |
| Choosing several species at once | One species at a time (decision of 7b: the colour scale keeps meaning conditions, low to high). Comparing means switching species. |
| Changes to the scoring model | None. |

---

## User flows

**Flow 1 — Choose a species**
1. The user taps the species half of the search bar (it takes the whole width) and types «cep».
2. They pick one of the suggestions (photo, common and scientific name).
3. The bar goes back to rest showing the name and a ×; the map recolours with that species' conditions.

**Flow 2 — Keep looking with the species active**
1. They open Hábitat and pick «De la seta»: the map shows where the species can grow, in any month.
2. They go back to «Bosques» or open Zonas: nothing is hidden, every class and every corner is still there.
3. They tap a point: the point card gives the score for that species.

**Flow 3 — Clear the species**
1. The user taps the circled × of the bar (or «Sin filtro» in the species list).
2. Meteo goes back to the mean of the excellent species; «De la seta» is disabled and the Hábitat panel shows «Bosques» again.

**Flow 4 — Observe with a species active**
1. The user observes a point with a species active.
2. The observed zone opens with that species already chosen in its own filter, as it does today.

---

## Open questions

| # | Question | Owner | Answer |
|---|---|---|---|
| 1 | **Split search** (direction decided by Marcos on 2026-11-12; the states table below is agreed in T1 before coding). On a phone, two fields at 50 % leave about 170 px each and the scientific name is truncated. | Marcos | ✅ **Direction:** one bar, two fields in one visual element, 50 % place search and 50 % species search, like the search with its «Filtrar» button built in (Zonas, catálogo). Between them a small **gap, not a line**: a thick unpainted separator, the same as between the species search and «Filtrar» on the catalogue. **Focusing one field lets it use the whole width of the bar** (the other gives way). Replaces the proposal of a compact segment. The other field **disappears entirely** while one has the focus (so the suggestions list has the whole width); the × at the right of the focused field **closes that search**, it does not clear the species filter (see «T1 — states of the search bar»). The rest of the states are settled in T1, to be seen live. |
| 2 | **Coexistence with the point's sheet on a phone** (T4 only). Today «one panel at a time» holds (Q5 of the navigation PRD) and the point's sheet reaches 80 %. | Marcos | ⬜ Pending, only if T4 opens. Proposal: the species card is transient; the fixed species bar always coexists with the point's sheet and with the tabs. |
| 3 | **Does the species stay active with Meteo off?** Today `seta` is written to the URL only while Meteo is on (Q6 of the navigation PRD). | Marcos | ✅ **Yes** (2026-11-12): the species belongs to the map, not to Meteo; `seta` leaves the Meteo-only rule (it supersedes that Q6; record it in `memory/decisions.md`). |
| 4 | **Bosque with a species: dim or hide the classes that do not fit?** | Marcos | ✅ **Neither** (2026-11-13; it was «dim» on 2026-11-12). The classes are not touched by the species. Instead the species gets its own habitat map under **Hábitat · De la seta** (T3), which does not depend on the weather, so it also answers «where could it grow» out of season. |
| 5 | **Mis rincones with a species: are untagged corners hidden or dimmed?** | Marcos | ✅ **Neither** (2026-11-13): the species does not filter the corners, on the map or in the list. (The list has no species filter today, contrary to what this PRD assumed on 2026-11-12: it filters by text, comarca, forest and kind.) A local species filter in the corners dialog may come later. |
| 6 | **Content of the sheet's card** (T4 only). | Marcos | ⬜ Pending, only if T4 opens. Proposal: photo, common and scientific name, edibility, season, legend, «Quitar filtro» and a link to the species' full card. |
| 7 | **Species out of season:** the map turns grey. | Marcos | ✅ **The legend is enough** (2026-11-13): Condiciones already says it (`obsLayOutOfSeason`, `seasonNote`), and Hábitat · De la seta paints out of season. No new notice. |
| 8 | **Small epic or single task?** | Marcos | ✅ **Small epic, `epic/observatory-species-filter`, with the tasks of the phasing table** (2026-11-12). |
| 9 | **Where does the habitat map live?** | Marcos | ✅ **In the Bosque tab, renamed Hábitat** (2026-11-13), as a segment next to the forest classes: Meteo is what changes with time, Hábitat what does not. Not in Meteo (a map without weather does not belong there) and not as a new tab. |
| 10 | **Habitat and Condiciones at the same time?** Both use the five-band colour scale. | Marcos | ✅ **Exclusion** (2026-11-13): while «De la seta» is shown, Condiciones and the forest classes are not drawn; Meteo's panel says why. Revisit with a scale of its own if seeing both is missed. |

---

## Deployment readiness

- Front end only. No migration, no new environment variable, no back-end change, no new dependency.
- Deploys with Vercel on the merge into `main`; no ordering with Render.
- Rollback: revert the merge commit.
- To check after deploy: phone (iOS Safari and Android Chrome, including the fullscreen mode and the browser bars), ES / CA / EN, light and dark, browser back/forward with `seta` in the URL, keyboard on the selector and the bar.

---

## Definition of Done

- [ ] A species chosen in the search affects Condiciones and the habitat map (and, later, the Top 10); Bosques, Mis rincones and Zonas de interés are untouched.
- [ ] With no species, every layer behaves as today.
- [ ] The Bosque tab is called Hábitat in ES / CA / EN, keeps the stored choices, and «De la seta» paints where the species can grow without weather or date.
- [ ] If T4 is built: the species sheet and the fixed bar work on phone and desktop; lowering the sheet does not clear the filter.
- [ ] The species state is in the URL as decided in Q3 and is handed over to the observed zone.
- [ ] The active species lives in one shared state (context/hook) ready for the Top 10 and Zonas de interés rows, which are still inert; checked on the hook.
- [ ] «Filtrar por seta» is no longer in the Meteo panel.
- [ ] Open questions answered or consciously deferred, and written in `memory/decisions.md`.
- [ ] ES / CA / EN, light and dark, text contrast ≥ 4.5:1 measured per task; iOS Safari and Android Chrome checked after the deploy.
- [ ] Branches squash-merged; retrospective done.
