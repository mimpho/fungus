# Plan — `epic/observatory-navigation`

> Technical plan and task breakdown. Product contract: [`observatory-navigation-prd.md`](observatory-navigation-prd.md) (open questions answered 2026-11-10; reasons in `memory/decisions.md`, «Observatory navigation: answers to the PRD's open questions»).
> Last updated: 2026-11-12

---

## Status

| # | Branch | Status |
|---|---|---|
| T1 | `feat/observatory-navigation-shell` | ✅ 2026-11-11 (see «T1 — as built» below) |
| T2 | `feat/observatory-navigation-phone` | ✅ 2026-11-11 (see «T2 — as built» below) |
| T3 | `feat/observatory-navigation-meteo` | ✅ 2026-11-11 (see «T3 — as built» below) |
| T4 | `feat/observatory-navigation-zonas-bosque` | ✅ 2026-11-12 (see «T4 — as built» below) |
| T5 | `chore/observatory-navigation-retire-old` | ⬜ |

Order: T1 → T2 → T3 → T4 → T5. T3 and T4 both touch `Observatory.jsx` and `i18n.js`, so they go one after the other. All branches are cut from `epic/observatory-navigation` and squash-merged into it.

The PRD suggested four branches; the shell is split into desktop (T1) and phone (T2) because it also carries the first-visit defaults, the loading bar and the Q5 coexistence rule.

---

## Findings in the current code

1. **Draw order is reversed.** `ObservatoryMap.jsx` creates `FOREST_PANE` at z-index 340 and `LAYER_PANE` (conditions) at 350: the forest is drawn **under** the conditions. The PRD wants Meteo at the bottom and Bosque above it (T4).
2. **Switching Condiciones on holds the page.** Working out the colours is synchronous; `MapPills` hides it by opening the popover first and switching the layer on after the slide (`waking`, `SLIDE_MS`). With Meteo on by default, the first computation must wait until the base map has painted (T1).
3. **Phone top right is taken** by the fullscreen button (`Maximize`, 52 px). The PRD puts Vista «next to the search». Where both go is decided in T2. The «Mis rincones» button under the search (`SavedPointsToggle compact`) goes: its job moves to «Ver listado» in Zonas (T4).
4. **The phone sheet already reports its height** (`onSheetHeight` → `centerAbove`), which keeps the picked point above it. The desktop panel needs the same idea sideways (T1).
5. **No front-end tests** (no test script in `package.json`; `system/workflows.spec.md` leaves front-end code untested). Each task is accepted with `npm run build` clean plus a manual QA pass against its scenarios.
6. **Today «Mis rincones» is on by default** (`fungus-obs-corners`, missing = on). The key is kept and becomes the Zonas switch (T1).

---

## Shared vocabulary

- **Tab**: Meteo, Zonas or Bosque. Code ids: `data`, `zones`, `forest`.
- **Switch**: whether a tab's layer is drawn. **Dot**: the mark on a tab icon while its switch is on.
- **Panel**: a tab's content (desktop: beside the rail; phone: a sheet over the tab bar). Vista has a panel too, but no switch and no dot.
- **Off look**: panel content at 40 % opacity, `inert`, under one transparent button «Activar {capa}».

---

## T1 · `feat/observatory-navigation-shell` — state model and desktop shell

**Files**
- New: `src/hooks/useMapNavigation.js` (open tab, switches, defaults, persistence), `src/hooks/useMapBusy.js`, `src/components/observatory/nav/` (`TabRail.jsx`, `NavPanel.jsx`, `PanelSwitch.jsx`, `ViewButton.jsx`, `ViewPanel.jsx`, `MapLoadingBar.jsx`), base-map thumbnails in `public/assets/images/observatory/`.
- Modified: `src/pages/Observatory.jsx`, `src/components/observatory/ObservatoryMap.jsx` (room for the panel when centring), `src/styles.css` (shadow tokens), `src/data/i18n.js`.

**Spec**
1. `useMapNavigation` holds `openTab` (`data | zones | forest | view | null`) and `on = { data, zones, forest }`. Opening a tab closes any other panel, Vista's included. Tapping the open tab closes it. A switch keeps its value when its panel closes.
2. First-visit defaults: `data` on, `zones` on if the user has saved corners (decided once the corners have loaded), `forest` off. Each switch is stored in `localStorage` (`fungus-obs-data`, `fungus-obs-corners` (reused), `fungus-obs-forest`); a stored value wins over the default. Wrap every read and write in try/catch.
3. Desktop layout: tab rail top right (icon + label per tab, dot when on); Vista button and the Leaflet zoom bottom right; search top left (unchanged); panel to the left of the rail, at most 400 px wide (25 rem), height to its content with a max height and inner scroll.
4. Panel header: tab name and `PanelSwitch` (`role="switch"`, `aria-checked`). Off look as in the vocabulary; a tap on it turns the switch on and does nothing else. The species field is the exception: it turns `data` on and keeps the focus (T3 wires the field; T1 provides the hook for it).
5. The panels hold today's content, moved as it is: `SpeciesLayerPicker` in Meteo, the corners checkbox plus the list button in Zonas, `ForestTypeLegend` in Bosque. Their final layout comes in T3 and T4.
6. Vista panel: Satélite · Mapa · Relieve with thumbnails; picking one closes the panel. Choice stored in `fungus-obs-basemap` as today.
7. Desktop closing: the panel closes with its tab or Esc. Esc joins the page's chain: phone fullscreen → zone layer → open panel → point card. A map click does not close the panel.
8. Coexistence (Q5): at ≥ 1024 px the point card (bottom left) and the panel are open together; from 640 to 1023 px opening one closes the other. When the map centres a point (search, zoom to the point) with a panel open, it leaves the panel's width free.
9. `useMapBusy(sources)` is true while any source whose layer is **on** is loading. `MapLoadingBar` sits on the top edge of the map: indeterminate, shown after 300 ms, kept for at least 400 ms, `role="progressbar"` without value, label «Cargando capas», `aria-busy` on the map, static under `prefers-reduced-motion`. If an on layer fails, a compact notice on the same edge: «No se pudo cargar {capa} · Reintentar».
10. Entry performance: the first Condiciones computation starts after the base map has painted (e.g. after the first `load` of the tile layer, or the next idle callback), so entering the page never freezes the map.
11. Shadow tokens: `--shadow-float: 0 4px 16px rgba(0,0,0,.45)` (search, buttons, rail, zoom, panels) and `--shadow-bottom: 0 -4px 16px rgba(0,0,0,.45)` (bars and sheets on the bottom edge).
12. Phone (< 640 px) keeps the old `MapLayersBox` until T2.

**Scenarios**

```gherkin
Feature: Desktop navigation shell

  Background:
    Given a logged-in user on /observatorio at 1280 px wide

  Scenario: First visit with saved corners
    Given the browser has no stored Observatory switches
    And the user has 12 saved corners
    When the page opens
    Then the base map is shown before the conditions colours
    And the Meteo tab and the Zonas tab show a dot
    And the Bosque tab shows no dot
    And no panel is open

  Scenario: First visit without saved corners
    Given the browser has no stored Observatory switches
    And the user has no saved corners
    When the page opens
    Then only the Meteo tab shows a dot

  Scenario: Switches are remembered
    Given the user switched Meteo off and Bosque on
    When the page is reloaded
    Then Meteo is off and Bosque is on

  Scenario: Opening, replacing and closing panels
    When the user clicks the Meteo tab
    Then the Meteo panel opens to the left of the rail
    When the user clicks the Zonas tab
    Then the Zonas panel replaces it
    When the user clicks the Zonas tab again
    Then no panel is open
    And every switch keeps its value

  Scenario: Vista and tab panels never show together
    Given the Bosque panel is open
    When the user clicks the Vista button
    Then the Bosque panel closes and the Vista panel opens
    When the user picks «Relieve»
    Then the base map is the relief and the Vista panel closes

  Scenario: A tap on dimmed content only switches the layer on
    Given the Bosque switch is off and its panel is open
    When the user clicks the «Encinar» row
    Then the Bosque switch is on and the Bosque tab shows a dot
    And every forest class keeps its previous state

  Scenario: Point card and panel coexist on a wide screen
    Given the Meteo panel is open
    When the user clicks a point on the map
    Then the point card opens at the bottom left
    And the Meteo panel stays open

  Scenario: Point card and panel take turns on a narrow desktop
    Given the window is 900 px wide and the Meteo panel is open
    When the user clicks a point on the map
    Then the point card opens and the Meteo panel closes

  Scenario: Esc closes the panel before the point card
    Given the point card and the Meteo panel are open
    When the user presses Esc
    Then the Meteo panel closes and the point card stays
    When the user presses Esc again
    Then the point card closes

  Scenario: Loading bar
    Given Meteo is on
    When the conditions take more than 300 ms to arrive
    Then a thin bar shows on the top edge of the map until they are drawn
    And no bar shows when the answer comes from the cache

  Scenario: A layer that fails
    Given Meteo is on and the conditions request fails
    Then the map shows «No se pudo cargar Condiciones · Reintentar»
    When the user clicks «Reintentar»
    Then the request is made again

  Scenario: Keyboard
    When the user tabs through the rail
    Then each tab is reachable and announces whether its panel is expanded
    And each switch toggles with Space
```

**Done when** the scenarios pass by hand, `npm run build` is clean, and the phone still works with the old layers card.

---

### T1 — as built (2026-11-11)

What changed against the spec above, for the tasks that follow:
- **One surface for the map's floating controls:** `.map-surface` in `src/styles/map.css` (the search's `--color-search-bg`, `#4c5240`; white 85 % in the light theme), not the artboards' `#30372a`. Used by the rail, panels, Vista, zoom, failure notice, the desktop point card and the map hint. **T2** applies it to the phone bar, sheets and the point's sheet (still `glass-olive-80`).
- **Layer pictures are worked out after the next paint** (`afterPaint` in `ObservatoryMap.jsx`) and the new picture replaces the old one only when it is ready; `onDrawing` feeds the loading bar. Without it a switch flipped on only after the picture was ready (React flushes the effects of a click before painting).
- **Conditions layer on the satellite:** `mix-blend-mode: hard-light` (`LAYER_BLEND`) and opacity factor 1.7 (was plain alpha, 0.8). The forest layer keeps its own factor (`FOREST_ALPHA_SCALE_BY_BASEMAP`, 0.8): its look is decided in **T4** (spec item 5).
- **Desktop search** stops before the rail, and before an open panel.
- **Not done here, left to T3:** with Meteo off, the dimmed Condiciones content shows only the species field (`SpeciesLayerPicker` hides the slider and legend while the layer is off); T3's Condiciones content must show them dimmed too. The rows «Pronto» (Lluvia, Temperatura, Viento, Zonas de interés, Top 10) are gone from desktop until T3 and T4.
- Sizes of the new controls are in px, not rem (the base font is 18px; see `memory/gotchas.md`).

---

## T2 · `feat/observatory-navigation-phone` — phone shell

**Files**
- New: `src/components/observatory/nav/PhoneTabBar.jsx`.
- Modified: `src/pages/Observatory.jsx`, `src/components/observatory/PointPanel.jsx` (`PointSheet` rises above the bar), `src/components/observatory/nav/ViewButton.jsx` / `ViewPanel.jsx` (phone placement), `src/data/i18n.js`.

**Spec**
1. With no tab open, the tab bar is a full-width bar fixed to the bottom of the map, top corners rounded, no drag handle, `--shadow-bottom`. Three tabs (icon + label + dot).
2. Opening a tab grows a sheet upward from the bar; the bar and its three icons do not move. The sheet scrolls inside and never covers more than 80 % of the map's height.
3. The point's sheet (`PointSheet`) rises from above the bar too, in the same place as a tab's sheet; its drag-down-to-close stays.
4. One sheet at a time (Q5): a tab tap closes the point's sheet and drops the picked point; a picked point or a search result closes the tab's sheet; with a tab's sheet open, the first map tap only closes it.
5. Vista (decided 2026-11-11, see `memory/decisions.md`): the bar's fourth button, after a thin line, with no switch and no dot; it opens as a sheet out of the bar like a tab, and picking a base map closes it. Fullscreen sits next to the search. No zoom buttons on the phone (pinch).
6. `centerAbove` uses the bar's height when no sheet is open, and the sheet's height when one is.
7. Touch targets ≥ 44 px. `MapLayersBox` is no longer rendered (deleted in T5). The compact `SavedPointsToggle` under the search goes.

**Scenarios**

```gherkin
Feature: Phone navigation shell

  Background:
    Given a logged-in user on /observatorio on a 390 px wide phone

  Scenario: The bar at rest
    When the page opens
    Then a full-width bar with Meteo, Zonas and Bosque is fixed at the bottom of the map
    And it has rounded top corners and no drag handle

  Scenario: The icons do not move
    When the user taps Meteo
    Then a sheet grows upward from the bar with the Meteo panel
    And the three tab icons stay in the same place
    When the user taps Meteo again
    Then the sheet closes and the icons are still in the same place

  Scenario: A tab closes the point's sheet
    Given the point's sheet is open for a picked point
    When the user taps Zonas
    Then the point's sheet closes, the picked point is dropped and the Zonas sheet opens

  Scenario: A map tap with a tab's sheet open
    Given the Bosque sheet is open
    When the user taps the map
    Then the Bosque sheet closes and no point is picked
    When the user taps the map again
    Then the point's sheet opens above the bar

  Scenario: A search result closes the tab's sheet
    Given the Meteo sheet is open
    When the user picks a search result
    Then the Meteo sheet closes and the point's sheet opens for that place

  Scenario: Vista
    Given the Zonas sheet is open
    When the user taps Vista in the bar
    Then the Zonas sheet gives way to the Vista sheet and the icons stay in the same place

  Scenario: Fullscreen
    When the user enters fullscreen
    Then the tab bar stays at the bottom of the screen and the loading bar at its top edge
```

**Done when** the scenarios pass on iOS Safari and Android Chrome, in and out of fullscreen and with the browser bars showing.

---

### T2 — as built (2026-11-11)

What changed against the spec above, for the tasks that follow:
- **Vista is the bar's fourth button** (after a thin line, no switch, no dot) and opens as a sheet like a tab; not next to the search, and not the desktop's floating button (a tab's sheet covered it). The top of the map holds the search and the fullscreen button. No zoom buttons on the phone (pinch). Reasons in `memory/decisions.md`.
- **One component for the bar and its sheet:** `PhoneTabBar` (bar and sheet are one surface; the sheet grows with a `grid-template-rows` transition and only scrolls once it is still). It reports two heights: the whole (for `centerAbove`) and the bar alone (`--obs-bottom-clear`, which lifts Leaflet's credits).
- **Panels are shared with desktop:** `navPanel(tab, { flat })` in `Observatory.jsx` builds a tab's panel for both devices; `NavPanel` and `ViewPanel` have a `flat` prop (no surface of their own) for the sheet. **T3 and T4** change the panels' content there once and it shows on both devices.
- **The point's sheet** sits on top of the bar (`sheetBottomPx`); the bar is above it in z-order, so the sheet slides in and out from behind the bar. Its look (it reads as coming out of the bar) is left for the point-card work, `memory/pending.md` item 6.
- **Search flight:** `ObservatoryMap` keeps a searched point clear of the sheet when the flight ends (`flyingRef`), instead of panning during the flight.
- Not checked here: real iOS Safari and Android Chrome (Marcos), with and without fullscreen and the browser bars.

---

## T3 · `feat/observatory-navigation-meteo` — Meteo panel

**Files**
- New: `src/components/observatory/nav/MeteoPanel.jsx`, `src/components/observatory/nav/RainPresets.jsx`, `src/components/observatory/nav/LayerLegend.jsx` (scale as a prop).
- Modified: `src/components/observatory/SpeciesLayerPicker.jsx` (becomes the Condiciones content), `src/components/observatory/LayerDayControl.jsx` (shared by every Meteo segment), `src/lib/observatoryView.js` and `src/hooks/useObservatoryView.js` (`capa`, `seta`, `dia`), `src/components/observatory/ObservedZone.jsx` and `src/pages/Observatory.jsx` (hand-off of the day), `src/data/i18n.js`.

**Spec**
1. Segmented control Condiciones · Lluvia · Temp. · Viento. Only Condiciones works; the other three are `aria-disabled` with a «Pronto» mark. In development builds (`import.meta.env.DEV`) they open their placeholder panels; in production they do not open.
2. Condiciones keeps today's behaviour: species field with placeholder «Filtrar por seta» (empty = mean of the excellent species), day slider −30 … +7 with the forecast stretch, step buttons, «Hoy», thermometer legend. Focusing the field with Meteo off switches it on and keeps the focus.
3. Out of season, the Condiciones legend says so (few species in season), so a grey map does not read as broken.
4. Lluvia placeholder panel: presets 24 h · 7 d · 21 d (default 7 d), window ending on the slider's day, label «Acumulado {desde}–{hasta} · {n} días», «incluye previsión» when the day is in the forecast stretch, `LayerLegend` in mm with placeholder cuts (21 d: the 60–120 mm «good» band of the zone's rain chart). Temperatura and Viento: slider and legend only.
5. URL (Q6): while Meteo is on, `capa` (`condiciones`), `seta` (species id, missing = excellent mean) and `dia` (YYYY-MM-DD, missing = today). Written with history replace. On open: invalid values are dropped; `dia` outside −30 … +7 is clamped. With Meteo off the three go; the last choice stays in memory for when it is switched on again. URL values win over stored switches (a link with `capa` turns Meteo on).
6. Hand-off to the observed zone, once when it opens: the species (as today) and, if `dia` is set, `hasta = dia` clamped to the last real day (`resolveWindow` already clamps).

**Scenarios**

```gherkin
Feature: Meteo panel

  Background:
    Given a logged-in user on /observatorio with Meteo on

  Scenario: Conditions for a species and a day
    When the user opens Meteo and picks «Boletus edulis» in «Filtrar por seta»
    Then the map shows the conditions of that species
    And the URL has capa=condiciones and seta=<its id>
    When the user moves the slider three days back
    Then the colours follow once the slider rests
    And the URL has dia=<that day>
    And the browser's Back button does not step through the days

  Scenario: Back to today
    Given the slider is three days back
    When the user taps «Hoy»
    Then the URL has no dia parameter

  Scenario: A shared link
    Given the browser has Meteo stored as off
    When the user opens /observatorio?capa=condiciones&seta=<id>&dia=<5 days ago>
    Then Meteo is on with that species and that day

  Scenario: A day out of range in a link
    When the user opens a link with dia 60 days ago
    Then the slider is at its first day (30 days back)

  Scenario: Switching Meteo off and on
    Given a species and a day are chosen
    When the user switches Meteo off
    Then capa, seta and dia leave the URL
    When the user switches it on again
    Then the same species and day are shown

  Scenario: Typing with Meteo off
    Given Meteo is off and its panel is open
    When the user taps «Filtrar por seta»
    Then Meteo is on and the field has the focus

  Scenario: Segments not built yet
    Given a production build
    Then Lluvia, Temperatura and Viento show «Pronto» and cannot be selected

  Scenario: The day travels to the observed zone
    Given the slider is on a day 10 days ago and «Boletus edulis» is chosen
    When the user observes a point
    Then the zone opens with «Boletus edulis» and its window ending on that day

  Scenario: A forecast day travels to the observed zone
    Given the slider is on a day 3 days ahead
    When the user observes a point
    Then the zone's window ends on the last day with real data

  Scenario: Out of season
    Given a reference day when no excellent species is in season
    Then the legend says that few species are in season
```

**Done when** the scenarios pass and `npm run build` is clean.

### T3 — as built (2026-11-11)

What changed against the spec above, for the tasks that follow:
- **One list of Meteo layers:** `src/lib/meteoLayers.js` (`METEO_LAYERS` with `ready`, `SHOW_PREVIEWS = import.meta.env.DEV`, rain presets and placeholder scales). The segmented control, the URL and the legends read it; `epic/observatory-meteo` turns a layer on by setting `ready` and adds its `param` to the links. Only ready layers can be named in `capa`; with a placeholder segment open (dev) the Meteo keys leave the URL.
- **Shared slider memory:** `layerDays(data)` in `LayerDayControl.jsx` keeps the last days the server gave, so the slider does not jump when Meteo is switched off and on, the species changes or another segment opens. The slider's range is counted from **today** (−30 … the last scorable day), not from the last day with data, so it matches the clamp of a link's `dia`. «Hoy» goes to today's offset (with no forecast, today is the last day with data and `dia` leaves the URL).
- **Condiciones off:** with Meteo off the panel ignores the layer's data (it may be the point's mean of the excellent ones while a species is chosen) and shows the slider and the legend as controls only. `SpeciesLayerPicker` keeps its `holding` prop and `LayerLoadingPlaceholder` export only for the old shell (T5 removes them).
- **Season note:** `seasonNote()` (exported for a quick check): a species out of season keeps `obsLayOutOfSeason`; the mean of the excellent ones says «none» or «only n of m» when fewer than a third are in season.
- **Hand-off:** `observe(lat, lon, { until })` writes `hasta` with the Meteo day (or the last real day for a forecast day). `ObservedZone.jsx` was not touched.
- **Links do not store:** `useMapNavigation({ dataFromUrl })` turns Meteo on for a link with `capa` without writing `fungus-obs-data`.
- **Shell fix taken here (asked during T3's review):** `ObservatoryMap` grows its drag limits (`maxBounds`) by what `centerAbove` covers (top, bottom, right), recomputed on zoom and when the covered area changes, so the south of Catalonia can be dragged up above an open sheet. When the sheet closes the map settles back inside the normal limits (the only automatic move).
- **Colours:** new tokens `--meteo-rain-*`, `--meteo-temp-*`, `--meteo-wind-*` in `tokens.css` (`:root`, both themes). `coffee-light` has no Tailwind opacity modifier: tinted fills use `color-mix()` (see `memory/gotchas.md`).
- Not checked here: forecast days (the local database had no fresh forecast), real iOS Safari and Android Chrome (Marcos).

---

## T4 · `feat/observatory-navigation-zonas-bosque` — Zonas and Bosque panels

**Files**
- New: `src/components/observatory/nav/ZonasPanel.jsx`, `src/components/observatory/nav/BosquePanel.jsx`.
- Modified: `src/components/observatory/ForestTypeLegend.jsx` (becomes the checklist, or is replaced by `BosquePanel`), `src/components/observatory/SavedPoints.jsx` (`SavedPointsToggle` goes), `src/components/observatory/ObservatoryMap.jsx` (pane order), `src/pages/Observatory.jsx`, `src/data/i18n.js`.

**Spec**
1. Zonas: three rows — Mis rincones (works), Zonas de interés and Top 10 (`aria-disabled`, «Pronto»). Each row: checkbox (`role="checkbox"`) and «Ver listado» with the count in a badge. «Ver listado» of Mis rincones opens the existing list modal (`ObsModal` + `SavedPointsList`); the inert rows show no count.
2. The Zonas switch draws the checked rows; the Mis rincones checkbox is remembered in `localStorage`.
3. Bosque: one checkbox per forest class with its colour, «Todos» / «Ninguno», and a counter «{n} de {total}». The checked classes are stored in `localStorage` (`fungus-obs-forest-classes`); unknown keys are ignored.
4. Draw order (bottom to top): Meteo colours, Bosque classes, Zonas de interés, Top 10, Mis rincones. Swap the panes so the forest is above the conditions; labels stay above both.
5. Forest look, decided with the new order (raised during T1 QA, 2026-11-11: on the satellite the forest reads as almost opaque and flat). Compare in the browser, alone and over the conditions: plain alpha (today, `FOREST_ALPHA_SCALE_BY_BASEMAP` 0.8 on satellite), `hard-light` alone, and translucent fill with an outline per class (as the PRD's draw-order rule says). Over the conditions the two layers must stay readable: two `hard-light` layers on top of each other mix into colours neither legend has.

**Scenarios**

```gherkin
Feature: Zonas and Bosque panels

  Background:
    Given a logged-in user on /observatorio with 12 saved corners

  Scenario: My corners and their list
    When the user opens Zonas
    Then the switch is on and «Mis rincones» is checked
    And «Ver listado» shows 12
    When the user taps «Ver listado»
    Then the list of corners opens

  Scenario: Rows not built yet
    Then «Zonas de interés» and «Top 10» show «Pronto» and cannot be checked

  Scenario: Forest over the conditions
    Given Meteo is on
    When the user switches Bosque on
    Then the forest classes are drawn over the conditions colours
    And the corners are drawn over both

  Scenario: Choosing forest classes
    Given Bosque is on
    When the user taps «Ninguno»
    Then no class is drawn and the counter reads «0 de 11»
    When the user checks «Hayedo»
    Then only beech forest is drawn and the counter reads «1 de 11»
    When the page is reloaded
    Then only «Hayedo» is checked

  Scenario: Forest over the satellite and over the conditions
    Given the base map is the satellite
    When the user switches Bosque on, with Meteo off and then on
    Then the forest classes can be told apart and the ground still reads through them
    And with Meteo on, both the conditions colours and the forest classes can be read

  Scenario: Keyboard
    When the user tabs into the Bosque panel
    Then each class checkbox toggles with Space
```

**Done when** the scenarios pass and flows 3 of the PRD can be followed end to end.

### T4 — as built (2026-11-12)

What changed against the spec above, for the tasks that follow:
- **Eleven forest classes, not eight:** the counter reads «{n} de 11» (`FOREST_TYPES`); the scenario above was corrected. The design's artboard draws ten made-up classes.
- **One checkbox for both panels:** `nav/NavCheckbox.jsx` (`role="checkbox"`, a button, so Space and Enter toggle it; the box takes the switch's tokens `--switch-on` / `--switch-thumb-on`; optional colour swatch; `aria-disabled` rows). Labels wrap instead of truncating (two columns of a 360 px panel are narrow for «Pinar de pino negro» or «Black pine (pinassa) forest»).
- **Storage:** the «Mis rincones» checkbox has its own key, `fungus-obs-zones-corners` (missing = checked), because `fungus-obs-corners` is the Zonas switch since T1. The Zonas layer draws the corners only with the switch on **and** the row checked. Bosque's classes: `fungus-obs-forest-classes`, a JSON list of keys (unknown keys dropped, unreadable = all).
- **Count badge:** solid fill with new tokens `--count-badge-bg` / `--count-badge-text` in `tokens.css` (dark `#c4a06b` / `#22281d`, 6.3:1; light `#8b6030` / white, 5.3:1), as in the artboard; the old `bg-coffee-light/25` drew nothing.
- **«Todos / Ninguno» in cream, not the artboard's gold:** `#c4a06b` on the dark surface (`#4c5240`) is 3.3:1, under 4.5:1. Each is disabled when it would change nothing.
- **Draw order:** panes conditions 350, forest 355, labels 360; 370 and 380 are reserved (comment) for «Zonas de interés» and Top 10; the corners stay in the marker pane (≥ 400).
- **Forest look: a translucent fill, no outline.** `MAX_ALPHA` in `forestLayer.js` 0.7 → 0.45 (× the share of forest); plain alpha, no blend. Forest factors per basemap lowered with it: streets 1.5 → 1.1, relief 2 → 1.1 (satellite stays 0.8). Compared in the browser over the satellite, with Meteo on and off: the old alpha and `hard-light` both covered the conditions completely. An outline per class was built and dropped in QA (Marcos): the raster's ~250 m pixels made the edges thick and stepped when zoomed in. Reasons in `memory/decisions.md`.
- **`ForestTypeLegend` and `SavedPointsToggle` are no longer used** (nor are `MapPills` / `MapLayersBox`, which import them); **T5** deletes them with the old shell, with their i18n keys (`obsForestHint` among them).
- Not checked here: the relief basemap; real iOS Safari and Android Chrome (Marcos).

---

## T5 · `chore/observatory-navigation-retire-old` — remove the old shell and final pass

**Files**
- Deleted: `src/components/observatory/MapPills.jsx` (with `ViewPill`), `src/components/observatory/MapLayersBox.jsx`.
- Modified: `src/data/i18n.js` (orphan keys), `system/project.spec.md` and `README.md` (roadmap rows out of date: no row for this epic, the base map epic still «Next»).

**Spec**
1. No import of the deleted components remains; no i18n key is left unused (checked with a grep of every `obs*` key against `src/`).
2. Full pass: ES / CA / EN, light and dark themes, iOS Safari and Android Chrome, keyboard and screen reader on tabs, switches, checkboxes and sliders, text contrast ≥ 4.5:1 (active fill `#766a3e`).

**Scenarios**

```gherkin
Feature: Old shell retired

  Scenario: No dead code
    When the source is searched for MapPills, ViewPill and MapLayersBox
    Then nothing is found

  Scenario: Languages and themes
    Given each of ES, CA and EN, in light and in dark
    When the user goes through every tab, Vista and the point card
    Then every string is translated and every text meets 4.5:1 contrast
```

**Done when** every item of the PRD's Definition of Done is ticked, except the retrospective and the merge into `main`.
