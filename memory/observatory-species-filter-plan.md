# Plan — `epic/observatory-species-filter`

> Technical plan and task breakdown. Product contract: [`observatory-species-filter-prd.md`](observatory-species-filter-prd.md) (scope reworked 2026-11-13; reasons in `memory/decisions.md`, «Species filter: a lens, not a filter, and the Hábitat tab»).
> Last updated: 2026-11-13

---

## Status

| # | Branch | Status |
|---|---|---|
| T1 | `feat/observatory-species-filter-bar` | ⬜ Next |
| T2 | `chore/observatory-species-filter-habitat-tab` | ⬜ |
| T3 | `feat/observatory-species-filter-habitat` | ⬜ |
| T4 | `feat/observatory-species-filter-sheet` | ⬜ Optional |

Order: T1 → T2 → T3 → T4. T1, T2 and T3 all touch `Observatory.jsx` and `i18n.js`, so they go one after the other. All branches are cut from `epic/observatory-species-filter` and squash-merged into it (*Squash and merge*, title = PR title).

The PRD of 2026-11-12 had T2 «Bosque dimmed» and a filter on Bosque, Mis rincones and Zonas. On 2026-11-13 Marcos reversed it: the species is a **lens**, never a filter that hides things (see the PRD, «What each layer does»). T2 «dimmed» is gone; the Bosque tab becomes **Hábitat** (T2) and gets the species' habitat map (T3).

---

## Findings in the current code

1. **The species lives in Meteo.** `Observatory.jsx` holds `layerSpecies` next to Meteo's state, `shownSpecies = probabilityOn ? layerSpecies : null` and `layerId = probabilityOn ? (layerSpecies ?? ALL_EXCELLENT) : pending ? ALL_EXCELLENT : null`. With Meteo off the hand-off to the observed zone (`initialSpecies`) and the point card's species name are `null`. T1 makes them follow the species, whatever Meteo does.
2. **`seta` is tied to `capa` in four places:** `parseMeteo` and `withMeteo` (`src/lib/observatoryView.js`), `canonicalParams`, and the `useEffect` that calls `setMeteo` in the page. A link with only `seta` is dropped today.
3. **`chooseLayerSpecies` resets the day** (`setLayerDate(null)`). With a map-wide species that surprises: the day belongs to the slider.
4. **The place search keeps its text** after a result is chosen (`chosenRef`), and a click outside only closes the list. The PRD asks for focus out and Esc to drop typed text in both fields, and for the bar to go back to rest.
5. **Tab cannot reach a field that is not in the DOM.** The «other field disappears» rule is done by collapsing it (width 0, no `display:none`, no `visibility:hidden`), so Tab still lands on it and focusing it expands it.
6. **Widths.** Phone: the search spans `left-3` to `right-[64px]` = 314 px on a 390 px phone, so each half is ~155 px (the PRD guessed ~170). Desktop: `max-w-[30rem]` is 540 px (base font 18 px), so each half is 268 px. Everything new is in px (`memory/gotchas.md`, «sizes in rem»).
7. **The species block of the layer answer is date-independent.** `layer.data.species` carries `elevation_min_m/max_m`, `forest_classes`, `forest_class_weights`, `substrate_classes` and `substrate_factors` (`backend/app/services/layer_probability.py`). T3 draws the habitat from it, with the elevation, forest and substrate rasters the page already loads: no catalogue field, no back-end change. The catalogue list does **not** carry `forest_affinity` (`normalizeSpeciesListItem`).
8. **`reliefLayer.js` has the pieces:** `factorAt` (forest × soil factor of a species at a raster pixel), `matchClasses`, `forestFactor`, `RANGE_MARGIN_M`, `MIN_FACTOR`, `scoreRgba`. Both painters need the cells (the weather), so T3 adds its own painter that uses only the grid's `elev` and `demIdx`.
9. **No front-end tests** (`system/workflows.spec.md`). Each task is accepted with `npm run build` clean plus a manual QA pass against its scenarios; pure helpers are exported for a quick node check (as `seasonNote`).
10. **Transitions and a busy thread** (`memory/gotchas.md`): choosing a species folds the field and recomputes the layer. The species is applied after the fold (`FIELD_MS + 40`, the pattern of `chooseBasemapAfterFold`).

---

## Shared vocabulary

- **Active species**: the one mushroom chosen for the map (`speciesId` or `null`). Null = the mean of the excellent species, as today.
- **Lens**: a layer that reads the active species and changes what it paints or ranks: Meteo · Condiciones, Hábitat · De la seta, Top 10. Bosques, Mis rincones and Zonas de interés are not lenses: the species never hides or dims them.
- **Rest / focused**: states of the search bar (PRD, «T1 — states of the search bar»).
- **Remove ×** (circle) clears the species filter; **close ×** (bare) closes a dropdown. Never mixed.

---

## T1 · `feat/observatory-species-filter-bar` — shared species and the search bar

**Files**
- New: `src/hooks/useActiveSpecies.js` (state, URL sync, catalogue check), `src/components/observatory/MapSearchBar.jsx` (the bar: rest / place / species focus), `src/components/observatory/MapSpeciesSearch.jsx` (species half), `src/components/observatory/SpeciesRow.jsx` (the observed zone's species card without score or details arrow: edge-to-edge photo, common name, scientific name in italics, edibility tag, file-card button; shared with the zone's panel).
- Modified: `src/components/observatory/MapSearch.jsx` (becomes the place half: collapsed prop, focus callbacks, drops text on focus out/Esc), `src/components/observatory/SpeciesPanel.jsx` (its `Row` uses `SpeciesRow`), `src/lib/speciesList.js` (`buildPickerRows` adds `edibGroup`; new `countPickerGroups`), `src/components/observatory/SpeciesLayerPicker.jsx` (the field leaves: slider, legend and the «Condiciones para {seta}» line stay), `src/lib/observatoryView.js` and `src/hooks/useObservatoryView.js` (`seta` on its own), `src/pages/Observatory.jsx`, `src/data/i18n.js`.

**Spec**
1. **State.** `useActiveSpecies({ initial })` returns `{ speciesId, setSpecies, clear }`. It lives in `Observatory.jsx` (the Top 10 and the zones of interest will read it from there). A species not in the catalogue (old or mistyped link) is dropped without a notice once the catalogue has loaded. It is **not** stored in `localStorage`: it comes from the URL or starts empty.
2. **URL.** `seta` (species id) is written whenever a species is active, with Meteo on or off, with history replace. `parseMeteo` / `withMeteo` stop touching `seta`; new `parseSpecies(params)` / `withSpecies(params, id)`. `canonicalParams` drops an invalid `seta` by itself. `capa` and `dia` keep today's rules (only while Meteo is on). A link with only `seta` does **not** turn Meteo on (`dataFromUrl` stays `Boolean(initialMeteo)`). Old links `capa=condiciones&seta=…` keep working.
3. **Meteo · Condiciones.** The field leaves the panel. Under the segmented control: a line «Condiciones para {nombre}» when a species is active (nothing when it is the mean of the excellent ones), then slider, legend and notes as today. `chooseLayerSpecies` no longer resets the day. With Meteo off the line still shows, dimmed with the rest.
4. **Other layers.** Bosque, Zonas, Mis rincones and the zones of interest do not read the species. Nothing in `ZonasPanel`, `BosquePanel` or the corners layer changes.
5. **Hand-off and point card.** `initialSpecies` of the observed zone and `layerSpeciesName` of the point card use the active species even with Meteo off. `layerId` for a picked point with Meteo off is the active species, else `ALL_EXCELLENT`.
6. **The bar** (PRD states table, in px): 52 px high, radius 26 px, a 4 px unpainted gap between the halves, `map-surface` + `shadow-float` as today. At rest the halves are 50 % / 50 %; the outer corners are 26 px and the inner ones square (as `SearchFilterBar`'s «Filtrar»). Left: magnifier + «Buscar lugar» (phone) / «Buscar lugar o coordenadas» (≥ 640 px). Right: mushroom icon + «Buscar seta». Accessible names stay long («Buscar en el mapa», «Buscar una seta para el mapa»).
7. **Species chosen at rest.** The right half shows the name (truncated) and the **remove ×**: a 44 × 44 px button with a 28 px circle `bg-cream/15` inside. Accessible name «Quitar filtro de seta».
8. **Focus.** The focused half takes the whole width (200 ms width transition; no colour transition on elements that swap fill and text); the other collapses to width 0, `overflow:hidden`, `opacity:0`, still focusable. A **bare close ×** (44 × 44 px, no circle, accessible name «Cerrar búsqueda») sits at the right of the focused half and closes the dropdown (back to rest, filter kept). Lists take the whole width.
9. **Species list**, modelled on the observed zone's «¿Qué seta buscas?» panel (`SpeciesPanel`). The dropdown holds, from top to bottom: an edibility selector (`ObsSelect`, the zone's groups `EDIB_GROUPS` with their counts over the whole catalogue, plus «Todas»), and the list. Rows are `SpeciesRow` cards: photo to the card's edge, common name, scientific name in italics, edibility tag, and the file-card button that opens `SpeciesPreview` (the species' sheet). No score, no details arrow. The chosen species has the zone's selection ring. No cap on the drawn rows (as the zone's panel: `loading="lazy"` photos, scroll inside the dropdown); no «y {n} más».
    - **The selector only works while exploring** (empty field). It opens on «Excelente», as in the zone, and keeps the group the user picks while the dropdown lives. **With any text typed, the search runs over the whole catalogue** and the selector is disabled and reads «Todas las setas ({n})», so a toxic or deadly species is always found. Deleting the text brings the group back.
    - With a species already chosen, the first row is «Sin filtro · Todas las setas». Choosing a row applies the species after the field has folded (`FIELD_MS + 40`).
    - **The file-card button keeps the field's focus** (`pointerdown` with `preventDefault`, like the rows): the dropdown stays open behind the sheet, the outside-click rule ignores the sheet (it lives in a portal), Esc closes the sheet first (`isDialogAbove`), and closing it returns the focus to the field with the typed text intact.
    - On a phone with the keyboard open the dropdown is as tall as the visible viewport allows (list scrolls inside); the height is measured in the task.
10. **Focus out or Esc** closes the dropdown and drops the typed text, in both halves; the bar goes back to rest and the chosen species is seen again. After choosing a place the place half is empty again (the recents list keeps it). Esc stops there (the page's Esc chain only runs when no dropdown is open).
11. **Keyboard.** Tab goes from the place half to the species half when the place search has no results; with results open it goes to the results first and the species half after them. Arrow keys inside a list, Enter chooses, Esc closes. Each half is a `combobox` with its `listbox`. A polite live region says «Filtro de seta: {nombre}» / «Sin filtro de seta».
12. **Desktop.** The bar keeps today's width (540 px max, it stops before the rail and an open panel); same behaviour.
13. **Text.** New keys in ES / CA / EN; the old `obsLayPlaceholder`, `obsLaySearchLabel` and `obsLayClear` go (grep of every removed key).
14. **Contrast** (≥ 4.5:1 for text, 3:1 for the remove circle and the focus ring; also the edibility tag and the selected row on `map-surface`, light and dark), measured in the DOM, light and dark, at 390 and 1280 px, before the task closes.

**Scenarios**

```gherkin
Feature: Species field in the search bar

  Background:
    Given a logged-in user on /observatorio

  Scenario: The bar at rest
    When the page opens
    Then one bar shows two halves of the same height with a gap between them
    And the left half says «Buscar lugar» and the right half says «Buscar seta»

  Scenario: Choosing a species
    When the user taps the species half
    Then it takes the whole width and the place half collapses
    When the user types «cep» and picks «Boletus edulis» (with its photo)
    Then the bar goes back to rest and the right half shows the name and a ×
    And the Meteo conditions are those of that species
    And the URL has seta=<its id>

  Scenario: Two crosses, two meanings
    Given a species is chosen
    Then the × at rest sits in a circle and its name is «Quitar filtro de seta»
    When the user focuses the species half
    Then the × is bare and its name is «Cerrar búsqueda»
    When the user taps it
    Then the search closes and the species is still chosen
    When the user taps the circled × at rest
    Then the species is cleared and seta leaves the URL

  Scenario: Exploring by edibility
    When the user focuses the species half with nothing typed
    Then the selector reads «Excelente» and the list shows only excellent species, each with photo, names and edibility tag
    When the user picks «Mortal» in the selector
    Then the list shows only deadly species

  Scenario: Typing searches the whole catalogue
    Given the selector reads «Excelente»
    When the user types «phalloides»
    Then «Amanita phalloides» is listed
    And the selector is disabled and reads «Todas las setas»
    When the user deletes the text
    Then the selector enables again and reads «Excelente»

  Scenario: Opening the species' sheet keeps the search
    Given the user typed «bol» in the species half
    When the user taps the file-card button of a row
    Then the species' sheet opens and the dropdown stays open behind it
    When the user closes the sheet with Esc
    Then the field has the focus and still says «bol»

  Scenario: The observed zone's panel is unchanged
    Given a point is observed
    When the user opens the zone's «¿Qué seta buscas?» panel
    Then rows look and behave as before: photo, names, edibility tag, file-card button, score and details arrow
    And choosing a row, the selector and the search work as before

  Scenario: Clearing from the list
    Given a species is chosen and the species half is focused
    Then the first row is «Sin filtro · Todas las setas»
    When the user picks it
    Then the species is cleared and Meteo shows the mean of the excellent species

  Scenario: Focus out drops the typed text
    Given a species is chosen
    When the user focuses the species half, types «am» and taps the map
    Then the dropdown closes, the typed text is gone and the chosen name shows again
    When the user focuses the place half, types «sant» and presses Esc
    Then the dropdown closes, the text is gone and the bar is at rest

  Scenario: Choosing a place leaves the bar at rest
    When the user picks a place from the results
    Then the map goes there and the place half is empty again

  Scenario: Tab between the halves
    Given the place search has no results
    When the user focuses the place half and presses Tab
    Then the species half takes the focus and the width
    Given the place search has results open
    When the user presses Tab
    Then the focus goes to the results first and the species half after them

  Scenario: The species outlives Meteo
    Given «Boletus edulis» is chosen
    When the user switches Meteo off
    Then seta stays in the URL
    And observing a point opens the zone with «Boletus edulis» chosen
    And the point card names that species

  Scenario: A link with only seta
    Given the browser has Meteo stored as off
    When the user opens /observatorio?seta=<id>
    Then Meteo stays off and the species is chosen

  Scenario: An old link
    When the user opens /observatorio?capa=condiciones&seta=<id>&dia=<5 days ago>
    Then Meteo is on with that species and that day

  Scenario: A species that does not exist
    When the user opens a link with seta=nope
    Then the species is dropped without a notice and seta leaves the URL

  Scenario: The day stays when the species changes
    Given the slider is three days back
    When the user chooses another species
    Then the slider is still three days back

  Scenario: Other layers ignore the species
    Given «Boletus edulis» is chosen
    Then Bosque draws every checked class and Mis rincones draws every corner

  Scenario: Phone width
    Given a 390 px phone
    Then each half is about 155 px and neither placeholder is cut mid-word
    And the touch targets are at least 44 px
```

**Done when** the scenarios pass by hand, `npm run build` is clean, contrast is measured, and Meteo no longer shows «Filtrar por seta».

---

## T2 · `chore/observatory-species-filter-habitat-tab` — Bosque becomes Hábitat

**Files**
- Modified: `src/components/observatory/nav/TabRail.jsx`, `src/components/observatory/nav/PhoneTabBar.jsx`, `src/hooks/useMapNavigation.js`, `src/pages/Observatory.jsx`, `src/components/observatory/nav/BosquePanel.jsx` → renamed `HabitatPanel.jsx` (content unchanged), `src/data/i18n.js`, `system/project.spec.md` and `memory/observatory-navigation-plan.md` only if they name the tab.

**Spec**
1. The tab reads **Hábitat / Hàbitat / Habitat**; the panel title too. The forest classes are the same panel under a segment **Bosques** (one segment for now; T3 adds the second). Tab id `forest` → `habitat` in code.
2. **`localStorage` keys keep their names** (`fungus-obs-forest`, `fungus-obs-forest-classes`): a choice made before the rename still holds. No URL changes (the open tab is not in the URL).
3. The icon stays the current one unless it reads wrong next to the new name; decide in the task.
4. No new logic. The old `obsTabForest` key goes if nothing else uses it (grep).

**Scenarios**

```gherkin
Feature: Hábitat tab

  Scenario: Same panel, new name
    When the user opens the tab that used to be Bosque
    Then it is called «Hábitat» in ES, «Hàbitat» in CA and «Habitat» in EN
    And «Todos», «Ninguno», the counter and the eleven classes work as before

  Scenario: Remembered choices survive
    Given the browser stored Bosque on and only «Hayedo» checked
    When the page opens
    Then the Hábitat tab shows a dot and only «Hayedo» is checked and drawn

  Scenario: Phone
    Given a 390 px phone
    Then the bar shows Meteo, Zonas and Hábitat and the label fits
```

**Done when** the scenarios pass, `npm run build` is clean and a grep of `obsTabForest` and the old tab id finds nothing.

---

## T3 · `feat/observatory-species-filter-habitat` — habitat of the chosen species

**Files**
- New: `src/lib/habitatLayer.js` (pure: `paintHabitat`, `habitatOverlay`), `src/components/observatory/nav/HabitatLegend.jsx` (or `LayerLegend` with habitat labels).
- Modified: `src/lib/reliefLayer.js` (exports `factorAt`, `matchClasses`, `RANGE_MARGIN_M`, `MIN_FACTOR`, `scoreRgba`), `src/components/observatory/nav/HabitatPanel.jsx` (segmented control Bosques · De la seta), `src/components/observatory/ObservatoryMap.jsx` (`habitat` prop), `src/pages/Observatory.jsx`, `src/data/i18n.js`.

**Spec**
1. **Segments** in the Hábitat panel, as Meteo's control: **Bosques** (the classes) and **De la seta** («Hábitat de {nombre}»). Without an active species the second is `aria-disabled` with «Elige una seta». The choice is stored in `fungus-obs-habitat-view` (`forest` | `species`); stored `species` without an active species behaves as `forest`.
2. **What it paints.** For every pixel of the elevation grid with data: not painted outside the species' altitude range ± `RANGE_MARGIN_M`; otherwise `f = factorAt(species, pixel, rasters)` (forest share × weights × soil fit); not painted under `MIN_FACTOR`; colour = the conditions' five-band scale of `f × 100`. No cells, no weather, no day, no season: a species out of season still paints. Legend: Poco adecuado … Muy adecuado, with the note «No depende de la fecha ni del clima» and «Sin datos de bosque para esta seta» when `forest_classes` is null.
3. **Data.** The species' block comes from the layer answer (`useProbabilityLayer(speciesId)`), which the page already requests; the hook is also on while Hábitat · De la seta is shown, even with Meteo off. The elevation, forest and substrate rasters load while it is shown. It paints only when all three are ready (a loading line in the panel until then; the loading bar covers it).
4. **Exclusion.** While Hábitat · De la seta is shown (tab switch on), the Condiciones picture is not drawn and the forest classes are not drawn. Meteo's switch keeps its value; its panel says «Oculto mientras Hábitat muestra la seta». Going back to Bosques (or switching Hábitat off, or clearing the species) brings back what was there.
5. **Draw.** The habitat picture goes in the conditions' pane (350), with the same blend and opacity per base map, so the exclusion looks the same as Condiciones. Computed after the next paint (`afterPaint`), replacing the old picture only when ready, and not in the same click as a transition.
6. **Calibration live.** The factor is 0–1 and the scale is the conditions' bands, so 0.5 reads as «Regular». Compare against the field notes of the species with reviewed weights (*Boletus edulis*, *Lactarius deliciosus*, *Cantharellus cibarius*, *Craterellus cornucopioides*) and adjust the mapping from `f` to colour if it misleads. Record the result in `memory/decisions.md`.
7. **Contrast** of the legend text, the segment and the notes (≥ 4.5:1) in both themes, over the satellite, streets and relief base maps.

**Scenarios**

```gherkin
Feature: Habitat of the chosen species

  Background:
    Given a logged-in user on /observatorio with «Boletus edulis» chosen

  Scenario: Where it can grow
    When the user opens Hábitat and picks «De la seta»
    Then the map shows where the species' altitude, forest and soil fit, from poor to very good
    And the forest classes and the Condiciones colours are not drawn

  Scenario: Out of season
    Given the date is in a month when the species does not fruit
    When «De la seta» is shown
    Then the map is painted and the legend says it does not depend on the date or the weather

  Scenario: No species
    Given no species is chosen
    Then «De la seta» is disabled and says «Elige una seta»
    And a stored «De la seta» choice behaves as «Bosques»

  Scenario: Back to the classes
    Given «De la seta» is shown
    When the user picks «Bosques»
    Then the checked classes are drawn and Condiciones comes back if Meteo is on

  Scenario: Clearing the species
    Given «De la seta» is shown
    When the user clears the species
    Then the panel goes back to «Bosques» and the map shows the classes

  Scenario: Meteo says why it is hidden
    Given «De la seta» is shown and Meteo is on
    When the user opens Meteo
    Then it says Condiciones is hidden while Hábitat shows the species

  Scenario: Meteo off
    Given Meteo is off
    When the user picks «De la seta»
    Then the habitat is painted and the weather is not requested for the colours

  Scenario: A species the forest cannot judge
    Given the species has no forest classes
    Then the map paints altitude and soil only and the legend says there is no forest data

  Scenario: Keyboard
    When the user tabs into the Hábitat panel
    Then both segments are reachable and announce which one is pressed
```

**Done when** the scenarios pass, `npm run build` is clean, the picture is compared on the three base maps and contrast is measured.

---

## T4 · `feat/observatory-species-filter-sheet` — species sheet and fixed bar (optional)

Only if the species field and the habitat fall short once T1 and T3 are seen live. Needs Q2 and Q6 of the PRD answered and the point-card work (item 6 of `memory/pending.md`) in sight. Not detailed here; if it opens, it gets its own states table before coding (`system/workflows.spec.md`, «Components with states») and its own spec and scenarios.

---

## Out of this epic

- **Top 10 by species**: its own epic. The contract left here is `useActiveSpecies`; the row stays inert.
- **Zonas de interés by species**: `observatory-zones-of-interest-prd.md`. The species is a lens there, not a filter that hides pins; adjust that PRD when it starts.
- **A species filter inside the «Mis rincones» dialog** (local to the list, next to kind, comarca and forest): possible follow-up, noted in `memory/pending.md`.
- **Several species at once**; changes to the scoring model.
