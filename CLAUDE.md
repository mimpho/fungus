# Fungus — Claude Instructions

This project uses **OpenSpecs** as its Single Source of Truth. Read the `system/` files in this order at the start of every session:

1. [`system/project.spec.md`](system/project.spec.md) — what the project is and how it is built
2. [`system/agents.spec.md`](system/agents.spec.md) — how to operate: rules, roles, session protocol
3. [`system/workflows.spec.md`](system/workflows.spec.md) — change lifecycle, git, documentation
4. [`system/glossary.spec.md`](system/glossary.spec.md) — technical and domain terminology

Active backlog: [`memory/pending.md`](memory/pending.md)
Architectural decisions: [`memory/decisions.md`](memory/decisions.md)
Known bugs and gotchas: [`memory/gotchas.md`](memory/gotchas.md)
Full scoring algorithm: [`memory/scoring.md`](memory/scoring.md)

## Session start and close

**Start.** After the `system/` files, read `memory/pending.md` (its active block says where the work stands) and, for the active epic, its PRD and plan; check the current branch (`git branch --show-current`, read-only) and the recent `git log`. Then continue from there: do not ask the user to re-explain the context. Product decisions taken elsewhere (claude.ai on the phone, Cowork) reach this session when the user pastes or tells them; Claude writes them into the PRD, `memory/decisions.md` or `memory/pending.md`.

**Close.** When a work block ends, the state lives in the repo docs, not in a separate status document: `memory/pending.md` (active block and loose ends), `memory/decisions.md`, the epic's plan and `CHANGELOG.md`, updated through the branch close checklist of `system/workflows.spec.md`. (The Spanish `estado-fungus-*` status documents of the Claude Project were retired on 2026-11-11: they repeated those files.)

**How we work.** Marcos is a front-end developer, not a back-end one: for back-end or database steps give the exact command and say what to look for in its output. He decides with tables of options. He tests in the browser and corrects with screenshots; Claude applies the change, runs `npm run build` and says what it could not see. SQL against production is never run by Claude: Marcos applies it and returns the final `SELECT`. Secrets never go in the chat; exact coordinates of foraging spots never go in the repo. A release tag is given only once the merge is in `origin/main` (check with `git fetch`), with the commit hash explicit in the command.

**Git.** Read-only commands are always fine: `status`, `diff`, `log`, `branch --show-current`, `ls-remote`. Claude may also run `fetch` and `pull --ff-only` (never a plain `pull`: it could create a merge). When the human asks explicitly, or says «integra», Claude may run `add <explicit paths>` (never `-A` or `.`; never `backend/.env`, `.env.local` or `local-data/`) and `commit` on `feat/*`, `fix/*`, `chore/*` and `docs/*` branches, after showing `git status` and `git diff --stat`. Everything else is the human's: `push`, `merge`, `rebase`, `checkout`/`switch`, `stash`, `reset`, `tag`, `branch -D`, force pushes, and anything that touches `epic/*` or `main`.
