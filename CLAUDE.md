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

**Start.** After the `system/` files, read the most recent `estado-fungus-*` document of the Fungus Project (`claude/estado-fungus-YYYY-MM-DD.md`) and check the current branch (`git branch --show-current`, read-only). Then continue from that status: do not ask the user to re-explain the context.

**Close.** When a work block ends (branch integrated, or the user says they are done), save a new `claude/estado-fungus-YYYY-MM-DD.md` in the Project with these sections: *Dónde estamos* · *Decisiones de construcción* · *Pendiente de la épica* · *Cabos sueltos* · *Cómo trabajamos*. Keep what is still valid from the previous one, drop what is done. The status documents are written in Spanish; the repository docs stay in English.

**Git.** Claude never runs write git commands (add, commit, checkout, merge, stash, reset…): only `status`, `diff`, `log` and `branch --show-current`. The human runs the rest.
