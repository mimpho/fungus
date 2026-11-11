---
name: fungus-branch-close
description: "Cierra una rama de Fungus antes del squash a su épica: checklist de docs, commits, título/descripción del PR, parada de los servicios locales y prompt de la siguiente tarea. Úsala con «integra», «cerramos la rama» o cuando la rama esté lista."
---

# Fungus — branch close

Runs the close of a `feat/*`, `fix/*` or `chore/*` branch before it is squashed into its epic (or into `main` for project-wide chores). Source of truth: `system/workflows.spec.md` ("Branch close checklist", "PR preparation") and the Git section of `CLAUDE.md`.

## When it applies

- The user says "integra", "squash", "prepara la PR", "cerramos la rama", or similar.
- The user says the branch is finished, the QA passed or it is ready. Do not wait for the keyword: the documentation checklist runs anyway.
- It does NOT apply to the final merge of an epic into `main` (that has its own retrospective and a `--no-ff` merge) nor to opening an epic.

## Phase A — always (no git writes)

1. Read-only state: `git branch --show-current`, `git status`, `git diff --stat`, `git log --oneline` against the parent branch. Confirm which branch it is and what changed.
2. Documentation checklist, in this order, all in English:
   - `CHANGELOG.md`: entry under `[Unreleased]` for everything that changed.
   - `memory/pending.md`: remove or update the block of this branch; completed items leave, they are not archived.
   - the epic's plan file in `memory/` (phase table and an «as built» section), if it has one.
   - `memory/decisions.md`: any architectural decision, with the discarded alternatives.
   - `memory/gotchas.md`: any new trap found while working.
   - `system/project.spec.md` and `README.md`: only if the roadmap, stack or endpoints changed.
   - if endpoints changed: also `docs/backend_architecture.md`.
3. Prepare, inline in the chat and each in its own fenced block:
   - the commit message of the code (Conventional Commit, English, scope from the allowed list);
   - the commit message of the docs (`docs: update changelog and pending for <branch>`);
   - the PR title (Conventional Commit, ≤72 chars, never a branch name or a command, because the squash title stays in the history);
   - the PR body with `## Summary`, `## Manual steps` (migrations, env vars, buckets, who applies each) and `## Testing checklist`.
4. State what was and was not verified (build, tests, visual check by the human) and anything left for the human.

## Phase B — only when the human asks explicitly ("integra", "haz los commits")

Staging and committing are local and reversible; pushing is not part of this skill.

1. Show `git status` and `git diff --stat` before touching the index.
2. Stage explicit paths only. Never `git add -A` or `git add .`. Never stage `backend/.env`, `.env.local`, `local-data/`, dumps or anything with credentials; if one of them appears in `status`, stop and say so. Files the branch did not make (for example an untracked `.claude/launch.json`) stay out.
3. Two commits, code first and docs after, using the messages of Phase A and the attribution trailers the session requires (commits and the end of the PR body).
4. Show `git log --oneline -3` as proof.
5. If the commit leaves a `.lock` file or fails, report it and stop; do not force anything and do not ask for broader permissions.

## Phase C — stop the local services (after Phase B)

The task is closed in this session: the services it started are stopped here, and the next task's session starts its own (Phase D).

1. List the servers this session started (`preview_list`) and stop each one (`preview_stop`): `api` (8000) and `dev` (5173).
2. Check that ports 8000 and 5173 are free (`lsof -nP -iTCP:<port> -sTCP:LISTEN`). If a process this session did not start still holds one, do not kill it: say which process it is (command and working directory) and ask.
3. Leave the browser pane as it was: reset any emulated viewport (`resize_window` preset `desktop`) and confirm the `localStorage` keys touched during the QA are back to their values.
4. Say in one line that the services are stopped.

## Phase D — prompt for the next task (always, after Phase A)

Read `memory/pending.md` (and the epic's plan file) and decide whether there is another task left in the same epic.

- If there is: write a prompt ready to copy and paste into a new session, in its own fenced block, in Spanish (the working language), self-contained so the new session does not depend on this conversation. It contains:
  - the task and its place in the epic; the branch to cut and from where (`git checkout <epic> && git pull --ff-only && git checkout -b feat/<epic>-<topic>`, run by the human);
  - what to read first (the `system/` files, `memory/pending.md` and the epic's PRD and plan, pointing at the exact block, including the «as built» sections of the tasks already done);
  - how to start the local services (when the task is checked in the browser): the `api` and `dev` configurations of `.claude/launch.json`. `api` must be on port 8000, because the front end points there (`VITE_API_BASE`): if it gets another port, stop it and tell the human instead of going on. `dev` on 5173. If a port is already taken by a process the new session did not start, say which one and ask before stopping it. Check that `http://localhost:8000/api/v1/health` answers `ok`. The local back end starts without migrations and refreshes the zones' weather from Open-Meteo at start-up only when it is stale, which is normal. Which database it uses depends on `backend/.env` (it may be a local one without fresh forecast: see `memory/gotchas.md`); never print its values. Open the page in the built-in browser and wait for the human to log in (the login is theirs);
  - the scope in and out; the open decisions that need the human before code (as a table of options); the constraints that apply (git scope of `CLAUDE.md`, docs in English, texts in ES/CA/EN in `src/data/i18n.js`, sizes in px and colours from `src/styles/tokens.css`, SQL against production only applied by the human); and how it is verified (what Claude checks, what the human checks on screen, `localStorage` keys restored at the end). No secrets, no coordinates of foraging spots, no values of environment variables.
- If there is not: say so, and propose the epic close (retrospective, `--no-ff`, tag) instead of inventing a task.

## Never, in any phase

`push`, `merge`, `rebase`, `checkout`/`switch`, `stash`, `reset`, `tag`, `branch -D`, force pushes, or anything on `epic/*` or `main`. Those are the human's.

## Closing the message

Give the human the exact next commands, **one command per fenced `bash` block, each on a single line** (no `\` continuations, no `&&` chains, no `$` prompt, no output inside the block): the desktop app only shows a Run button on single-line shell blocks. In order: `git push -u origin <branch>`; open the PR with the prepared title and body; and, only after the QA is confirmed, the squash and delete from the cheatsheet of `system/workflows.spec.md`, split into its separate commands (`git checkout <epic>`, `git merge --squash <branch>`, `git commit -m "<PR title>"`, `git branch -D <branch>`), with a line saying they go one after the other and the next only if the previous one succeeded.
