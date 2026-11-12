# PRD — Observatory map navigation: one model for desktop and phone (`epic/observatory-navigation`)

> Product Requirements Document. Written before the first feature branch.
> Once all Open questions are resolved and DoD is written, development can start.
> Last updated: 2026-11-10
>
> **Design source of truth**: Claude artifact «Observatorio — propuestas de filtros y vistas del mapa», <https://claude.ai/artifact/NXnBaSTjJSZcLGrbhuQB3g>. **Proposal C** is the chosen one; A and B are kept in the canvas only as discarded alternatives. Every screen cited below is an artboard of that canvas, named as in its title («C · …»).

---

## Problem / Why

Navigation inside the Observatory map has grown layer by layer and today works in two different ways:

- **Desktop**: a column of pills at the right edge (`MapPills`), each with its own popover; «Mis rincones» has a list button, the conditions layer has its species search, day slider and legend, «Tipo de bosque» has its checkbox legend, and a separate «Vista» dropdown (`ViewPill`). One click switches a layer on or off.
- **Phone**: the same things live in a layers card (`MapLayersBox`) behind one button, with a different structure.

Three more data layers (rain, temperature, wind) and «Zonas de interés» are coming. With the current pattern each one adds a pill, its own popover and a phone variant. Each layer also has particular controls (species filter, time slider, rain accumulation window, checklists, list modal) and there is no shared place for them.

This epic gives the map **one navigation model, identical in structure on desktop and phone**, before the new layers are built. It comes before the phone improvements that were planned: those improvements are applied on top of this model, not on the old one.

---

## The model (proposal C)

Four controls, the same on both devices:

| Control | What it is | Behaves as |
|---|---|---|
| **Meteo** | The data layers: Condiciones, Lluvia, Temperatura, Viento | Tab with a switch; one data layer shown at a time (they share the day slider and the legend) |
| **Zonas** | Mis rincones, Zonas de interés and Top 10 | Tab with a switch; each item a checkbox, plus «Ver listado» (opens the existing list modal) |
| **Bosque** | The forest class layer | Tab with a switch; one checkbox per forest class, with its colour |
| **Vista** | Satellite / Map / Relief (Satellite already carries place names; see Q4) | A separate button (not a tab, no switch): it chooses the base map |

Rules that hold on every screen:

1. **Layers accumulate.** Meteo, Zonas and Bosque can all be on at once and are drawn over the same map. Only inside Meteo is the choice exclusive (one data layer at a time).
2. **Each tab has a switch** (top right of its panel). **Defaults on a first visit** (Q7): Meteo **on** (Condiciones, mean of the excellent species, today), Zonas **on if the user has saved corners** (off otherwise), Bosque off. After that each switch is remembered in this browser (`localStorage`; Zonas takes over the current `fungus-obs-corners` key), and URL parameters win over what is stored. With the switch off the panel content is still shown, dimmed (40 %) and inert, so the user sees what turning it on will offer; a tap on it only turns the switch on (the tapped control does not act), except the species field, which turns Meteo on and keeps the focus. Turning the switch on keeps whatever was last chosen (checked classes, species, preset).
3. **A dot on a tab icon means «this layer is on»**. No dot, layer off. Vista never has a dot.
4. **One tap on a tab opens its panel**; a second tap on the same tab closes it, and the layer keeps its state. Opening another tab replaces the panel. Vista's panel and the tabs' panel never show together (opening one closes the other).
5. **Draw order** (bottom to top): Meteo colours, Bosque classes (translucent fill; the outline per class was dropped in T4 QA, 2026-11-12: the raster's ~250 m pixels made it stepped), Zonas de interés (pins, not outlines: corrected on 2026-11-12, see `memory/observatory-zones-of-interest-prd.md`), Top 10 (ranked markers), Mis rincones (points).

---

## Scope

### In — must ship

| Feature | Notes |
|---|---|
| New navigation shell, desktop | Tab rail at the top right, Vista button and zoom at the bottom right, search at the top left, panel opening to the left of the rail (≤ 400 px, height to content; Q9). Artboards «C · Desktop — …». |
| New navigation shell, phone | Bottom bar with three tabs. When no tab is open it is a full-width bar fixed at the bottom with rounded top corners and no drag handle; when a tab opens, a sheet grows upward from the bar and **the three icons do not move**. Vista is the layers button next to the search, opening a panel under it. Artboards «C · …». |
| **Meteo** panel | Segmented control Condiciones · Lluvia · Temp. · Viento; switch. Condiciones keeps today's behaviour: species field (placeholder «Filtrar por seta»; empty means the mean of the excellent species as today), reference-day slider −30 d … +7 d with the forecast stretch marked, step buttons, «Hoy», thermometer-style legend. Lluvia / Temperatura / Viento panels are built as in the artboards (no species field, own legend). Lluvia shows the rain **accumulated over a window that ends on the day of the shared day slider**; its length is chosen with presets **24 h · 7 d · 21 d** (default 7 d). No two-handle window on the map (see Q2). The 21 d preset is the same measure as the 21-day line of the observed zone's rain chart and of the score (PA21). |
| **Zonas** panel | Three rows: Mis rincones (works today), Zonas de interés and Top 10 (both inert, «Pronto»). Each: checkbox + «Ver listado» button with the count in a badge. Top 10 ranks by the Meteo tab's species and day (see Q5 notes in `memory/decisions.md`). |
| **Bosque** panel | Checkbox per forest class with its colour, «Todos / Ninguno», counter. Replaces the legend popover and the phone card. |
| **Vista** | Satellite · Map · Relief with thumbnails. |
| Off state and defaults | Shared by the three tabs, as described in rule 2. The first-visit state is no longer the artboard «C · Inicio» / «C · Desktop — Inicio» (nothing on): Meteo is on and Zonas too when there are corners (Q7). The artboards still give the layout and the off look. Out of season the Condiciones legend says so (few species in season), so a grey first map does not read as broken. |
| Loading and error on the map | A thin indeterminate bar on the **top edge of the map** (under the header on desktop; top of the screen in the phone's fullscreen) while any layer that is **on** is loading: Meteo and its rasters, the Bosque raster, later the `observatory-meteo` layers. Shown only after ~300 ms and for at least ~400 ms, so cached answers never flash it; a layer loading in the background while off (the point card's mean of the excellent species) does not show it. One small hook (`useMapBusy`) gathers the statuses. `role="progressbar"` without value, «Cargando capas», `aria-busy` on the map, static under `prefers-reduced-motion`. If an on layer fails, the bar gives way to a compact notice on the same edge, «No se pudo cargar {capa} · Reintentar». The panel keeps its own skeleton and dimmed legend. |
| Shadows | Two tokens only: floating controls (search, buttons, rail, zoom, panels): `0 4px 16px rgba(0,0,0,.45)`; bars and sheets attached to the bottom edge: `0 -4px 16px rgba(0,0,0,.45)`. |
| Retire the old shell | `MapPills`, `MapLayersBox`, `ViewPill` and their phone counterparts go once the new one is in place (no dead code left behind, see the chore pending after `epic/observatory-map`). |
| Accessibility | Tabs with `aria-expanded` / `aria-pressed`; switches `role="switch"`; checkboxes `role="checkbox"`; the day slider and both rain handles `role="slider"` with `aria-valuetext` and keyboard control; touch targets ≥ 44 px; text contrast ≥ 4.5:1. Active fill per theme (tokens `--nav-active`, `--switch-on` in `src/styles/tokens.css`): dark `#766a3e`, darker than `--bar` for this reason; light the buttons' green `--color-bar` (`#758847`), with only an icon inside the tab pill (3:1); white text on it (open Vista, buttons) is ~3.9:1, to review in T5. |
| i18n | ES / CA / EN for every new string; light and dark themes checked (the artboards are drawn on the dark theme only). |

### Out — explicitly excluded

| Feature | Reason / deferred to |
|---|---|
| Data for rain, temperature and wind (ingest, endpoints, colour scales) | `epic/observatory-meteo` (full stack; renamed from `observatory-layers`, rain first). In this epic those three segments exist in the panel but are inert («Pronto»), as the pills are today. |
| «Zonas de interés» data, endpoint, markers, tap to observe | `epic/observatory-zones-of-interest`. The row exists and is inert until then. |
| Top 10 data and ranking | Lives in the **Zonas** tab as a third row, inert here. Not a weather layer, so not in `epic/observatory-meteo`; what it ranks (cells or zones), over which region and in which epic it is built are decided later (`memory/pending.md`, item 7f). |
| Other phone improvements (point sheet, fullscreen, search, etc.) | Follow-up on top of this model. |
| Real 3D / MapLibre | Discarded earlier. |

---

## User flows

**Flow 1 — First visit.** The user opens the Observatory and sees the base map with the search, the Vista button and the three tabs (a floating block on desktop; the rounded bar at the bottom on phone). The base map shows at once; the conditions of today (mean of the excellent species) are drawn over it when they arrive. The Meteo tab has its dot; Zonas too, with the corners on the map, if the user has any. No panel is open.

**Flow 2 — See the conditions for a mushroom.**
1. User taps **Meteo**. The panel opens with Condiciones selected and the switch on (first visit); the species field shows «Filtrar por seta».
2. User types a species in the field and picks one from the suggestions; the colours change to that species.
3. User drags the day slider or taps the step buttons; the colours follow once the finger rests.
4. User taps **Meteo** again: the panel closes, the layer stays on.

**Flow 3 — Add the forest and my corners over it.**
1. With Meteo on, the user (who has 12 saved corners) taps **Zonas**. The Meteo panel closes, the Zonas panel opens with its switch already on: Mis rincones are points over the conditions colours. Both tabs keep their dots.
2. User taps «Ver listado · 12»: the list modal opens. (A user without corners finds the switch off and the rows dimmed; a tap on them turns it on.)
3. User taps **Bosque**, turns it on, and unticks the classes they do not want. The map now shows the three layers at once.

**Flow 4 — How much did it rain?**
1. In Meteo the user picks **Lluvia**. The species field is gone. The day slider stays where it was; the default window is the 7 days ending on that day.
2. User taps «21 d». The label reads «Acumulado 21 oct – 10 nov · 21 días» and the legend is in mm, with the 60–120 mm «good» band of the zone's rain chart.
3. User drags the day slider: the heat map follows, showing how the accumulated rain moves across Catalonia.

**Flow 5 — Change the base map.** User taps **Vista** (bottom right on desktop; next to the search on phone), picks Relief; the panel closes with the choice.

---

## Open questions

| # | Question | Owner | Answer |
|---|---|---|---|
| 1 | Name of the first tab. «Datos» is a working name: «Clima» does not cover the species-based Condiciones; «Capas» is too generic. | Marcos | ✅ **Meteo** (ES) · **Meteo** (CA) · **Weather** (EN). Short enough for the phone bar, and it names what the tab's layers share: they change by day and share the day slider. Code id stays neutral (`data`), so a later rename or Top 10 joining the tab does not ripple. (2026-11-10) |
| 2 | Does the rain window have its own legend scale per window length (30 mm in a day is not 30 mm in 15 days), or a fixed scale? Needs the data from `observatory-meteo`. | Marcos / layers epic | ✅ **One fixed scale per preset, always in mm, never fitted to the data on screen.** The map has no free-length window: the window ends on the shared day slider and its length is a preset, 24 h · 7 d · 21 d. The 21 d scale reuses the 60–120 mm «good» band of the zone's rain chart; the cuts for 24 h and 7 d are set by `observatory-meteo` with real data. This epic builds the legend with the scale as a prop and placeholder cuts. A variable-length window on the map (two handles, like the zone's timeline) is a possible future improvement, not planned. (2026-11-10) |
| 3 | The rain window's right end inside the forecast mixes measured and forecast rain: how is it flagged? (Proposed: the hatched forecast stretch of the slider, as today.) | Marcos | ✅ As proposed, simpler after Q2: when the slider's day is in the forecast stretch, the accumulation includes forecast days; flagged by the hatched stretch of the slider and an «incluye previsión» tag next to the label. (2026-11-10) |
| 4 | Is a fourth base map (Hybrid: satellite with labels) wanted and available from the tile providers used? Today there are three. | Marcos | ✅ **No: three base maps, Satélite · Mapa · Relieve.** «Satélite» is already hybrid (ICGC `orto-hibrida`, names and roads printed in). What is missing is the opposite, a satellite without labels (better for reading the layer colours); it needs an ICGC orthophoto without text, URL not located (`memory/pending.md`, 7b-bis): possible future improvement, not in this epic. The Vista panel's thumbnails are static images in `public/`. (2026-11-10) |
| 5 | When the point's card (phone sheet / desktop panel) opens, what happens to an open layers panel? Today the phone closes one when the other opens; confirm that rule for both devices and for the new sheet. | Marcos | ✅ **Desktop: they coexist** (point card bottom left, tab panel top right), so moving the species or the day shows the point's value change; below **1024 px** wide they would overlap, and the phone rule applies. **Phone: one at a time**, as today: the point's sheet rises from above the tab bar (same place as a tab's sheet; the bar and its icons stay), a tab tap closes the point's sheet and drops the point, a picked point or search result closes the tab's sheet, and with a tab's sheet open the first map tap only closes it. Vista is one more panel under the same rule. (2026-11-10) |
| 6 | Does the URL view state (already holds the point and the view) also store open tab, data type, species, day and forest classes? Proposed: yes for data type, species, day and classes; no for open tab. | Marcos | ✅ **The URL holds what is being looked at; `localStorage` holds preferences.** URL, only while Meteo is on: `capa` (data type), `seta` (species id), `dia` (YYYY-MM-DD, left out when it is today; clamped to −30…+7 on open), later `acum` (rain preset, wired by `observatory-meteo`). Written with history replace, like the zone window. `localStorage`: Zonas and Bosque switches, Bosque classes (with the base map and Mis rincones, as today). Neither: the open tab. Hand-off to the observed zone, once on opening: species (as today) and, when the day is not today, `hasta` = that day, clamped to the last real day. Unlike the proposal, the forest classes stay out of the URL. (2026-11-10) |
| 7 | Should tapping the dimmed content of a panel with the switch off turn the switch on? Proposed: yes (dimmed content must not feel broken). | Marcos | ✅ **Yes, and the tap only turns the switch on**: the tapped control does not act (unticking a class to hide it must not end up showing the forest). Exception: the species field turns Meteo on and keeps the focus. Built as `inert` content under a transparent button «Activar {capa}». Asked with it, the defaults change (rule 2): Meteo on and Zonas on when the user has corners on a first visit, Bosque off, each switch then remembered per browser. (2026-11-10) |
| 8 | Do the inert rows (Lluvia, Temperatura, Viento, Zonas de interés, Top 10) show «Pronto» as today, or hide until built? Proposed: show, inert, with the tag. | Marcos | ✅ **Shown, inert, with «Pronto».** Zonas: Zonas de interés and Top 10 as disabled rows. Meteo: the four segments always there, Lluvia / Temperatura / Viento `aria-disabled` with a «Pronto» mark (hiding them would leave a one-option segmented control, to be removed and added back). Their built panels (presets, legend with placeholder cuts) open only in development builds (`import.meta.env.DEV`, no new variable) for review and QA, so production never shows fake figures. If `observatory-meteo` slips far, hiding them is a one-line change. (2026-11-10) |
| 9 | Desktop: the panel covers up to ~460 px at the right of the map. Acceptable, or open the panel as a bottom deck? (Alternative A in the canvas.) | Marcos | ✅ **Side panel at the right, as in proposal C**, with three adjustments: at most **400 px** wide (25 rem); height to its content with a max height and inner scroll, so the map shows below it; centring a point (search, zoom to the point) leaves the panel's width free, as `centerAbove` does for the phone sheet. On desktop a map click does not close the panel (points can be picked with it open); it closes with its tab or Esc, which joins the existing Esc chain. A bottom deck (A) would collide with the point card, which coexists with the panel at the bottom left (Q5). (2026-11-10) |

---

## Deployment readiness

- Front end only. No migration, no new environment variable, no backend change, no new dependency expected.
- Deploys with Vercel on the merge into `main`; no ordering with Render.
- Rollback: revert the merge commit.
- To check after deploy: phone (iOS Safari and Android Chrome, including the fullscreen mode and the browser bars), ES / CA / EN, light and dark, keyboard navigation of tabs, switches and sliders, and that the old shell leaves no orphan i18n keys.

---

## Branches

The task breakdown, with each task's spec and Gherkin scenarios, is in [`observatory-navigation-plan.md`](observatory-navigation-plan.md): T1 shell and desktop, T2 phone, T3 Meteo, T4 Zonas and Bosque, T5 retire the old shell. All cut from `epic/observatory-navigation`, squash-merged into it.

## Definition of Done

- [x] Desktop and phone navigation match proposal C in the canvas (states: initial, each tab off, each tab on, Vista).
- [x] Layers accumulate on one map in the draw order of this PRD; Meteo shows one layer at a time.
- [x] Switch off = default; panel content dimmed and visible; switching on restores the last choices; dots follow the switches.
- [x] On phone the tab icons do not move when the sheet opens or closes.
- [x] A layer that is on and loading shows the bar on the map's top edge (not for cached answers); a failed one shows the notice with «Reintentar».
- [x] The existing behaviour of Condiciones (species, day slider with forecast, legend), Mis rincones (map and list modal) and Bosque is unchanged in function.
- [x] Rain, temperature, wind, Zonas de interés and Top 10 appear as inert rows, ready to be wired by their epics.
- [x] Open questions 1–9 answered or consciously deferred and written in `memory/decisions.md`.
- [x] Old pills, layers card and view dropdown removed; no orphan i18n keys.
- [ ] ES / CA / EN, light and dark, iOS Safari and Android Chrome checked; keyboard and screen-reader pass on tabs, switches, checkboxes and sliders. — ES / CA / EN, light and dark, 390 and 1280 px and contrast done in T5 (2026-11-12); **after the deploy** (no real device before production): iOS Safari, Android Chrome, real keyboard and screen reader.
- [ ] Deployment readiness checks done.
- [ ] All feature branches squash-merged into `epic/observatory-navigation`
- [ ] Retrospective completed and workflow improvements applied
- [ ] `epic/observatory-navigation` merged to `main` with `--no-ff`, tagged `vX.Y.0`
