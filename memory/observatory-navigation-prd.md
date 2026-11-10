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
| **Datos** | The data layers: Condiciones, Lluvia, Temperatura, Viento | Tab with a switch; one data layer shown at a time (they share the day slider and the legend) |
| **Zonas** | Mis rincones and Zonas de interés | Tab with a switch; each item a checkbox, plus «Ver listado» (opens the existing list modal) |
| **Bosque** | The forest class layer | Tab with a switch; one checkbox per forest class, with its colour |
| **Vista** | Satellite / Map / Relief (and maybe Hybrid, see Open questions) | A separate button (not a tab, no switch): it chooses the base map |

Rules that hold on every screen:

1. **Layers accumulate.** Datos, Zonas and Bosque can all be on at once and are drawn over the same map. Only inside Datos is the choice exclusive (one data layer at a time).
2. **Each tab has a switch** (top right of its panel). Off is the **default** for all three. The panel content is still shown when off, dimmed (40 %) and not interactive, so the user sees what turning it on will offer. Turning the switch on keeps whatever was last chosen (checked classes, species, window).
3. **A dot on a tab icon means «this layer is on»**. No dot, layer off. Vista never has a dot.
4. **One tap on a tab opens its panel**; a second tap on the same tab closes it, and the layer keeps its state. Opening another tab replaces the panel. Vista's panel and the tabs' panel never show together (opening one closes the other).
5. **Draw order** (bottom to top): Datos colours, Bosque classes (translucent fill with outline), Zonas de interés (dashed outline), Mis rincones (points).

---

## Scope

### In — must ship

| Feature | Notes |
|---|---|
| New navigation shell, desktop | Tab rail at the top right, Vista button and zoom at the bottom right, search at the top left, panel opening to the left of the rail. Artboards «C · Desktop — …». |
| New navigation shell, phone | Bottom bar with three tabs. When no tab is open it is a full-width bar fixed at the bottom with rounded top corners and no drag handle; when a tab opens, a sheet grows upward from the bar and **the three icons do not move**. Vista is the layers button next to the search, opening a panel under it. Artboards «C · …». |
| **Datos** panel | Segmented control Condiciones · Lluvia · Temp. · Viento; switch. Condiciones keeps today's behaviour: species field (placeholder «Filtrar por seta»; empty means the mean of the excellent species as today), reference-day slider −30 d … +7 d with the forecast stretch marked, step buttons, «Hoy», thermometer-style legend. Lluvia / Temperatura / Viento panels are built as in the artboards (no species field, own legend). Lluvia has the **accumulation window** (two handles plus presets 24 h · 3 d · 7 d · 15 d), defaulting to 7 d ending today. |
| **Zonas** panel | Two rows, Mis rincones (works today) and Zonas de interés. Each: checkbox + «Ver listado» button with the count in a badge. |
| **Bosque** panel | Checkbox per forest class with its colour, «Todos / Ninguno», counter. Replaces the legend popover and the phone card. |
| **Vista** | Satellite · Map · Relief with thumbnails. |
| Off state | Shared by the three tabs, as described in rule 2. Initial state of the map (no tab open, nothing on) is the artboard «C · Inicio» / «C · Desktop — Inicio». |
| Shadows | Two tokens only: floating controls (search, buttons, rail, zoom, panels): `0 4px 16px rgba(0,0,0,.45)`; bars and sheets attached to the bottom edge: `0 -4px 16px rgba(0,0,0,.45)`. |
| Retire the old shell | `MapPills`, `MapLayersBox`, `ViewPill` and their phone counterparts go once the new one is in place (no dead code left behind, see the chore pending after `epic/observatory-map`). |
| Accessibility | Tabs with `aria-expanded` / `aria-pressed`; switches `role="switch"`; checkboxes `role="checkbox"`; the day slider and both rain handles `role="slider"` with `aria-valuetext` and keyboard control; touch targets ≥ 44 px; text contrast ≥ 4.5:1 (the active fill is `#766a3e`, darker than the `--bar` token, for this reason). |
| i18n | ES / CA / EN for every new string; light and dark themes checked (the artboards are drawn on the dark theme only). |

### Out — explicitly excluded

| Feature | Reason / deferred to |
|---|---|
| Data for rain, temperature and wind (ingest, endpoints, colour scales) | `epic/observatory-layers`. In this epic those three segments exist in the panel but are inert («Pronto»), as the pills are today. |
| «Zonas de interés» data, endpoint, markers, tap to observe | `epic/observatory-zones-of-interest`. The row exists and is inert until then. |
| Top 10 layer | `epic/observatory-layers` (item 7f). Where it goes in the model (probably a fifth segment of Datos) is decided there. |
| Other phone improvements (point sheet, fullscreen, search, etc.) | Follow-up on top of this model. |
| Real 3D / MapLibre | Discarded earlier. |

---

## User flows

**Flow 1 — First visit, nothing on.** The user opens the Observatory and sees the base map with the search, the Vista button and the three tabs (a floating block on desktop; the rounded bar at the bottom on phone). Nothing is highlighted and there are no dots.

**Flow 2 — See the conditions for a mushroom.**
1. User taps **Datos**. The panel opens with Condiciones selected, the species field showing «Filtrar por seta» and everything dimmed, switch off.
2. User turns the switch on. The map shows the conditions for the day (mean of the excellent species), the Datos tab gets its dot.
3. User types a species in the field and picks one from the suggestions; the colours change to that species.
4. User drags the day slider or taps the step buttons; the colours follow once the finger rests.
5. User taps **Datos** again: the panel closes, the layer stays on.

**Flow 3 — Add the forest and my corners over it.**
1. With Datos on, the user taps **Zonas**. The Datos panel closes, the Zonas panel opens (switch off, rows dimmed). The Datos tab keeps its dot.
2. User turns the switch on: Mis rincones appear as points over the conditions colours. User taps «Ver listado · 12»: the list modal opens.
3. User taps **Bosque**, turns it on, and unticks the classes they do not want. The map now shows the three layers at once.

**Flow 4 — How much did it rain?**
1. In Datos the user picks **Lluvia**. The species field is gone. The default window is the last 7 days.
2. User taps «15 d», or drags either handle to fit their own window. The label reads «Acumulado 3–10 nov · 7 días» and the legend is in mm.

**Flow 5 — Change the base map.** User taps **Vista** (bottom right on desktop; next to the search on phone), picks Relief; the panel closes with the choice.

---

## Open questions

| # | Question | Owner | Answer |
|---|---|---|---|
| 1 | Name of the first tab. «Datos» is a working name: «Clima» does not cover the species-based Condiciones; «Capas» is too generic. | Marcos | ⬜ Pending |
| 2 | Does the rain window have its own legend scale per window length (30 mm in a day is not 30 mm in 15 days), or a fixed scale? Needs the data from `observatory-layers`. | Marcos / layers epic | ⬜ Pending |
| 3 | The rain window's right end inside the forecast mixes measured and forecast rain: how is it flagged? (Proposed: the hatched forecast stretch of the slider, as today.) | Marcos | ⬜ Pending |
| 4 | Is a fourth base map (Hybrid: satellite with labels) wanted and available from the tile providers used? Today there are three. | Marcos | ⬜ Pending |
| 5 | When the point's card (phone sheet / desktop panel) opens, what happens to an open layers panel? Today the phone closes one when the other opens; confirm that rule for both devices and for the new sheet. | Marcos | ⬜ Pending |
| 6 | Does the URL view state (already holds the point and the view) also store open tab, data type, species, day and forest classes? Proposed: yes for data type, species, day and classes; no for open tab. | Marcos | ⬜ Pending |
| 7 | Should tapping the dimmed content of a panel with the switch off turn the switch on? Proposed: yes (dimmed content must not feel broken). | Marcos | ⬜ Pending |
| 8 | Do the inert rows (Lluvia, Temperatura, Viento, Zonas de interés) show «Pronto» as today, or hide until built? Proposed: show, inert, with the tag. | Marcos | ⬜ Pending |
| 9 | Desktop: the panel covers up to ~460 px at the right of the map. Acceptable, or open the panel as a bottom deck? (Alternative A in the canvas.) | Marcos | ⬜ Pending |

---

## Deployment readiness

- Front end only. No migration, no new environment variable, no backend change, no new dependency expected.
- Deploys with Vercel on the merge into `main`; no ordering with Render.
- Rollback: revert the merge commit.
- To check after deploy: phone (iOS Safari and Android Chrome, including the fullscreen mode and the browser bars), ES / CA / EN, light and dark, keyboard navigation of tabs, switches and sliders, and that the old shell leaves no orphan i18n keys.

---

## Suggested branches

All cut from `epic/observatory-navigation`, squash-merged into it.

1. `feat/observatory-navigation-shell`: state model (open tab, switches, accumulation, dots, off state), desktop rail + Vista button + zoom, phone bar + sheet, Vista panel, shadow tokens. Existing layers (Condiciones, Mis rincones, Bosque) wired into it.
2. `feat/observatory-navigation-datos`: Datos panel with the four segments; Condiciones moved over; Lluvia / Temperatura / Viento as inert segments with their panel layout ready for the layers epic (including the two-handle window component).
3. `feat/observatory-navigation-zonas-bosque`: Zonas panel (Mis rincones live, Zonas de interés inert) and Bosque panel (checklist from the forest classes, Todos / Ninguno).
4. `chore/observatory-navigation-retire-old`: remove `MapPills`, `MapLayersBox`, `ViewPill`, the phone layers card and their i18n keys; ES / CA / EN, light / dark and phone pass.

---

## Definition of Done

- [ ] Desktop and phone navigation match proposal C in the canvas (states: initial, each tab off, each tab on, Vista).
- [ ] Layers accumulate on one map in the draw order of this PRD; Datos shows one layer at a time.
- [ ] Switch off = default; panel content dimmed and visible; switching on restores the last choices; dots follow the switches.
- [ ] On phone the tab icons do not move when the sheet opens or closes.
- [ ] The existing behaviour of Condiciones (species, day slider with forecast, legend), Mis rincones (map and list modal) and Bosque is unchanged in function.
- [ ] Rain, temperature, wind and Zonas de interés appear as inert rows, ready to be wired by their epics.
- [ ] Open questions 1–9 answered or consciously deferred and written in `memory/decisions.md`.
- [ ] Old pills, layers card and view dropdown removed; no orphan i18n keys.
- [ ] ES / CA / EN, light and dark, iOS Safari and Android Chrome checked; keyboard and screen-reader pass on tabs, switches, checkboxes and sliders.
- [ ] Deployment readiness checks done.
- [ ] All feature branches squash-merged into `epic/observatory-navigation`
- [ ] Retrospective completed and workflow improvements applied
- [ ] `epic/observatory-navigation` merged to `main` with `--no-ff`, tagged `vX.Y.0`
