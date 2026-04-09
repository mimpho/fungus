# agents.spec.md — Fungus

> Defines the roles operating in the project, their capabilities, limits and interaction protocols.
> These rules are mandatory — not suggestions.

---

## Roles

### Claude / Cowork (primary agent)

**Entry point**: `CLAUDE.md` → points to `system/`
**Capabilities**: writing code, editing files, running bash commands, git operations, updating documentation.
**Limits**:
- No direct push to `main` (branch protection). Always via PR.
- Does not run SQL migrations directly on Supabase. Prepares them; the admin applies them.
- Does not commit without the user explicitly requesting it.
- Does not make product/business decisions without consulting first.

### Claude / Chat (quick consultation)

**When to use**: conceptual questions, snippet review, architecture discussion without touching files.
**When not**: any task involving reading, editing or creating repo files. Use Cowork for that.

### Human admin (Marcos)

**Exclusive responsibilities**:
- Approving and merging PRs on GitHub.
- Applying SQL migrations on Supabase (Dashboard or `psql`).
- Pushing release tags (`git tag -a vX.Y.0 && git push origin --tags`).
- Managing environment variables on Vercel and Render.
- Rotating API keys.

### Batch scripts (Python)

**Non-interactive agents** running in `backend/scripts/`:
- `generate_visual_dna.py` — Gemini 2.5 Flash offline. Resume-safe.
- `refine_visual_dna.py` — Gemini Vision multimodal. Corrects DNA Visual with real photos.
- `seed_catalog.py` — imports mock JS → PostgreSQL.
- `backfill.py` — climate history backfill.

**Critical rule**: never overwrite records with `is_validated = true` in `mushroom_visual_prompts`.

---

## Code and architecture rules

These rules apply in every work session. No review needed — they are in force by default.

### Frontend

1. **`src/` is the active path** — there is no `frontend/` subdirectory. Do not touch `standalone/` except for reference.
2. **`soil_temperature_0cm` only in `hourly`** — adding it to `current` returns HTTP 400.
3. **`window.L = L` at module level** in `LeafletMap.jsx`, before any dynamic `import('leaflet.heat')`.
4. **`fakeConditions()`** kept only as fallback in `useWeatherConditions.js` — never call directly from components.
5. **`conditionsMap` starts as `{}`** — all access uses `?.` or `?? 0`. No exceptions.
6. **`CACHE_VERSION`** in `weatherService.js` — increment every time the scoring algorithm changes to invalidate user caches.
7. **React StrictMode** mounts effects twice in dev — use module-level in-flight promise cache (`_allZonesPromise`, `_singlePromises`), not `useRef` guards.
8. **`useMemo`** for derived calculations from `conditionsMap` in Dashboard/Zones — the map updates asynchronously and `useMemo` must include it in its dependencies.
9. **`resolveUrl()`** — always use in `<img src>` for assets in modals and articles. Relative paths break in nested URLs like `/especies/boletus-edulis`.
10. **Colours in Leaflet and `ArticleCallout`** — always literal hex, never CSS vars. See `system/glossary.spec.md`.

### Modals and navigation

11. **`ModalRenderer` is the sole modal navigation authority**. Components only call `setSelected*(item)`. Never `navigate()` from inside a modal.
12. **Modal-from-modal pattern**: to open modal B from modal A, call `setSelectedA(null)` + `setSelectedB(item)`. Do not use `navigate()` with `replace: true`.
13. **Anti-loop guard in ModalRenderer**: before navigating, check `if (location.pathname === target) return`.
14. **ESC + Lightbox pattern**: modals with lightbox deregister their ESC listener while the lightbox is open. The effect must depend on `[lightbox]`.
15. **`GallerySection`** in `SpeciesModal` — local component with `useState(errored)`. Hides when all images have errored. Use plain `<img>` with `onError`, not `<SpeciesImg>`.

### Content and safety

16. **Always show a safety disclaimer** on species with `edibility: 'toxico'` or `edibility: 'mortal'`.
17. **`is_validated = true`** in `mushroom_visual_prompts` — never overwrite with automated scripts. Manual admin edit only.
18. **Prompt bloat** — the image generator's enemy. Short, non-overlapping instructions; token order matters.

### Backend

19. **Column `geom`** in `zones` and `weather_stations` is `GENERATED ALWAYS AS` (PostGIS). Never insert directly.
20. **Upsert upgrade rule** in `climate_history` — never overwrite a higher-quality source with a lower one. Open-Meteo is P3.
21. **Auto-migrate in lifespan**: `await asyncio.to_thread(_run_db_migrations)`. Do not use `asyncio.run()` inside the lifespan (event loop already running → RuntimeError).
22. **Backend floats** — always round when normalising in the frontend (helpers `r1`, `r0` in `apiService.js`).

---

## Model selection guidance

Claude recommends the most cost-efficient model for each type of task. Apply this guidance proactively at the start of a session or when the task scope becomes clear.

| Task type | Recommended model | Rationale |
|---|---|---|
| Documentation edits, spec updates, CHANGELOG | Haiku | Pure text, well-structured context, no reasoning needed |
| Small isolated bug fixes (1-2 files) | Haiku | Narrow scope, straightforward edit |
| New feature implementation (multiple files) | Sonnet | Requires architectural reasoning and cross-file coherence |
| Debugging complex interactions (async, routing, cache) | Sonnet | Needs to track multi-step logic |
| Architecture decisions, refactors, major migrations | Sonnet / Opus | High-stakes reasoning, trade-off analysis |
| Image generation prompt tuning | Sonnet | Iterative creative reasoning |

**How to apply**: when the user starts a session or describes a task, mention the recommended model if it would be more economical than the current one. One short note is enough — do not repeat it mid-session.

Example: *"This looks like a documentation update — Haiku would handle it fine and use fewer tokens. Switch if you want."*

---

## Session protocol — Start

When starting a Cowork session, Claude reads in this order:

1. `system/project.spec.md` — what the project is and how it is built
2. `system/agents.spec.md` — this file: how to operate
3. `system/workflows.spec.md` — how to manage changes and documentation
4. `system/glossary.spec.md` — domain terminology
5. `memory/pending.md` — what needs doing

No need to re-explain the project. A minimal cue ("let's continue with v7.0") is enough.

What is worth mentioning explicitly: context that happened **outside Cowork** since the last session (a decision made in another conversation, a manual code change, a new API key received).

---

## Session protocol — Close

Before closing, apply the documentation protocol from `system/workflows.spec.md`.

At the end of each work block, Claude proactively suggests next steps in three dimensions:

**Git** — repo state and pending actions:
- Uncommitted changes → suggest commit with Conventional Commits message
- Finished feature branch → suggest squash merge to epic and branch deletion
- Completed phase → suggest `--no-ff` merge to `main`, tag and push
- PR ready → provide title and description ready to paste into GitHub

**Conversation** — continue here or new session:
- Continue if the next block is a natural extension of the current one (same branch, same context)
- New session if the topic changes, the branch changes, or the conversation is already long
- Chat without Cowork if what's next is a quick question without touching files

**Documentation** — what to update before closing (see `system/workflows.spec.md`)

Format of the suggestion: three actionable bullets, not a report.

---

## When to use Cowork vs Chat

| Situation | Tool |
|---|---|
| Write, edit or read repo files | Cowork |
| Run commands (npm, git, python) | Cowork |
| Git operations (commit, branch, PR) | Cowork |
| Update documentation | Cowork |
| Conceptual question without touching files | Chat |
| Review a standalone snippet | Chat |
| Ask about a library | Chat |

**Session scope**: one cohesive block of work, not a single trivial task nor the entire project. The signal to open a new session is noticing Claude losing the thread — don't wait for it to fail. `system/` ensures continuity between sessions.
